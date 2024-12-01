import { Param, Body, Get, Post, Put, JsonController, Req } from 'routing-controllers';
import { Container, Service } from 'typedi';
import { CreateBookingDto, UpdateBookingDto } from '@dtos/bookings.dto';
import { BookingService } from '@services/bookings.service';
import { RequestWithUser } from '@interfaces/auth.interface';

@Service()
@JsonController()
export class BookingController {
  public booking = Container.get(BookingService);

  @Post('/bookings')
  async createBooking(@Body() bookingData: CreateBookingDto, @Req() req: RequestWithUser) {
    const createBookingData = await this.booking.createBooking(req.user._id.toString(), bookingData);
    return { data: createBookingData, message: 'created' };
  }

  @Get('/bookings')
  async getUserBookings(@Req() req: RequestWithUser) {
    const bookings = await this.booking.getUserBookings(req.user._id.toString());
    return { data: bookings, message: 'findAll' };
  }

  @Put('/bookings/:id')
  async updateBookingStatus(@Param('id') bookingId: string, @Body() updateData: UpdateBookingDto, @Req() req: RequestWithUser) {
    const updatedBooking = await this.booking.updateBookingStatus(bookingId, req.user._id.toString(), updateData);
    return { data: updatedBooking, message: 'updated' };
  }
}
