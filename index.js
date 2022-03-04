import express from "express";
import pg from "pg";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";

const { Pool } = pg;
// set the way we will connect to the server
const pgConnectionConfigs = {
  user: "ameliawibi",
  host: "localhost",
  database: "birding",
  port: 5432, // Postgres server always runs on this port
};

// create the var we'll use
const pool = new Pool(pgConnectionConfigs);

const whenQueryDone = (error, result) => {
  if (error) {
    console.log("Error executing query", error.stack);
    return;
  }
  if (result.rows) {
    // this is the output
    console.table(result.rows);
  }
};

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());

app.get("/note", (req, res) => {
  res.render("postNote");
});

app.post("/note", (req, res) => {
  console.log(req.body);
  let notes = req.body;
  let datetime = notes.date.concat(" ", notes.time);
  //console.log(datetime);
  let sqlQuery =
    "INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat) VALUES ($1, $2, $3, $4, $5)";

  let inputData = [
    datetime,
    notes.photo_url,
    Number(notes.flock_size),
    notes.vocalization,
    notes.habitat,
  ];
  pool.query(sqlQuery, inputData, whenQueryDone);
  res.send("post success");
});

app.get("/note/:id", (req, res) => {
  const { notesid } = req.params;
  let sqlQuery = `SELECT * FROM notes INNER JOIN behaviour ON notes.id = behaviour.notes_id`;

  pool.query(sqlQuery, (error, result) => {
    if (error) {
      console.log("Error executing query", error.stack);
      return;
    }
    if (result.rows) {
      // this is the output
      //console.table(result.rows);

      let ejsData = result.rows;
      console.table(ejsData);
      res.send("get success");
      //res.render("viewNote", ejsData);
    }
  });
});

app.listen(3006);
