# mini-social-feed API

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm run dev`.

The API listens on port `4000` by default. Health check: `GET /health`.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/posts?page=1&limit=20`
- `POST /api/posts` (Bearer token)
- `POST /api/posts/:id/like` (Bearer token)
- `POST /api/posts/:id/comments` (Bearer token)
- `GET /api/notifications` (Bearer token)
