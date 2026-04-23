# CivicFlow Election Copilot

**CivicFlow** is a production-ready, interactive web application designed to help users navigate the complexities of the election process. It provides personalized timelines, risk assessments, and real-time guidance based on the user's location and voting preferences.

## 🚀 Key Features
- **Smart Onboarding**: Tailored voter profile generation.
- **Risk Meter**: Real-time tracking of upcoming deadlines.
- **Polling Finder**: Integrated Google Maps for finding polling stations.
- **AI Copilot**: Plain-language Q&A powered by Gemini.
- **Eligibility Checker**: Interactive document and status verification.
- **Admin Panel**: Secure dashboard for updating global election data.

## 🛠 Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend**: Firebase (Auth, Firestore, Cloud Functions, Hosting).
- **Maps**: Google Maps Places API.
- **AI**: Google Gemini API.
- **Testing**: Vitest, Playwright, React Testing Library.

---

## 💻 Local Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
GEMINI_API_KEY=your_gemini_key
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### End-to-End Tests
```bash
npx playwright install
npm run test:e2e
```

---

## 📦 Deployment

### Firebase Setup
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable Authentication (Google), Firestore, and Functions.
3. Install Firebase CLI: `npm install -g firebase-tools`.
4. Login: `firebase login`.
5. Deploy:
```bash
firebase deploy
```

---

## 📊 Data Model (Firestore)
- `users`: `{ uid, email, onboarded, location, ageGroup, role }`
- `election_rules`: `{ state, registrationDeadline, earlyVotingStart, idRequirements }`
- `myths_facts`: `{ myth, fact, source, sourceUrl }`
- `user_checklists`: `{ uid, items: [{ text, checked, required }] }`

---

## 📝 2-Minute Demo Script
1. **Landing**: Start on the premium landing page, emphasizing the "Vote with Confidence" message.
2. **Onboarding**: Sign in with Google and complete the 4-step onboarding (Location -> Profile -> Method).
3. **Dashboard**: Show the **Risk Meter** and **Personalized Timeline**. Explain how the data is filtered by state.
4. **Tools**: Navigate to the **Eligibility Checker** to show the interactive document list.
5. **Maps**: Open the **Polling Finder**, select a station, and show the accessibility notes.
6. **Chat**: Ask the **Copilot** "When is my registration deadline?" to see the AI response.
7. **Admin**: Quick peek at the **Admin Panel** to show how easy it is to update dates globally.

---

## 🛡 Security & Accessibility
- **WCAG 2.1**: High contrast mode support and ARIA labels.
- **RBAC**: Admin-only access to global rule updates.
- **Validation**: Server-side validation via Cloud Functions for sensitive actions.
