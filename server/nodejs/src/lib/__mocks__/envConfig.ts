/**
 * Mock environment configuration for testing
 * Sets up test environment variables before envConfig.ts is imported
 */

export function setupTestEnv() {
  if (!process.env.ACCESS_CODE_CONFIGS) {
    process.env.PORT = "4003";
    process.env.JWT_SECRET = "a".repeat(32);
    process.env.COUNSEL_WEBHOOK_SECRET = "test-webhook-secret";
    process.env.COUNSEL_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDsBZnh0Ia4lXDO
lTfl0476d59qbniqpfVGRDMLAxfy4lJOYpUpoQwd7ixqxvVLJQ7liLOOHT8o/4lc
74m2Z/YafY+XgeITYbb9+EyoS4sANMd095DmTCU2jveZkvuNla+N43M2oZbeDIAv
389CqESZ5L2PYTLILiZ/Wl1YmlhMLKuB+MIoAtRLkf84P0/S8KW5qSPPDpF5uatG
TkawykmBSNe1XLpsgNDrQlu0r9qQWCUd73bYeBeGOXqaUpDqFI0vd9NeGYID9wTB
2WTj9a428lBdxAmaT4sK7rtQFPVPSaSD/N9lNa02M6u4GUOwsGzpWCpB0QaJ4rKI
S9hJQbcxAgMBAAECggEAWHVO88HWREcKJPrrHNGaJEiCMH8f7YFOuJul78okhy0I
wQUUt6n64xrZfdl8pMHKX//IoApZGjIP1wuV9w3mwI3vq86Ln0z/qxcNEARkH9so
KDADGDVQuy6BIQdkDXAdAFZPX5nXc/iGcKr2wJpVP8Jpw1ugD0OwvQlus98BGebp
ynF54muzOU2731JuoWIfKa/guFLxFJFQc4UUbl/VBjYjycUOAyPa/548apA6J8EW
BohzzUeBE8MVk3YMA7FMMywZBkZCMzSGV+4BU5GQG0BUgWBh1H9yopH5Dpdgpe/t
T5EssjhHchRVr1v5iy3TCxEaecTjlccn1sbLaIP3mwKBgQD4pmba6cGdAG3j8Oq/
UNC1mgbGMcOGd2ablA7sTGl7+4FS4Vg6spXJxu9tGeOxYaD9AcWsxhWzeTNb2BoB
Oeo0YJQ57aY5OzhhunJNYDByLKeh5MXXMfU0qJrnA2Z/ytbCYWJrIOu8aTNW9MBz
iU+gbEen/Nwmr57CUa5XilLT1wKBgQDy/6OY24HFUcUmyiIli5NC4nL8iG+tv9n+
nvSOq9om248k5sTjXL5HJWUfvOiTQwQI13LaHrCjb+TtMHZnHdJEtXnmDOXc9wM1
4CylR4JjgaujbDizatCb/rwz+KF7DbinSQKPib0bOK1kZQcfl3jp9CozGiniXNb9
6g5hdbTsNwKBgQDduzX5fX6ETT+xhsMvfBfB+eqUjwf3Pz6m+i8clT9zqmI20HDn
Vx2v49Daj722DoOLWys12Sa89xXPjzQRZ93seztzNPOIEcFDlQoc6ewJxLxv6Bxs
vEYXgUsxOp0K1I0SpdkoAyF00LNRlcyQux/gxO5ZZWnErdN7IW/A7L7T3QKBgQCj
H//YDotoRgNejdUsdS1PeisM4h5ueltCNb0gxbb13PCUKiLEKq9FnZHsI2nR6ewc
b12XlYCoxuXcYGsrv/Y2z8jcKY5prpzGHw55ia67VAI/+9d4gl02S2RWUzM8IzLx
ge6pIyMC0iJ8QeHtUEcIbzOhCJBTeFWPMP+kZ1skMwKBgEBIvlPiqNbneoBUrya8
02RshdzlghpwINdaxvut+Vvv8h2oStYDIkmaTvKbit9o9cXAGWxBHzhSVa6XXZ7v
mdClXupSWrpZZrxf8TWBDUA7cAK7TbE9WisyLcGzZpD7BwV7dzxusUNSW8GVVR1/
C5BbuQIDjQMF9oegNdwn/V5/
-----END PRIVATE KEY-----`;
    process.env.ACCESS_CODE_CONFIGS = JSON.stringify({
      MAIN01: {
        client: "main",
        apiUrl: "https://test-api.counselhealth.com",
        userType: "main",
        apiKey: "sk_test_main01_key",
        issuer: "https://local-test-partner.example.com/main",
      },
      CODE23: {
        client: "main",
        apiUrl: "https://test-api.counselhealth.com",
        userType: "main",
        apiKey: "sk_test_code23_key",
        issuer: "https://local-test-partner.example.com/main",
      },
      ONBR01: {
        client: "onboarding",
        apiUrl: "https://test-api.counselhealth.com",
        userType: "onboarding",
        apiKey: "sk_test_onbr01_key",
        issuer: "https://local-test-partner.example.com/onboarding",
      },
      APIK01: {
        client: "main",
        apiUrl: "https://test-api.counselhealth.com",
        userType: "main",
        apiKey: "sk_test_api_key_123",
      },
    });
  }
}
