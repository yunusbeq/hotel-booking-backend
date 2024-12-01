import { Action } from 'routing-controllers';
import { Service } from 'typedi';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { db } from '@utils/mongodb';
import { ObjectId } from 'mongodb';

@Service()
export class AuthorizationChecker {
  async check(action: Action, roles: string[]) {
    try {
      const Authorization = action.request.cookies['Authorization'] || action.request.headers['authorization'];

      if (!Authorization) {
        throw new HttpException(401, 'Authentication token missing');
      }

      const token = Authorization.startsWith('Bearer ') ? Authorization.split('Bearer ')[1] : Authorization;

      if (!token) {
        throw new HttpException(401, 'Invalid token format');
      }

      try {
        const decoded = verify(token, SECRET_KEY) as { id: string; role: string };
        const users = db.getDb().collection<User>('users');

        const findUser = await users.findOne({ _id: new ObjectId(decoded.id) });
        if (!findUser) {
          throw new HttpException(401, 'User not found');
        }

        if (decoded.role !== findUser.role) {
          throw new HttpException(401, 'Invalid token - Role mismatch');
        }

        // Store user in request
        action.request.user = findUser;

        // Check if user has required roles
        if (roles.length > 0 && !roles.includes(findUser.role)) {
          return false;
        }

        return true;
      } catch (error) {
        throw new HttpException(401, 'Invalid token');
      }
    } catch (error) {
      return false;
    }
  }
}
