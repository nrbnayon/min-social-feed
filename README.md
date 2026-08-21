# min-social-feed

A small social feed application with an Expo React Native client and an Express/MongoDB API.

## Project layout

- `backend/`: TypeScript Express API with Mongoose, JWT auth, validation, and interaction services.
- `mobile/`: Expo Router client with typed API services, Zustand auth state, feed routes, and reusable UI.
- `docs/`: API, architecture, and database contracts.

## Run locally

```text
cd backend
npm install
copy .env.example .env
npm run dev
```

In another terminal:

```text
cd mobile
npm install
copy .env.example .env
npm start
```

Set `DATABASE_URL` and `JWT_SECRET` in the backend environment. Set `EXPO_PUBLIC_API_URL` in the mobile environment. For a physical device, use the computer's LAN address instead of `localhost`.
