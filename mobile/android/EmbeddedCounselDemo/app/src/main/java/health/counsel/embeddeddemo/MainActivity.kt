package health.counsel.embeddeddemo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import health.counsel.embeddeddemo.data.TokenStore
import health.counsel.embeddeddemo.data.api.Api

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val api = Api()
        val tokenStore = TokenStore(applicationContext)
        setContent {
            EmbeddedCounselDemoApp(api = api, tokenStore = tokenStore)
        }
    }
}
