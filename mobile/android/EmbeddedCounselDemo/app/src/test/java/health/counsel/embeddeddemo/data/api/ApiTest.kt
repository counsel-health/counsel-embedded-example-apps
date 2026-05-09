package health.counsel.embeddeddemo.data.api

import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.headersOf
import io.ktor.utils.io.ByteReadChannel
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

class ApiTest {

    @Test
    fun `fetchToken happy path returns token and userType`() = runTest {
        val engine = MockEngine { request ->
            assertEquals("/user/signUp", request.url.encodedPath)
            assertEquals("ABC123", request.headers["accessCode"])
            respond(
                content = ByteReadChannel("""{"token":"tok-xyz","userType":"main"}"""),
                status = HttpStatusCode.OK,
                headers = headersOf(HttpHeaders.ContentType, "application/json"),
            )
        }
        val api = Api(engine = engine, baseUrl = "https://example.test")

        val result = api.fetchToken("ABC123")

        assertEquals("tok-xyz", result.token)
        assertEquals(UserType.MAIN, result.userType)
    }
}
