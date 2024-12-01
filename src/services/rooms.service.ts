import { Service } from 'typedi';
import { Collection, ObjectId } from 'mongodb';
import { CreateRoomDto } from '@dtos/rooms.dto';
import { HttpException } from '@exceptions/HttpException';
import { Room } from '@interfaces/rooms.interface';
import { db } from '@utils/mongodb';
import { BookingStatus } from '@interfaces/bookings.interface';

@Service()
export class RoomService {
  private rooms: Collection<Room>;

  constructor() {
    this.rooms = db.getDb().collection<Room>('rooms');
  }

  public async findAllRooms(): Promise<Room[]> {
    const rooms = await this.rooms.find().toArray();
    return rooms;
  }

  public async findRoomById(roomId: string): Promise<Room> {
    const room = await this.rooms.findOne({ _id: new ObjectId(roomId) });
    if (!room) throw new HttpException(404, "Room doesn't exist");
    return room;
  }

  public async createRoom(roomData: CreateRoomDto): Promise<Room> {
    const existingRoom = await this.rooms.findOne({ roomNumber: roomData.roomNumber });
    if (existingRoom) throw new HttpException(409, `Room number ${roomData.roomNumber} already exists`);

    const newRoom: Room = {
      ...roomData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.rooms.insertOne(newRoom);
    return { ...newRoom, _id: result.insertedId };
  }

  public async updateRoom(roomId: string, roomData: CreateRoomDto): Promise<Room> {
    const room = await this.rooms.findOne({ _id: new ObjectId(roomId) });
    if (!room) throw new HttpException(404, "Room doesn't exist");

    await this.rooms.updateOne({ _id: new ObjectId(roomId) }, { $set: roomData });

    return { ...roomData, _id: new ObjectId(roomId) };
  }

  public async deleteRoom(roomId: string): Promise<void> {
    const room = await this.rooms.findOne({ _id: new ObjectId(roomId) });
    if (!room) throw new HttpException(404, "Room doesn't exist");

    await this.rooms.deleteOne({ _id: new ObjectId(roomId) });
  }

  public async findAvailableRooms(startDate: Date, endDate: Date): Promise<Room[]> {
    if (!startDate || !endDate) {
      throw new HttpException(400, 'Start date and end date are required');
    }

    if (startDate > endDate) {
      throw new HttpException(400, 'Start date must be before end date');
    }

    const bookings = db.getDb().collection('bookings');

    const bookedRoomIds = await bookings.distinct('roomId', {
      status: { $nin: [BookingStatus.CANCELLED] },
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    });

    const availableRooms = await this.rooms
      .find({
        isAvailable: true,
        _id: { $nin: bookedRoomIds.map(id => new ObjectId(id)) },
      })
      .toArray();

    return availableRooms;
  }
}
