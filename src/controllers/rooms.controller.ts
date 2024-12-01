import { Param, Body, Get, Post, Put, Delete, HttpCode, JsonController, Authorized, QueryParams } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateRoomDto, UpdateRoomDto } from '@dtos/rooms.dto';
import { Room, RoomType } from '@interfaces/rooms.interface';
import { RoomService } from '@services/rooms.service';
import { UserRole } from '@interfaces/users.interface';
import { AuthService } from '@services/auth.service';
import { RoomAvailabilityDto } from '@dtos/rooms.dto';
import { ObjectId } from 'mongodb';
import { HttpException } from '@exceptions/HttpException';
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
    return { data: findAllRoomsData, message: 'findAll' };
  }

  @Get('/rooms/available')
  async getAvailableRooms(@QueryParams() query: { startDate: string; endDate: string }) {
    try {
      console.log('Checking available rooms with query:', query);

      if (!query.startDate || !query.endDate) {
        throw new HttpException(400, 'Start date and end date are required');
      }

      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new HttpException(400, 'Invalid date format');
      }

      console.log('Parsed dates:', { startDate, endDate });

      const availableRooms = await this.room.findAvailableRooms(startDate, endDate);
      console.log('Found available rooms:', availableRooms.length);

      return {
        data: availableRooms.map(room => this.transformResponse(room)),
        message: 'available rooms found',
      };
    } catch (error) {
      console.error('Error getting available rooms:', error);
      throw error;
    }
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
    try {
      // Gelen veriyi kontrol et
      console.log('Received room data:', roomData);

      // Eksik alan kontrolü
      if (!roomData.roomNumber || !roomData.type || !roomData.price) {
        throw new HttpException(400, 'Missing required fields');
      }

      // RoomType enum kontrolü
      if (!Object.values(RoomType).includes(roomData.type)) {
        throw new HttpException(400, 'Invalid room type');
      }

      const createRoomData: Room = await this.room.createRoom(roomData);
      return { data: this.transformResponse(createRoomData), message: 'created' };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
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
