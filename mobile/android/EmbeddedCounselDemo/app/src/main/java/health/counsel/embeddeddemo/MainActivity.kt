package health.counsel.embeddeddemo

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import health.counsel.embeddeddemo.data.TokenStore
import health.counsel.embeddeddemo.data.api.Api

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        // ADJUST_RESIZE is what makes the IME report as a window inset so Compose's
        // WindowInsets.ime / imePadding() can shrink the WebView when the keyboard opens.
        // Under edge-to-edge (decorFitsSystemWindows=false) the window itself isn't resized,
        // so we drive the resize from Compose insets — mirroring how iOS resizes the
        // visual viewport on keyboard events.
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
        val api = Api()
        val tokenStore = TokenStore(applicationContext)
        setContent {
            EmbeddedCounselDemoApp(api = api, tokenStore = tokenStore)
        }
    }
}
