# CivicFlow Architecture & Contribution Guide

## 🏛️ Architectural Overview
CivicFlow is built on a **Resilient Next.js 16** foundation, leveraging a decoupled service-oriented architecture.

### Core Layers:
1. **Presentation**: React 19 Client Components with Tailwind 4 and Framer Motion.
2. **Business Logic**: Decoupled utilities in `src/utils/election-logic.ts` for pure, testable calculations.
3. **Data Access**: Standardized `UserService` with Zod validation.
4. **Security**: Nonce-based CSP and hardened Proxy Middleware.

## 🛠️ Development Standards
- **Zero-Any Policy**: All variables must be strictly typed.
- **Result Pattern**: Use the `Result<T, E>` pattern for error-prone operations.
- **A11y First**: Every interactive element must have appropriate ARIA attributes.

## 🧪 Testing Strategy
- **Unit**: Vitest for core logic.
- **E2E**: Playwright for critical user flows (Onboarding, AI Chat).
- **Performance**: Benchmarks ensuring <10ms business logic execution.
