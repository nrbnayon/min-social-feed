# MiniSocial API Documentation

**Base URL**: `http://localhost:5000/api` (or configured `PORT`)

All API responses follow a consistent, standardized JSON envelope.

---

## 📐 Global Response Structure

### 1. Success Response
```json
{
  "success": true,
  "message": "Operation successful description",
  "data": { ... }
}
```

### 2. Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": null
  }
}
```

---

## 🔐 Authentication & Profile Endpoints

All authenticated requests require the `Authorization` header with a valid Access Token:
```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

### 1. Register Account
Creates a new user account and returns the initial user profile along with access and refresh tokens.

- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Access**: Public
- **Headers**: `Content-Type: application/json`

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
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | 2 - 60 characters |
| `username` | `string` | **Yes** | 2 - 30 characters, alphanumeric & underscores only |
| `email` | `string` | **Yes** | Valid email format |
| `password` | `string` | **Yes** | 6 - 128 characters |

#### Responses

- **`201 Created`** - Account created successfully
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
      "avatar": "https://api.dicebear.com/7.x/avataaars/png?seed=jordan...",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/png?seed=jordan...",
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

- **`400 Bad Request`** - Validation error (e.g. invalid email format, short password)
```json
{
  "success": false,
  "error": {
    "message": "Username can only contain letters, numbers, and underscores"
  }
}
```

- **`409 Conflict`** - Email or username already taken
```json
{
  "success": false,
  "error": {
    "message": "An account with this email address already exists."
  }
}
```

---

### 2. Login
Authenticates an existing user via email or username and issues a new access token and refresh token.

- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Access**: Public
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "email": "jordan@example.com",
  "password": "SecurePassword123!"
}
```
*(Note: `email` field also accepts username)*

#### Responses

- **`200 OK`** - Logged in successfully
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
      "followersList": ["..."],
      "followingList": ["..."],
      "createdAt": "2026-08-21T13:00:00.000Z",
      "updatedAt": "2026-08-21T13:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

- **`401 Unauthorized`** - Invalid email/username or password
```json
{
  "success": false,
  "error": {
    "message": "Invalid email/username or password."
  }
}
```

---

### 3. Get Current User Profile (`/get-me` or `/me`)
Fetches the currently authenticated user's complete profile and follower counts.

- **Method**: `GET`
- **Endpoint**: `/auth/get-me` (or `/auth/me`)
- **Access**: Private (Requires Access Token)
- **Headers**:
  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  ```

#### Responses

- **`200 OK`** - Profile retrieved successfully
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
      "followersList": ["..."],
      "followingList": ["..."],
      "createdAt": "2026-08-21T13:00:00.000Z",
      "updatedAt": "2026-08-21T13:00:00.000Z"
    }
  }
}
```

- **`401 Unauthorized`** - Missing, invalid, or expired access token
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

### 4. Refresh Access Token (`/refresh-token`)
Rotates the user's refresh token and issues a new access token without requiring the user to log in again.

- **Method**: `POST`
- **Endpoint**: `/auth/refresh-token`
- **Access**: Public
- **Headers**: `Content-Type: application/json`

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Responses

- **`200 OK`** - Tokens refreshed successfully
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(NEW_ACCESS_TOKEN)",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(NEW_ROTATED_REFRESH_TOKEN)"
  }
}
```

- **`400 Bad Request`** - Refresh token missing
- **`401 Unauthorized`** - Invalid or expired refresh token
- **`403 Forbidden`** - Token reuse detected (revokes all sessions)
```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired refresh token. Please sign in again."
  }
}
```

---

### 5. Edit Profile (`/edit-profile`)
Updates the authenticated user's profile details.

- **Method**: `PUT` or `PATCH`
- **Endpoint**: `/auth/edit-profile`
- **Access**: Private (Requires Access Token)
- **Headers**:
  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json
  ```

#### Request Body (All fields optional)
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

#### Responses

- **`200 OK`** - Profile updated successfully
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
      "followersList": ["..."],
      "followingList": ["..."],
      "createdAt": "2026-08-21T13:00:00.000Z",
      "updatedAt": "2026-08-21T13:10:00.000Z"
    }
  }
}
```

- **`400 Bad Request`** - Validation failure (e.g. bio too long)
- **`409 Conflict`** - Username already taken by another account
```json
{
  "success": false,
  "error": {
    "message": "This username is already taken."
  }
}
```

---

### 6. Logout (`/logout`)
Revokes the refresh token from the database, terminating the user session.

- **Method**: `POST`
- **Endpoint**: `/auth/logout`
- **Access**: Private (Requires Access Token)
- **Headers**:
  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json
  ```

#### Request Body (Optional)
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Responses

- **`200 OK`** - Logged out successfully
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

## 📝 Posts & Feed Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts?page=1&limit=20&username=...` | Public | Paginated feed with search/filter |
| `POST` | `/posts` | Private | Create a new post (`{ content }`) |
| `POST` | `/posts/:id/like` | Private | Toggle like on a post |
| `POST` | `/posts/:id/comments` | Private | Add comment to post (`{ content }`) |

---

## 🔔 Notifications Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Private | Get current user's notifications |
| `PATCH` | `/notifications/:id/read` | Private | Mark notification as read |
| `PATCH` | `/notifications/read-all` | Private | Mark all notifications as read |

---

## 📊 Summary of HTTP Status Codes

| Status Code | Description | When Used |
| :--- | :--- | :--- |
| **`200 OK`** | Standard Success | Successful GET, PUT, PATCH, login, refresh, logout |
| **`201 Created`** | Resource Created | Successful user registration or post creation |
| **`400 Bad Request`** | Validation Error | Malformed body, missing fields, or invalid format |
| **`401 Unauthorized`** | Auth Failure | Invalid credentials, missing token, or expired token |
| **`403 Forbidden`** | Action Not Allowed | Security violation, refresh token reuse detected |
| **`404 Not Found`** | Resource Missing | User or post not found |
| **`409 Conflict`** | Duplicate Resource | Email or username already taken |
| **`500 Server Error`** | Internal Error | Unhandled database or server exception |
