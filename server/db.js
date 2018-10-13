const sqlite3 = require('sqlite3').verbose();

// Create or Connect to Database and Initialize it.
console.log("INIT DB!");
let db = new sqlite3.Database('mews.db');
db.serialize(() => {
    // db.run('DROP TABLE IF EXISTS mews');
    db.run('CREATE TABLE IF NOT EXISTS mews (id INTEGER PRIMARY KEY, name, content, date, time)');
    // let stmt = db.prepare("INSERT INTO mews (name, content, date, time) VALUES (?, ?, ?, ?)");
    // let d = new Date();
    // stmt.run("TESTBOT", "HELLO, THIS IS A TEST", d.toLocaleDateString(), d.toLocaleTimeString());
    // stmt.finalize();
    db.each("SELECT id, name, content, date, time FROM mews", (err, row) => {
        console.log(`${row.id}, ${row.name}: \"${row.content}\" created on ${row.date} at ${row.time}`);
    });
});
db.close();
