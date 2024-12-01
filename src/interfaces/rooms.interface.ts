import { ObjectId } from 'mongodb';

export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
}

export interface Room {
  _id?: ObjectId;
  id?: string;
  roomNumber: string;
  type: RoomType;
  price: number;
  isAvailable: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
