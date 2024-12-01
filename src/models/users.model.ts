import { User, UserRole } from '@interfaces/users.interface';
import { ObjectId } from 'mongodb';

// password: password
export const UserModel: User[] = [
  {
    _id: new ObjectId(),
    email: 'example1@email.com',
    password: '$2b$10$TBEfaCe1oo.2jfkBDWcj/usBj4oECsW2wOoDXpCa2IH9xqCpEK/hC',
    role: UserRole.CUSTOMER,
  },
  {
    _id: new ObjectId(),
    email: 'example2@email.com',
    password: '$2b$10$TBEfaCe1oo.2jfkBDWcj/usBj4oECsW2wOoDXpCa2IH9xqCpEK/hC',
    role: UserRole.CUSTOMER,
  },
  {
    _id: new ObjectId(),
    email: 'example3@email.com',
    password: '$2b$10$TBEfaCe1oo.2jfkBDWcj/usBj4oECsW2wOoDXpCa2IH9xqCpEK/hC',
    role: UserRole.CUSTOMER,
  },
  {
    _id: new ObjectId(),
    email: 'example4@email.com',
    password: '$2b$10$TBEfaCe1oo.2jfkBDWcj/usBj4oECsW2wOoDXpCa2IH9xqCpEK/hC',
    role: UserRole.CUSTOMER,
  },
];
