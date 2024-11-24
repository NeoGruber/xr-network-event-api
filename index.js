import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
app.use(express.json());

// Utility: Create a database connection
function createConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
}

// Utility: Retry database connection
function attemptConnection(retries = 5, delay = 3000) {
  const connection = createConnection();
  connection.connect(function (err) {
    if (!err) {
      return startServer(connection);
    }
    if (retries === 0) {
      console.error("Failed to connect to the database:", err.stack);
      process.exit(1);
    }
    console.error(
      `Retrying connection in ${delay / 1000}s... (${retries} retries left)`,
    );
    setTimeout(function () {
      attemptConnection(retries - 1, delay);
    }, delay);
  });
}

// Utility: Send a query and handle results
function queryDatabase(connection, query, params, res, callback) {
  connection.query(query, params, function (err, results) {
    if (err) {
      return res.status(500).send({ error: "Database error", details: err });
    }
    callback(results);
  });
}

// Server: Define API routes
function startServer(connection) {
  app.get("/", function (_, res) {
    res.send("XR Meeting Platform API");
  });

  app.get("/readme", function (_, res) {
    fs.readFile("README.md", "utf8", function (err, data) {
      if (err) {
        return res.status(500).send("Error reading README file.");
      }

      // Convert Markdown to HTML using `marked`
      const htmlContent = marked(data);

      // Wrap the HTML content in a basic template
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>README</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 20px auto;
              padding: 20px;
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            h1, h2, h3 {
              color: #333;
            }
            pre {
              background-color: #eee;
              padding: 10px;
              border-radius: 5px;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `);
    });
  });

  app.get("/web", function (_, res) {
    res.sendFile(__dirname + "/index.html");
  });

  // Get all users
  app.get("/users", function (_, res) {
    queryDatabase(
      connection,
      "SELECT * FROM users",
      [],
      res,
      function (results) {
        res.json(results);
      },
    );
  });

  //Get a single user
  app.get("/users/:OculusID", function (_, res) {
    const { OculusID } = req.params;
    queryDatabase(
      connection,
      "SELECT * FROM users WHERE OculusID = ?",
      [OculusID],
      res,
      function (results) {
        res.json(results);
      },
    );
  });

  // Add a new user
  app.post("/users", function (req, res) {
    const {
      OculusID,
      OculusName,
      Role,
      NameTag,
      NetworkState,
      Muted,
      Flag1 = 0,
      Flag2 = 0,
      Flag3 = 0,
    } = req.body;
    if (
      !OculusID ||
      !OculusName ||
      Role === undefined ||
      !NameTag ||
      NetworkState === undefined ||
      Muted === undefined
    ) {
      return res.status(400).send("Invalid input");
    }
    queryDatabase(
      connection,
      "INSERT INTO users (OculusID, OculusName, Role, NameTag, NetworkState, Muted, Flag1, Flag2, Flag3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        OculusID,
        OculusName,
        Role,
        NameTag,
        NetworkState,
        Muted,
        Flag1,
        Flag2,
        Flag3,
      ],
      res,
      function () {
        res.status(201).send(`User added successfully: ${OculusID}`);
      },
    );
  });

  // Update a user's network state or muted status
  app.patch("/users/:OculusID", function (req, res) {
    const { OculusID } = req.params;
    const { NetworkState, Muted, Role, Flag1, Flag2, Flag3 } = req.body;
    if (
      NetworkState === undefined &&
      Muted === undefined &&
      Role === undefined &&
      Flag1 === undefined &&
      Flag2 === undefined &&
      Flag3 === undefined
    ) {
      return res.status(400).send("No valid fields to update");
    }

    const fields = [];
    const values = [];
    if (NetworkState !== undefined) {
      fields.push("NetworkState = ?");
      values.push(NetworkState);
    }
    if (Muted !== undefined) {
      fields.push("Muted = ?");
      values.push(Muted);
    }
    if (Role !== undefined) {
      fields.push("Role = ?");
      values.push(Role);
    }
    if (Flag1 !== undefined) {
      fields.push("Flag1 = ?");
      values.push(Flag1);
    }
    if (Flag2 !== undefined) {
      fields.push("Flag2 = ?");
      values.push(Flag2);
    }
    if (Flag3 !== undefined) {
      fields.push("Flag3 = ?");
      values.push(Flag3);
    }

    values.push(OculusID);
    queryDatabase(
      connection,
      `UPDATE users SET ${fields.join(", ")} WHERE OculusID = ?`,
      values,
      res,
      function (results) {
        if (results.affectedRows === 0) {
          return res.status(404).send("User not found");
        }
        res.send(`User updated successfully: ${OculusID}`);
      },
    );
  });

  // Delete a user
  app.delete("/users/:OculusID", function (req, res) {
    const { OculusID } = req.params;
    queryDatabase(
      connection,
      "DELETE FROM users WHERE OculusID = ?",
      [OculusID],
      res,
      function (results) {
        if (results.affectedRows === 0) {
          return res.status(404).send("User not found");
        }
        res.send(`User deleted successfully: ${OculusID}`);
      },
    );
  });

  app.listen(port, function () {
    console.log(`App listening at http://localhost:${port}`);
  });
}

attemptConnection();
