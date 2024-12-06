# XR Meeting Platform API

This document provides an overview of the XR Meeting Platform API, which enables the management of users and locations for an extended reality (XR) meeting platform.

---

## Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [General](#general)
  - [Users](#users)
  - [Locations](#locations)
- [Database Schema](#database-schema)
- [Usage](#usage)

---

## Setup

### Prerequisites

- Node.js (v16+ recommended)
- MySQL database

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and configure your database credentials (see [Environment Variables](#environment-variables)).
4. Start the server:
   ```bash
   node index.js
   ```
5. The API will be available at `http://localhost:3000`.

---

## Environment Variables

The following environment variables are required for database connection:

- `DB_HOST`: The host of your MySQL database.
- `DB_USER`: The username for the database.
- `DB_PASS`: The password for the database.
- `DB_NAME`: The name of the database.

Example `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=xr_meeting
```

---

## API Endpoints

### General

- `GET /`
  - **Description:** Welcome message for the API.

- `GET /readme`
  - **Description:** Displays the README in HTML format.

- `GET /web`
  - **Description:** Serves a static HTML page (`index.html`).

### Users

#### Get All Users
- `GET /users`
  - **Description:** Retrieves all users.
  - **Response:** Array of user objects.

#### Get User by OculusID
- `GET /users/:OculusID`
  - **Description:** Retrieves a user by their `OculusID`.
  - **Parameters:**
    - `OculusID`: Unique ID of the user.

#### Add a New User
- `POST /users`
  - **Description:** Adds a new user.
  - **Request Body:**
    ```json
    {
      "OculusID": "string",
      "OculusName": "string",
      "Role": 0,
      "NameTag": "string",
      "NetworkState": 0,
      "Muted": 0,
      "Flag1": 0,
      "Flag2": 0,
      "Flag3": 0,
      "LocationID": "integer"
    }
    ```

#### Update User
- `PATCH /users/:OculusID`
  - **Description:** Updates a user's fields (e.g., `NetworkState`, `Muted`).
  - **Parameters:**
    - `OculusID`: Unique ID of the user.
  - **Request Body:** Any combination of:
    ```json
    {
      "NetworkState": 1,
      "Muted": 0,
      "Role": 1,
      "Flag1": 1,
      "Flag2": 1,
      "Flag3": 1,
      "LocationID": 5
    }
    ```

#### Delete User
- `DELETE /users/:OculusID`
  - **Description:** Deletes a user by their `OculusID`.
  - **Parameters:**
    - `OculusID`: Unique ID of the user.

### Locations

#### Get All Locations
- `GET /locations`
  - **Description:** Retrieves all locations.

#### Add a New Location
- `POST /locations`
  - **Description:** Adds a new location.
  - **Request Body:**
    ```json
    {
      "City": "string",
      "Location": "string"
    }
    ```

#### Delete Location
- `DELETE /locations/:ID`
  - **Description:** Deletes a location by its ID.
  - **Parameters:**
    - `ID`: Unique ID of the location.

---

## Database Schema

### `users` Table
| Column        | Type    | Description                 |
|---------------|---------|-----------------------------|
| `OculusID`    | VARCHAR | Unique ID for the user.     |
| `OculusName`  | VARCHAR | Oculus username.            |
| `Role`        | INT     | Role identifier (e.g., 0=guest). |
| `NameTag`     | VARCHAR | Display name tag.           |
| `NetworkState`| INT     | Network connection status.  |
| `Muted`       | INT     | Mute status (0/1).          |
| `Flag1`       | INT     | Custom flag.                |
| `Flag2`       | INT     | Custom flag.                |
| `Flag3`       | INT     | Custom flag.                |
| `LocationID`  | INT     | Associated location ID.     |

### `locations` Table
| Column        | Type    | Description                 |
|---------------|---------|-----------------------------|
| `LocationID`  | INT     | Unique ID for the location. |
| `City`        | VARCHAR | Name of the city.           |
| `Location`    | VARCHAR | Detailed location name.     |

---

## Usage

- Start the API and ensure the database is running.
- Use tools like [Postman](https://www.postman.com/) or [curl](https://curl.se/) to interact with the endpoints.
- Validate the input and responses against the expected schema provided in this README.

---

For additional support or questions, please contact the project maintainer.
