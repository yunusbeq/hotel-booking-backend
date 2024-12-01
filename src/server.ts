import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { UserController } from '@controllers/users.controller';
import { AuthController } from '@controllers/auth.controller';
import { db } from '@utils/mongodb';
import { BookingController } from '@controllers/bookings.controller';
import { RoomsController } from '@controllers/rooms.controller';
import { logger } from '@utils/logger';

const bootstrap = async () => {
  try {
    ValidateEnv();

    await db.connect();

    const app = new App([UserController, AuthController, BookingController, RoomsController]);
    app.listen();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap().catch(error => {
  logger.error('Bootstrap failed:', error);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  try {
    await db.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});
