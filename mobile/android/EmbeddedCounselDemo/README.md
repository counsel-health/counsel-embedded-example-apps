# EmbeddedCounselDemo (Android)

Native Android counterpart to `mobile/ios/EmbeddedCounselDemo`. Demonstrates how a
partner app can embed the Counsel chat experience using an access-code login flow
and a WebView pointed at a server-signed URL.

## Stack

- Kotlin 2.0.21 + Jetpack Compose (Material3)
- Ktor Client + kotlinx.serialization
- DataStore Preferences (token/userType persistence)
- AGP 8.7.2, JDK 17, Gradle 8.10.2
- Min SDK 26, Target SDK 35

## Setup

```bash
cd mobile/android/EmbeddedCounselDemo
./gradlew :app:assembleDebug
```

Open in Android Studio (Hedgehog or newer): "Open" this directory.

## Running locally against the Node server

The debug variant points at `http://localhost:4003` and reaches the host Node server
through an `adb reverse` tunnel (see below). We use the tunnel instead of the emulator's
`10.0.2.2` host alias because a host VPN (common on work machines — look for `utun*`
interfaces) breaks the emulator's `10.0.2.2` NAT route, while the tunnel keeps working.
Start the local Node server first:

```bash
cd ../../..
./start.sh   # or run server/nodejs/ directly per top-level README
```

Then Run the `app` configuration in Android Studio (or `./gradlew installDebug`).

`network_security_config.xml` permits cleartext only for `localhost`, `127.0.0.1`, and
`10.0.2.2` in the debug build. Release builds connect to the production Cloud Run URL over HTTPS.

### Letting the emulator reach your host (`adb reverse`)

Both the Node server (`:4003`) and the signed web-app URL the server returns
(`http://localhost:<port>`) are reached over `localhost` from inside the emulator — but
`localhost` inside the emulator means the emulator itself, not your Mac. Without
forwarding, API calls fail with `error=Network` and the WebView fails with
`net::ERR_CONNECTION_REFUSED` (logcat `pageError code=-6`). `adb reverse` tunnels the
emulator's `localhost:<port>` back to the same port on your host:

```bash
adb reverse tcp:4003 tcp:4003   # Node API server (BASE_URL)
adb reverse tcp:3000 tcp:3000   # Counsel web app (signed app URL); add any other port it uses
```

This is per-session adb state — it's cleared whenever the emulator reboots/cold-boots or
the adb server restarts, so re-run both if the app stops connecting. List active rules
with `adb reverse --list`.

#### If `adb` isn't installed yet

`adb` ships with the **Android SDK Platform-Tools**. If you have Android Studio it's
already on disk (macOS default: `~/Library/Android/sdk/platform-tools/adb`); you just
need it on your `PATH`:

```bash
# zsh: add platform-tools to PATH permanently
echo 'export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

No Android Studio? Install the standalone tools:

```bash
brew install --cask android-platform-tools
```

Verify it's working and the emulator is attached (start the emulator from Android
Studio's Device Manager first):

```bash
adb version            # confirms adb is on PATH
adb devices            # should list e.g. "emulator-5554   device"
```

## Flow

```
+-----------------+                          +------------------+
| AccessCodeScreen| -- POST /user/signUp --> |  Node server     |
|  (input + btn)  | <-- token+userType ----- |                  |
+-----------------+                          +------------------+
        |
        v  token persisted in DataStore;
           signed URL preloaded in parallel
        |
+-----------------+                          +------------------+
| WebViewScreen   | -- POST /signedAppUrl -> |  Node server     |
|  (android.web)  | <-- signed URL --------- |                  |
+-----------------+                          +------------------+
        |
        v
  WebView loads embedded Counsel chat
  - target=_blank -> system browser via Intent.ACTION_VIEW
  - back button -> webview.goBack() if history; otherwise exit
  - portrait-locked, light theme
```

## Tests

```bash
./gradlew :app:test
```

## Lint / format

Static analysis + Kotlin formatting are handled by [detekt](https://detekt.dev/)
with the `detekt-formatting` extension (ktlint rule set). Config in `detekt.yml`.

```bash
./gradlew :app:detekt        # locally: auto-corrects formatting; fails on real findings
CI=true ./gradlew :app:detekt # simulates CI: never modifies source, fails on any finding
```

Android Lint (AGP) still runs separately for Android-specific issues:

```bash
./gradlew :app:lint
```

CI runs all three: `:app:detekt`, `:app:lint`, `:app:test`, then `:app:assembleDebug`.

## File map

```
app/src/main/java/health/counsel/embeddeddemo/
├── MainActivity.kt              # entry point
├── EmbeddedCounselDemoApp.kt    # root composable, auth-state routing
├── ui/
│   ├── AccessCodeScreen.kt
│   ├── WebViewScreen.kt         # AndroidView wrapping android.webkit.WebView
│   └── theme/Theme.kt
├── data/
│   ├── TokenStore.kt            # DataStore Preferences
│   └── api/
│       ├── Api.kt               # single-HttpClient Ktor wrapper
│       ├── ApiError.kt          # sealed error hierarchy
│       └── ResponseModels.kt    # @Serializable DTOs
└── util/
    └── ExternalBrowser.kt       # Intent.ACTION_VIEW helper
```
