const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const staticDir = path.join(__dirname, '..\\client');
const serverDir = __dirname;
const app = express();

// Create or Connect to Database and Initialize it.
console.log("INIT DB!");
let db = new sqlite3.Database('mews.db');
db.serialize(() => {
    // db.run('DROP TABLE IF EXISTS mews');
    db.run('CREATE TABLE IF NOT EXISTS mews (id INTEGER PRIMARY KEY, name, content, created)');
    db.each("SELECT id, name, content, created FROM mews", (err, row) => {
        console.log(`${row.id}, ${row.name}: \"${row.content}\" created on ${row.created}`);
    });
});
db.close();

app.use(cors());
app.use(express.json());
app.use(express.static(staticDir));

function landingPage(req, res) {
    res.sendFile(`${staticDir}/index.html`);
}

app.get('/', landingPage);

app.get('/mews', (req, res) => {
    findMews().then((result) => {
        res.json(result);
    });
});

function isValidMew(mew) {
    return mew.name && mew.name.toString().trim() !== '' &&
        mew.content && mew.content.toString().trim() !== '';
}

function findMews() {
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database('mews.db');
        let result = [];
        let dbPromise = new Promise((resolve, reject) => {
            db.serialize(() => {
                db.each("SELECT id, name, content, created FROM mews", (err, row) => {
                    console.log("FINDING...");
                    mew = {
                        name: row.name,
                        content: row.content,
                        created: row.created
                    };
                    result.push(mew);
                }, resolve);
            });
        });
        dbPromise.then((res, rej) => {
            result.reverse();
            console.log(result);
            db.close();
            resolve(result);
        });
    });
}

function insertMew(mew) {
    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database('mews.db');
        let resultMew;
        db.serialize(() => {
            let stmt = db.prepare('INSERT INTO mews (name, content, created) VALUES (?,?,?)');
            stmt.run(mew.name, mew.content, mew.created);
            stmt.finalize();
            db.get("SELECT * FROM mews ORDER BY id DESC LIMIT 1", (err, row) => {
                resultMew = {
                    name: row.name,
                    content: row.content,
                    created: row.created,
                };
                console.log("HI");
                db.close();
                resolve(resultMew);
            });
        });
    });
}

app.post('/mews', (req, res) => {
    if (isValidMew(req.body)) {
        const mew = {
            name: req.body.name.toString(),
            content: req.body.content.toString(),
            created: new Date()
        };
        console.log(mew);
        insertMew(mew)
            .then(createdMew => {
                console.log("DONE INSERT");
                res.json(createdMew);
            });
    } else {
        res.status(422);
        res.json({
            message: "Hey! Name and Content is required!"
        });
    }
});

app.post('/resetdb', (req, res) => {
    console.log("PROCESSING RESET");
    let db = new sqlite3.Database('mews.db');
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS mews');
        db.run('CREATE TABLE IF NOT EXISTS mews (id INTEGER PRIMARY KEY, name, content, created)');
    });
    db.close();
    console.log("DONE RESETTING");
});

app.listen(5000, () => {
    console.log('Listening on http://localhost:5000');
});
