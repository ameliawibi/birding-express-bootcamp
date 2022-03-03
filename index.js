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
    "INSERT INTO notes (date_time,appearance,flock_size,vocalization,habitat,behaviour) VALUES ($1, $2, $3, $4, $5, $6)";

  let inputData = [
    datetime,
    notes.appearance,
    Number(notes.flock_size),
    notes.vocalization,
    notes.habitat,
    notes.behaviour,
  ];
  pool.query(sqlQuery, inputData, whenQueryDone);
  res.send("post success");
});

app.listen(3006);
