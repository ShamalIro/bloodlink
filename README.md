# BloodLink

A location-based emergency blood request and donor management app.
React Native (Expo) frontend, Node.js/Express microservices backend, MongoDB.

## Structure
- `apps/mobile` — React Native (Expo) app
- `services/*` — one folder per microservice (auth, donor, request, verification, notification, camp, inventory)
- `gateway` — API gateway, single entry point for the mobile app
- `packages/*` — shared code (types, utils, middleware) used across services
- `infra` — docker-compose for local dev, k8s manifests and terraform for later deployment

## Getting started (local dev)
1. Copy `.env.example` to `.env` in each service folder you're working on (start with `services/auth-service`).
2. From the repo root: `docker-compose -f infra/docker-compose.yml up --build`
3. In a separate terminal: `cd apps/mobile && npx create-expo-app . --template blank` (first time only), then `npx expo start`

## Recommended build order
1. auth-service — register/login/role routing (FR1)
2. request-service — SOS requests, matching (FR3, FR4, FR6, FR7)
3. donor-service — profile, availability, donation history (FR2, FR8)
4. verification-service — hospital/NGO verification badges (FR5)
5. notification-service — push + SMS fallback (FR9)
6. camp-service — NGO donation camps (FR10)
7. inventory-service — blood stock overview
8. gateway — wire everything together once 2-3 services exist
