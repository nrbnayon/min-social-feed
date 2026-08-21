# MiniSocial API Documentation

**Base URL**: `http://localhost:5000/api` (or configured `PORT`)

All API responses follow a consistent, standardised JSON envelope with no exceptions.

---

## 📐 Global Response Envelope

### Success Response
```json
{
  "success": true,
  "message": "Human-readable description of the operation",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error description",
    "details": null
  }
}
```

> **`details`** is omitted when there are no extra details. It is included for
> validation errors (an array of field-level messages) and for auth errors that
> carry a machine-readable `code`.

---

## 🔐 Authentication

All **Private** endpoints require the `Authorization` header:
```http
Authorization: Bearer <ACCESS_TOKEN>
```

Tokens are short-lived **access tokens** (default 15 min). Use `/auth/refresh-token`
to obtain a new pair before expiry.

---

## 1. Auth Endpoints — `/api/auth`

### 1.1 Register

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/auth/register` |
| **Access** | Public |

#### Request Body
```json
{
  "name": "Jordan Ellis",
  "username": "jordan",
  "email": "jordan@example.com",
  "password": "SecurePassword123!"
}
```

| Field | Type | Required | Constraints |
|:---|:---|:---|:---|
| `name` | `string` | **Yes** | 2 – 60 characters |
| `username` | `string` | **Yes** | 2 – 30 chars, alphanumeric & underscores only |
| `email` | `string` | **Yes** | Valid email format |
| `password` | `string` | **Yes** | 6 – 128 characters |

#### Responses

**`201 Created`** — Account created
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "data": {
    "user": {
      "id": "66c5a1f2e8b4c91a7d1e4001",
      "name": "Jordan Ellis",
      "username": "jordan",
      "email": "jordan@example.com",
      "avatar": "https://api.dicebear.com/7.x/avataaars/png?seed=jordan&backgroundColor=b6e3f4",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/png?seed=jordan&backgroundColor=b6e3f4",
      "coverImage": "",
      "bio": "",
      "location": "",
      "website": "",
      "verified": false,
      "followers": 0,
      "following": 0,
      "followersList": [],
      "followingList": [],
      "createdAt": "2026-08-21T13:00:00.000Z",
      "updatedAt": "2026-08-21T13:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**`400 Bad Request`** — Validation error
```json
{
  "success": false,
  "error": {
    "message": "Username can only contain letters, numbers, and underscores"
  }
}
```

**`409 Conflict`** — Email or username already taken
```json
{
  "success": false,
  "error": {
    "message": "An account with this email address already exists."
  }
}
```

---

### 1.2 Login

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/auth/login` |
| **Access** | Public |

#### Request Body
```json
{
  "email": "jordan@example.com",
  "password": "SecurePassword123!"
}
```

> **Note:** The `email` field accepts either an **email address** or a **username**.

| Field | Type | Required |
|:---|:---|:---|
| `email` | `string` | **Yes** (email or username) |
| `password` | `string` | **Yes** |

#### Responses

**`200 OK`** — Logged in successfully
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": {
      "id": "66c5a1f2e8b4c91a7d1e4001",
      "name": "Jordan Ellis",
      "username": "jordan",
      "email": "jordan@example.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      "coverImage": "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=800",
      "bio": "Product Designer & Frontend Engineer.",
      "location": "San Francisco, CA",
      "website": "https://jordan.dev",
      "verified": true,
      "followers": 1248,
      "following": 394,
      "followersList": ["66c5a1f2e8b4c91a7d1e4002", "..."],
      "followingList": ["66c5a1f2e8b4c91a7d1e4003", "..."],
      "createdAt": "2026-08-21T13:00:00.000Z",
      "updatedAt": "2026-08-21T13:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**`401 Unauthorized`** — Wrong credentials
```json
{
  "success": false,
  "error": {
    "message": "Invalid email/username or password."
  }
}
```

---

### 1.3 Get Current User (`/get-me` or `/me`)

