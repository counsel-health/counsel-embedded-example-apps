package health.counsel.embeddeddemo.data.api

sealed class ApiError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    object TokenExpired : ApiError("Token expired (HTTP 400)")
    object Unauthorized : ApiError("Unauthorized (HTTP 401)")
    class BadStatus(val status: Int) : ApiError("Unexpected HTTP status: $status")
    class Network(cause: Throwable) : ApiError("Network failure: ${cause.message}", cause)
    class Parse(cause: Throwable) : ApiError("Failed to parse response: ${cause.message}", cause)
    class Server(val status: Int) : ApiError("Server error: $status")
    class WebViewLoad(val code: Int, val description: String, val url: String) :
        ApiError("WebView load failed ($code $description) for $url")
}
