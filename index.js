const pg = require("pg");
const express = require("express");

const client = new pg.Client(
    process.env.DATABASE_URL || "postgres://localhost/acme_flavors_db"
);
const server = express();

const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
        );`;
    await client.query(SQL);
    console.log("table created");

    SQL = ` INSERT INTO flavors(name) VALUES('strawberry');
        INSERT INTO flavors(name) VALUES('chocolate');
        INSERT INTO flavors(name) VALUES('carmel');`;
    await client.query(SQL);
    console.log("data seeded");

    const port = process.env.PORT || 3002;
    server.listen(port, () => {
        console.log(`listening on port ${port}`)});
};
init();

//middleware to use before all routes
server.use(express.json()); //parses the request body so our route can access it
server.use(require("morgan")("dev")); //logs the requests received to the server

server.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `SELECT * from flavors ORDER BY created_at DESC;`;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (err) {
      next(err);
    }
  });

  server.post("/api/flavors", async (req, res, next) => {
    try {
      const { name } = req.body;
      const SQL = `INSERT into flavors (name) VALUES ($1) RETURNING *;`;
      const response = await client.query(SQL, [name]);
      res.status(201).send(response.rows[0]);
    } catch (err) {
      next(err);
    }
  });
  
  server.put("/api/flavors/:id", async (req, res, next) => {
    try {
      const { name } = req.body;
      const SQL = `UPDATE flavors SET name=$1, updated_at=now() WHERE id=$2 RETURNING *;`
      const response = await client.query(SQL, [name,
          req.params.id]);
      res.send(response.rows[0]);
    } catch (err) {
      next(err);
    }
  });
  
  server.delete("/api/flavors/:id", async (req, res, next) => {
    try {
      const SQL = `DELETE from flavors WHERE id=$1`;
      const response = await client.query(SQL, [req.params.id]);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  });