# Backend API

## Register User

`POST /user/register`

Creates a new Uber user account.

### Request Body

Send JSON with these required fields:

- `firstname`: string, minimum 3 characters
- `lastname`: string, minimum 3 characters
- `email`: valid email address
- `password`: string, minimum 6 characters

### Example Request

```json
{
  "firstname": "Pratik",
  "lastname": "Galave",
  "email": "pratik@example.com",
  "password": "1234567"
}
```

### Status Codes

- `201 Created`: user registered successfully
- `400 Bad Request`: validation failed or user could not be created

### Success Response Example

```json
{
  "message": "User registered successfully",
  "user": {
    "fullname": {
      "firstname": "Pratik",
      "lastname": "Galave"
    },
    "email": "pratik@example.com"
  },
  "token": "jwt-token-here"
}
```

### Notes

- The backend currently mounts the route at `/user/register` in [app.js](app.js).
- If you want the public path to be `/users/register`, update the route mount in [app.js](app.js) from `/user` to `/users`.

## Login User

`POST /user/login`

Authenticates an existing user and returns a JWT token.

### Request Body

Send JSON with these required fields:

- `email`: valid email address
- `password`: string, minimum 6 characters

### Example Request

```json
{
  "email": "pratik@example.com",
  "password": "1234567"
}
```

### Status Codes

- `200 OK`: login successful
- `400 Bad Request`: validation failed
- `401 Unauthorized`: user not found or invalid credentials
- `500 Internal Server Error`: unexpected server/database error

### Success Response Example

```json
{
  "message": "Login successful",
  "user": {
    "fullname": {
      "firstname": "Pratik",
      "lastname": "Galave"
    },
    "email": "pratik@example.com"
  },
  "token": "jwt-token-here"
}
```

### Error Response Example

```json
{
  "error": "Invalid credentials"
}
```

## Get User Profile

`GET /user/profile`

Returns the currently authenticated user's profile.

### Authentication

This route requires a valid JWT token.

Send the token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### Request Body

No request body is required.

### Status Codes

- `200 OK`: profile returned successfully
- `401 Unauthorized`: no token provided or token is blacklisted
- `400 Bad Request`: token is invalid

### Success Response Example

```json
{
  "user": {
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "_id": "user-id-here",
    "email": "john@example.com"
  }
}
```

## Logout User

`GET /user/logout`

Logs out the authenticated user by clearing the cookie token and blacklisting the JWT.

### Authentication

This route requires a valid JWT token.

Send the token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### Request Body

No request body is required.

### Status Codes

- `200 OK`: logout successful
- `401 Unauthorized`: no token provided or token is already blacklisted
- `400 Bad Request`: token is invalid

### Success Response Example

```json
{
  "message": "Logout successful"
}
```

### Notes

- Both routes are mounted under `/user` in [app.js](app.js).
- If you want to document them as `/users/profile` and `/users/logout`, update the route mount in [app.js](app.js) accordingly.
