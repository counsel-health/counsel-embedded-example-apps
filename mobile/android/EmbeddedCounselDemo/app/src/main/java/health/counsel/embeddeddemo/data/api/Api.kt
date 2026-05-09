package health.counsel.embeddeddemo.data.api

import health.counsel.embeddeddemo.BuildConfig
import health.counsel.embeddeddemo.util.AppLogger
import io.ktor.client.HttpClient
import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.headers
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.JsonConvertException
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json

private const val SIGN_UP_ENDPOINT = "user/signUp"
private const val SIGNED_APP_URL_ENDPOINT = "user/signedAppUrl"

class Api(
    engine: HttpClientEngine? = null,
    baseUrl: String = BuildConfig.BASE_URL,
) {
    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    private val client: HttpClient = if (engine != null) {
        HttpClient(engine) { configure(baseUrl) }
    } else {
        HttpClient(OkHttp) { configure(baseUrl) }
    }

    private fun io.ktor.client.HttpClientConfig<*>.configure(baseUrl: String) {
        install(ContentNegotiation) { json(json) }
        defaultRequest {
            url(baseUrl.trimEnd('/') + "/")
            contentType(ContentType.Application.Json)
        }
        expectSuccess = false
    }

    suspend fun fetchToken(accessCode: String): AccessCodeTokenResponse {
        val startedAt = System.currentTimeMillis()
        logApiStarted(SIGN_UP_ENDPOINT)
        val response = runCatching {
            client.post(SIGN_UP_ENDPOINT) {
                headers { append("accessCode", accessCode) }
                setBody(SignUpRequest(accessCode))
            }
        }.getOrElse {
            // Preserve structured concurrency: don't smuggle cancellation into ApiError.
            if (it is CancellationException) throw it
            val error = ApiError.Network(it)
            logApiFailure(SIGN_UP_ENDPOINT, startedAt, error)
            throw error
        }

        validateStatus(SIGN_UP_ENDPOINT, response.status, startedAt)

        return try {
            json.decodeFromString<AccessCodeTokenResponse>(response.bodyAsText()).also {
                logApiCompleted(SIGN_UP_ENDPOINT, startedAt)
            }
        } catch (e: SerializationException) {
            val error = ApiError.Parse(e)
            logApiFailure(SIGN_UP_ENDPOINT, startedAt, error)
            throw error
        } catch (e: JsonConvertException) {
            val error = ApiError.Parse(e)
            logApiFailure(SIGN_UP_ENDPOINT, startedAt, error)
            throw error
        }
    }

    suspend fun fetchSignedAppUrl(token: String): String {
        val startedAt = System.currentTimeMillis()
        logApiStarted(SIGNED_APP_URL_ENDPOINT)
        val response = runCatching {
            client.post(SIGNED_APP_URL_ENDPOINT) {
                headers { append(HttpHeaders.Authorization, "Bearer $token") }
                // The server's body schema is z.record(z.string(), z.unknown()) — i.e.
                // it requires a JSON object, even if empty. Send {} so Elysia's body
                // validator accepts the request.
                setBody(EmptySessionData)
            }
        }.getOrElse {
            // Preserve structured concurrency: don't smuggle cancellation into ApiError.
            if (it is CancellationException) throw it
            val error = ApiError.Network(it)
            logApiFailure(SIGNED_APP_URL_ENDPOINT, startedAt, error)
            throw error
        }

        validateStatus(SIGNED_APP_URL_ENDPOINT, response.status, startedAt)

        return try {
            json.decodeFromString<SignedAppResponse>(response.bodyAsText()).url.also {
                logApiCompleted(SIGNED_APP_URL_ENDPOINT, startedAt)
            }
        } catch (e: SerializationException) {
            val error = ApiError.Parse(e)
            logApiFailure(SIGNED_APP_URL_ENDPOINT, startedAt, error)
            throw error
        } catch (e: JsonConvertException) {
            val error = ApiError.Parse(e)
            logApiFailure(SIGNED_APP_URL_ENDPOINT, startedAt, error)
            throw error
        }
    }

    private fun validateStatus(endpoint: String, status: HttpStatusCode, startedAt: Long) {
        val error = when (status) {
            HttpStatusCode.OK -> null
            HttpStatusCode.BadRequest -> ApiError.TokenExpired
            HttpStatusCode.Unauthorized -> ApiError.Unauthorized
            else -> if (status.value >= 500) {
                ApiError.Server(status.value)
            } else {
                ApiError.BadStatus(status.value)
            }
        }
        if (error != null) {
            logApiFailure(endpoint, startedAt, error, status.value)
            throw error
        }
        AppLogger.info(
            AppLogger.API_TAG,
            "$endpoint response status=${status.value} elapsedMs=${elapsedMs(startedAt)}",
        )
    }

    private fun logApiStarted(endpoint: String) {
        AppLogger.info(AppLogger.API_TAG, "$endpoint request started")
    }

    private fun logApiCompleted(endpoint: String, startedAt: Long) {
        AppLogger.info(AppLogger.API_TAG, "$endpoint completed elapsedMs=${elapsedMs(startedAt)}")
    }

    private fun logApiFailure(
        endpoint: String,
        startedAt: Long,
        error: ApiError,
        status: Int? = null,
    ) {
        val statusPart = status?.let { " status=$it" }.orEmpty()
        AppLogger.warn(
            AppLogger.API_TAG,
            "$endpoint failed$statusPart error=${error.javaClass.simpleName} elapsedMs=${elapsedMs(startedAt)}",
        )
    }

    private fun elapsedMs(startedAt: Long): Long = System.currentTimeMillis() - startedAt

    @kotlinx.serialization.Serializable
    private data class SignUpRequest(val accessCode: String)

    @kotlinx.serialization.Serializable
    private object EmptySessionData
}
