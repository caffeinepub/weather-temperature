# TRUE TEMP

## Current State
Full-featured three-page weather app (Dashboard, Studio, Profile) with local localStorage-based user profile (nickname, avatars, streaks). No authentication system. All data is stored client-side.

## Requested Changes (Diff)

### Add
- Backend authorization system using the `authorization` Caffeine component (username + password, role-based)
- Login/Signup splash screen shown on first visit (before Dashboard)
- Animated weather background on the auth screen (reusing existing weather animations)
- TRUE TEMP logo/branding on the auth screen
- Two tabs on auth screen: "Log In" and "Sign Up"
- Logout button on the Profile page

### Modify
- App.tsx: wrap main app in auth gate -- show login screen if not authenticated, show Dashboard if authenticated
- ProfilePage.tsx: add logout option

### Remove
- Nothing removed

## Implementation Plan
1. Generate Motoko backend with authorization support
2. Create `LoginPage.tsx` component with:
   - Animated weather background (rain/sun animations)
   - TRUE TEMP logo
   - Sign Up tab: username + password fields + confirm password + "Create Account" button
   - Log In tab: username + password fields + "Log In" button
   - Error states for invalid credentials / username taken
   - Loading state during auth calls
3. Update `App.tsx` to check auth state on load:
   - If not logged in: show `<LoginPage />`
   - If logged in: show existing three-page app
4. Update `ProfilePage.tsx` to add a "Log Out" button that clears session and returns to login screen
5. Wire up backend auth calls (register, login, logout) using generated `backend.d.ts` bindings
