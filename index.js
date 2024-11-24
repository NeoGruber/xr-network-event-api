import express from 'express';
import mysql from 'mysql2';

const app = express();
const port = 3000;
app.use(express.json());

const createConnection = () => {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
};

const attemptConnection = (retries = 5, delay = 3000) => {
    const connection = createConnection();

    connection.connect(err => {
        if (err) {
            if (retries > 0) {
                console.error(`Error connecting to the database. Retrying in ${delay / 1000} seconds...`, err);
                setTimeout(() => attemptConnection(retries - 1, delay), delay);
            } else {
                console.error('Error connecting to the database:', err.stack);
                process.exit(1);
            }
        } else {
            console.log('Connected to the database');
            startServer(connection);
        }
    });
};

const startServer = (connection) => {
    app.get('/', (req, res) => {
        res.send('hello world!');
    });

    app.get('/scores', (req, res) => {
        connection.query('SELECT * FROM scores ORDER BY score DESC', (err, results) => {
            if (err) {
                res.status(500).send('Error querying the database');
                return;
            }

            let place = 1;
            results.forEach(result => {
                result.place = place;
                place++;
            });

            res.json(results);
        });
    });

    app.post('/scores', (req, res) => {
        const { name, score } = req.body;
        if (!name || typeof score !== 'number') {
            res.status(400).send('Invalid input');
            return;
        }
        connection.query('INSERT INTO scores (name, score) VALUES (?, ?)', [name, score], (err) => {
            if (err) {
                res.status(500).send('Error inserting into the database' + err);
                return;
            }
            connection.query('SELECT * FROM scores ORDER BY score DESC', (err, results) => {
                if (err) {
                    res.status(500).send('Error querying the database');
                    return;
                }
                let place = 1;
                results.forEach(result => {
                    result.place = place;
                    place++;
                });

                res.json(results);
            });
        });
    });

    app.delete('/scores/:id', (req, res) => {
        const { id } = req.params;
        connection.query('DELETE FROM scores WHERE id = ?', [id], (err, results) => {
            if (err) {
                res.status(500).send('Error deleting from the database');
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).send('Score not found');
                return;
            }
            connection.query('SELECT * FROM scores ORDER BY score DESC', (err, results) => {
                if (err) {
                    res.status(500).send('Error querying the database');
                    return;
                }
                res.json(results);
            });
        });
    });

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
};

attemptConnection();
