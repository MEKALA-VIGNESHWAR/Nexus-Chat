/**
 * Room Model
 * Simulates Mongoose Room model using PostgreSQL queries and schema mapper.
 */
const db = require('../config/db');
const MongooseQuery = require('./mongooseMock');

function getNestedVal(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

async function populateRoom(roomObj, populates) {
  if (!roomObj) return null;

  const memberPopulate = populates.find((p) => p.path === 'members.user');
  const mSql = `
    SELECT rm.role, rm.joined_at, u.id, u.username, u.avatar_url, u.avatar_public_id, u.status_online, u.status_last_seen
    FROM room_members rm
    JOIN users u ON rm.user_id = u.id
    WHERE rm.room_id = $1
  `;
  const { rows: mRows } = await db.query(mSql, [roomObj._id]);
  roomObj.members = mRows.map((row) => ({
    user: memberPopulate ? {
      _id: row.id,
      id: row.id,
      username: row.username,
      avatar: { url: row.avatar_url, publicId: row.avatar_public_id },
      status: { online: row.status_online, lastSeen: row.status_last_seen },
    } : row.id,
    role: row.role,
    joinedAt: row.joined_at,
  }));

  if (roomObj.lastMessage && populates.some((p) => p.path === 'lastMessage')) {
    const { rows: msgRows } = await db.query('SELECT * FROM messages WHERE id = $1', [roomObj.lastMessage]);
    if (msgRows.length > 0) {
      const msg = msgRows[0];
      const { rows: senderRows } = await db.query('SELECT id, username, avatar_url FROM users WHERE id = $1', [msg.sender_id]);
      roomObj.lastMessage = {
        _id: msg.id,
        id: msg.id,
        room: msg.room_id,
        sender: senderRows.length > 0 ? {
          _id: senderRows[0].id,
          username: senderRows[0].username,
          avatar: { url: senderRows[0].avatar_url },
        } : msg.sender_id,
        content: { text: msg.content_text, iv: msg.content_iv },
        type: msg.type,
        media: msg.media_id,
        replyTo: msg.reply_to,
        deleted: msg.deleted,
        createdAt: msg.created_at,
        updatedAt: msg.updated_at,
      };
    }
  }

  return roomObj;
}

class Room {
  constructor(data) {
    if (!data) return;
    this._id = data.id || data._id;
    this.id = this._id;
    this.name = data.name || '';
    this.type = data.type;
    this.avatar = {
      url: data.avatar_url || (data.avatar ? data.avatar.url : ''),
      publicId: data.avatar_public_id || (data.avatar ? data.avatar.publicId : ''),
    };
    this.settings = {
      maxMembers: data.settings_max_members || (data.settings ? data.settings.maxMembers : 100),
      isPrivate: data.settings_is_private !== undefined ? data.settings_is_private : (data.settings ? data.settings.isPrivate : true),
    };
    this.createdBy = data.created_by || data.createdBy;
    this.lastMessage = data.last_message_id || data.lastMessage;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    this.members = data.members || [];
  }

  async save() {
    const sql = `
      UPDATE rooms
      SET name = $1, type = $2, avatar_url = $3, avatar_public_id = $4,
          settings_max_members = $5, settings_is_private = $6, created_by = $7,
          last_message_id = $8, updated_at = NOW()
      WHERE id = $9
    `;
    await db.query(sql, [
      this.name,
      this.type,
      this.avatar.url,
      this.avatar.publicId,
      this.settings.maxMembers,
      this.settings.isPrivate,
      this.createdBy,
      this.lastMessage ? (this.lastMessage._id || this.lastMessage) : null,
      this._id,
    ]);

    if (this.members && this.members.length > 0) {
      for (const member of this.members) {
        const memberUserId = member.user._id || member.user;
        await db.query(
          `INSERT INTO room_members (room_id, user_id, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (room_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
          [this._id, memberUserId, member.role || 'member']
        );
      }
      const activeUserIds = this.members.map((m) => m.user._id || m.user);
      await db.query(
        'DELETE FROM room_members WHERE room_id = $1 AND NOT (user_id = ANY($2))',
        [this._id, activeUserIds]
      );
    }

    return this;
  }

  // ── Static methods ───────────────────────────────────

  static findById(id) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;
      const { rows } = await db.query('SELECT * FROM rooms WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      const room = new Room(rows[0]);
      await populateRoom(room, mq.populates);
      return room;
    });
  }

  static findByIdAndUpdate(id, updates, options = {}) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;

      const allowedFields = {
        name: 'name',
        type: 'type',
        'avatar.url': 'avatar_url',
        'avatar.publicId': 'avatar_public_id',
        'settings.maxMembers': 'settings_max_members',
        'settings.isPrivate': 'settings_is_private',
        createdBy: 'created_by',
        lastMessage: 'last_message_id'
      };

      const data = updates.$set || updates;
      const setClauses = [];
      const params = [id];
      let paramIndex = 2;

      for (const [key, col] of Object.entries(allowedFields)) {
        const val = key.includes('.') ? getNestedVal(data, key) : data[key];
        if (val !== undefined) {
          setClauses.push(`${col} = $${paramIndex}`);
          params.push(val);
          paramIndex++;
        }
      }

      if (setClauses.length > 0) {
        const sql = `UPDATE rooms SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1`;
        await db.query(sql, params);
      }

      const { rows } = await db.query('SELECT * FROM rooms WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      const room = new Room(rows[0]);
      await populateRoom(room, mq.populates);
      return room;
    });
  }

  static findByIdAndDelete(id) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;
      await db.query('DELETE FROM rooms WHERE id = $1', [id]);
      return { _id: id };
    });
  }

  static find(query) {
    return new MongooseQuery(async (mq) => {
      let sql = 'SELECT r.* FROM rooms r';
      const params = [];

      if (query && query['members.user']) {
        sql += ' JOIN room_members rm ON r.id = rm.room_id WHERE rm.user_id = $1';
        params.push(query['members.user']);
      }

      const { rows } = await db.query(sql, params);
      const rooms = rows.map((r) => new Room(r));
      return rooms;
    });
  }

  static async create(roomData) {
    const sql = `
      INSERT INTO rooms (name, type, avatar_url, avatar_public_id, settings_max_members, settings_is_private, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const { rows } = await db.query(sql, [
      roomData.name || '',
      roomData.type,
      roomData.avatar?.url || '',
      roomData.avatar?.publicId || '',
      roomData.settings?.maxMembers || 100,
      roomData.settings?.isPrivate !== undefined ? roomData.settings.isPrivate : true,
      roomData.createdBy,
    ]);
    const newRoom = new Room(rows[0]);

    if (roomData.members && roomData.members.length > 0) {
      for (const member of roomData.members) {
        const memberUserId = member.user._id || member.user;
        await db.query(
          'INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, $3)',
          [newRoom._id, memberUserId, member.role || 'member']
        );
      }
    }

    return newRoom;
  }

  static async isMember(roomId, userId) {
    const { rows } = await db.query(
      'SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );
    return rows.length > 0;
  }

  static async isAdmin(roomId, userId) {
    const { rows } = await db.query(
      "SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2 AND role = 'admin'",
      [roomId, userId]
    );
    return rows.length > 0;
  }

  static async findDirectRoom(userId1, userId2) {
    const sql = `
      SELECT r.* FROM rooms r
      JOIN room_members rm1 ON r.id = rm1.room_id AND rm1.user_id = $1
      JOIN room_members rm2 ON r.id = rm2.room_id AND rm2.user_id = $2
      WHERE r.type = 'direct'
    `;
    const { rows } = await db.query(sql, [userId1, userId2]);
    if (rows.length === 0) return null;
    const room = new Room(rows[0]);
    await populateRoom(room, [{ path: 'members.user' }]);
    return room;
  }

  static getUserRooms(userId) {
    return new MongooseQuery(async (mq) => {
      const sql = `
        SELECT r.* FROM rooms r
        JOIN room_members rm ON r.id = rm.room_id
        WHERE rm.user_id = $1
        ORDER BY r.updated_at DESC
      `;
      const { rows } = await db.query(sql, [userId]);
      const rooms = rows.map((r) => new Room(r));

      const populates = [
        { path: 'members.user' },
        { path: 'lastMessage' }
      ];
      for (const room of rooms) {
        await populateRoom(room, populates);
      }
      return rooms;
    });
  }
}

module.exports = Room;
