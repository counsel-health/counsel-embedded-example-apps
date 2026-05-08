package health.counsel.embeddeddemo.data

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import health.counsel.embeddeddemo.data.api.UserType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "embedded_counsel_demo")

class TokenStore(context: Context) {
    private val store = context.applicationContext.dataStore

    val tokenFlow: Flow<String?> = store.data.map { it[KEY_TOKEN] }
    val userTypeFlow: Flow<UserType?> = store.data.map { prefs ->
        prefs[KEY_USER_TYPE]?.let { raw -> runCatching { UserType.valueOf(raw) }.getOrNull() }
    }

    suspend fun save(token: String, userType: UserType) {
        store.edit { prefs ->
            prefs[KEY_TOKEN] = token
            prefs[KEY_USER_TYPE] = userType.name
        }
    }

    suspend fun clear() {
        store.edit { prefs ->
            prefs.remove(KEY_TOKEN)
            prefs.remove(KEY_USER_TYPE)
        }
    }

    private companion object {
        val KEY_TOKEN: Preferences.Key<String> = stringPreferencesKey("token")
        val KEY_USER_TYPE: Preferences.Key<String> = stringPreferencesKey("userType")
    }
}
