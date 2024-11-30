import { cleanEnv, port, str } from 'envalid';

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    MONGODB_URI: str(),
    DB_NAME: str(),
    SECRET_KEY: str(),
    LOG_FORMAT: str(),
    LOG_DIR: str(),
    ORIGIN: str(),
  });
};
