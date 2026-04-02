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
