package health.counsel.embeddeddemo.ui

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import health.counsel.embeddeddemo.BuildConfig
import health.counsel.embeddeddemo.R
import health.counsel.embeddeddemo.data.api.ApiError
import health.counsel.embeddeddemo.util.AppLogger
import health.counsel.embeddeddemo.util.openInExternalBrowser
import kotlinx.coroutines.CancellationException

// Refetch the signed app URL on resume if the current one is older than this.
// Counsel signed URLs are short-TTL; 5 minutes keeps us comfortably ahead of expiry
// while not refetching on every quick app switch.
private const val URL_FRESHNESS_MS: Long = 5 * 60 * 1000

private const val VIEWPORT_SCRIPT = """
    (function() {
        if (!document.querySelector('meta[name="viewport"]')) {
            var meta = document.createElement('meta');
            meta.setAttribute('name', 'viewport');
            meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, interactive-widget=resizes-visual');
            document.head.appendChild(meta);
        }
    })();
"""

sealed class UrlState {
    data object Loading : UrlState()
    data class Loaded(val url: String) : UrlState()
    data class Failed(val error: ApiError) : UrlState()
}

@Composable
fun WebViewScreen(
    fetchUrl: suspend () -> String,
    onTokenInvalid: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier,
    preloadedUrl: String? = null,
) {
    val now = System.currentTimeMillis()
    var state: UrlState by remember {
        mutableStateOf(if (preloadedUrl != null) UrlState.Loaded(preloadedUrl) else UrlState.Loading)
    }
    // Tracks when the URL currently in `state` was fetched. 0L means "no fresh URL yet"
    // (e.g., initial load is still pending). Used by the lifecycle observer below to
    // decide whether the URL is stale on resume.
    var loadedAt by remember { mutableLongStateOf(if (preloadedUrl != null) now else 0L) }
    var attempt by remember { mutableStateOf(0) }
    var fetchReason by remember { mutableStateOf("initial") }
    var showLogoutDialog by remember { mutableStateOf(false) }

    LaunchedEffect(attempt) {
        if (state is UrlState.Loaded && loadedAt != 0L) return@LaunchedEffect
        AppLogger.info(
            AppLogger.WEB_VIEW_TAG,
            "signedAppUrlFetch started reason=$fetchReason attempt=$attempt",
        )
        state = UrlState.Loading
        try {
            val fetched = fetchUrl()
            state = UrlState.Loaded(fetched)
            loadedAt = System.currentTimeMillis()
            AppLogger.info(
                AppLogger.WEB_VIEW_TAG,
                "signedAppUrlFetch completed reason=$fetchReason url=${safeUrlLabel(fetched)}",
            )
        } catch (e: CancellationException) {
            // LaunchedEffect was re-keyed (e.g. retry tapped) — let cancellation propagate
            // instead of writing Failed state for a coroutine that's been superseded.
            throw e
        } catch (e: Throwable) {
            AppLogger.warn(
                AppLogger.WEB_VIEW_TAG,
                "signedAppUrlFetch failed reason=$fetchReason error=${e.javaClass.simpleName}",
            )
            when (e) {
                is ApiError.TokenExpired, is ApiError.Unauthorized -> onTokenInvalid()
                is ApiError -> state = UrlState.Failed(e)
                else -> state = UrlState.Failed(ApiError.Network(e))
            }
        }
    }

    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event != Lifecycle.Event.ON_RESUME) return@LifecycleEventObserver
            // Only refetch when we have a Loaded URL that's gone stale.
            // Loading/Failed states are already exercising the fetch path.
            if (state !is UrlState.Loaded) return@LifecycleEventObserver
            if (loadedAt == 0L) return@LifecycleEventObserver
            if (System.currentTimeMillis() - loadedAt < URL_FRESHNESS_MS) return@LifecycleEventObserver
            // Mark the URL stale and re-trigger the fetch effect.
            AppLogger.info(AppLogger.WEB_VIEW_TAG, "signedAppUrlFetch staleOnResume")
            fetchReason = "staleResume"
            loadedAt = 0L
            attempt++
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    // System back always asks to log out from the WebView screen — we don't navigate
    // the WebView's history. Confirm in the dialog clears the session; cancel dismisses.
    BackHandler(enabled = true) { showLogoutDialog = true }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text(stringResource(R.string.logout_title)) },
            text = { Text(stringResource(R.string.logout_message)) },
            confirmButton = {
                TextButton(onClick = {
                    showLogoutDialog = false
                    onLogout()
                }) { Text(stringResource(R.string.logout_confirm)) }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text(stringResource(R.string.cancel))
                }
            },
        )
    }

    Box(modifier = modifier.fillMaxSize()) {
        when (val s = state) {
            is UrlState.Loaded -> EmbeddedWebView(
                url = s.url,
                onMainFrameError = { code, desc, failingUrl ->
                    state = UrlState.Failed(ApiError.WebViewLoad(code, desc, failingUrl))
                },
                modifier = Modifier.fillMaxSize(),
            )
            is UrlState.Loading -> Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.height(8.dp))
                Text(text = stringResource(R.string.loading))
            }
            is UrlState.Failed -> ErrorRetry(
                error = s.error,
                onRetry = {
                    AppLogger.info(AppLogger.WEB_VIEW_TAG, "signedAppUrlFetch retryRequested")
                    fetchReason = "retry"
                    attempt++
                },
                modifier = Modifier.fillMaxSize().padding(32.dp),
            )
        }
    }
}

