# BloodLink Mobile (React Native / Expo)

This folder is a placeholder. To scaffold the real Expo app:

    cd apps/mobile
    npx create-expo-app . --template blank
    npx expo start

Then build out `src/screens/` to match your Figma screens, organized by role:
- `onboarding/` — Splash, RoleSelect, Login, CreateAccount, DonorSignupDetails, StaffVerification
- `donor/` — Home, ProfileAvailability, AlertMatching, RequestAccepted, DonationHistory, DonorQR
- `requester/` — Home, SOSStep1, SOSStep2, RequestStatus, MyRequests, Profile
- `coordinator/` — Dashboard, RequestQueue, RequestVerification, DonorCheckin, BloodStock, Profile, Chat
- `ngo/` — Dashboard, CampForm, CampDetails

`src/services/` should hold one API client file per backend microservice (e.g. `authApi.js`, `requestApi.js`),
each calling the gateway at `http://<gateway-host>:4000/api/...` rather than a service directly.
