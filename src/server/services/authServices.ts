import { connectDB } from '@/db/connection';
import { User } from '@/db/models/user.model';
import { HttpError } from "../errors/http-error";
import bcrypt from "bcryptjs";

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


export class AuthService {
  private constructor() {
    // Private constructor prevents 'new UserService()'
  }

  public static async getInstance() {
    await connectDB(); // Connect once here
    return new AuthService();
  }

  async register(input: RegisterInput) {
    const { email, firstname, lastname, mobile, password } = input;

    // Check if user already exists
    await this.checkUserExists(email);

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

  async login(input: LoginInput) {
    const { email, password } = input;
    const user = await this.getUserByEmail(email)

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

  // Now these functions are super clean!
  async getAllUsers() {
    return User.find({});
  }

  async getUserById(id: string) {
    const user = User.findById(id);
    if (!user) {
      throw new HttpError("Not Found", {
        status: 404,
        code: "NOT_FOUND",
      });
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = User.findOne({ email });
    if (!user) {
      throw new HttpError("Not Found", {
        status: 404,
        code: "NOT_FOUND",
      });
    }
    return user;
  }

  async checkUserExists(email: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new HttpError("User already exists", {
        status: 409,
        code: "USER_EXISTS",
      });
    }
  }

}

// Usage in your Route Handler:
// const authService = await AuthService.getInstance();
// const users = await AuthService.getAllUsers();