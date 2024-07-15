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
       
    `
    await client.query(SQL);
    console.log("data seeded");
    
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`listening on port ${port}`)});
};
init();
