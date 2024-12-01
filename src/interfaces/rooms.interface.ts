import { ObjectId } from 'mongodb';

export enum RoomType {
  BASIC = 'basic',
  PREMIUM = 'premium',
  SUITE = 'suite',
}

export interface Room {
  _id?: ObjectId;
  roomNumber: string;
  type: RoomType;
  price: number;
  isAvailable: boolean;
  description?: string;
}
