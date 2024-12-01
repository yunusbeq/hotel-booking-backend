import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { Collection, ObjectId } from 'mongodb';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { db } from '@utils/mongodb';

@Service()
export class UserService {
  private users: Collection<User>;

  constructor() {
    try {
      this.users = db.getDb().collection<User>('users');
      this.users.createIndex({ email: 1 }, { unique: true });
    } catch (error) {
      throw new Error('Database initialization failed in UserService');
    }
  }

  public async findAllUser(): Promise<User[]> {
    const users = await this.users.find().toArray();
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new HttpException(400, 'Invalid user ID format');
      }

      const findUser = await this.users.findOne({ _id: new ObjectId(userId) });
      if (!findUser) throw new HttpException(404, "User doesn't exist");

      return findUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, 'Internal server error while finding user');
    }
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    try {
      if (!userData.email || !userData.password) {
        throw new HttpException(400, 'Email and password are required');
      }

      const findUser = await this.users.findOne({ email: userData.email });
      if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

      const hashedPassword = await hash(userData.password, 10);
      const createUserData: User = {
        email: userData.email.toLowerCase(),
        password: hashedPassword,
      };

      const result = await this.users.insertOne(createUserData);
      return { ...createUserData, _id: result.insertedId };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, 'Internal server error while creating user');
    }
  }

  public async updateUser(userId: string, userData: CreateUserDto): Promise<User> {
    const findUser = await this.users.findOne({ _id: new ObjectId(userId) });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    const updateUserData: User = {
      email: userData.email,
      password: hashedPassword,
    };

    await this.users.updateOne({ _id: new ObjectId(userId) }, { $set: updateUserData });

    return { ...updateUserData, _id: new ObjectId(userId) };
  }

  public async deleteUser(userId: string): Promise<void> {
    const findUser = await this.users.findOne({ _id: new ObjectId(userId) });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await this.users.deleteOne({ _id: new ObjectId(userId) });
  }
}
