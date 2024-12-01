import { ExpressMiddlewareInterface } from 'routing-controllers';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User, UserRole } from '@interfaces/users.interface';
import { db } from '@utils/mongodb';
import { Container } from 'typedi';

export function Roles(roles: UserRole[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req: RequestWithUser = args[0];

      if (!roles.includes(req.user.role)) {
        throw new HttpException(403, 'You do not have permission to access this resource');
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
