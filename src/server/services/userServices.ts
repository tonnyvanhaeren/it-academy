import { connectDB } from '../../db/mongodb'
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

export class UserService {
  private static instance: UserService | null = null;

  private constructor() { }

  public static async getInstance(): Promise<UserService> {
    if (!UserService.instance) {
      await connectDB(); // Herbruikbare connectie
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getAllUsers() {
    return User.find({}).select('_id firstname lastname email mobile role createdAt');
  }


  async getUserById(id: string) {
    const user = User.findById(id).select('_id firstname lastname email mobile role createdAt');;
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