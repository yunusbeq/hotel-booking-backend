import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { Response, NextFunction } from 'express';

@Service()
export class AdminMiddleware implements ExpressMiddlewareInterface {
  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    if (!req.user || !req.user.isAdmin) {
      throw new HttpException(403, 'Admin access required');
    }
    next();
  }
}
