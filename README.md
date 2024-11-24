# XR Meeting Platform API Documentation

## Base URL
Github: [xr-network-event-api](https://github.com/NeoGruber/xr-network-event-api)

## Endpoints

### 1. **GET /**
- **Description**: Returns a message to indicate the API is running.
- **Response**:
  - Status Code: `200 OK`
  - Body: `"XR Meeting Platform API"`

### 2. **GET /users**
- **Description**: Retrieves a list of all users.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of user objects, each containing:
    - `OculusID`
    - `OculusName`
    - `Role`
    - `NameTag`
    - `NetworkState`
    - `Muted`
    - `Flag1`
    - `Flag2`
    - `Flag3`

### 3. **GET /users/:OculusID**
- **Description**: Retrieves a single user by their `OculusID`.
- **Parameters**:
  - `OculusID` (URL Parameter): The unique ID of the user.
- **Response**:
  - Status Code: `200 OK`
  - Body: A user object containing:
    - `OculusID`
    - `OculusName`
    - `Role`
    - `NameTag`
    - `NetworkState`
    - `Muted`
    - `Flag1`
    - `Flag2`
    - `Flag3`
  - Status Code: `404 Not Found` if user does not exist.

### 4. **POST /users**
- **Description**: Adds a new user to the database.
- **Request Body**:
  - `OculusID` (String): The unique ID for the user.
  - `OculusName` (String): The name of the user in Oculus.
  - `Role` (String): The role of the user.
  - `NameTag` (String): The user's name tag.
  - `NetworkState` (String): The user's network state.
  - `Muted` (Boolean): Whether the user is muted.
  - `Flag1`, `Flag2`, `Flag3` (Integer, optional, default: `0`): Flags associated with the user.
- **Response**:
  - Status Code: `201 Created`
  - Body: `"User added successfully: OculusID"`
  - Status Code: `400 Bad Request` if any required fields are missing.

### 5. **PATCH /users/:OculusID**
- **Description**: Updates a user's details (network state, mute status, role, and flags).
- **Parameters**:
  - `OculusID` (URL Parameter): The unique ID of the user to update.
- **Request Body** (any of the following fields are optional):
  - `NetworkState` (String)
  - `Muted` (Boolean)
  - `Role` (String)
  - `Flag1` (Integer)
  - `Flag2` (Integer)
  - `Flag3` (Integer)
- **Response**:
  - Status Code: `200 OK`
  - Body: `"User updated successfully: OculusID"`
  - Status Code: `400 Bad Request` if no valid fields are provided.
  - Status Code: `404 Not Found` if user does not exist.

### 6. **DELETE /users/:OculusID**
- **Description**: Deletes a user by their `OculusID`.
- **Parameters**:
  - `OculusID` (URL Parameter): The unique ID of the user to delete.
- **Response**:
  - Status Code: `200 OK`
  - Body: `"User deleted successfully: OculusID"`
  - Status Code: `404 Not Found` if user does not exist.
