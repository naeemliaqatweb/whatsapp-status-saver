package com.statussaver

import android.content.Intent
import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

class StatusScannerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "StatusScannerModule"

    private fun getVideoThumbnail(videoFile: File): String {
        return try {
            val thumbDir = File(reactContext.cacheDir, "status_thumbs")
            if (!thumbDir.exists()) thumbDir.mkdirs()
            val thumbFile = File(thumbDir, "${videoFile.name}.jpg")
            if (thumbFile.exists()) {
                return "file://${thumbFile.absolutePath}"
            }
            val retriever = MediaMetadataRetriever()
            retriever.setDataSource(videoFile.absolutePath)
            val bitmap = retriever.getFrameAtTime(1000000, MediaMetadataRetriever.OPTION_CLOSEST_SYNC) 
                ?: retriever.frameAtTime
            retriever.release()

            if (bitmap != null) {
                FileOutputStream(thumbFile).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 80, out)
                }
                "file://${thumbFile.absolutePath}"
            } else {
                "file://${videoFile.absolutePath}"
            }
        } catch (e: Exception) {
            "file://${videoFile.absolutePath}"
        }
    }

    private val WHATSAPP_PATHS = arrayOf(
        "/storage/emulated/0/Android/media/com.whatsapp/WhatsApp/Media/.Statuses",
        "/storage/emulated/0/WhatsApp/Media/.Statuses",
        "${Environment.getExternalStorageDirectory()}/Android/media/com.whatsapp/WhatsApp/Media/.Statuses",
        "${Environment.getExternalStorageDirectory()}/WhatsApp/Media/.Statuses"
    )

    private val WHATSAPP_BUSINESS_PATHS = arrayOf(
        "/storage/emulated/0/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/.Statuses",
        "/storage/emulated/0/WhatsApp Business/Media/.Statuses",
        "${Environment.getExternalStorageDirectory()}/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/.Statuses",
        "${Environment.getExternalStorageDirectory()}/WhatsApp Business/Media/.Statuses"
    )

    @ReactMethod
    fun hasManageStoragePermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                promise.resolve(Environment.isExternalStorageManager())
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun requestManageStoragePermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                if (!Environment.isExternalStorageManager()) {
                    val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
                        data = Uri.parse("package:${reactContext.packageName}")
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    reactContext.startActivity(intent)
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                val intent = Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } catch (e2: Exception) {
                promise.reject("PERMISSION_ERROR", e2.message, e2)
            }
        }
    }

    @ReactMethod
    fun scanStatuses(appType: String, promise: Promise) {
        try {
            val result = Arguments.createArray()
            val paths = if (appType == "business") WHATSAPP_BUSINESS_PATHS else WHATSAPP_PATHS
            val processedFileNames = HashSet<String>()

            for (pathStr in paths) {
                val dir = File(pathStr)
                if (dir.exists() && dir.isDirectory) {
                    val files = dir.listFiles()
                    if (files != null) {
                        // Sort by latest modified first
                        files.sortByDescending { it.lastModified() }
                        for (file in files) {
                            if (file.isFile && !file.name.startsWith(".nomedia") && !processedFileNames.contains(file.name)) {
                                val name = file.name.lowercase()
                                val isImage = name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")
                                val isVideo = name.endsWith(".mp4") || name.endsWith(".3gp") || name.endsWith(".mkv")

                                if (isImage || isVideo) {
                                    processedFileNames.add(file.name)
                                    val thumbUri = if (isVideo) getVideoThumbnail(file) else "file://${file.absolutePath}"
                                    val itemMap = Arguments.createMap().apply {
                                        putString("id", file.absolutePath)
                                        putString("fileName", file.name)
                                        putString("filePath", file.absolutePath)
                                        putString("uri", "file://${file.absolutePath}")
                                        putString("thumbnailUri", thumbUri)
                                        putString("type", if (isVideo) "video" else "image")
                                        putDouble("timestamp", file.lastModified().toDouble())
                                        putDouble("sizeBytes", file.length().toDouble())
                                        putString("timeAgo", formatTimeAgo(file.lastModified()))
                                        putBoolean("isSaved", isFileInSavedFolder(file.name, appType))
                                        putString("appSource", appType)
                                    }
                                    result.pushMap(itemMap)
                                }
                            }
                        }
                    }
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getSavedStatuses(appType: String, promise: Promise) {
        try {
            val result = Arguments.createArray()
            val baseDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "StatusSaver")
            val isBusiness = appType == "business"
            val targetDirName = if (isBusiness) "WhatsAppBusiness" else "WhatsApp"
            val targetDir = File(baseDir, targetDirName)

            val processedFiles = HashSet<String>()

            // Scan target directory specifically for this app type
            if (targetDir.exists() && targetDir.isDirectory) {
                val files = targetDir.listFiles()
                if (files != null) {
                    files.sortByDescending { it.lastModified() }
                    for (file in files) {
                        if (file.isFile && !file.name.startsWith(".nomedia") && !processedFiles.contains(file.name)) {
                            val name = file.name.lowercase()
                            val isImage = name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")
                            val isVideo = name.endsWith(".mp4") || name.endsWith(".3gp") || name.endsWith(".mkv")

                            if (isImage || isVideo) {
                                processedFiles.add(file.name)
                                val thumbUri = if (isVideo) getVideoThumbnail(file) else "file://${file.absolutePath}"
                                val itemMap = Arguments.createMap().apply {
                                    putString("id", file.absolutePath)
                                    putString("fileName", file.name)
                                    putString("filePath", file.absolutePath)
                                    putString("uri", "file://${file.absolutePath}")
                                    putString("thumbnailUri", thumbUri)
                                    putString("type", if (isVideo) "video" else "image")
                                    putDouble("timestamp", file.lastModified().toDouble())
                                    putDouble("sizeBytes", file.length().toDouble())
                                    putString("timeAgo", formatTimeAgo(file.lastModified()))
                                    putBoolean("isSaved", true)
                                    putString("appSource", if (isBusiness) "business" else "whatsapp")
                                }
                                result.pushMap(itemMap)
                            }
                        }
                    }
                }
            }

            // Also check legacy root StatusSaver folder for backwards compatibility
            if (baseDir.exists() && baseDir.isDirectory) {
                val rootFiles = baseDir.listFiles()
                if (rootFiles != null) {
                    for (file in rootFiles) {
                        if (file.isFile && !file.name.startsWith(".nomedia") && !processedFiles.contains(file.name)) {
                            val name = file.name.lowercase()
                            val isImage = name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")
                            val isVideo = name.endsWith(".mp4") || name.endsWith(".3gp") || name.endsWith(".mkv")
                            
                            val isFileBusiness = file.name.startsWith("w4b_") || file.name.contains("business", ignoreCase = true)
                            val belongsToCurrent = if (isBusiness) isFileBusiness else !isFileBusiness

                            if ((isImage || isVideo) && belongsToCurrent) {
                                processedFiles.add(file.name)
                                val thumbUri = if (isVideo) getVideoThumbnail(file) else "file://${file.absolutePath}"
                                val itemMap = Arguments.createMap().apply {
                                    putString("id", file.absolutePath)
                                    putString("fileName", file.name)
                                    putString("filePath", file.absolutePath)
                                    putString("uri", "file://${file.absolutePath}")
                                    putString("thumbnailUri", thumbUri)
                                    putString("type", if (isVideo) "video" else "image")
                                    putDouble("timestamp", file.lastModified().toDouble())
                                    putDouble("sizeBytes", file.length().toDouble())
                                    putString("timeAgo", formatTimeAgo(file.lastModified()))
                                    putBoolean("isSaved", true)
                                    putString("appSource", if (isBusiness) "business" else "whatsapp")
                                }
                                result.pushMap(itemMap)
                            }
                        }
                    }
                }
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SAVED_SCAN_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun saveStatus(sourcePath: String, appType: String, promise: Promise) {
        try {
            val cleanPath = sourcePath.replace("file://", "")
            val sourceFile = File(cleanPath)
            if (!sourceFile.exists()) {
                promise.reject("FILE_NOT_FOUND", "Source status file does not exist at: $cleanPath")
                return
            }

            val baseDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "StatusSaver")
            val subDirName = if (appType == "business") "WhatsAppBusiness" else "WhatsApp"
            val destDir = File(baseDir, subDirName)
            if (!destDir.exists()) {
                destDir.mkdirs()
            }

            val destFile = File(destDir, sourceFile.name)
            FileInputStream(sourceFile).use { input ->
                FileOutputStream(destFile).use { output ->
                    input.copyTo(output)
                }
            }

            // Trigger Media Scanner so it appears in device Gallery instantly
            MediaScannerConnection.scanFile(
                reactContext,
                arrayOf(destFile.absolutePath),
                null
            ) { _, _ -> }

            promise.resolve(destFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("SAVE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun shareFile(filePath: String, promise: Promise) {
        try {
            val cleanPath = filePath.replace("file://", "")
            val file = File(cleanPath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "File does not exist: $cleanPath")
                return
            }

            val uri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.fileprovider",
                file
            )

            val isVideo = file.name.endsWith(".mp4", ignoreCase = true) ||
                          file.name.endsWith(".3gp", ignoreCase = true) ||
                          file.name.endsWith(".mkv", ignoreCase = true)
            val mimeType = if (isVideo) "video/*" else "image/*"

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            val chooser = Intent.createChooser(shareIntent, "Share Status via").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(chooser)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SHARE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun repostToWhatsApp(filePath: String, isBusiness: Boolean, promise: Promise) {
        try {
            val cleanPath = filePath.replace("file://", "")
            val file = File(cleanPath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "File does not exist: $cleanPath")
                return
            }

            val uri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.fileprovider",
                file
            )

            val isVideo = file.name.endsWith(".mp4", ignoreCase = true) ||
                          file.name.endsWith(".3gp", ignoreCase = true) ||
                          file.name.endsWith(".mkv", ignoreCase = true)
            val mimeType = if (isVideo) "video/*" else "image/*"
            val targetPkg = if (isBusiness) "com.whatsapp.w4b" else "com.whatsapp"

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                setPackage(targetPkg)
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactContext.startActivity(shareIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            try {
                shareFile(filePath, promise)
            } catch (e2: Exception) {
                promise.reject("REPOST_ERROR", e2.message, e2)
            }
        }
    }

    @ReactMethod
    fun deleteSavedStatus(filePath: String, promise: Promise) {
        try {
            val cleanPath = filePath.replace("file://", "")
            val file = File(cleanPath)
            if (file.exists()) {
                val deleted = file.delete()
                if (deleted) {
                    MediaScannerConnection.scanFile(reactContext, arrayOf(cleanPath), null) { _, _ -> }
                    promise.resolve(true)
                } else {
                    promise.reject("DELETE_FAILED", "Could not delete file")
                }
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("DELETE_ERROR", e.message, e)
        }
    }

    private fun isFileInSavedFolder(fileName: String, appType: String): Boolean {
        val baseDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "StatusSaver")
        val subDirName = if (appType == "business") "WhatsAppBusiness" else "WhatsApp"
        val subDir = File(baseDir, subDirName)
        return File(subDir, fileName).exists() || File(baseDir, fileName).exists()
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
            else -> "${days}d ago"
        }
    }
}

