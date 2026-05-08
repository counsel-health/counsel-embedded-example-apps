package health.counsel.embeddeddemo.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Brand palette mirrors mobile/ios/.../Assets.xcassets/Brand*.colorset (light values).
// Names match iOS for parity even where they're a stretch (BrandMidGreen is dark slate teal).
val BrandDarkBlue = Color(0xFF002243)
val BrandLightBlue = Color(0xFF95BDDC)
val BrandMidGreen = Color(0xFF274651)

private val LightColors = lightColorScheme(
    primary = BrandMidGreen,
    onPrimary = Color.White,
    secondary = BrandDarkBlue,
    onSecondary = Color.White,
    tertiary = BrandLightBlue,
    onTertiary = BrandDarkBlue,
    background = Color.White,
    onBackground = BrandDarkBlue,
    surface = Color.White,
    onSurface = BrandDarkBlue,
)

@Composable
fun EmbeddedCounselDemoTheme(
    @Suppress("UNUSED_PARAMETER") darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = LightColors,
        content = content,
    )
}
