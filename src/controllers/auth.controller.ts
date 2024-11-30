import { Response } from 'express';
import { Req, Body, Post, HttpCode, Res, JsonController } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { AuthService } from '@services/auth.service';

@Service()
@JsonController()
export class AuthController {
  public auth = Container.get(AuthService);

  @Post('/signup')
  @HttpCode(201)
  async signUp(@Body() userData: CreateUserDto) {
    const signUpUserData: User = await this.auth.signup(userData);
    return { data: signUpUserData, message: 'signup' };
  }

  @Post('/login')
  async logIn(@Res() res: Response, @Body() userData: CreateUserDto) {
    const { cookie, findUser } = await this.auth.login(userData);

    res.setHeader('Set-Cookie', [cookie]);
    return { data: findUser, message: 'login' };
  }

  @Post('/logout')
  async logOut(@Req() req: RequestWithUser, @Res() res: Response) {
    const userData: User = req.user;
    const logOutUserData: User = await this.auth.logout(userData);

    res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
    return { data: logOutUserData, message: 'logout' };
  }
}
