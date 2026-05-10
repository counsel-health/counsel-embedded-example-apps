plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.detekt)
}

// Apply detekt to every Kotlin source set in the project so adding new modules
// doesn't require remembering to wire detekt in each one.
allprojects {
    apply(plugin = rootProject.libs.plugins.detekt.get().pluginId)

    // GitHub Actions sets CI=true; locally CI is unset, so devs get auto-correct.
    val isCi = providers.environmentVariable("CI").orNull == "true"

    detekt {
        toolVersion = rootProject.libs.versions.detekt.get()
        config.setFrom(rootProject.files("detekt.yml"))
        buildUponDefaultConfig = true
        // Local: auto-correct formatting in place. CI: never modify source —
        // surface findings as build failures instead.
        autoCorrect = !isCi
        // Source sets are auto-discovered for Android modules; explicit list for clarity.
        source.setFrom(
            files(
                "src/main/java",
                "src/main/kotlin",
                "src/test/java",
                "src/test/kotlin",
                "src/androidTest/java",
                "src/androidTest/kotlin",
            ),
        )
        ignoredBuildTypes = listOf("release")
    }

    dependencies {
        // Adds the ktlint-equivalent formatting rule set on top of detekt's defaults.
        "detektPlugins"(rootProject.libs.detekt.formatting)
    }

    tasks.withType<io.gitlab.arturbosch.detekt.Detekt>().configureEach {
        jvmTarget = "17"
        reports {
            html.required.set(true)
            xml.required.set(true)
            sarif.required.set(true)
            md.required.set(false)
        }
    }

    tasks.withType<io.gitlab.arturbosch.detekt.DetektCreateBaselineTask>().configureEach {
        jvmTarget = "17"
    }
}
