/**
 * Media Model
 * Tracks files uploaded with metadata for display and management.
 * Simulates Mongoose Media model using PostgreSQL queries.
 */
const db = require('../config/db');
const MongooseQuery = require('./mongooseMock');

async function populateMedia(mediaObj, populates) {
  if (!mediaObj) return null;

  if (
    mediaObj.uploader &&
    populates &&
    populates.some((p) => p.path === 'uploader')
  ) {
    const { rows } = await db.query(
      'SELECT id, username, avatar_url, avatar_public_id FROM users WHERE id = $1',
      [mediaObj.uploader]
    );
    if (rows.length > 0) {
      mediaObj.uploader = {
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
  return mediaObj;
}

class Media {
  constructor(data) {
    if (!data) return;
    this._id = data.id || data._id;
    this.id = this._id;
    this.uploader = data.uploader_id || data.uploader;
    this.room = data.room_id || data.room;
    this.type = data.type;
    this.url = data.url;
    this.publicId = data.public_id || data.publicId;
    this.originalName = data.original_name || data.originalName;
    this.mimeType = data.mime_type || data.mimeType;
    this.size = Number(data.size);
    this.dimensions = {
      width: data.width !== undefined ? data.width : (data.dimensions ? data.dimensions.width : null),
      height: data.height !== undefined ? data.height : (data.dimensions ? data.dimensions.height : null),
    };
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  // ── Static methods ───────────────────────────────────

  /**
   * Create a media record
   */
  static async create(mediaData) {
    const sql = `
      INSERT INTO media (uploader_id, room_id, type, url, public_id, original_name, mime_type, size, width, height)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const { rows } = await db.query(sql, [
      mediaData.uploader,
      mediaData.room,
      mediaData.type,
      mediaData.url,
      mediaData.publicId,
      mediaData.originalName,
      mediaData.mimeType,
      mediaData.size,
      mediaData.dimensions?.width || null,
      mediaData.dimensions?.height || null,
    ]);
    return new Media(rows[0]);
  }

  /**
   * Find by ID
   */
  static findById(id) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;
      const { rows } = await db.query('SELECT * FROM media WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      const media = new Media(rows[0]);
      await populateMedia(media, mq.populates);
      return media;
    });
  }

  /**
   * Find by ID and delete
   */
  static findByIdAndDelete(id) {
    return new MongooseQuery(async (mq) => {
      if (!id) return null;
      await db.query('DELETE FROM media WHERE id = $1', [id]);
      return { _id: id };
    });
  }

  /**
   * Get all media files for a room, newest first.
   */
  static getByRoom(roomId, options = {}) {
    return new MongooseQuery(async (mq) => {
      let sql = 'SELECT * FROM media WHERE room_id = $1';
      const params = [roomId];
      let paramIndex = 2;

      if (options.type) {
        sql += ` AND type = $${paramIndex}`;
        params.push(options.type);
        paramIndex++;
      }

      // Collect limit if chained
      const limitVal = mq.limitVal || options.limit || 20;

      sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
      params.push(limitVal);

      const { rows } = await db.query(sql, params);
      const mediaList = rows.map((r) => new Media(r));

      for (const media of mediaList) {
        await populateMedia(media, mq.populates);
      }

      return mediaList;
    });
  }
}

module.exports = Media;
