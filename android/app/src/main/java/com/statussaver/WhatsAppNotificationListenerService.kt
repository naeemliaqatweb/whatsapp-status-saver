package com.statussaver

import android.app.Notification
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class WhatsAppNotificationListenerService : NotificationListenerService() {

    companion object {
        private const val TAG = "WhatsAppNotifListener"
        const val WHATSAPP_PKG = "com.whatsapp"
        const val WHATSAPP_BUSINESS_PKG = "com.whatsapp.w4b"
        var isRunning = false
    }

    private lateinit var dbHelper: NotificationDbHelper

    override fun onCreate() {
        super.onCreate()
        dbHelper = NotificationDbHelper(applicationContext)
        isRunning = true
        Log.d(TAG, "WhatsApp Notification Listener Service started")
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return
        val pkg = sbn.packageName ?: return

        // Only intercept WhatsApp and WhatsApp Business
        if (pkg != WHATSAPP_PKG && pkg != WHATSAPP_BUSINESS_PKG) {
            return
        }

        try {
            val notification = sbn.notification ?: return
            val extras: Bundle = notification.extras ?: return

            // Check if it's ongoing (e.g. active call, web connected, backup in progress)
            if ((notification.flags and Notification.FLAG_ONGOING_EVENT) != 0) {
                return
            }

            val titleCharSequence = extras.getCharSequence(Notification.EXTRA_TITLE)
            val textCharSequence = extras.getCharSequence(Notification.EXTRA_TEXT)
            val bigTextCharSequence = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)

            val sender = titleCharSequence?.toString()?.trim() ?: return
            val message = (bigTextCharSequence ?: textCharSequence)?.toString()?.trim() ?: return

            // Filter out system summaries or empty notifications
            if (sender.isEmpty() || message.isEmpty()) return
            if (sender.equals("WhatsApp", ignoreCase = true) || 
                sender.equals("WhatsApp Business", ignoreCase = true) ||
                message.contains("Checking for new messages", ignoreCase = true) ||
                message.contains("WhatsApp Web is currently active", ignoreCase = true) ||
                (message.contains("new messages", ignoreCase = true) && sender.contains("WhatsApp", ignoreCase = true))) {
                return
            }

            val timestamp = sbn.postTime
            val isBusiness = (pkg == WHATSAPP_BUSINESS_PKG)
            val appType = if (isBusiness) "business" else "whatsapp"

            // Check if this is a "This message was deleted" notification
            val isDeletedTrigger = isDeletedMessageNotification(message)

            if (isDeletedTrigger) {
                Log.d(TAG, "Detected deleted message trigger for sender: $sender")
                dbHelper.markLatestMessageDeleted(sender, timestamp)
            } else {
                Log.d(TAG, "Intercepted message from $sender: $message")

                // Detect if notification is a Voice Note, Image, Video, or Audio
                val mediaType = WhatsAppMediaRecoveryHelper.detectMediaTypeFromText(message)
                var mediaUri: String? = null
                var mediaDuration = 0
                var mediaSize = 0L

                if (mediaType != null) {
                    var mediaInfo: RecoveredMediaInfo? = null
                    if (mediaType == "image") {
                        mediaInfo = WhatsAppMediaRecoveryHelper.extractBitmapFromExtras(applicationContext, extras)
                    }
                    if (mediaInfo == null) {
                        mediaInfo = WhatsAppMediaRecoveryHelper.findAndCacheRecentMedia(
                            applicationContext,
                            mediaType,
                            isBusiness
                        )
                    }
                    if (mediaInfo != null) {
                        mediaUri = mediaInfo.cachedFilePath
                        mediaDuration = mediaInfo.durationSeconds
                        mediaSize = mediaInfo.fileSizeBytes
                    }
                }

                dbHelper.insertMessage(
                    packageName = pkg,
                    sender = sender,
                    text = message,
                    timestamp = timestamp,
                    isDeleted = false,
                    appType = appType,
                    mediaType = mediaType,
                    mediaUri = mediaUri,
                    mediaDuration = mediaDuration,
                    mediaSize = mediaSize
                )
            }

            // Broadcast event to React Native if app is active
            NotificationRecoveryModule.notifyNewMessage()

        } catch (e: Exception) {
            Log.e(TAG, "Error handling WhatsApp notification: ${e.message}", e)
        }
    }

    private fun isDeletedMessageNotification(text: String): Boolean {
        val lower = text.lowercase()
        return lower.contains("this message was deleted") ||
               lower.contains("this message was deleted by the sender") ||
               lower.contains("you deleted this message") ||
               lower.contains("ye message delete ho gaya") ||
               lower.contains("message was deleted")
    }
}
