const { Pool } = require("pg");

const pool = new Pool({});
module.exports = {
    query: (text, params) => pool.query(text, params),
};

process.on("SIGINT", () => {
    pool.end();
    console.log("Application successfully shutdown");
    process.exit(0);
});
