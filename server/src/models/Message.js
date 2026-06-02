/**
 * Message Model
 * Simulates Mongoose Message model using PostgreSQL queries and schema mapper.
 */
const db = require('../config/db');
const MongooseQuery = require('./mongooseMock');

async function populateMessage(msgObj, populates) {
  if (!msgObj) return null;

  if (msgObj.sender && populates.some((p) => p.path === 'sender')) {
    const { rows } = await db.query('SELECT id, username, avatar_url, avatar_public_id FROM users WHERE id = $1', [msgObj.sender]);
    if (rows.length > 0) {
      msgObj.sender = {
        _id: rows[0].id,
        id: rows[0].id,
        username: rows[0].username,
        avatar: { url: rows[0].avatar_url, publicId: rows[0].avatar_public_id }
      };
    }
  }

  if (msgObj.media && populates.some((p) => p.path === 'media')) {
    const { rows } = await db.query('SELECT * FROM media WHERE id = $1', [msgObj.media]);
    if (rows.length > 0) {
      const m = rows[0];
      msgObj.media = {
        _id: m.id,
        id: m.id,
        uploader: m.uploader_id,
        room: m.room_id,
        type: m.type,
        url: m.url,
        publicId: m.public_id,
        originalName: m.original_name,
        mimeType: m.mime_type,
        size: m.size,
        dimensions: { width: m.width, height: m.height }
      };
    }
  }

  if (msgObj.replyTo && populates.some((p) => p.path === 'replyTo')) {
    const { rows } = await db.query('SELECT * FROM messages WHERE id = $1', [msgObj.replyTo]);
    if (rows.length > 0) {
      const rMsg = rows[0];
      const { rows: rSenderRows } = await db.query('SELECT id, username FROM users WHERE id = $1', [rMsg.sender_id]);
      msgObj.replyTo = {
        _id: rMsg.id,
        id: rMsg.id,
        content: { text: rMsg.content_text },
        sender: rSenderRows.length > 0 ? {
          _id: rSenderRows[0].id,
          id: rSenderRows[0].id,
          username: rSenderRows[0].username
        } : rMsg.sender_id
      };
    }
  }

  const { rows: rRows } = await db.query('SELECT user_id, read_at FROM message_read_by WHERE message_id = $1', [msgObj._id]);
  msgObj.readBy = rRows.map((r) => ({ user: r.user_id, readAt: r.read_at }));

  const { rows: dRows } = await db.query('SELECT user_id, delivered_at FROM message_delivered_to WHERE message_id = $1', [msgObj._id]);
  msgObj.deliveredTo = dRows.map((d) => ({ user: d.user_id, deliveredAt: d.delivered_at }));

  return msgObj;
}

class Message {
  constructor(data) {
    if (!data) return;
    this._id = data.id || data._id;
    this.id = this._id;
    this.room = data.room_id || data.room;
    this.sender = data.sender_id || data.sender;
    this.content = {
      text: data.content_text || (data.content ? data.content.text : ''),
      iv: data.content_iv || (data.content ? data.content.iv : ''),
    };
    this.type = data.type || 'text';
    this.media = data.media_id || data.media;
    this.replyTo = data.reply_to || data.replyTo;
    this.deleted = data.deleted !== undefined ? data.deleted : false;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    this.readBy = data.readBy || [];
    this.deliveredTo = data.deliveredTo || [];
  }

  // ── Static methods ───────────────────────────────────

  static async create(msgData) {
    const sql = `
      INSERT INTO messages (room_id, sender_id, type, content_text, content_iv, media_id, reply_to)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const { rows } = await db.query(sql, [
      msgData.room,
      msgData.sender,
      msgData.type || 'text',
      msgData.content?.text || '',
      msgData.content?.iv || '',
      msgData.media,
      msgData.replyTo,
    ]);
    const message = new Message(rows[0]);

    await db.query(
      'INSERT INTO message_read_by (message_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [message._id, message.sender]
    );

    return message;
  }

  static findById(id) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;
      const { rows } = await db.query('SELECT * FROM messages WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      const message = new Message(rows[0]);
      await populateMessage(message, mq.populates);
      return message;
    });
  }

  static async getByRoom(roomId, options = {}) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 50, 100);
    const skip = (page - 1) * limit;

    const { rows: cntRows } = await db.query(
      'SELECT COUNT(*)::integer as count FROM messages WHERE room_id = $1 AND deleted = false',
      [roomId]
    );
    const totalCount = cntRows[0].count;

    const sql = `
      SELECT * FROM messages
      WHERE room_id = $1 AND deleted = false
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await db.query(sql, [roomId, limit, skip]);
    const messages = rows.map((r) => new Message(r));

    const populates = [
      { path: 'sender' },
      { path: 'media' },
      { path: 'replyTo' }
    ];
    for (const msg of messages) {
      await populateMessage(msg, populates);
    }

    return {
      messages: messages.reverse(),
      totalCount,
      hasMore: skip + messages.length < totalCount
    };
  }

  static async markAsRead(roomId, userId) {
    const sql = `
      INSERT INTO message_read_by (message_id, user_id)
      SELECT m.id, $1 FROM messages m
      LEFT JOIN message_read_by mr ON m.id = mr.message_id AND mr.user_id = $1
      WHERE m.room_id = $2 AND m.sender_id != $1 AND mr.message_id IS NULL AND m.deleted = false
      ON CONFLICT DO NOTHING
    `;
    await db.query(sql, [userId, roomId]);
  }

  static async markAsDelivered(roomId, userId) {
    const sql = `
      INSERT INTO message_delivered_to (message_id, user_id)
      SELECT m.id, $1 FROM messages m
      LEFT JOIN message_delivered_to md ON m.id = md.message_id AND md.user_id = $1
      WHERE m.room_id = $2 AND m.sender_id != $1 AND md.message_id IS NULL AND m.deleted = false
      ON CONFLICT DO NOTHING
    `;
    await db.query(sql, [userId, roomId]);
  }
}

module.exports = Message;