| | |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/auth/get-me` *or* `/auth/me` |
| **Access** | **Private** |

#### Responses

**`200 OK`**
```json
{
  "success": true,
  "message": "User profile fetched successfully.",
  "data": {
    "user": {
      "id": "66c5a1f2e8b4c91a7d1e4001",
      "name": "Jordan Ellis",
      "username": "jordan",
      "email": "jordan@example.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      "coverImage": "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=800",
      "bio": "Product Designer & Frontend Engineer.",
      "location": "San Francisco, CA",
      "website": "https://jordan.dev",
      "verified": true,
      "followers": 1248,
      "following": 394,
      "followersList": ["66c5a1f2e8b4c91a7d1e4002"],
      "followingList": ["66c5a1f2e8b4c91a7d1e4003"],
      "createdAt": "2026-08-21T13:00:00.000Z",
      "updatedAt": "2026-08-21T13:00:00.000Z"
    }
  }
}
```

**`401 Unauthorized`** — Token missing, invalid, or expired
```json
{
  "success": false,
  "error": {
    "message": "Access token has expired. Please refresh your token.",
    "details": {
      "code": "TOKEN_EXPIRED"
    }
  }
}
```

---

### 1.4 Refresh Access Token

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/auth/refresh-token` |
| **Access** | Public |

Rotates the refresh token and issues a fresh access token without requiring re-login.
Implements **refresh token reuse detection** — if a previously-used token is submitted,
**all sessions are immediately revoked**.

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type | Required |
|:---|:---|:---|
| `refreshToken` | `string` | **Yes** |

#### Responses

**`200 OK`** — New token pair issued
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(NEW)",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(ROTATED)"
  }
}
```

**`400 Bad Request`** — Token missing from body

**`401 Unauthorized`** — Token invalid or expired
```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired refresh token. Please sign in again."
  }
}
```

**`403 Forbidden`** — Reuse attack detected (all sessions revoked)
```json
{
  "success": false,
  "error": {
    "message": "Suspicious refresh token reuse detected. All sessions have been revoked. Please sign in again."
  }
}
```

---

### 1.5 Edit Profile

| | |
|---|---|
| **Method** | `PUT` or `PATCH` |
| **Endpoint** | `/auth/edit-profile` |
| **Access** | **Private** |

#### Request Body (all fields optional)
```json
{
  "name": "Jordan Ellis",
  "username": "jordan_dev",
  "bio": "Senior Full Stack Engineer & UI Architect.",
  "location": "San Francisco, CA",
  "website": "https://jordanellis.dev",
  "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "coverImage": "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1000"
}
```

| Field | Type | Constraints |
|:---|:---|:---|
| `name` | `string` | 2 – 60 characters |
| `username` | `string` | 2 – 30 chars, alphanumeric & underscores only |
| `bio` | `string` | Max 300 characters |
| `location` | `string` | Max 100 characters |
| `website` | `string` | Max 200 characters |
| `avatar` | `string` | URL string |
| `coverImage` | `string` | URL string |

#### Responses

**`200 OK`**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "user": {
      "id": "66c5a1f2e8b4c91a7d1e4001",
      "name": "Jordan Ellis",
      "username": "jordan_dev",
      "email": "jordan@example.com",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      "coverImage": "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1000",
      "bio": "Senior Full Stack Engineer & UI Architect.",
      "location": "San Francisco, CA",
      "website": "https://jordanellis.dev",
      "verified": true,
      "followers": 1248,
      "following": 394,
      "followersList": ["66c5a1f2e8b4c91a7d1e4002"],
      "followingList": ["66c5a1f2e8b4c91a7d1e4003"],
      "createdAt": "2026-08-21T13:00:00.000Z",
      "updatedAt": "2026-08-21T13:10:00.000Z"
    }
  }
}
```

**`400 Bad Request`** — Validation failure
```json
{
  "success": false,
  "error": {
    "message": "Bio cannot exceed 300 characters"
  }
}
```

**`409 Conflict`** — Username taken
```json
{
  "success": false,
  "error": {
    "message": "This username is already taken."
  }
}
```

---

### 1.6 Logout

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/auth/logout` |
| **Access** | **Private** |

Revokes the provided refresh token from the database. If no token is supplied,
**all** sessions for the user are revoked (sign out from all devices).

#### Request Body (optional)
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response

**`200 OK`**
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": {
    "message": "Successfully logged out."
  }
}
```

---

## 2. Posts & Feed — `/api/posts`

### 2.1 List / Search Posts

