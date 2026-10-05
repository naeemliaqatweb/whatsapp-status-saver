package com.statussaver

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationRecoveryModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val dbHelper: NotificationDbHelper by lazy {
        NotificationDbHelper(reactContext)
    }

    companion object {
        private var instance: NotificationRecoveryModule? = null

        fun notifyNewMessage() {
            instance?.sendEvent("onWhatsAppMessageReceived", null)
        }
    }

    init {
        instance = this
    }

    override fun getName(): String = "NotificationRecoveryModule"

    private fun sendEvent(eventName: String, params: WritableMap?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun isNotificationAccessGranted(promise: Promise) {
        try {
            val packageName = reactContext.packageName
            val flat = Settings.Secure.getString(
                reactContext.contentResolver,
                "enabled_notification_listeners"
            )
            if (!TextUtils.isEmpty(flat)) {
                val names = flat.split(":".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                for (name in names) {
                    val cn = ComponentName.unflattenFromString(name)
                    if (cn != null && TextUtils.equals(packageName, cn.packageName)) {
                        promise.resolve(true)
                        return
                    }
                }
            }
            promise.resolve(false)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openNotificationAccessSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getChats(promise: Promise) {
        try {
            val chats = dbHelper.getChatsList()
            promise.resolve(chats)
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getChatMessages(senderName: String, promise: Promise) {
        try {
            val messages = dbHelper.getMessagesForChat(senderName)
            promise.resolve(messages)
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun deleteChat(senderName: String, promise: Promise) {
        try {
            dbHelper.deleteChat(senderName)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun clearAllChats(promise: Promise) {
        try {
            dbHelper.clearAll()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("DB_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun seedSampleMessages(promise: Promise) {
        try {
            val now = System.currentTimeMillis()
            // Sample contacts to showcase UI immediately
            dbHelper.insertMessage("com.whatsapp", "Ahmad Khan", "Assalam o Alaikum bhai, kya hal hai?", now - 3600000 * 2, false, "whatsapp")
            dbHelper.insertMessage("com.whatsapp", "Ahmad Khan", "Are you available today?", now - 3600000, false, "whatsapp")
            dbHelper.insertMessage("com.whatsapp", "Ahmad Khan", "Please send me the status video link!", now - 1800000, true, "whatsapp") // Deleted

            dbHelper.insertMessage("com.whatsapp", "Family Group", "Dinner tonight at 9 PM!", now - 7200000, false, "whatsapp")
            dbHelper.insertMessage("com.whatsapp", "Family Group", "Don't forget to bring the photos", now - 3600000, true, "whatsapp") // Deleted

            dbHelper.insertMessage("com.whatsapp.w4b", "Customer Support", "Your order #4829 has been shipped.", now - 86400000, false, "business")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SEED_ERROR", e.message, e)
        }
    }
}
