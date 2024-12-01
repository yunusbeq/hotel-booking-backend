import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI, DB_NAME } from '@config';
import { logger } from '@utils/logger';

class Database {
  private static instance: Database;
  private client: MongoClient;
  private db: Db;

  private constructor() {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
    this.client = new MongoClient(MONGODB_URI);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('MongoDB client is not initialized');
      }
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error('MongoDB connection error:', error);
      throw error;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.db;
  }
}

export const db = Database.getInstance();