| | |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/posts` |
| **Access** | Public |

#### Query Parameters

| Param | Type | Default | Description |
|:---|:---|:---|:---|
| `page` | `number` | `1` | Page number (min 1) |
| `limit` | `number` | `20` | Items per page (max 50) |
| `username` | `string` | — | Filter posts by **author username** |

#### Response — `200 OK`
```json
{
  "success": true,
  "message": "Posts fetched successfully.",
  "data": {
    "items": [
      {
        "_id": "66c5a1f2e8b4c91a7d1e5001",
        "author": {
          "id": "66c5a1f2e8b4c91a7d1e4001",
          "username": "jordan",
          "name": "Jordan Ellis",
          "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          "verified": true
        },
        "content": "Just shipped a new feature! 🚀",
        "images": [],
        "likeCount": 42,
        "commentCount": 7,
        "createdAt": "2026-08-21T10:00:00.000Z",
        "updatedAt": "2026-08-21T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 128,
      "hasMore": true
    }
  }
}
```

---

### 2.2 Create Post

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/posts` |
| **Access** | **Private** |

#### Request Body
```json
{
  "content": "Just shipped a new feature! 🚀",
  "images": ["https://images.unsplash.com/photo-xxx?w=800"]
}
```

| Field | Type | Required | Constraints |
|:---|:---|:---|:---|
| `content` | `string` | **Yes** | Max 2000 characters |
| `images` | `string[]` | No | Array of image URLs |

#### Response — `201 Created`
```json
{
  "success": true,
  "message": "Post created successfully.",
  "data": {
    "post": {
      "_id": "66c5a1f2e8b4c91a7d1e5001",
      "author": {
        "id": "66c5a1f2e8b4c91a7d1e4001",
        "username": "jordan",
        "name": "Jordan Ellis",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "verified": true
      },
      "content": "Just shipped a new feature! 🚀",
      "images": [],
      "likeCount": 0,
      "commentCount": 0,
      "createdAt": "2026-08-21T13:00:00.000Z",
      "updatedAt": "2026-08-21T13:00:00.000Z"
    }
  }
}
```

---

### 2.3 Toggle Like

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/posts/:id/like` |
| **Access** | **Private** |

Toggles a like on the post. Idempotent — calling twice on the same post un-likes it.

#### Response — `200 OK`
```json
{
  "success": true,
  "message": "Post liked.",
  "data": {
    "liked": true,
    "likeCount": 43
  }
}
```

*(When un-liking: `"message": "Post unliked."`, `"liked": false`)*

**`404 Not Found`** — Post does not exist
```json
{
  "success": false,
  "error": { "message": "Post not found." }
}
```

---

### 2.4 Add Comment

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/posts/:id/comments` |
| **Access** | **Private** |

#### Request Body
```json
{
  "content": "Great work! 🙌"
}
```

| Field | Type | Required | Constraints |
|:---|:---|:---|:---|
| `content` | `string` | **Yes** | Max 500 characters |

#### Response — `201 Created`
```json
{
  "success": true,
  "message": "Comment added.",
  "data": {
    "comment": {
      "_id": "66c5a1f2e8b4c91a7d1e6001",
      "post": "66c5a1f2e8b4c91a7d1e5001",
      "author": {
        "id": "66c5a1f2e8b4c91a7d1e4001",
        "username": "jordan",
        "name": "Jordan Ellis",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "verified": true
      },
      "content": "Great work! 🙌",
      "createdAt": "2026-08-21T13:05:00.000Z",
      "updatedAt": "2026-08-21T13:05:00.000Z"
    }
  }
}
```

**`404 Not Found`** — Post does not exist
```json
{
  "success": false,
  "error": { "message": "Post not found." }
}
```

## 1.7 Register Device Push Token

| | |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/auth/device-token` |
| **Access** | **Private** |

Saves the device's **Expo push token** to the user's profile so the backend can
send real-time push notifications. Called automatically by the mobile app right
after login or registration.

#### Request Body
```json
{
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

| Field | Type | Required | Constraints |
|:---|:---|:---|:---|
| `expoPushToken` | `string` | **Yes** | Must start with `ExponentPushToken[` |

#### Response — `200 OK`
```json
{
  "success": true,
  "message": "Device token registered successfully.",
  "data": null
}
```

---

## 3. Notifications — `/api/auth/notifications`

> Notifications are created automatically by the backend when a post is liked or commented on.
> The mobile app receives them in real-time via FCM / APNs through the Expo Push Service.

### 3.1 Get Notifications

| | |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/auth/notifications` |
| **Access** | **Private** |

#### Query Parameters

| Param | Type | Default | Description |
|:---|:---|:---|:---|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |

#### Response — `200 OK`
```json
{
  "success": true,
  "message": "Notifications fetched successfully.",
  "data": {
    "items": [
      {
        "_id": "66c5a1f2e8b4c91a7d1e7001",
        "recipient": "66c5a1f2e8b4c91a7d1e4001",
        "sender": {
          "id": "66c5a1f2e8b4c91a7d1e4002",
          "username": "alexm",
          "name": "Alex Morgan",
          "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
          "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
        },
        "type": "like",
        "post": {
          "id": "66c5a1f2e8b4c91a7d1e5001",
          "content": "Just shipped a new feature! 🚀",
          "images": []
        },
        "read": false,
        "createdAt": "2026-08-21T13:10:00.000Z",
        "updatedAt": "2026-08-21T13:10:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "hasMore": false
    },
    "unreadCount": 3
  }
}
```

---

### 3.2 Mark Notification as Read

| | |
|---|---|
| **Method** | `PATCH` |
| **Endpoint** | `/auth/notifications/:id/read` |
| **Access** | **Private** |

#### Response — `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read.",
  "data": {
    "notification": { "_id": "66c5a1f2e8b4c91a7d1e7001", "read": true }
  }
}
```

**`404 Not Found`** — Notification doesn't exist or belongs to another user.

---

### 3.3 Mark All Notifications as Read

| | |
|---|---|
| **Method** | `PATCH` |
| **Endpoint** | `/auth/notifications/read-all` |
| **Access** | **Private** |

#### Response — `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read.",
  "data": { "updated": 3 }
}
```

---

## 🔔 Push Notification System

The push notification system uses the **Expo Push Notification Service** as the
relay — no Firebase Admin SDK or service account keys required.

### Flow
```
Mobile App
  └─ getExpoPushTokenAsync()     → Expo servers → token stored in User.expoPushToken

Backend (on like / comment)
  └─ POST https://exp.host/push/send
       { to: expoPushToken, title, body, data: { type, postId, senderId } }
     → Expo servers → FCM (Android) / APNs (iOS) → Device 🔔
```

### Notification Payload Data
```json
{
  "type": "like",
  "postId": "66c5a1f2e8b4c91a7d1e5001",
  "senderId": "66c5a1f2e8b4c91a7d1e4002",
  "senderUsername": "alexm"
}
```
The mobile app reads `data.postId` on tap → navigates to `/(protected)/post/[id]`.

### Rules
- Authors are **never** notified of their own likes/comments
- Push is **fire-and-forget** — a delivery failure never breaks the API response
- Token validation uses `Expo.isExpoPushToken()` before sending
- Notifications are also **persisted in MongoDB** for the in-app feed

---

## 📊 HTTP Status Code Reference

| Code | Name | When Used |
|:---|:---|:---|
| `200 OK` | Success | GET, PUT, PATCH, login, refresh, logout, like/unlike |
| `201 Created` | Created | Registration, post creation, comment creation |
| `400 Bad Request` | Validation Error | Malformed body, missing required fields, invalid format |
| `401 Unauthorized` | Auth Failure | Missing token, invalid credentials, expired access token |
| `403 Forbidden` | Forbidden | Refresh token reuse detected (all sessions revoked) |
| `404 Not Found` | Not Found | User, post, notification, or resource does not exist |
| `409 Conflict` | Duplicate | Email or username already taken |
| `500 Internal Server Error` | Server Error | Unhandled database or runtime exception |

---

## 🔒 Security Model

| Mechanism | Detail |
|:---|:---|
| **Password hashing** | bcryptjs, cost factor 12 |
| **Access token** | JWT signed with `JWT_SECRET`, expires in `JWT_EXPIRES_IN` (default 15 min) |
| **Refresh token** | JWT signed with `JWT_REFRESH_SECRET`, expires in `JWT_REFRESH_EXPIRES_IN` (default 30 days) |
| **Token storage** | Refresh tokens stored as an array in the User document (`select: false`) |
| **Multi-device** | Up to 5 concurrent refresh tokens per user |
| **Token rotation** | Every `/refresh-token` call replaces the old refresh token in-place |
| **Reuse detection** | Presenting a revoked refresh token immediately clears **all** active sessions |
| **Sensitive fields** | `passwordHash` and `refreshTokens` are never returned in any API response (`select: false` on schema + stripped in `toPublicJSON`) |
