import { Service } from 'typedi';
import { Collection, ObjectId } from 'mongodb';
import { CreateRoomDto } from '@dtos/rooms.dto';
import { HttpException } from '@exceptions/HttpException';
import { Room } from '@interfaces/rooms.interface';
import { db } from '@utils/mongodb';
import { BookingStatus } from '@interfaces/bookings.interface';
import { UpdateRoomDto } from '@dtos/rooms.dto';

@Service()
export class RoomService {
  private rooms: Collection<Room>;

  constructor() {
    this.rooms = db.getDb().collection<Room>('rooms');
  }

  public async findAllRooms(): Promise<Room[]> {
    const rooms = await this.rooms.find().toArray();
    return rooms.map(room => ({
      ...room,
      id: room._id.toString(),
    }));
  }

  public async findRoomById(roomId: string): Promise<Room> {
    try {
      console.log('Attempting to find room with ID:', roomId);

      if (!roomId || !ObjectId.isValid(roomId)) {
        console.log('Invalid room ID format:', roomId);
        throw new HttpException(400, 'Invalid room ID format');
      }

      const room = await this.rooms.findOne({ _id: new ObjectId(roomId) });

      console.log('Found room:', room);

      if (!room) {
        console.log('Room not found with ID:', roomId);
        throw new HttpException(404, "Room doesn't exist");
      }

      return room;
    } catch (error) {
      console.error('Error in findRoomById:', {
        roomId,
        error: error.message,
        stack: error.stack,
      });

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.name === 'BSONError') {
        throw new HttpException(400, 'Invalid room ID format');
      }

      throw new HttpException(500, 'Error while finding room: ' + error.message);
    }
  }

  public async createRoom(roomData: CreateRoomDto): Promise<Room> {
    const newRoom: Room = {
      roomNumber: roomData.roomNumber,
      type: roomData.type,
      price: roomData.price,
      isAvailable: true,
      description: roomData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.rooms.insertOne(newRoom);
    return { ...newRoom, _id: result.insertedId };
  }

  public async updateRoom(roomId: string, roomData: UpdateRoomDto): Promise<Room> {
    if (!ObjectId.isValid(roomId)) {
      throw new HttpException(400, 'Invalid room ID format');
    }

    const existingRoom = await this.rooms.findOne({ _id: new ObjectId(roomId) });
    if (!existingRoom) {
      throw new HttpException(404, "Room doesn't exist");
    }

    const updateRoomData = {
      ...existingRoom,
      ...roomData,
      updatedAt: new Date(),
      isAvailable: roomData.isAvailable ?? existingRoom.isAvailable,
    };

    await this.rooms.updateOne({ _id: new ObjectId(roomId) }, { $set: updateRoomData });

    return updateRoomData;
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

    try {
      const bookings = db.getDb().collection('bookings');

      console.log('Searching for available rooms between:', { startDate, endDate });

      const bookedRoomIds = await bookings.distinct('roomId', {
        status: { $nin: [BookingStatus.CANCELLED] },
        $or: [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
        ],
      });

      console.log('Found booked room IDs:', bookedRoomIds);

      if (!bookedRoomIds || bookedRoomIds.length === 0) {
        console.log('No bookings found, returning all available rooms');
        return this.rooms.find({ isAvailable: true }).toArray();
      }

      const validBookedRoomIds = bookedRoomIds.filter(id => id && ObjectId.isValid(id.toString())).map(id => new ObjectId(id.toString()));

      console.log('Converted room IDs:', validBookedRoomIds);

      const availableRooms = await this.rooms
        .find({
          isAvailable: true,
          _id: {
            $nin: validBookedRoomIds,
          },
        })
        .toArray();

      console.log('Found available rooms:', availableRooms.length);

      return availableRooms;
    } catch (error) {
      console.error('Error in findAvailableRooms:', error);
      throw new HttpException(500, 'Error while searching for available rooms');
    }
  }
}
