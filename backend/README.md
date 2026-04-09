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

## Maps Routes

All maps routes are mounted under `/maps` in [app.js](app.js) and require user authentication.

### Authentication

Send a valid user JWT token in header:

```http
Authorization: Bearer <token>
```

## Get Coordinates

`GET /maps/get-coordinates?address=<address>`

Returns latitude and longitude for a given address.

### Query Params

- `address` (required): full address string

### Status Codes

- `200 OK`: coordinates returned
- `400 Bad Request`: missing/invalid query
- `500 Internal Server Error`: geocoding failed

### Success Response Example

```json
{
  "lat": 18.5204303,
  "lng": 73.8567437
}
```

## Get Distance And Time

`GET /maps/get-distance-time?origin=<origin>&destination=<destination>`

Returns distance and estimated duration between origin and destination.

### Query Params

- `origin` (required)
- `destination` (required)

### Status Codes

- `200 OK`: distance and duration returned
- `400 Bad Request`: missing/invalid query
- `500 Internal Server Error`: distance lookup failed

### Success Response Example

```json
{
  "distance": {
    "text": "249 km",
    "value": 248783
  },
  "duration": {
    "text": "4 hours 35 mins",
    "value": 16474
  },
  "status": "OK"
}
```

## Get Place Suggestions

`GET /maps/get-suggestions?input=<searchText>`

Returns a list of Google place autocomplete predictions.

### Query Params

- `input` (required): partial address/place text

### Status Codes

- `200 OK`: suggestions returned
- `400 Bad Request`: missing/invalid query
- `500 Internal Server Error`: suggestion lookup failed

### Success Response Example

```json
[
  {
    "description": "Army Public School, Ridge Road, Dhaula Kuan, Delhi Cantonment, New Delhi, Delhi, India",
    "place_id": "ChIJ...",
    "reference": "ChIJ..."
  }
]
```

## Ride Routes

All ride routes are mounted under `/ride` in [app.js](app.js) and require user authentication.

### Authentication

Send a valid user JWT token in header:

```http
Authorization: Bearer <token>
```

## Create Ride

`POST /ride/create`

Creates a ride request with computed fare and generated OTP.

### Request Body

- `origin` (required): string
- `destination` (required): string
- `userId` (required): MongoDB user id
- `vehicleType` (required): one of `car`, `auto`, `bike`

### Example Request

```json
{
  "origin": "Pune",
  "destination": "Solapur",
  "userId": "<user-id>",
  "vehicleType": "car"
}
```

### Status Codes

- `201 Created`: ride created
- `400 Bad Request`: validation failed
- `500 Internal Server Error`: ride creation failed

### Success Response Example

```json
{
  "origin": "Pune",
  "destination": "Solapur",
  "user": "<user-id>",
  "fare": 2249,
  "status": "requested",
  "otp": "639325",
  "_id": "<ride-id>",
  "createdAt": "2026-04-07T22:58:01.239Z",
  "updatedAt": "2026-04-07T22:58:01.239Z",
  "__v": 0
}
```

## Get Fare Estimate

`GET /ride/get-fare?pickup=<pickup>&destination=<destination>`

Returns estimated fare by vehicle type.

### Query Params

- `pickup` (required)
- `destination` (required)

### Status Codes

- `200 OK`: fare object returned
- `400 Bad Request`: missing/invalid query
- `500 Internal Server Error`: fare calculation failed

### Success Response Example

```json
{
  "car": 2249,
  "auto": 1492,
  "bike": 979
}
```
