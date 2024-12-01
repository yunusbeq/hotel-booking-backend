import { Service } from 'typedi';
import { Collection, ObjectId } from 'mongodb';
import { CreateRoomDto } from '@dtos/rooms.dto';
import { HttpException } from '@exceptions/HttpException';
import { Room } from '@interfaces/rooms.interface';
import { db } from '@utils/mongodb';

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

    const result = await this.rooms.insertOne(roomData);
    return { ...roomData, _id: result.insertedId };
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

    const rooms = await this.rooms
      .find({
        isAvailable: true,
        // Burada ek olarak booking tarihleriyle çakışma kontrolü de eklenebilir
      })
      .toArray();

    return rooms;
  }
}
