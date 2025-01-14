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

let connection;

function createConnection() {
  const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  // Handle lost connection
  conn.on("error", function (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection lost. Reconnecting...");
      attemptConnection(); // Retry connection on disconnect
    } else {
      console.error("Database error:", err.stack);
      process.exit(1); // Exit for non-recoverable errors
    }
  });

  return conn;
}

function attemptConnection(retries = 5, delay = 3000) {
  if (connection) {
    connection.destroy(); // Clean up the old connection
  }

  connection = createConnection();

  connection.connect(function (err) {
    if (!err) {
      console.log("Connected to the database!");
      startServer(connection); // Start server on successful connection
      return;
    }

    if (retries === 0) {
      console.error("Failed to connect to the database:", err.stack);
      process.exit(1);
    }

    console.error(
      `Retrying connection in ${delay / 1000}s... (${retries} retries left)`,
    );
    setTimeout(() => attemptConnection(retries - 1, delay), delay);
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

      const htmlContent = marked(data);

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
  app.get("/users/:OculusID", function (req, res) {
    const OculusID = BigInt(req.params.OculusID); // Convert the OculusID to BigInt

    queryDatabase(
      connection,
      "SELECT * FROM users WHERE OculusID = ?",
      [OculusID.toString()], // Pass BigInt as a string to the database
      res,
      function (results) {
        if (results.length === 0) {
          return res.status(404).send("User not found");
        }

        // Convert OculusID back to string in the response
        const adjustedResults = results.map((user) => ({
          ...user,
          OculusID: user.OculusID.toString(),
        }));

        res.json(adjustedResults);
      },
    );
  });

  // Add a new user
  app.post("/users", function (req, res) {
    const {
      OculusName,
      Role,
      NameTag,
      NetworkState,
      Muted,
      Flag1 = 0,
      Flag2 = 0,
      Flag3 = 0,
      LocationID,
    } = req.body;

    const OculusID = BigInt(req.body.OculusID);

    // Input validation
    if (
      !OculusID ||
      !OculusName ||
      Role === undefined ||
      !NameTag ||
      NetworkState === undefined ||
      Muted === undefined ||
      LocationID === undefined
    ) {
      return res.status(400).send("Invalid input");
    }

    const OculusIDBigInt = BigInt(OculusID); // Convert OculusID to BigInt

    queryDatabase(
      connection,
      "INSERT INTO users (OculusID, OculusName, Role, NameTag, NetworkState, Muted, Flag1, Flag2, Flag3, LocationID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        OculusIDBigInt.toString(), // Pass BigInt as a string to the database
        OculusName,
        Role,
        NameTag,
        NetworkState,
        Muted,
        Flag1,
        Flag2,
        Flag3,
        LocationID,
      ],
      res,
      function () {
        queryDatabase(
          connection,
          "SELECT * FROM users WHERE OculusID = ?",
          [OculusIDBigInt.toString()], // Query using BigInt as a string
          res,
          function (results) {
            // Convert OculusID back to string in the response
            const adjustedResults = results.map((user) => ({
              ...user,
              OculusID: user.OculusID.toString(),
            }));
            res.status(201).json(adjustedResults);
          },
        );
      },
    );
  });

  // Update a user's network state or muted status
  app.patch("/users/:OculusID", function (req, res) {
    let OculusID;

    // Convert OculusID from params to BigInt
    try {
      OculusID = BigInt(req.params.OculusID);
    } catch (error) {
      return res
        .status(400)
        .send("Invalid OculusID format, must be a numeric value");
    }

    const { NetworkState, Muted, Role, Flag1, Flag2, Flag3, LocationID } =
      req.body;

    // Ensure at least one field is being updated
    if (
      NetworkState === undefined &&
      Muted === undefined &&
      Role === undefined &&
      Flag1 === undefined &&
      Flag2 === undefined &&
      Flag3 === undefined &&
      LocationID === undefined
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
    if (LocationID !== undefined) {
      fields.push("LocationID = ?");
      values.push(LocationID);
    }

    values.push(OculusID.toString()); // Add OculusID as string for the query

    // Update user in the database
    queryDatabase(
      connection,
      `UPDATE users SET ${fields.join(", ")} WHERE OculusID = ?`,
      values,
      res,
      function (results) {
        if (results.affectedRows === 0) {
          return res.status(404).send("User not found");
        }

        // Fetch the updated user
        queryDatabase(
          connection,
          "SELECT * FROM users WHERE OculusID = ?",
          [OculusID.toString()],
          res,
          function (results) {
            // Convert OculusID back to string in the response
            const adjustedResults = results.map((user) => ({
              ...user,
              OculusID: user.OculusID.toString(),
            }));
            res.status(200).json(adjustedResults);
          },
        );
      },
    );
  });

  // Delete a user
  app.delete("/users/:OculusID", function (req, res) {
    let OculusID;

    // Convert OculusID from params to BigInt
    try {
      OculusID = BigInt(req.params.OculusID);
    } catch (error) {
      return res
        .status(400)
        .send("Invalid OculusID format, must be a numeric value");
    }

    // Delete user from the database
    queryDatabase(
      connection,
      "DELETE FROM users WHERE OculusID = ?",
      [OculusID.toString()], // Pass BigInt as a string to the query
      res,
      function (results) {
        if (results.affectedRows === 0) {
          return res.status(404).send("User not found");
        }
        res
          .status(200)
          .send(`User deleted successfully: ${OculusID.toString()}`);
      },
    );
  });

  app.post("/locations", function (req, res) {
    const { City, Location } = req.body;

    if (!City || !Location) {
      return res.status(400).send("Invalid input");
    }

    queryDatabase(
      connection,
      "INSERT INTO locations (City, Location) VALUES (?, ?)",
      [City, Location],
      res,
      function () {
        queryDatabase(
          connection,
          "SELECT * FROM locations",
          [],
          res,
          function (results) {
            res.status(201).json(results);
          },
        );
      },
    );
  });

  app.get("/locations", function (req, res) {
    queryDatabase(
      connection,
      "SELECT * FROM locations",
      [],
      res,
      function (results) {
        res.json(results);
      },
    );
  });

  app.delete("/locations/:ID", function (req, res) {
    const { ID } = req.params;
    queryDatabase(
      connection,
      "DELETE FROM locations WHERE LocationID = ?",
      [ID],
      res,
      function (results) {
        if (results.affectedRows === 0) {
          return res.status(404).send("Location not found");
        }
        res.status(200).send(`Location deleted successfully: ${ID}`);
      },
    );
  });

  app.listen(port, function () {
    console.log(`App listening at http://localhost:${port}`);
  });
}

attemptConnection();
