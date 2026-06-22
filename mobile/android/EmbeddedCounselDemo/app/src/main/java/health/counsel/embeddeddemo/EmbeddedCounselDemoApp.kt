package health.counsel.embeddeddemo

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import health.counsel.embeddeddemo.data.TokenStore
import health.counsel.embeddeddemo.data.api.Api
import health.counsel.embeddeddemo.ui.AccessCodeScreen
import health.counsel.embeddeddemo.ui.WebViewScreen
import health.counsel.embeddeddemo.ui.theme.EmbeddedCounselDemoTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

private sealed interface AuthState {
    data object Unloaded : AuthState
    data object SignedOut : AuthState
    data class SignedIn(val token: String) : AuthState
}

@Composable
fun EmbeddedCounselDemoApp(
    api: Api,
    tokenStore: TokenStore,
) {
    val authFlow = remember(tokenStore) {
        tokenStore.tokenFlow.map<String?, AuthState> { token ->
            if (token == null) AuthState.SignedOut else AuthState.SignedIn(token)
        }
    }
    val authState by authFlow.collectAsState(initial = AuthState.Unloaded)
    var preloadedUrl by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    EmbeddedCounselDemoTheme {
        // No safeDrawing padding on the Surface itself: the WebView is meant to render
        // edge-to-edge (under the status/nav bars), matching iOS and relying on the web
        // app's CSS env(safe-area-inset-*) — enabled via viewport-fit=cover in WebViewScreen.
        // The native screens (access-code form, loading spinner) opt back into safe-area
        // insets individually so their controls stay clear of the system bars.
        Surface(modifier = Modifier.fillMaxSize()) {
            when (val s = authState) {
                AuthState.Unloaded -> Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .windowInsetsPadding(WindowInsets.safeDrawing),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                }

                AuthState.SignedOut -> AccessCodeScreen(
                    modifier = Modifier.windowInsetsPadding(WindowInsets.safeDrawing),
                    onLogin = { code -> api.fetchToken(code) },
                    onAuthenticated = { resp ->
                        // Preload the signed URL BEFORE persisting the token. Saving the
                        // token triggers the auth-state flow → SignedIn → WebViewScreen
                        // composes; if the preload hadn't completed by then, WebViewScreen's
                        // `remember` would lock in `preloadedUrl == null` and start a
                        // redundant fetch. Serializing keeps the preload effective.
                        // Failure here is non-fatal: WebViewScreen falls back to fetching
                        // its own URL via `fetchUrl`.
                        scope.launch(Dispatchers.IO) {
                            preloadedUrl = runCatching { api.fetchSignedAppUrl(resp.token) }
                                .getOrNull()
                            tokenStore.save(resp.token, resp.userType)
                        }
                    },
                )

                is AuthState.SignedIn -> {
                    val clearSession: () -> Unit = {
                        preloadedUrl = null
                        scope.launch { tokenStore.clear() }
                    }
                    WebViewScreen(
                        fetchUrl = { api.fetchSignedAppUrl(s.token) },
                        onTokenInvalid = clearSession,
                        onLogout = clearSession,
                        preloadedUrl = preloadedUrl,
                    )
                }
            }
        }
    }
}
