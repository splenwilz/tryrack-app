# TODO

This file tracks pending features, improvements, and technical debt that will be addressed in future development cycles.

## 🔴 Blocked / Waiting

### Authentication - Password Reset Flow

**Status:** Blocked - Waiting for Apple Developer Program enrollment  
**Reason:** Requires EAS build with app ID for deep linking configuration  
**Files:**

- `app/auth/forgot-password.tsx` - UI exists, needs integration testing
- `app/auth/reset-password.tsx` - UI exists, needs integration testing
- `api/auth/forgot-password/services.ts` - Backend integration pending
- `api/auth/reset-password/services.ts` - Backend integration pending

**Next Steps:**

1. Complete Apple Developer Program enrollment
2. Configure app ID in `app.json` and `eas.json`
3. Run `eas build --profile development` to generate development build
4. Test deep linking for password reset flow
5. Complete forgot/reset password integration

---

## 🟡 In Progress

Onboarding

---

## 🟢 Planned

### Features

- [ ] Email verification resend functionality (backend endpoint pending)
- [ ] Protected route implementation using stored user session
- [ ] Profile page to display user information
- [ ] Social auth error handling improvements
- [ ] OAuth state validation enhancement

### Technical Debt

- [ ] Add comprehensive error boundary components
- [ ] Implement request retry logic for network failures
- [ ] Add analytics tracking for auth flows
- [ ] Improve loading states across auth screens
- [ ] Add unit tests for auth hooks and utilities

### Documentation

- [ ] Add API documentation for auth endpoints
- [ ] Create developer setup guide
- [ ] Document OAuth flow architecture

---

## 📝 Notes

- Password reset flow is fully implemented in UI but blocked by infrastructure requirements
- All auth screens follow consistent patterns using shared hooks (`use-social-oauth.ts`)
- Token storage uses `expo-secure-store` following industry best practices
- React Query v5 patterns are used throughout for data fetching

---

## ✅ Completed

- [x] Social OAuth flow (Google, Apple)
- [x] Email/password signup and signin
- [x] Email verification flow
- [x] Shared social auth hook abstraction
- [x] Secure token storage implementation
- [x] React Query setup and configuration
- [x] Terms of Service and Privacy Policy screens

---

**Last Updated:** 2024-12-19
