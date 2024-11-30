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
    this.users = db.getDb().collection<User>('users');
  }

  public async findAllUser(): Promise<User[]> {
    const users = await this.users.find().toArray();
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser = await this.users.findOne({ _id: new ObjectId(userId) });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const findUser = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = {
      email: userData.email,
      password: hashedPassword,
    };

    const result = await this.users.insertOne(createUserData);
    return { ...createUserData, _id: result.insertedId };
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