@Composable
private fun ErrorRetry(error: ApiError, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    val message = when (error) {
        is ApiError.Network, is ApiError.WebViewLoad -> stringResource(R.string.error_network)
        is ApiError.Server -> stringResource(R.string.error_server)
        else -> stringResource(R.string.error_server)
    }
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(text = message, style = MaterialTheme.typography.bodyLarge)
        if (BuildConfig.DEBUG) {
            Spacer(Modifier.height(8.dp))
            Text(
                text = "[debug] ${error::class.simpleName}: ${error.message ?: ""}",
                style = MaterialTheme.typography.bodySmall,
            )
        }
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRetry) { Text(stringResource(R.string.retry)) }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun EmbeddedWebView(
    url: String,
    onMainFrameError: (code: Int, description: String, failingUrl: String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var showLoading by remember { mutableStateOf(true) }
    // Track the URL we *requested* the WebView to load, separate from `webView.url`.
    // After a server redirect, `webView.url` reflects the redirected URL, which would
    // make `webView.url != url` true on every recomposition and re-trigger loadUrl —
    // double-loading and (for single-use signed URLs) breaking subsequent loads.
    var lastLoadedUrl by remember { mutableStateOf<String?>(null) }

    // Holds the pending file-input callback from onShowFileChooser until the system
    // picker returns. Android's WebView does not open a file chooser on its own, so
    // without this override the page's <input type="file"> (the chat upload button)
    // silently does nothing.
    val filePathCallbackRef = remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }

    val fileChooserLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartActivityForResult(),
    ) { result ->
        val callback = filePathCallbackRef.value
        filePathCallbackRef.value = null
        // parseResult returns the selected URIs, or null when the user cancels.
        // Always invoke the callback — skipping it (e.g. on cancel) wedges every
        // subsequent upload attempt.
        callback?.onReceiveValue(
            WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data),
        )
    }

    // imePadding() shrinks the WebView by the keyboard height when the IME opens (paired with
    // ADJUST_RESIZE set in MainActivity). The WebView resizes its document viewport from its
    // View bounds, so the focused input stays visible — matching iOS's resizes-visual behavior.
    Box(modifier = modifier.imePadding()) {
        AndroidView(
            factory = { ctx ->
                if (BuildConfig.DEBUG) WebView.setWebContentsDebuggingEnabled(true)
                WebView(ctx).apply {
                    // Force MATCH_PARENT × MATCH_PARENT explicitly. Compose's AndroidView
                    // defaults hosted Views to WRAP_CONTENT
                    // The Counsel WebView is designed to be full screen, so we need to set the layout params to MATCH_PARENT.
                    // Otherwise, it will collapse to 0.
                    // CSS viewport units (`100dvh`, `100vh`) circular: the viewport depends
                    // on the content, the content depends on the viewport, and calc(100dvh)
                    // collapses to 0. We want Compose to drive the WebView's size and the
                    // WebView to size its document viewport from its View bounds.
                    // See: https://issues.chromium.org/issues/40191237 for inspiration on the fix.
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT,
                    )
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.mediaPlaybackRequiresUserGesture = false
                    // setSupportMultipleWindows(false) is default; target=_blank navigations
                    // route through shouldOverrideUrlLoading where we hand off to the system browser.

                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
                            showLoading = true
                            AppLogger.info(
                                AppLogger.WEB_VIEW_TAG,
                                "pageStarted url=${safeUrlLabel(url)}",
                            )
                            view.evaluateJavascript(VIEWPORT_SCRIPT, null)
                        }

                        override fun onPageFinished(view: WebView, url: String?) {
                            showLoading = false
                            AppLogger.info(
                                AppLogger.WEB_VIEW_TAG,
                                "pageFinished url=${safeUrlLabel(url)}",
                            )
                        }

                        override fun onReceivedError(
                            view: WebView,
                            request: WebResourceRequest,
                            error: WebResourceError,
                        ) {
                            // Only report main-frame failures — sub-resource errors (e.g. a
                            // failed analytics beacon) shouldn't take down the whole screen.
                            if (!request.isForMainFrame) return
                            showLoading = false
                            AppLogger.warn(
                                AppLogger.WEB_VIEW_TAG,
                                "pageError code=${error.errorCode} url=${safeUrlLabel(request.url?.toString())}",
                            )
                            onMainFrameError(
                                error.errorCode,
                                error.description?.toString() ?: "unknown",
                                request.url?.toString() ?: "",
                            )
                        }

                        override fun shouldOverrideUrlLoading(
                            view: WebView,
                            request: WebResourceRequest,
                        ): Boolean {
                            val target = request.url?.toString() ?: return false
                            val current = view.url
                            if (current != null && sameHost(target, current)) {
                                AppLogger.info(
                                    AppLogger.WEB_VIEW_TAG,
                                    "navigation inWebView target=${safeUrlLabel(target)}",
                                )
                                return false
                            }
                            val handled = openInExternalBrowser(view.context, target)
                            AppLogger.info(
                                AppLogger.WEB_VIEW_TAG,
                                "externalNavigation target=${safeUrlLabel(target)} handled=$handled",
                            )
                            return handled
                        }
                    }
                    webChromeClient = object : WebChromeClient() {
                        // Android's WebView delegates <input type="file"> handling to the host
                        // app. Without this override the chat upload button does nothing.
                        override fun onShowFileChooser(
                            webView: WebView,
                            filePathCallback: ValueCallback<Array<Uri>>,
                            fileChooserParams: FileChooserParams,
                        ): Boolean {
                            // Cancel any previous pending request so its callback isn't leaked
                            // or left wedging the next upload.
                            filePathCallbackRef.value?.onReceiveValue(null)
                            filePathCallbackRef.value = filePathCallback

                            // createIntent() honors the input's `accept` types and multiple flag.
                            val intent: Intent = fileChooserParams.createIntent()
                            return try {
                                fileChooserLauncher.launch(intent)
                                true
                            } catch (e: Exception) {
                                // Release the pending callback before returning false. Android
                                // WebView has no default file chooser when the host returns false,
                                // so if we skip onReceiveValue the page's <input type="file"> stays
                                // wedged and every later chat upload silently does nothing.
                                filePathCallback.onReceiveValue(null)
                                filePathCallbackRef.value = null
                                AppLogger.warn(
                                    AppLogger.WEB_VIEW_TAG,
                                    "fileChooser launch failed error=${e.javaClass.simpleName}",
                                )
                                false
                            }
                        }
                    }

                    AppLogger.info(AppLogger.WEB_VIEW_TAG, "loadUrl initial url=${safeUrlLabel(url)}")
                    loadUrl(url)
                    lastLoadedUrl = url
                }
            },
            update = { webView ->
                if (lastLoadedUrl != url) {
                    AppLogger.info(AppLogger.WEB_VIEW_TAG, "loadUrl update url=${safeUrlLabel(url)}")
                    webView.loadUrl(url)
                    lastLoadedUrl = url
                }
            },
            modifier = Modifier.fillMaxSize(),
        )

        if (showLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

private fun sameHost(a: String, b: String): Boolean = runCatching {
    val ha = Uri.parse(a).host ?: return false
    val hb = Uri.parse(b).host ?: return false
    ha.equals(hb, ignoreCase = true)
}.getOrDefault(false)

private fun safeUrlLabel(url: String?): String {
    if (url.isNullOrBlank()) return "unknown"
    return runCatching {
        val uri = Uri.parse(url)
        val scheme = uri.scheme ?: "unknown"
        val host = uri.host ?: "unknown"
        "$scheme://$host"
    }.getOrDefault("invalid")
}
