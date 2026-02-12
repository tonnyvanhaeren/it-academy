import { connectDB } from '../../db/mongodb'
import { User } from '@/db/models/user.model';
import bcrypt from "bcryptjs";
import { formatMongooseDate } from '../utils/databaseUtils';
import { ConflictEmailOrMobileError, ConflictError, NotFoundErrorWithEmail, NotFoundErrorWithId, UnauthorizedError } from '../errorClasses/errors';


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
  private static instance: AuthService | null = null;

  private constructor() { }

  public static async getInstance(): Promise<AuthService> {
    if (!AuthService.instance) {
      await connectDB(); // Herbruikbare connectie
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(input: RegisterInput) {
    const { email, firstname, lastname, mobile, password } = input;

    // Check if a user with email or mobile already exists
    await this.checkUserWithEmailOrMobileExists(email, mobile);

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
      id: user._id.toString(),
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      mobile: user.mobile,
      role: user.role,
      createdAt: formatMongooseDate(user.createdAt)
    };
  }

  async login(input: LoginInput) {
    const { email, password } = input;
    const user = await this.getUserByEmail(email)

    if (!user) {
      throw new NotFoundErrorWithEmail('User', email);
    }

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      throw new UnauthorizedError('Wachtwoord of email niet juist')
    }

    return {
      id: user.id as string,
      email: user.email as string,
      role: user.role as string
    };
  }

  async checkUserWithEmailOrMobileExists(email: string, mobile: string) {
    const existingUser = await User.findOne({
      $or: [
        { mobile: mobile },
        { email: email }
      ]
    }).exec();

    if (existingUser) {
      throw new ConflictEmailOrMobileError('User met email of mobile nummer')
    }
    throw new Error('Method not implemented.');
  }

  // Now these functions are super clean!
  async getAllUsers() {
    const users = await User.find({}).exec();
    return users;
  }

  async getUserById(id: string) {
    const user = await User.findById(id).exec();
    if (!user) {
      throw new NotFoundErrorWithId('User', id);
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = User.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundErrorWithEmail('User', email);
    }
    return user;
  }

  async checkUserExists(email: string) {
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictError('User', 'email', email);
    }
  }

}