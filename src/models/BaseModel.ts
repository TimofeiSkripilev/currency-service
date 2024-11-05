import { Model } from 'objection';
import { knex } from '../config/database';

Model.knex(knex);

export class BaseModel extends Model {
  id!: number;
  created_at!: Date;
  updated_at!: Date;

  $beforeInsert() {
    const now = new Date();
    this.created_at = now;
    this.updated_at = now;
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }

  $formatDatabaseJson(json: any) {
    json = super.$formatDatabaseJson(json);
    if (json.created_at instanceof Date) {
      json.created_at = json.created_at.toISOString().replace('T', ' ').replace('Z', '');
    }
    if (json.updated_at instanceof Date) {
      json.updated_at = json.updated_at.toISOString().replace('T', ' ').replace('Z', '');
    }
    return json;
  }

  $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json);
    if (json.created_at) {
      json.created_at = new Date(json.created_at);
    }
    if (json.updated_at) {
      json.updated_at = new Date(json.updated_at);
    }
    return json;
  }
}