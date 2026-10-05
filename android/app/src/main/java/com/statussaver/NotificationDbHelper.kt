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
        const val DATABASE_VERSION = 1

        const val TABLE_MESSAGES = "messages"
        const val COL_ID = "_id"
        const val COL_PACKAGE = "package_name"
        const val COL_SENDER = "sender_name"
        const val COL_TEXT = "message_text"
        const val COL_TIMESTAMP = "timestamp"
        const val COL_IS_DELETED = "is_deleted"
        const val COL_APP_TYPE = "app_type" // "whatsapp" or "business"
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
                $COL_APP_TYPE TEXT DEFAULT 'whatsapp'
            )
        """.trimIndent()
        db.execSQL(createTable)
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_sender ON $TABLE_MESSAGES($COL_SENDER)")
        db.execSQL("CREATE INDEX IF NOT EXISTS idx_timestamp ON $TABLE_MESSAGES($COL_TIMESTAMP)")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // Safe schema upgrade
    }

    fun isRecentDuplicate(sender: String, text: String, timestamp: Long): Boolean {
        val db = readableDatabase
        val cutoffMin = timestamp - 15000L
        val cutoffMax = timestamp + 15000L
        val cursor = db.rawQuery(
            """
            SELECT $COL_ID FROM $TABLE_MESSAGES 
            WHERE $COL_SENDER = ? AND $COL_TEXT = ? AND $COL_TIMESTAMP BETWEEN ? AND ?
            LIMIT 1
            """.trimIndent(),
            arrayOf(sender, text, cutoffMin.toString(), cutoffMax.toString())
        )
        val exists = cursor.moveToFirst()
        cursor.close()
        return exists
    }

    @Synchronized
    fun cleanupExistingDuplicates() {
        try {
            val db = writableDatabase
            // 1. Delete generic notification summaries like "2 new messages", "3 new messages"
            db.delete(TABLE_MESSAGES, "$COL_TEXT LIKE '%new message%' OR $COL_TEXT LIKE '%new messages%'", null)

            // 2. Remove duplicate message entries for the same sender and text within 15s
            db.execSQL("""
                DELETE FROM $TABLE_MESSAGES 
                WHERE $COL_ID NOT IN (
                    SELECT MIN($COL_ID) FROM $TABLE_MESSAGES 
                    GROUP BY $COL_SENDER, $COL_TEXT, ($COL_TIMESTAMP / 15000)
                )
            """.trimIndent())
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning duplicates: ${e.message}")
        }
    }

    @Synchronized
    fun insertMessage(
        packageName: String,
        sender: String,
        text: String,
        timestamp: Long,
        isDeleted: Boolean = false,
        appType: String = "whatsapp"
    ): Long {
        // Prevent duplicate insertion
        if (!isDeleted && isRecentDuplicate(sender, text, timestamp)) {
            Log.d(TAG, "Duplicate message suppressed for $sender: $text")
            return -1L
        }

        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_PACKAGE, packageName)
            put(COL_SENDER, sender)
            put(COL_TEXT, text)
            put(COL_TIMESTAMP, timestamp)
            put(COL_IS_DELETED, if (isDeleted) 1 else 0)
            put(COL_APP_TYPE, appType)
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
            SELECT $COL_ID, $COL_TEXT FROM $TABLE_MESSAGES 
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
        cleanupExistingDuplicates()
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
                $COL_APP_TYPE
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

                val msgMap = Arguments.createMap().apply {
                    putString("id", id.toString())
                    putString("senderName", senderName)
                    putString("text", text)
                    putDouble("timestamp", timestamp.toDouble())
                    putString("timeAgo", formatTimeAgo(timestamp))
                    putString("timeFormatted", formatTime(timestamp))
                    putBoolean("isDeleted", isDeleted)
                    putString("appType", appType)
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
