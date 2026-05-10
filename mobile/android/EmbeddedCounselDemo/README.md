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

The debug variant points at `http://10.0.2.2:4003`, which maps to your host
machine's `localhost` from the Android emulator. Start the local Node server first:

```bash
cd ../../..
./start.sh   # or run server/nodejs/ directly per top-level README
```

Then Run the `app` configuration in Android Studio (or `./gradlew installDebug`).

`network_security_config.xml` permits cleartext only for `10.0.2.2` and `localhost`
in the debug build. Release builds connect to the production Cloud Run URL over HTTPS.

NOTE: you need to run these commands to allow the Android emulator to connect to the local server & web app:

```bash
adb reverse tcp:3000 tcp:3000
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
