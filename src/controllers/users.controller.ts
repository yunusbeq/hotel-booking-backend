import { Param, Body, Get, Post, Put, Delete, HttpCode, JsonController } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import { UserService } from '@services/users.service';

@Service()
@JsonController()
export class UserController {
  public user = Container.get(UserService);

  @Get('/users')
  async getUsers() {
    const findAllUsersData: User[] = await this.user.findAllUser();
    return { data: findAllUsersData, message: 'findAll' };
  }

  @Get('/users/:id')
  async getUserById(@Param('id') userId: string) {
    const findOneUserData: User = await this.user.findUserById(userId);
    return { data: findOneUserData, message: 'findOne' };
  }

  @Post('/users')
  @HttpCode(201)
  async createUser(@Body() userData: CreateUserDto) {
    const createUserData: User = await this.user.createUser(userData);
    return { data: createUserData, message: 'created' };
  }

  @Put('/users/:id')
  async updateUser(@Param('id') userId: string, @Body() userData: CreateUserDto) {
    const updateUserData: User = await this.user.updateUser(userId, userData);
    return { data: updateUserData, message: 'updated' };
  }

  @Delete('/users/:id')
  async deleteUser(@Param('id') userId: string) {
    await this.user.deleteUser(userId);
    return { message: 'deleted' };
  }
}
