import { Param, Body, Get, Post, Put, Delete, HttpCode, JsonController, Authorized } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateRoomDto, UpdateRoomDto } from '@dtos/rooms.dto';
import { Room } from '@interfaces/rooms.interface';
import { RoomService } from '@services/rooms.service';
import { UserRole } from '@interfaces/users.interface';
import { AuthService } from '@services/auth.service';

@Service()
@JsonController()
export class RoomsController {
  public room = Container.get(RoomService);
  public authService = Container.get(AuthService);

  private transformResponse(room: Room) {
    if (!room._id) return room;

    return {
      ...room,
      id: room._id.toString(),
      _id: room._id.toString(),
    };
  }

  @Get('/rooms')
  async getRooms() {
    const findAllRoomsData: Room[] = await this.room.findAllRooms();
    const transformedRooms = findAllRoomsData.map(room => this.transformResponse(room));
    return { data: transformedRooms, message: 'findAll' };
  }

  @Get('/rooms/:id')
  async getRoomById(@Param('id') roomId: string) {
    const room = await this.room.findRoomById(roomId);
    return { data: this.transformResponse(room), message: 'findOne' };
  }

  @Post('/rooms')
  @HttpCode(201)
  @Authorized([UserRole.ADMIN])
  async createRoom(@Body() roomData: CreateRoomDto) {
    const createRoomData: Room = await this.room.createRoom(roomData);
    return { data: this.transformResponse(createRoomData), message: 'created' };
  }

  @Put('/rooms/:id')
  @Authorized([UserRole.ADMIN])
  async updateRoom(@Param('id') roomId: string, @Body() roomData: UpdateRoomDto) {
    const updateRoomData: Room = await this.room.updateRoom(roomId, roomData);
    return { data: this.transformResponse(updateRoomData), message: 'updated' };
  }

  @Delete('/rooms/:id')
  @Authorized([UserRole.ADMIN])
  async deleteRoom(@Param('id') roomId: string) {
    await this.room.deleteRoom(roomId);
    return { message: 'deleted' };
  }
}
