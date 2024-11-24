# Game Scoreboard API

This is a simple Node.js application with a MySQL database to manage a scoreboard for a game. The application allows you to add, retrieve, and delete scores.

## Prerequisites

- Docker
- Docker Compose

## Setup

```sh
git clone https://github.com/NeoGruber/game-scoreboard.git
cd game-scoreboard
docker-compose up -d --build
```

## API Endpoints

### Get All Scores

URL: `/scores`

Method: `GET`

Description: Retrieves all scores sorted from best to worst.

#### Response
```json
[
  {
    "id": 1,
    "name": "player1",
    "score": 100
  },
  {
    "id": 2,
    "name": "player2",
    "score": 90
  }
]
```

### Add a New Score

URL: `/scores`

Method: `POST`

Description: Adds a new score and returns all scores sorted from best to worst.

#### Request Body
```json
{
  "name": "player1",
  "score": 100
}
```

#### Response
```json
[
  {
    "id": 1,
    "name": "player1",
    "score": 100
  },
  {
    "id": 2,
    "name": "player2",
    "score": 90
  }
]
```

### Delete Score

URL: `/scores/:id`

Method: `DELETE`

Description: Deletes a score by its id and returns all scores sorted from best to worst.

#### Request URL

`/scores/1`

#### Response
```json
[
  {
    "id": 2,
    "name": "player2",
    "score": 90
  }
]
```
