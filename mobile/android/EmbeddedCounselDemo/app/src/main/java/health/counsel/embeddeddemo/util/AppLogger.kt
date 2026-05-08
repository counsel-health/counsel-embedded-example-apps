package health.counsel.embeddeddemo.util

import android.util.Log

object AppLogger {
    const val API_TAG = "CounselApi"
    const val WEB_VIEW_TAG = "CounselWebView"

    fun debug(tag: String, message: String, throwable: Throwable? = null) {
        log(Log.DEBUG, tag, message, throwable)
    }

    fun info(tag: String, message: String, throwable: Throwable? = null) {
        log(Log.INFO, tag, message, throwable)
    }

    fun warn(tag: String, message: String, throwable: Throwable? = null) {
        log(Log.WARN, tag, message, throwable)
    }

    fun error(tag: String, message: String, throwable: Throwable? = null) {
        log(Log.ERROR, tag, message, throwable)
    }

    private fun log(priority: Int, tag: String, message: String, throwable: Throwable?) {
        if (throwable == null) {
            Log.println(priority, tag, message)
        } else {
            Log.println(priority, tag, "$message\n${Log.getStackTraceString(throwable)}")
        }
    }
}
