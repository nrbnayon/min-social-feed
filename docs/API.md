# API

Base URL: `http://localhost:4000/api`

Authentication uses `Authorization: Bearer <token>`.

## Auth

`POST /auth/register` accepts `{ username, email, password }`.

`POST /auth/login` accepts `{ email, password }`.

Both return `{ success, data: { user, token } }`.

## Posts

`GET /posts?page=1&limit=20&username=...` returns a paginated feed.

`POST /posts` accepts `{ content }` and requires authentication.

`POST /posts/:id/like` toggles the current user's like.

`POST /posts/:id/comments` accepts `{ content }`.
