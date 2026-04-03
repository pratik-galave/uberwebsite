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

## Register Captain

`POST /captain/register`

Creates a new captain account.

### Request Body

Send JSON with these required fields:

- `fullname.firstname`: string, minimum 3 characters
- `fullname.lastname`: string, minimum 3 characters
- `email`: non-empty string (should be a valid email)
- `password`: non-empty string
- `vehicle.color`: non-empty string
- `vehicle.vehicleType`: non-empty string (`car`, `bike`, or `auto`)
- `vehicle.vehiclePlate`: non-empty string
- `vehicle.capacity`: non-empty number

### Example Request

```json
{
  "fullname": {
    "firstname": "Rahul",
    "lastname": "Sharma"
  },
  "email": "rahul.captain1@example.com",
  "password": "Captain@123",
  "vehicle": {
    "color": "Black",
    "vehicleType": "car",
    "vehiclePlate": "MH12AB1234",
    "capacity": 4
  }
}
```

### Status Codes

- `201 Created`: captain registered successfully
- `400 Bad Request`: validation failed, required fields missing, or captain already exists
- `500 Internal Server Error`: unexpected server/database error

### Success Response Example

```json
{
  "message": "Captain registered successfully",
  "captain": {
    "fullname": {
      "firstname": "Rahul",
      "lastname": "Sharma"
    },
    "email": "rahul.captain1@example.com",
    "vehicle": {
      "color": "Black",
      "vehicleType": "car",
      "vehiclePlate": "MH12AB1234",
      "capacity": 4
    }
  },
  "token": "jwt-token-here"
}
```

### Notes

- This route is mounted under `/captain` in [app.js](app.js).
- `email` and `vehicle.vehiclePlate` should be unique.

## Login Captain

`POST /captain/login`

Authenticates an existing captain and returns a JWT token.

### Request Body

Send JSON with these required fields:

- `email`: captain email
- `password`: captain password

### Example Request

```json
{
  "email": "rahul.captain1@example.com",
  "password": "Captain@123"
}
```

### Status Codes

- `200 OK`: login successful
- `400 Bad Request`: validation failed
- `401 Unauthorized`: captain not found or invalid credentials

### Success Response Example

```json
{
  "message": "Login successful",
  "token": "jwt-token-here"
}
```

### Notes

- The route also sets an HTTP-only `token` cookie on success.
- This route is mounted under `/captain` in [app.js](app.js).

## Get Captain Profile

`GET /captain/profile`

Returns the currently authenticated captain's profile.

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
- `401 Unauthorized`: no token provided, token is blacklisted, or captain not found
- `400 Bad Request`: token is invalid

### Success Response Example

```json
{
  "captain": {
    "fullname": {
      "firstname": "Rahul",
      "lastname": "Sharma"
    },
    "email": "rahul.captain1@example.com",
    "vehicle": {
      "color": "Black",
      "vehicleType": "car",
      "vehiclePlate": "MH12AB1234",
      "capacity": 4
    }
  }
}
```

## Logout Captain

`GET /captain/logout`

Logs out the authenticated captain by clearing the cookie token and blacklisting the JWT.

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

- These routes are mounted under `/captain` in [app.js](app.js).
