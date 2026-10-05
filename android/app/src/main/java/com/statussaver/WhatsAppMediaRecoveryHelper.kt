package com.statussaver

import android.content.Context
import android.media.MediaMetadataRetriever
import android.os.Environment
import android.util.Log
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

data class RecoveredMediaInfo(
    val mediaType: String, // "voice", "audio", "image", "video"
    val cachedFilePath: String,
    val durationSeconds: Int,
    val fileSizeBytes: Long
)

object WhatsAppMediaRecoveryHelper {

    private const val TAG = "WAMediaRecoveryHelper"
    private const val RECENT_THRESHOLD_MS = 10 * 60 * 1000L // 10 minutes

    /**
     * Determine if the notification text indicates media (voice, photo, video, etc.)
     */
    fun detectMediaTypeFromText(text: String): String? {
        val lower = text.lowercase().trim()
        return when {
            lower.contains("voice message") || lower.startsWith("🎤") || lower.contains("ptt-") -> "voice"
            lower.contains("audio") || lower.startsWith("🎵") -> "audio"
            lower.contains("photo") || lower.startsWith("📷") || lower.contains("image") -> "image"
            lower.contains("video") || lower.startsWith("🎥") || lower.contains("gif") -> "video"
            else -> null
        }
    }

    /**
     * Find and cache recently arrived WhatsApp media file for the given type
     */
    fun findAndCacheRecentMedia(
        context: Context,
        mediaType: String,
        isBusiness: Boolean
    ): RecoveredMediaInfo? {
        try {
            val sourceDirs = getSourceDirectories(mediaType, isBusiness)
            var latestFile: File? = null
            var latestModTime = 0L
            val cutoffTime = System.currentTimeMillis() - RECENT_THRESHOLD_MS

            for (dir in sourceDirs) {
                if (!dir.exists() || !dir.isDirectory) continue
                
                // Collect files (including subdirectories for Voice Notes e.g. 2024xx, 2025xx)
                val files = getAllMediaFiles(dir, mediaType)
                for (file in files) {
                    val lastMod = file.lastModified()
                    if (lastMod >= cutoffTime && lastMod > latestModTime && file.length() > 0) {
                        // Skip .nomedia and temp files
                        if (!file.name.startsWith(".") && !file.name.endsWith(".tmp")) {
                            latestModTime = lastMod
                            latestFile = file
                        }
                    }
                }
            }

            if (latestFile != null && latestFile.exists()) {
                Log.d(TAG, "Found recent $mediaType file: ${latestFile.absolutePath} (size=${latestFile.length()} bytes)")
                
                // Copy to persistent internal/external storage
                val destDir = File(context.getExternalFilesDir(null) ?: context.filesDir, "recovered_media")
                if (!destDir.exists()) {
                    destDir.mkdirs()
                }

                val destFile = File(destDir, "rec_${System.currentTimeMillis()}_${latestFile.name}")
                copyFile(latestFile, destFile)

                var duration = 0
                if (mediaType == "voice" || mediaType == "audio" || mediaType == "video") {
                    duration = extractMediaDuration(destFile)
                }

                return RecoveredMediaInfo(
                    mediaType = mediaType,
                    cachedFilePath = "file://${destFile.absolutePath}",
                    durationSeconds = duration,
                    fileSizeBytes = destFile.length()
                )
            } else {
                Log.d(TAG, "No recent $mediaType file found within threshold")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error caching media: ${e.message}", e)
        }
        return null
    }

    private fun getSourceDirectories(mediaType: String, isBusiness: Boolean): List<File> {
        val dirs = mutableListOf<File>()
        val storage = Environment.getExternalStorageDirectory()

        val basePackage = if (isBusiness) "com.whatsapp.w4b" else "com.whatsapp"
        val folderName = if (isBusiness) "WhatsApp Business" else "WhatsApp"

        // Android 11+ scoped storage location
        val androidMediaBase = File(storage, "Android/media/$basePackage/$folderName/Media")
        // Legacy root storage location
        val legacyBase = File(storage, "$folderName/Media")

        val subFolderNames = when (mediaType) {
            "voice" -> listOf("$folderName Voice Notes", "$folderName Audio")
            "audio" -> listOf("$folderName Audio", "$folderName Voice Notes")
            "image" -> listOf("$folderName Images")
            "video" -> listOf("$folderName Video")
            else -> emptyList()
        }

        for (sub in subFolderNames) {
            dirs.add(File(androidMediaBase, sub))
            dirs.add(File(legacyBase, sub))
        }

        return dirs
    }

    private fun getAllMediaFiles(dir: File, mediaType: String): List<File> {
        val result = mutableListOf<File>()
        val list = dir.listFiles() ?: return result

        for (file in list) {
            if (file.isDirectory) {
                // Voice notes are partitioned into subdirectories like "202440", "202610", etc.
                result.addAll(getAllMediaFiles(file, mediaType))
            } else if (file.isFile) {
                val name = file.name.lowercase()
                val isMatching = when (mediaType) {
                    "voice", "audio" -> name.endsWith(".opus") || name.endsWith(".aac") || name.endsWith(".mp3") || name.endsWith(".m4a") || name.endsWith(".ogg")
                    "image" -> name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".webp")
                    "video" -> name.endsWith(".mp4") || name.endsWith(".3gp") || name.endsWith(".mkv")
                    else -> false
                }
                if (isMatching) {
                    result.add(file)
                }
            }
        }
        return result
    }

    private fun copyFile(src: File, dst: File) {
        FileInputStream(src).use { inStream ->
            FileOutputStream(dst).use { outStream ->
                val buffer = ByteArray(8192)
                var bytesRead: Int
                while (inStream.read(buffer).also { bytesRead = it } > 0) {
                    outStream.write(buffer, 0, bytesRead)
                }
                outStream.flush()
            }
        }
    }

    private fun extractMediaDuration(file: File): Int {
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(file.absolutePath)
            val time = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
            val timeMs = time?.toLongOrNull() ?: 0L
            (timeMs / 1000).toInt()
        } catch (e: Exception) {
            0
        } finally {
            try {
                retriever.release()
            } catch (e: Exception) {}
        }
    }

    fun getAnyAvailableVoiceNote(context: Context): RecoveredMediaInfo? {
        try {
            val sourceDirs = getSourceDirectories("voice", false) + getSourceDirectories("voice", true)
            var latestFile: File? = null
            var latestModTime = 0L

            for (dir in sourceDirs) {
                if (!dir.exists() || !dir.isDirectory) continue
                val files = getAllMediaFiles(dir, "voice")
                for (file in files) {
                    if (file.lastModified() > latestModTime && file.length() > 0 && !file.name.startsWith(".")) {
                        latestModTime = file.lastModified()
                        latestFile = file
                    }
                }
            }

            if (latestFile != null && latestFile.exists()) {
                val destDir = File(context.getExternalFilesDir(null) ?: context.filesDir, "recovered_media")
                if (!destDir.exists()) destDir.mkdirs()
                val destFile = File(destDir, "cached_${latestFile.name}")
                if (!destFile.exists() || destFile.length() == 0L) {
                    copyFile(latestFile, destFile)
                }
                val duration = extractMediaDuration(destFile)
                return RecoveredMediaInfo(
                    mediaType = "voice",
                    cachedFilePath = "file://${destFile.absolutePath}",
                    durationSeconds = if (duration > 0) duration else 8,
                    fileSizeBytes = destFile.length()
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error finding fallback voice note: ${e.message}")
        }
        return null
    }
}
