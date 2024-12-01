import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { UserController } from '@controllers/users.controller';
import { AuthController } from '@controllers/auth.controller';
import { RoomController } from '@controllers/rooms.controller';
import { BookingController } from '@controllers/bookings.controller';
import { db } from '@utils/mongodb';

ValidateEnv();

const bootstrap = async () => {
  try {
    await db.connect().then(() => {
      console.log('Database connected');
      const app = new App([UserController, AuthController, RoomController, BookingController]);
      app.listen();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();

const gracefulShutdown = async () => {
  try {
    await db.disconnect();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error while closing database connection:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
