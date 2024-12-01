import { ObjectId } from 'mongodb';

export interface Booking {
  _id?: ObjectId;
  roomId: ObjectId;
  userId: ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}
