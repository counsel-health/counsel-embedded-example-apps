package health.counsel.embeddeddemo.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import health.counsel.embeddeddemo.R
import health.counsel.embeddeddemo.data.api.AccessCodeTokenResponse
import health.counsel.embeddeddemo.ui.theme.BrandDarkBlue
import health.counsel.embeddeddemo.ui.theme.BrandMidGreen
import kotlinx.coroutines.launch

@Composable
fun AccessCodeScreen(
    onLogin: suspend (accessCode: String) -> AccessCodeTokenResponse,
    onAuthenticated: (AccessCodeTokenResponse) -> Unit,
    modifier: Modifier = Modifier,
) {
    var accessCode by rememberSaveable { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var showError by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 32.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = stringResource(R.string.access_code_title),
            style = MaterialTheme.typography.headlineLarge.copy(fontWeight = FontWeight.Bold),
            color = BrandMidGreen,
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.access_code_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = BrandDarkBlue,
        )
        Spacer(Modifier.height(80.dp))
        OutlinedTextField(
            value = accessCode,
            onValueChange = { accessCode = it },
            label = { Text(stringResource(R.string.access_code_label)) },
            placeholder = { Text(stringResource(R.string.access_code_placeholder)) },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(16.dp))
        Button(
            onClick = {
                if (accessCode.isBlank()) {
                    showError = true
                    return@Button
                }
                scope.launch {
                    isLoading = true
                    runCatching { onLogin(accessCode.trim()) }
                        .onSuccess { onAuthenticated(it) }
                        .onFailure { showError = true }
                    isLoading = false
                }
            },
            enabled = !isLoading,
            modifier = Modifier.align(Alignment.Start),
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.onPrimary,
                    strokeWidth = 2.dp,
                    modifier = Modifier.height(20.dp),
                )
            } else {
                Text(stringResource(R.string.login))
            }
        }
    }

    if (showError) {
        AlertDialog(
            onDismissRequest = { showError = false },
            title = { Text(stringResource(R.string.error_title)) },
            text = { Text(stringResource(R.string.error_invalid_code)) },
            confirmButton = {
                TextButton(onClick = { showError = false }) {
                    Text(stringResource(R.string.ok))
                }
            },
        )
    }
}
