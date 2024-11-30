import { App } from '@/app';
import { ValidateEnv } from '@utils/validateEnv';
import { UserController } from '@controllers/users.controller';
import { AuthController } from '@controllers/auth.controller';
import { db } from '@utils/mongodb';

ValidateEnv();

const bootstrap = async () => {
  try {
    await db.connect().then(() => {
      console.log('Database connected');
      const app = new App([UserController, AuthController]);
      app.listen();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();

process.on('SIGTERM', async () => {
  process.exit(0);
});
