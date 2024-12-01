import { Service } from 'typedi';
import { Collection, ObjectId } from 'mongodb';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from '@dtos/bookings.dto';
import { HttpException } from '@exceptions/HttpException';
import { Booking, BookingStatus, PaymentStatus } from '@interfaces/bookings.interface';
import { db } from '@utils/mongodb';

@Service()
export class BookingService {
  private bookings: Collection<Booking>;

  constructor() {
    this.bookings = db.getDb().collection<Booking>('bookings');

    // Create indexes
    this.bookings.createIndex({ roomId: 1, startDate: 1, endDate: 1 });
    this.bookings.createIndex({ userId: 1 });
    this.bookings.createIndex({ status: 1 });
  }

  public async getBookingById(bookingId: string, userId: string): Promise<Booking> {
    if (!ObjectId.isValid(bookingId)) {
      throw new HttpException(400, 'Invalid booking ID format');
    }

    const booking = await this.bookings.findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(userId),
    });

    if (!booking) {
      throw new HttpException(404, 'Booking not found');
    }

    return booking;
  }

  public async getUserBookings(userId: string): Promise<Booking[]> {
    if (!ObjectId.isValid(userId)) {
      throw new HttpException(400, 'Invalid user ID format');
    }
    return this.bookings.find({ userId: new ObjectId(userId) }).toArray();
  }

  public async createBooking(userId: string, bookingData: CreateBookingDto): Promise<Booking> {
    if (!ObjectId.isValid(bookingData.roomId)) {
      throw new HttpException(400, 'Invalid room ID format');
    }

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
      startDate: new Date(bookingData.startDate),
      endDate: new Date(bookingData.endDate),
      totalPrice: bookingData.totalPrice,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      cancellationDeadline: new Date(bookingData.startDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.bookings.insertOne(booking);
    return { ...booking, _id: result.insertedId };
  }

  public async cancelBooking(bookingId: string, userId: string, cancelData: CancelBookingDto): Promise<Booking> {
    const booking = await this.getBookingById(bookingId, userId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new HttpException(400, 'Booking is already cancelled');
    }

    const updatedBooking: Booking = {
      ...booking,
      status: BookingStatus.CANCELLED,
      cancellationReason: cancelData.cancellationReason,
      updatedAt: new Date(),
    };

    await this.bookings.updateOne({ _id: new ObjectId(bookingId) }, { $set: updatedBooking });

    return updatedBooking;
  }
}
