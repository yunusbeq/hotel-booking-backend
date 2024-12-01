import { ObjectId } from 'mongodb';

export interface Booking {
  _id?: ObjectId;
  roomId: ObjectId;
  userId: ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  cancellationDeadline: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
}
