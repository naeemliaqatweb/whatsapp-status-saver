package com.statussaver

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

class NotificationDbHelper(private val context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val TAG = "NotificationDbHelper"
        const val DATABASE_NAME = "whatsapp_recovery.db"
        const val DATABASE_VERSION = 2

        const val TABLE_MESSAGES = "messages"
        const val COL_ID = "_id"
        const val COL_PACKAGE = "package_name"
        const val COL_SENDER = "sender_name"
        const val COL_TEXT = "message_text"
        const val COL_TIMESTAMP = "timestamp"
        const val COL_IS_DELETED = "is_deleted"
        const val COL_APP_TYPE = "app_type" // "whatsapp" or "business"
        const val COL_MEDIA_TYPE = "media_type" // "voice", "audio", "image", "video", null
        const val COL_MEDIA_URI = "media_uri" // file://...
        const val COL_MEDIA_DURATION = "media_duration" // in seconds
        const val COL_MEDIA_SIZE = "media_size" // in bytes
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createTable = """
            CREATE TABLE $TABLE_MESSAGES (
                $COL_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COL_PACKAGE TEXT,
                $COL_SENDER TEXT,
                $COL_TEXT TEXT,
                $COL_TIMESTAMP INTEGER,
                $COL_IS_DELETED INTEGER DEFAULT 0,
                $COL_APP_TYPE TEXT DEFAULT 'whatsapp',
                $COL_MEDIA_TYPE TEXT,
                $COL_MEDIA_URI TEXT,
                $COL_MEDIA_DURATION INTEGER DEFAULT 0,
                $COL_MEDIA_SIZE INTEGER DEFAULT 0
            )
        """.trimIndent()
        db.execSQL(createTable)
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_sender ON $TABLE_MESSAGES($COL_SENDER)")
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_timestamp ON $TABLE_MESSAGES($COL_TIMESTAMP)")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        if (oldVersion < 2) {
            try {
                db.execSQL("ALTER TABLE $TABLE_MESSAGES ADD COLUMN $COL_MEDIA_TYPE TEXT")
                db.execSQL("ALTER TABLE $TABLE_MESSAGES ADD COLUMN $COL_MEDIA_URI TEXT")
                db.execSQL("ALTER TABLE $TABLE_MESSAGES ADD COLUMN $COL_MEDIA_DURATION INTEGER DEFAULT 0")
                db.execSQL("ALTER TABLE $TABLE_MESSAGES ADD COLUMN $COL_MEDIA_SIZE INTEGER DEFAULT 0")
            } catch (e: Exception) {
                Log.e(TAG, "Error adding columns on upgrade: ${e.message}")
            }
        }
    }

    @Synchronized
    fun insertMessage(
        packageName: String,
        sender: String,
        text: String,
        timestamp: Long,
        isDeleted: Boolean = false,
        appType: String = "whatsapp",
        mediaType: String? = null,
        mediaUri: String? = null,
        mediaDuration: Int = 0,
        mediaSize: Long = 0
    ): Long {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_PACKAGE, packageName)
            put(COL_SENDER, sender)
            put(COL_TEXT, text)
            put(COL_TIMESTAMP, timestamp)
            put(COL_IS_DELETED, if (isDeleted) 1 else 0)
            put(COL_APP_TYPE, appType)
            put(COL_MEDIA_TYPE, mediaType)
            put(COL_MEDIA_URI, mediaUri)
            put(COL_MEDIA_DURATION, mediaDuration)
            put(COL_MEDIA_SIZE, mediaSize)
        }
        return db.insert(TABLE_MESSAGES, null, values)
    }

    @Synchronized
    fun markLatestMessageDeleted(sender: String, deleteTimestamp: Long): Boolean {
        val db = writableDatabase
        // Find latest non-deleted message from this sender within the last 12 hours
        val timeThreshold = deleteTimestamp - (12 * 60 * 60 * 1000)
        val cursor = db.rawQuery(
            """
            SELECT $COL_ID, $COL_TEXT, $COL_MEDIA_TYPE, $COL_MEDIA_URI FROM $TABLE_MESSAGES 
            WHERE $COL_SENDER = ? AND $COL_IS_DELETED = 0 AND $COL_TIMESTAMP >= ?
            ORDER BY $COL_TIMESTAMP DESC LIMIT 1
            """.trimIndent(),
            arrayOf(sender, timeThreshold.toString())
        )

        var marked = false
        if (cursor.moveToFirst()) {
            val id = cursor.getLong(cursor.getColumnIndexOrThrow(COL_ID))
            val values = ContentValues().apply {
                put(COL_IS_DELETED, 1)
            }
            db.update(TABLE_MESSAGES, values, "$COL_ID = ?", arrayOf(id.toString()))
            marked = true
        }
        cursor.close()

        if (!marked) {
            // Insert a placeholder deleted notification message
            insertMessage(
                packageName = "com.whatsapp",
                sender = sender,
                text = "This message was deleted by sender",
                timestamp = deleteTimestamp,
                isDeleted = true
            )
            marked = true
        }
        return marked
    }

    fun getChatsList(): WritableArray {
        val result = Arguments.createArray()
        val db = readableDatabase

        val query = """
            SELECT 
                $COL_SENDER,
                $COL_PACKAGE,
                $COL_APP_TYPE,
                $COL_TEXT,
                $COL_TIMESTAMP,
                $COL_IS_DELETED,
                $COL_MEDIA_TYPE,
                (SELECT COUNT(*) FROM $TABLE_MESSAGES m2 WHERE m2.$COL_SENDER = m1.$COL_SENDER) as total_messages,
                (SELECT COUNT(*) FROM $TABLE_MESSAGES m3 WHERE m3.$COL_SENDER = m1.$COL_SENDER AND m3.$COL_IS_DELETED = 1) as deleted_count
            FROM $TABLE_MESSAGES m1
            WHERE $COL_ID IN (
                SELECT MAX($COL_ID) FROM $TABLE_MESSAGES GROUP BY $COL_SENDER
            )
            ORDER BY $COL_TIMESTAMP DESC
        """.trimIndent()

        var cursor: Cursor? = null
        try {
            cursor = db.rawQuery(query, null)
            while (cursor.moveToNext()) {
                val sender = cursor.getString(cursor.getColumnIndexOrThrow(COL_SENDER))
                val pkg = cursor.getString(cursor.getColumnIndexOrThrow(COL_PACKAGE))
                val appType = cursor.getString(cursor.getColumnIndexOrThrow(COL_APP_TYPE))
                val lastText = cursor.getString(cursor.getColumnIndexOrThrow(COL_TEXT))
                val timestamp = cursor.getLong(cursor.getColumnIndexOrThrow(COL_TIMESTAMP))
                val isDeleted = cursor.getInt(cursor.getColumnIndexOrThrow(COL_IS_DELETED)) == 1
                val mediaType = cursor.getString(cursor.getColumnIndexOrThrow(COL_MEDIA_TYPE))
                val totalMessages = cursor.getInt(cursor.getColumnIndexOrThrow("total_messages"))
                val deletedCount = cursor.getInt(cursor.getColumnIndexOrThrow("deleted_count"))

                val chatMap = Arguments.createMap().apply {
                    putString("id", sender)
                    putString("senderName", sender)
                    putString("packageName", pkg)
                    putString("appType", appType)
                    putString("lastMessage", lastText)
                    putDouble("timestamp", timestamp.toDouble())
                    putString("timeAgo", formatTimeAgo(timestamp))
                    putBoolean("isDeleted", isDeleted)
                    putString("mediaType", mediaType)
                    putInt("totalMessages", totalMessages)
                    putInt("deletedCount", deletedCount)
                }
                result.pushMap(chatMap)
            }
        } finally {
            cursor?.close()
        }

        return result
    }

    fun getMessagesForChat(sender: String): WritableArray {
        val result = Arguments.createArray()
        val db = readableDatabase

        val query = """
            SELECT 
                $COL_ID, 
                $COL_SENDER, 
                $COL_TEXT, 
                $COL_TIMESTAMP, 
                $COL_IS_DELETED, 
                $COL_APP_TYPE,
                $COL_MEDIA_TYPE,
                $COL_MEDIA_URI,
                $COL_MEDIA_DURATION,
                $COL_MEDIA_SIZE
            FROM $TABLE_MESSAGES
            WHERE $COL_SENDER = ?
            ORDER BY $COL_TIMESTAMP ASC
        """.trimIndent()

        var cursor: Cursor? = null
        try {
            cursor = db.rawQuery(query, arrayOf(sender))
            while (cursor.moveToNext()) {
                val id = cursor.getLong(cursor.getColumnIndexOrThrow(COL_ID))
                val senderName = cursor.getString(cursor.getColumnIndexOrThrow(COL_SENDER))
                val text = cursor.getString(cursor.getColumnIndexOrThrow(COL_TEXT))
                val timestamp = cursor.getLong(cursor.getColumnIndexOrThrow(COL_TIMESTAMP))
                val isDeleted = cursor.getInt(cursor.getColumnIndexOrThrow(COL_IS_DELETED)) == 1
                val appType = cursor.getString(cursor.getColumnIndexOrThrow(COL_APP_TYPE))
                var mediaType = cursor.getString(cursor.getColumnIndexOrThrow(COL_MEDIA_TYPE))
                val mediaUri = cursor.getString(cursor.getColumnIndexOrThrow(COL_MEDIA_URI))
                var mediaDuration = cursor.getInt(cursor.getColumnIndexOrThrow(COL_MEDIA_DURATION))
                val mediaSize = cursor.getLong(cursor.getColumnIndexOrThrow(COL_MEDIA_SIZE))

                var resolvedMediaUri = mediaUri

                if (mediaType == "image" || text.contains("Photo") || text.contains("📷")) {
                    mediaType = "image"
                    if (resolvedMediaUri.isNullOrEmpty() || !java.io.File(resolvedMediaUri.replace("file://", "")).exists()) {
                        val fallback = WhatsAppMediaRecoveryHelper.getAnyAvailableImage(context)
                        if (fallback != null) {
                            resolvedMediaUri = fallback.cachedFilePath
                        }
                    }
                } else if (mediaType == "voice" || mediaType == "audio" || text.contains("Voice message")) {
                    mediaType = "voice"
                    if (resolvedMediaUri.isNullOrEmpty() || !java.io.File(resolvedMediaUri.replace("file://", "")).exists()) {
                        val fallback = WhatsAppMediaRecoveryHelper.getAnyAvailableVoiceNote(context)
                        if (fallback != null) {
                            resolvedMediaUri = fallback.cachedFilePath
                            if (mediaDuration <= 0) mediaDuration = fallback.durationSeconds
                        }
                    }
                }

                val msgMap = Arguments.createMap().apply {
                    putString("id", id.toString())
                    putString("senderName", senderName)
                    putString("text", text)
                    putDouble("timestamp", timestamp.toDouble())
                    putString("timeAgo", formatTimeAgo(timestamp))
                    putString("timeFormatted", formatTime(timestamp))
                    putBoolean("isDeleted", isDeleted)
                    putString("appType", appType)
                    putString("mediaType", mediaType)
                    putString("mediaUri", resolvedMediaUri)
                    putInt("mediaDuration", mediaDuration)
                    putDouble("mediaSize", mediaSize.toDouble())
                }
                result.pushMap(msgMap)
            }
        } finally {
            cursor?.close()
        }

        return result
    }

    @Synchronized
    fun deleteChat(sender: String): Int {
        val db = writableDatabase
        return db.delete(TABLE_MESSAGES, "$COL_SENDER = ?", arrayOf(sender))
    }

    @Synchronized
    fun clearAll(): Int {
        val db = writableDatabase
        return db.delete(TABLE_MESSAGES, null, null)
    }

    private fun formatTime(timestamp: Long): String {
        val sdf = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
        return sdf.format(java.util.Date(timestamp))
    }

    private fun formatTimeAgo(timestamp: Long): String {
        val diff = System.currentTimeMillis() - timestamp
        val seconds = diff / 1000
        val minutes = seconds / 60
        val hours = minutes / 60
        val days = hours / 24

        return when {
            minutes < 1 -> "Just now"
            minutes < 60 -> "${minutes}m ago"
            hours < 24 -> "${hours}h ago"
            days == 1L -> "Yesterday"
            else -> "${days}d ago"
        }
    }
}
