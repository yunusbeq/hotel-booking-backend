import { Param, Body, Get, Post, Put, JsonController, Req, Authorized, HttpException } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from '@dtos/bookings.dto';
import { BookingService } from '@services/bookings.service';
import { RequestWithUser } from '@interfaces/auth.interface';
import { Booking } from '@interfaces/bookings.interface';
import { ObjectId } from 'mongodb';
import { RoomService } from '@services/rooms.service';

interface TransformedBooking extends Omit<Booking, '_id' | 'roomId' | 'userId'> {
  _id: string;
  roomId: string;
  userId: string;
}

@Service()
@JsonController()
export class BookingController {
  public booking = Container.get(BookingService);
  public room = Container.get(RoomService);

  private transformResponse(booking: Booking): TransformedBooking | null {
    if (!booking) return null;

    return {
      ...booking,
      _id: booking._id ? booking._id.toString() : '',
      roomId: booking.roomId ? booking.roomId.toString() : '',
      userId: booking.userId ? booking.userId.toString() : '',
    };
  }

  @Post('/bookings')
  @Authorized()
  async createBooking(@Body() bookingData: CreateBookingDto, @Req() req: RequestWithUser) {
    const isAvailable = await this.room.findAvailableRooms(new Date(bookingData.startDate), new Date(bookingData.endDate));

    const requestedRoom = isAvailable.find(room => room._id.toString() === bookingData.roomId);
    if (!requestedRoom) {
      throw new HttpException(409, 'Room is not available for these dates');
    }

    const createBookingData = await this.booking.createBooking(req.user._id.toString(), bookingData);

    return {
      data: this.transformResponse(createBookingData),
      message: 'booking created successfully',
    };
  }

  @Get('/bookings')
  @Authorized()
  async getUserBookings(@Req() req: RequestWithUser) {
    const bookings = await this.booking.getUserBookings(req.user._id.toString());
    return {
      data: bookings.map(booking => this.transformResponse(booking)),
      message: 'findAll',
    };
  }

  @Get('/bookings/:id')
  @Authorized()
  async getBooking(@Param('id') bookingId: string, @Req() req: RequestWithUser) {
    const booking = await this.booking.getBookingById(bookingId, req.user._id.toString());
    return { data: this.transformResponse(booking), message: 'findOne' };
  }

  @Put('/bookings/:id/cancel')
  @Authorized()
  async cancelBooking(@Param('id') bookingId: string, @Body() cancelData: CancelBookingDto, @Req() req: RequestWithUser) {
    const cancelledBooking = await this.booking.cancelBooking(bookingId, req.user._id.toString(), cancelData);
    return { data: this.transformResponse(cancelledBooking), message: 'cancelled' };
  }
}
