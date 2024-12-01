import { Service } from 'typedi';
import { Collection, ObjectId } from 'mongodb';
import { CreateBookingDto, UpdateBookingDto } from '@dtos/bookings.dto';
import { HttpException } from '@exceptions/HttpException';
import { Booking, BookingStatus } from '@interfaces/bookings.interface';
import { db } from '@utils/mongodb';

@Service()
export class BookingService {
  private bookings: Collection<Booking>;

  constructor() {
    this.bookings = db.getDb().collection<Booking>('bookings');
  }

  public async createBooking(userId: string, bookingData: CreateBookingDto): Promise<Booking> {
    // Check if room is available for the given dates
    const existingBooking = await this.bookings.findOne({
      roomId: new ObjectId(bookingData.roomId),
      status: { $ne: BookingStatus.CANCELLED },
      $or: [
        {
          startDate: { $lte: bookingData.endDate },
          endDate: { $gte: bookingData.startDate },
        },
      ],
    });

    if (existingBooking) {
      throw new HttpException(409, 'Room is not available for these dates');
    }

    const booking: Booking = {
      roomId: new ObjectId(bookingData.roomId),
      userId: new ObjectId(userId),
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      totalPrice: bookingData.totalPrice,
      status: BookingStatus.PENDING,
    };

    const result = await this.bookings.insertOne(booking);
    return { ...booking, _id: result.insertedId };
  }

  public async getUserBookings(userId: string): Promise<Booking[]> {
    return this.bookings.find({ userId: new ObjectId(userId) }).toArray();
  }

  public async updateBookingStatus(bookingId: string, userId: string, updateData: UpdateBookingDto): Promise<Booking> {
    const booking = await this.bookings.findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(userId),
    });

    if (!booking) {
      throw new HttpException(404, 'Booking not found');
    }

    await this.bookings.updateOne({ _id: new ObjectId(bookingId) }, { $set: { status: updateData.status } });

    return { ...booking, status: updateData.status };
  }
}
