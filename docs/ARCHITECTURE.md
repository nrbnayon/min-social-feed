# Architecture

The repository is a small two-client system:

- `backend`: Express HTTP controllers, Zod validation, Mongoose models, service-layer mutations, and JWT authentication.
- `mobile`: Expo Router screens, typed API services, Zustand auth state, and reusable feed/comment UI.
- `docs`: API and persistence contracts shared by both clients.

Requests flow through route -> validation/auth middleware -> controller -> service -> model. Controllers only translate HTTP concerns; business mutations stay in services.
