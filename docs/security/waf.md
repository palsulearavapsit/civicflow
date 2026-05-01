# 🛡️ Google Cloud Armor & WAF Configuration

**Requirement SEC-10**: Enterprise-grade DDoS and WAF protection.

## Security Policy: `civicflow-waf-policy`

| Rule Priority | Match | Action | Description |
| :--- | :--- | :--- | :--- |
| 1000 | `evaluatePreconfiguredExpr('sqli-v33-stable')` | Deny (403) | Prevent SQL Injection attacks. |
| 1100 | `evaluatePreconfiguredExpr('xss-v33-stable')` | Deny (403) | Prevent Cross-Site Scripting. |
| 1200 | `evaluatePreconfiguredExpr('lfi-v33-stable')` | Deny (403) | Prevent Local File Inclusion. |
| 2000 | `origin.region_code != 'US'` | Rate Limit | Throttling non-US traffic for compliance. |
| 9999 | `*` | Allow | Default allow for all other traffic. |

## Rate Limiting Configuration
- **Threshold**: 100 requests per 1 minute per IP.
- **Action**: Redirect to `recaptcha` verification after threshold.

## Edge Security Headers
All responses are injected with:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Content-Security-Policy: ...` (See middleware.ts)
