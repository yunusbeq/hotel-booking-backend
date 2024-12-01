import { Param, Body, Get, Post, Put, Delete, HttpCode, JsonController, Authorized } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateRoomDto } from '@dtos/rooms.dto';
import { Room } from '@interfaces/rooms.interface';
import { RoomService } from '@services/rooms.service';
import { UserRole } from '@interfaces/users.interface';
import { AuthService } from '@services/auth.service';

@Service()
@JsonController()
export class RoomsController {
  public room = Container.get(RoomService);
  public authService = Container.get(AuthService);

  @Get('/rooms')
  async getRooms() {
    const findAllRoomsData: Room[] = await this.room.findAllRooms();
    return { data: findAllRoomsData, message: 'findAll' };
  }

  @Post('/rooms')
  @HttpCode(201)
  @Authorized([UserRole.ADMIN])
  async createRoom(@Body() roomData: CreateRoomDto) {
    const createRoomData: Room = await this.room.createRoom(roomData);
    return { data: createRoomData, message: 'created' };
  }

  @Put('/rooms/:id')
  @Authorized([UserRole.ADMIN])
  async updateRoom(@Param('id') roomId: string, @Body() roomData: CreateRoomDto) {
    const updateRoomData: Room = await this.room.updateRoom(roomId, roomData);
    return { data: updateRoomData, message: 'updated' };
  }

  @Delete('/rooms/:id')
  @Authorized([UserRole.ADMIN])
  async deleteRoom(@Param('id') roomId: string) {
    await this.room.deleteRoom(roomId);
    return { message: 'deleted' };
  }
}
