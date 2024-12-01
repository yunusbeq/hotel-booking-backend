import { Service } from 'typedi';
import { Collection, ObjectId } from 'mongodb';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from '@dtos/bookings.dto';
import { HttpException } from '@exceptions/HttpException';
import { Booking, BookingStatus } from '@interfaces/bookings.interface';
import { db } from '@utils/mongodb';
import { PaymentStatus } from '@interfaces/bookings.interface';

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
      paymentStatus: PaymentStatus.PENDING,
      cancellationDeadline: new Date(bookingData.startDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.bookings.insertOne(booking);
    return { ...booking, _id: result.insertedId };
  }

  public async getUserBookings(userId: string): Promise<Booking[]> {
    return this.bookings.find({ userId: new ObjectId(userId) }).toArray();
  }

  public async updateBookingStatus(bookingId: string, userId: string, updateData: UpdateBookingDto): Promise<Booking> {
    const booking = await this.getBookingById(bookingId, userId);

    await this.bookings.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          status: updateData.status,
          updatedAt: new Date(),
        },
      },
    );

    return { ...booking, status: updateData.status, updatedAt: new Date() };
  }

  public async cancelBooking(bookingId: string, userId: string, cancelData: CancelBookingDto): Promise<Booking> {
    const booking = await this.getBookingById(bookingId, userId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new HttpException(400, 'Booking is already cancelled');
    }

    if (new Date() > booking.cancellationDeadline) {
      throw new HttpException(400, 'Cancellation deadline has passed');
    }

    await this.bookings.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          status: BookingStatus.CANCELLED,
          cancellationReason: cancelData.cancellationReason,
          updatedAt: new Date(),
        },
      },
    );

    return {
      ...booking,
      status: BookingStatus.CANCELLED,
      cancellationReason: cancelData.cancellationReason,
      updatedAt: new Date(),
    };
  }
}
