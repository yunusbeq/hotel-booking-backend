import { Param, Body, Get, Post, Put, JsonController, Req, Authorized } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from '@dtos/bookings.dto';
import { BookingService } from '@services/bookings.service';
import { RequestWithUser } from '@interfaces/auth.interface';
import { Booking } from '@interfaces/bookings.interface';
import { ObjectId } from 'mongodb';

@Service()
@JsonController()
export class BookingController {
  public booking = Container.get(BookingService);

  private transformResponse(booking: Booking) {
    if (!booking) return null;

    return {
      ...booking,
      _id: booking._id instanceof ObjectId ? booking._id.toString() : booking._id,
      roomId: booking.roomId instanceof ObjectId ? booking.roomId.toString() : booking.roomId,
      userId: booking.userId instanceof ObjectId ? booking.userId.toString() : booking.userId,
    };
  }

  @Post('/bookings')
  @Authorized()
  async createBooking(@Body() bookingData: CreateBookingDto, @Req() req: RequestWithUser) {
    const createBookingData = await this.booking.createBooking(req.user._id.toString(), bookingData);
    return { data: this.transformResponse(createBookingData), message: 'created' };
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
