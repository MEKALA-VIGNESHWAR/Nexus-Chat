/**
 * User Model
 * Simulates Mongoose User model using PostgreSQL queries and schema mapper.
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const MongooseQuery = require('./mongooseMock');
const { AUTH } = require('../utils/constants');

function getNestedVal(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

class User {
  constructor(data) {
    if (!data) return;
    this._id = data.id || data._id;
    this.id = this._id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.avatar = {
      url: data.avatar_url || (data.avatar ? data.avatar.url : ''),
      publicId: data.avatar_public_id || (data.avatar ? data.avatar.publicId : ''),
    };
    this.status = {
      online: data.status_online !== undefined ? data.status_online : (data.status ? data.status.online : false),
      lastSeen: data.status_last_seen || (data.status ? data.status.lastSeen : new Date()),
    };
    this.refreshToken = data.refresh_token || data.refreshToken;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  async comparePassword(candidatePassword) {
    if (!this.password) {
      const { rows } = await db.query('SELECT password FROM users WHERE id = $1', [this._id]);
      if (rows.length === 0) return false;
      this.password = rows[0].password;
    }
    return bcrypt.compare(candidatePassword, this.password);
  }

  toPublicProfile() {
    return {
      _id: this._id,
      id: this._id,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  async save() {
    const queryStr = `
      UPDATE users
      SET username = $1, email = $2, password = $3, avatar_url = $4, avatar_public_id = $5,
          status_online = $6, status_last_seen = $7, refresh_token = $8, updated_at = NOW()
      WHERE id = $9
    `;
    await db.query(queryStr, [
      this.username.toLowerCase(),
      this.email.toLowerCase(),
      this.password,
      this.avatar.url,
      this.avatar.publicId,
      this.status.online,
      this.status.lastSeen,
      this.refreshToken,
      this._id
    ]);
    return this;
  }

  // Mongoose save compatibility middleware triggers
  isModified(field) {
    return true; // Simple mock returning true
  }

  // ── Static methods ───────────────────────────────────

  static findById(id) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      return new User(rows[0]);
    });
  }

  static findByIdAndUpdate(id, updates, options = {}) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;
      if (updates.$addToSet && updates.$addToSet.rooms) {
        await db.query('INSERT INTO room_members (user_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, updates.$addToSet.rooms]);
      } else if (updates.$pull && updates.$pull.rooms) {
        await db.query('DELETE FROM room_members WHERE user_id = $1 AND room_id = $2', [id, updates.$pull.rooms]);
      } else {
        const allowedFields = {
          username: 'username',
          email: 'email',
          password: 'password',
          'avatar.url': 'avatar_url',
          'avatar.publicId': 'avatar_public_id',
          'status.online': 'status_online',
          'status.lastSeen': 'status_last_seen',
          refreshToken: 'refresh_token',
        };

        const data = updates.$set || updates;
        const setClauses = [];
        const params = [id];
        let paramIndex = 2;

        for (const [key, col] of Object.entries(allowedFields)) {
          const val = data[key] !== undefined ? data[key] : (key.includes('.') ? getNestedVal(data, key) : undefined);
          if (val !== undefined) {
            setClauses.push(`${col} = $${paramIndex}`);
            params.push(val);
            paramIndex++;
          }
        }

        if (setClauses.length > 0) {
          const sql = `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
          const { rows } = await db.query(sql, params);
          if (rows.length > 0) return new User(rows[0]);
        }
      }

      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return rows.length > 0 ? new User(rows[0]) : null;
    });
  }

  static findOne(query) {
    return new MongooseQuery(async (mq) => {
      let sql = 'SELECT * FROM users WHERE ';
      const params = [];

      if (query.$or) {
        const clauses = [];
        query.$or.forEach((item, idx) => {
          const key = Object.keys(item)[0];
          const val = item[key];
          clauses.push(`${key} = $${idx + 1}`);
          params.push(val.toLowerCase());
        });
        sql += `(${clauses.join(' OR ')})`;
      } else {
        const key = Object.keys(query)[0];
        const val = query[key];
        sql += `${key} = $1`;
        params.push(val.toLowerCase());
      }

      const { rows } = await db.query(sql, params);
      return rows.length > 0 ? new User(rows[0]) : null;
    });
  }

  static async create(userData) {
    const salt = await bcrypt.genSalt(AUTH.BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const sql = `
      INSERT INTO users (username, email, password, avatar_url, avatar_public_id, status_online, status_last_seen)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const { rows } = await db.query(sql, [
      userData.username.toLowerCase(),
      userData.email.toLowerCase(),
      hashedPassword,
      userData.avatar?.url || '',
      userData.avatar?.publicId || '',
      userData.status?.online || false,
      userData.status?.lastSeen || new Date()
    ]);
    return new User(rows[0]);
  }

  static findByEmailWithPassword(email) {
    return new MongooseQuery(async (mq) => {
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      return rows.length > 0 ? new User(rows[0]) : null;
    });
  }

  static findByIdWithRefreshToken(id) {
    return new MongooseQuery(async (mq) => {
      const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return rows.length > 0 ? new User(rows[0]) : null;
    });
  }

  static searchByUsername(searchTerm, excludeUserId, limit = 20) {
    return new MongooseQuery(async (mq) => {
      const sql = `
        SELECT * FROM users
        WHERE username ILIKE $1 AND id != $2
        LIMIT $3
      `;
      const { rows } = await db.query(sql, [`%${searchTerm}%`, excludeUserId, limit]);
      return rows.map((r) => new User(r));
    });
  }

  static find(query) {
    return new MongooseQuery(async (mq) => {
      let sql = 'SELECT * FROM users';
      const params = [];

      if (query && query['status.online'] === true) {
        sql += ' WHERE status_online = TRUE';
      } else if (query && query._id && query._id.$in) {
        sql += ' WHERE id = ANY($1)';
        params.push(query._id.$in);
      }

      const { rows } = await db.query(sql, params);
      return rows.map((r) => new User(r));
    });
  }

  static updateMany(filter, update) {
    return new MongooseQuery(async (mq) => {
      if (filter._id && filter._id.$in && update.$addToSet && update.$addToSet.rooms) {
        const room_id = update.$addToSet.rooms;
        const user_ids = filter._id.$in;
        for (const user_id of user_ids) {
          await db.query('INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [room_id, user_id]);
        }
      }
      return { modifiedCount: 0 };
    });
  }
}

module.exports = User;
