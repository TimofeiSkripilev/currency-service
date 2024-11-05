import { BaseModel } from './BaseModel';
import bcrypt from 'bcrypt';

export class User extends BaseModel {
  static tableName = 'users';
  
  username!: string;
  password!: string;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}