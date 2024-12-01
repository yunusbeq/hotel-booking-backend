import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Service } from 'typedi';
import { ObjectId } from 'mongodb';
import { SECRET_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { TokenData } from '@interfaces/auth.interface';
import { User, UserRole } from '@interfaces/users.interface';
import { db } from '@utils/mongodb';
import { DataStoredInToken } from '@interfaces/auth.interface';

const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = {
    id: user._id.toString(),
  };
  const expiresIn: number = 60 * 60;

  return { expiresIn, token: sign(dataStoredInToken, SECRET_KEY, { expiresIn }) };
};

const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
};

@Service()
export class AuthService {
  private users = db.getDb().collection<User>('users');

  public async signup(userData: CreateUserDto): Promise<User> {
    const findUser = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const result = await this.users.insertOne({
      email: userData.email,
      password: hashedPassword,
      role: userData.role || UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newUser = await this.users.findOne({ _id: result.insertedId });
    return newUser;
  }

  public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User }> {
    const findUser = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, 'Password is not matching');

    const tokenData = createToken(findUser);
    const cookie = createCookie(tokenData);

    return { cookie, findUser };
  }

  public async logout(userData: User): Promise<User> {
    const findUser = await this.users.findOne({
      _id: new ObjectId(userData._id),
      email: userData.email,
    });

    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }
}
