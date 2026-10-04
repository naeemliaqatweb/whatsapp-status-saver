package com.statussaver

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class StatusVideoViewManager : SimpleViewManager<StatusVideoView>() {

    override fun getName(): String = "StatusVideoView"

    override fun createViewInstance(reactContext: ThemedReactContext): StatusVideoView {
        return StatusVideoView(reactContext)
    }

    @ReactProp(name = "src")
    fun setSrc(view: StatusVideoView, src: String?) {
        if (!src.isNullOrEmpty()) {
            view.setSource(src)
        }
    }

    @ReactProp(name = "paused", defaultBoolean = false)
    fun setPaused(view: StatusVideoView, paused: Boolean) {
        view.setPaused(paused)
    }

    @ReactProp(name = "loop", defaultBoolean = true)
    fun setLoop(view: StatusVideoView, loop: Boolean) {
        view.setLoop(loop)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .put("topOnPrepared", MapBuilder.of("registrationName", "onPrepared"))
            .put("topOnCompletion", MapBuilder.of("registrationName", "onCompletion"))
            .put("topOnError", MapBuilder.of("registrationName", "onError"))
            .build()
    }
}
