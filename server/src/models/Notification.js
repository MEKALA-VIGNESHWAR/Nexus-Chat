/**
 * Notification Model
 * Push notifications for messages, invites, and system events.
 * Simulates Mongoose Notification model using PostgreSQL queries.
 */
const db = require('../config/db');
const MongooseQuery = require('./mongooseMock');

async function populateNotification(notificationObj, populates) {
  if (!notificationObj) return null;

  if (
    notificationObj.data?.sender &&
    populates &&
    populates.some((p) => p.path === 'data.sender' || p.path === 'sender')
  ) {
    const { rows } = await db.query(
      'SELECT id, username, avatar_url, avatar_public_id FROM users WHERE id = $1',
      [notificationObj.data.sender]
    );
    if (rows.length > 0) {
      notificationObj.data.sender = {
        _id: rows[0].id,
        id: rows[0].id,
        username: rows[0].username,
        avatar: {
          url: rows[0].avatar_url,
          publicId: rows[0].avatar_public_id,
        },
      };
    }
  }
  return notificationObj;
}

class Notification {
  constructor(data) {
    if (!data) return;
    this._id = data.id || data._id;
    this.id = this._id;
    this.recipient = data.recipient_id || data.recipient;
    this.type = data.type;
    this.title = data.title;
    this.body = data.body || '';
    this.data = {
      room: data.data_room_id || (data.data ? data.data.room : null),
      message: data.data_message_id || (data.data ? data.data.message : null),
      sender: data.data_sender_id || (data.data ? data.data.sender : null),
    };
    this.read = data.read !== undefined ? data.read : false;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // ── Static methods ───────────────────────────────────

  /**
   * Create a single notification
   */
  static async create(doc) {
    const sql = `
      INSERT INTO notifications (recipient_id, type, title, body, data_room_id, data_message_id, data_sender_id, read)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const { rows } = await db.query(sql, [
      doc.recipient,
      doc.type,
      doc.title,
      doc.body || '',
      doc.data?.room || null,
      doc.data?.message || null,
      doc.data?.sender || null,
      doc.read !== undefined ? doc.read : false,
    ]);
    return new Notification(rows[0]);
  }

  /**
   * Bulk insert notifications (non-blocking)
   */
  static async insertMany(docs) {
    if (!Array.isArray(docs) || docs.length === 0) return [];

    const valueClauses = [];
    const params = [];
    let index = 1;

    for (const doc of docs) {
      valueClauses.push(
        `($${index}, $${index + 1}, $${index + 2}, $${index + 3}, $${index + 4}, $${index + 5}, $${index + 6}, $${index + 7})`
      );
      params.push(
        doc.recipient,
        doc.type,
        doc.title,
        doc.body || '',
        doc.data?.room || null,
        doc.data?.message || null,
        doc.data?.sender || null,
        doc.read !== undefined ? doc.read : false
      );
      index += 8;
    }

    const sql = `
      INSERT INTO notifications (recipient_id, type, title, body, data_room_id, data_message_id, data_sender_id, read)
      VALUES ${valueClauses.join(', ')}
      RETURNING *
    `;

    const { rows } = await db.query(sql, params);
    return rows.map((r) => new Notification(r));
  }

  /**
   * Find notification by ID
   */
  static findById(id) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;
      const { rows } = await db.query('SELECT * FROM notifications WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      const notification = new Notification(rows[0]);
      await populateNotification(notification, mq.populates);
      return notification;
    });
  }

  /**
   * Find by ID and update fields
   */
  static findByIdAndUpdate(id, updates, options = {}) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;

      const allowedFields = {
        read: 'read',
        title: 'title',
        body: 'body',
        type: 'type',
      };

      const data = updates.$set || updates;
      const setClauses = [];
      const params = [id];
      let paramIndex = 2;

      for (const [key, col] of Object.entries(allowedFields)) {
        if (data[key] !== undefined) {
          setClauses.push(`${col} = $${paramIndex}`);
          params.push(data[key]);
          paramIndex++;
        }
      }

      if (setClauses.length > 0) {
        const sql = `UPDATE notifications SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1`;
        await db.query(sql, params);
      }

      const { rows } = await db.query('SELECT * FROM notifications WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      const notification = new Notification(rows[0]);
      await populateNotification(notification, mq.populates);
      return notification;
    });
  }

  /**
   * Get notifications for a user with pagination.
   */
  static async getForUser(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const skip = (page - 1) * limit;

    let sql = 'SELECT * FROM notifications WHERE recipient_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      sql += ' AND read = FALSE';
    }

    // Count unread notifications
    const { rows: countRows } = await db.query(
      'SELECT COUNT(*)::integer as count FROM notifications WHERE recipient_id = $1 AND read = FALSE',
      [userId]
    );
    const unreadCount = countRows[0].count;

    // Get paginated results
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, skip);

    const { rows } = await db.query(sql, params);
    const notifications = rows.map((r) => new Notification(r));

    // Populate sender info
    const populates = [{ path: 'data.sender' }];
    for (const notification of notifications) {
      await populateNotification(notification, populates);
    }

    return { notifications, unreadCount };
  }

  /**
   * Mark all notifications as read for a user.
   */
  static async markAllRead(userId) {
    const sql = 'UPDATE notifications SET read = TRUE, updated_at = NOW() WHERE recipient_id = $1 AND read = FALSE';
    await db.query(sql, [userId]);
  }
}

module.exports = Notification;
