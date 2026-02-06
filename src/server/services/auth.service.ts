import bcrypt from "bcryptjs";
import { User } from "../../db/models/user.model";
import { HttpError } from "../errors/http-error";
import { connectDB } from "@/db/connection";

interface RegisterInput {
  email: string;
  firstname: string;
  lastname: string;
  mobile: string;
  password: string;
  role?: "student" | "teacher" | "admin";
}

interface LoginInput {
  email: string;
  password: string;
}

type JwtHandler = {
  sign: (signValue: any) => Promise<string>;
  verify: (jwt?: string, options?: any) => Promise<any>;
}

class AuthService {


  async register(input: RegisterInput) {
    const { email, firstname, lastname, mobile, password } = input;
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new HttpError("User already exists", {
        status: 409,
        code: "USER_EXISTS",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      firstname,
      lastname,
      mobile,
      hashedPassword,
      role: "student",
    });

    return {
      id: user._id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    };
  }

  async checkUser(input: LoginInput) {
    const { email, password } = input;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpError("Invalid credentials", {
        status: 401,
        code: "INVALID_CREDENTIALS",
      });
    }
      // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      throw new HttpError("Invalid credentials", {
        status: 401,
        code: "INVALID_CREDENTIALS",
      });
    }

    return {
      id: user.id as string,
      email: user.email as string,
      role: user.role as string
    };
  }

  async login(input: LoginInput, accessJwt: JwtHandler, refreshJwt: JwtHandler) {
    const { email, password } = input;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpError("Invalid credentials", {
        status: 401,
        code: "INVALID_CREDENTIALS",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      throw new HttpError("Invalid credentials", {
        status: 401,
        code: "INVALID_CREDENTIALS",
      });
    }

    // Generate tokens
    const accessToken = await accessJwt.sign({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = await refreshJwt.sign({
      userId: user._id.toString(),
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string | undefined,
    accessJwt: JwtHandler,
    refreshJwt: JwtHandler
  ) {
    if (!refreshToken) {
      throw new HttpError("Refresh token required", {
        status: 401,
        code: "NO_REFRESH_TOKEN",
      });
    }

    // Verify refresh token
    const payload = await refreshJwt.verify(refreshToken);
    if (!payload || !payload.userId) {
      throw new HttpError("Invalid refresh token", {
        status: 401,
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Find user
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new HttpError("User not found", {
        status: 401,
        code: "USER_NOT_FOUND",
      });
    }

    // Generate new access token
    const newAccessToken = await accessJwt.sign({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return newAccessToken;
  }

  async getSession(accessToken: string | undefined, accessJwt: JwtHandler) {
    if (!accessToken) {
      throw new HttpError("Not authenticated", {
        status: 401,
        code: "NO_TOKEN",
      });
    }

    const payload = await accessJwt.verify(accessToken);
    if (!payload || !payload.userId) {
      throw new HttpError("Invalid session", {
        status: 401,
        code: "INVALID_TOKEN",
      });
    }

    const user = await User.findById(payload.userId).select("-hashedPassword");
    if (!user) {
      throw new HttpError("User not found", {
        status: 401,
        code: "USER_NOT_FOUND",
      });
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        mobile: user.mobile,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();