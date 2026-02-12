import { connectDB } from '../../db/mongodb'
import { User } from '@/db/models/user.model';
import { NotFoundErrorWithId, NotFoundErrorWithEmail, ConflictError } from '../errorClasses/errors';


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
    const users = await User.find({}).select('_id firstname lastname email mobile role createdAt').exec();
    return users;
  }


  async getUserById(id: string) {
    const user = await User.findById(id).select('_id firstname lastname email mobile role createdAt').exec();
    if (!user) {
      throw new NotFoundErrorWithId('User', id);
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await User.findOne({ email }).exec();
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