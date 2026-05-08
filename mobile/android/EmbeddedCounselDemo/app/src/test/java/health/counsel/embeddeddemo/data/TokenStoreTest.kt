package health.counsel.embeddeddemo.data

import androidx.test.core.app.ApplicationProvider
import health.counsel.embeddeddemo.data.api.UserType
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], manifest = Config.NONE)
class TokenStoreTest {

    private val context = ApplicationProvider.getApplicationContext<android.content.Context>()
    private val store = TokenStore(context)

    @After
    fun tearDown() = runTest { store.clear() }

    @Test
    fun `save then read round-trips token and userType`() = runTest {
        store.save("tok-abc", UserType.ONBOARDING)

        assertEquals("tok-abc", store.tokenFlow.first())
        assertEquals(UserType.ONBOARDING, store.userTypeFlow.first())
    }

    @Test
    fun `clear removes both keys`() = runTest {
        store.save("tok-abc", UserType.MAIN)
        store.clear()

        assertNull(store.tokenFlow.first())
        assertNull(store.userTypeFlow.first())
    }
}
