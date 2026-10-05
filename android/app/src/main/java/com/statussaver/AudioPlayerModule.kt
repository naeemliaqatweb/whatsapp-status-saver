package com.statussaver

import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileInputStream

class AudioPlayerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "AudioPlayerModule"
        private const val PROGRESS_INTERVAL_MS = 150L
    }

    private var mediaPlayer: MediaPlayer? = null
    private var currentPlayingUri: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private var isTrackingProgress = false

    override fun getName(): String = "AudioPlayerModule"

    private val progressRunnable = object : Runnable {
        override fun run() {
            mediaPlayer?.let { mp ->
                try {
                    if (mp.isPlaying) {
                        val currentPosition = mp.currentPosition
                        val duration = mp.duration
                        val params = Arguments.createMap().apply {
                            putInt("currentPosition", currentPosition)
                            putInt("duration", duration)
                            putString("uri", currentPlayingUri)
                            putBoolean("isPlaying", true)
                        }
                        sendEvent("onAudioProgress", params)
                        handler.postDelayed(this, PROGRESS_INTERVAL_MS)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error updating audio progress: ${e.message}")
                }
            }
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    private fun startProgressUpdates() {
        if (!isTrackingProgress) {
            isTrackingProgress = true
            handler.post(progressRunnable)
        }
    }

    private fun stopProgressUpdates() {
        isTrackingProgress = false
        handler.removeCallbacks(progressRunnable)
    }

    private fun releaseMediaPlayer() {
        stopProgressUpdates()
        try {
            mediaPlayer?.apply {
                if (isPlaying) {
                    stop()
                }
                reset()
                release()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing media player: ${e.message}")
        } finally {
            mediaPlayer = null
            currentPlayingUri = null
        }
    }

    @ReactMethod
    fun play(filePath: String?, promise: Promise) {
        try {
            var targetFile: File? = null

            if (!filePath.isNullOrEmpty()) {
                val cleanPath = filePath.replace("file://", "")
                val candidate = File(cleanPath)
                if (candidate.exists() && candidate.length() > 0) {
                    targetFile = candidate
                }
            }

            // Fallback: If no file path or file not found, find the latest real voice note on device
            if (targetFile == null || !targetFile.exists()) {
                val fallbackMedia = WhatsAppMediaRecoveryHelper.getAnyAvailableVoiceNote(reactContext)
                if (fallbackMedia != null) {
                    val cleanPath = fallbackMedia.cachedFilePath.replace("file://", "")
                    targetFile = File(cleanPath)
                }
            }

            if (targetFile == null || !targetFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "No voice audio file found on device to play.")
                return
            }

            val resolvedUri = "file://${targetFile.absolutePath}"

            // If already playing the same file, do nothing
            if (currentPlayingUri == resolvedUri && mediaPlayer?.isPlaying == true) {
                promise.resolve(true)
                return
            }

            releaseMediaPlayer()

            val mp = MediaPlayer()
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .build()
            mp.setAudioAttributes(audioAttributes)

            FileInputStream(targetFile).use { fis ->
                mp.setDataSource(fis.fd)
            }
            mp.prepare()

            val duration = mp.duration
            currentPlayingUri = resolvedUri

            mp.setOnCompletionListener {
                stopProgressUpdates()
                val event = Arguments.createMap().apply {
                    putString("uri", resolvedUri)
                    putInt("duration", duration)
                }
                sendEvent("onAudioCompletion", event)
                currentPlayingUri = null
            }

            mp.setOnErrorListener { _, what, extra ->
                Log.e(TAG, "MediaPlayer error: what=$what, extra=$extra")
                stopProgressUpdates()
                val event = Arguments.createMap().apply {
                    putString("uri", resolvedUri)
                    putInt("what", what)
                    putInt("extra", extra)
                }
                sendEvent("onAudioError", event)
                releaseMediaPlayer()
                true
            }

            mp.start()
            startProgressUpdates()
            mediaPlayer = mp

            val result = Arguments.createMap().apply {
                putBoolean("success", true)
                putInt("duration", duration)
                putString("uri", resolvedUri)
            }
            promise.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "Error playing audio: ${e.message}", e)
            releaseMediaPlayer()
            promise.reject("PLAY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun pause(promise: Promise) {
        try {
            mediaPlayer?.let { mp ->
                if (mp.isPlaying) {
                    mp.pause()
                    stopProgressUpdates()
                    val params = Arguments.createMap().apply {
                        putString("uri", currentPlayingUri)
                        putBoolean("isPlaying", false)
                        putInt("currentPosition", mp.currentPosition)
                    }
                    sendEvent("onAudioPaused", params)
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PAUSE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun resume(promise: Promise) {
        try {
            mediaPlayer?.let { mp ->
                if (!mp.isPlaying) {
                    mp.start()
                    startProgressUpdates()
                    val params = Arguments.createMap().apply {
                        putString("uri", currentPlayingUri)
                        putBoolean("isPlaying", true)
                        putInt("currentPosition", mp.currentPosition)
                    }
                    sendEvent("onAudioResumed", params)
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("RESUME_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            releaseMediaPlayer()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun seekTo(positionMs: Double, promise: Promise) {
        try {
            mediaPlayer?.let { mp ->
                mp.seekTo(positionMs.toInt())
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SEEK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val mp = mediaPlayer
            val isPlaying = mp?.isPlaying == true
            val currentPos = mp?.currentPosition ?: 0
            val duration = mp?.duration ?: 0

            val result = Arguments.createMap().apply {
                putBoolean("isPlaying", isPlaying)
                putInt("currentPosition", currentPos)
                putInt("duration", duration)
                putString("currentUri", currentPlayingUri)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.message, e)
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        releaseMediaPlayer()
    }
}
