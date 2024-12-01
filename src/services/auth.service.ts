import { Service } from 'typedi';
import { Collection } from 'mongodb';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User, UserRole } from '@interfaces/users.interface';
import { db } from '@utils/mongodb';
import { Room } from '@interfaces/rooms.interface';

@Service()
export class AuthService {
  private users: Collection<User>;

  constructor() {
    this.users = db.getDb().collection<User>('users');
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = {
      id: user._id.toString(),
      role: user.role || UserRole.CUSTOMER,
    };
    const secretKey: string = SECRET_KEY;

    return {
      expiresIn: 60 * 60,
      token: sign(dataStoredInToken, secretKey, { expiresIn: '24h' }),
    };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  public async signup(userData: CreateUserDto): Promise<User> {
    const findUser = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = {
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role || UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.users.insertOne(createUserData);
    return { ...createUserData, _id: result.insertedId };
  }

  public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User }> {
    const findUser = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "Password doesn't match");

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser };
  }

  public async logout(userData: User): Promise<User> {
    const findUser = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }
}
