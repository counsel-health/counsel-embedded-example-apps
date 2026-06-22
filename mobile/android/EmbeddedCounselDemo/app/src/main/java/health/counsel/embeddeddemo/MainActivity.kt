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
        // ADJUST_RESIZE is what makes the IME report (and animate) as a WindowInsets.ime inset
        // that Compose can read. Under edge-to-edge (decorFitsSystemWindows=false) the window
        // itself is never resized or panned by the system, so WebViewScreen consumes that inset
        // to pan the WebView up by the keyboard height when the keyboard opens.
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
        val api = Api()
        val tokenStore = TokenStore(applicationContext)
        setContent {
            EmbeddedCounselDemoApp(api = api, tokenStore = tokenStore)
        }
    }
}
