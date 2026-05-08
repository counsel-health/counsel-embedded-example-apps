package health.counsel.embeddeddemo.data.api

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class UserType {
    @SerialName("main") MAIN,
    @SerialName("onboarding") ONBOARDING,
}

@Serializable
data class AccessCodeTokenResponse(
    val token: String,
    val userType: UserType,
)

@Serializable
data class SignedAppResponse(
    val url: String,
)
