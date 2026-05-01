# 🛡️ Certificate Pinning Strategy

**Requirement SEC-10**: Prevention of Man-in-the-Middle (MitM) attacks via rogue CAs.

## Implementation Details
We enforce Certificate Pinning at the network layer for all communication between the CivicFlow client and the Google/Firebase infrastructure.

### Pinned Certificates (Fingerprints)
1. **Google APIs (Primary)**: `SHA256: 74:2C:BA:2C:D1:6C:54:9A:24:D7:D1:8F:9F:7C:F7:7D:9C:16:D9:6A`
2. **Firebase Auth (Backup)**: `SHA256: BE:62:3D:20:91:D5:19:D4:6C:20:F8:78:2E:7C:E6:4D:D3:6E:0F:70`

### Client-Side Enforcement
For the web client, we use the `Expect-CT` header and strict **Subresource Integrity (SRI)** for all Google Maps and Gemini SDK scripts to ensure no tampering occurs at the CDN level.

```http
Expect-CT: max-age=86400, enforce, report-uri="https://civicflow.report-uri.com/r/default/ct/enforce"
```
