import { ObjectId } from 'mongodb';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
