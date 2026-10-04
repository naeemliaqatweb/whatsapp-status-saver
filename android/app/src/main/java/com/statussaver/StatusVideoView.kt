package com.statussaver

import android.content.Context
import android.media.MediaPlayer
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.VideoView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter

class StatusVideoView(context: Context) : FrameLayout(context) {
    val videoView: VideoView = VideoView(context)
    private var isLooping: Boolean = true

    init {
        val layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT).apply {
            gravity = Gravity.CENTER
        }
        videoView.layoutParams = layoutParams
        addView(videoView)

        videoView.setOnPreparedListener { mp ->
            mp.isLooping = isLooping
            mp.start()
            val event: WritableMap = Arguments.createMap().apply {
                putInt("duration", mp.duration)
                putInt("width", mp.videoWidth)
                putInt("height", mp.videoHeight)
            }
            (context as? ReactContext)?.getJSModule(RCTEventEmitter::class.java)
                ?.receiveEvent(id, "topOnPrepared", event)
        }

        videoView.setOnCompletionListener {
            val event: WritableMap = Arguments.createMap()
            (context as? ReactContext)?.getJSModule(RCTEventEmitter::class.java)
                ?.receiveEvent(id, "topOnCompletion", event)
        }

        videoView.setOnErrorListener { _, what, extra ->
            val event: WritableMap = Arguments.createMap().apply {
                putInt("what", what)
                putInt("extra", extra)
            }
            (context as? ReactContext)?.getJSModule(RCTEventEmitter::class.java)
                ?.receiveEvent(id, "topOnError", event)
            true
        }
    }

    fun setSource(sourcePath: String) {
        val cleanPath = sourcePath.replace("file://", "")
        videoView.setVideoPath(cleanPath)
        videoView.start()
    }

    fun setPaused(paused: Boolean) {
        if (paused) {
            if (videoView.isPlaying) {
                videoView.pause()
            }
        } else {
            videoView.start()
        }
    }

    fun setLoop(loop: Boolean) {
        isLooping = loop
    }
}
