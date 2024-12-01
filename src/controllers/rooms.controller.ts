import { Param, Body, Get, Post, Put, Delete, HttpCode, JsonController, QueryParams } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateRoomDto } from '@dtos/rooms.dto';
import { Room } from '@interfaces/rooms.interface';
import { RoomService } from '@services/rooms.service';

@Service()
@JsonController()
export class RoomController {
  public room = Container.get(RoomService);

  @Get('/rooms')
  async getRooms() {
    const findAllRoomsData: Room[] = await this.room.findAllRooms();
    return { data: findAllRoomsData, message: 'findAll' };
  }

  @Get('/rooms/available')
  async getAvailableRooms(@QueryParams() query: { startDate: string; endDate: string }) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const availableRooms = await this.room.findAvailableRooms(startDate, endDate);
    return { data: availableRooms, message: 'findAvailable' };
  }

  @Get('/rooms/:id')
  async getRoomById(@Param('id') roomId: string) {
    const findOneRoomData: Room = await this.room.findRoomById(roomId);
    return { data: findOneRoomData, message: 'findOne' };
  }

  @Post('/rooms')
  @HttpCode(201)
  async createRoom(@Body() roomData: CreateRoomDto) {
    const createRoomData: Room = await this.room.createRoom(roomData);
    return { data: createRoomData, message: 'created' };
  }

  @Put('/rooms/:id')
  async updateRoom(@Param('id') roomId: string, @Body() roomData: CreateRoomDto) {
    const updateRoomData: Room = await this.room.updateRoom(roomId, roomData);
    return { data: updateRoomData, message: 'updated' };
  }

  @Delete('/rooms/:id')
  async deleteRoom(@Param('id') roomId: string) {
    await this.room.deleteRoom(roomId);
    return { message: 'deleted' };
  }
}
