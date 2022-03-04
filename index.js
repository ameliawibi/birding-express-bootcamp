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
  const notes = req.body;
  const datetime = notes.date.concat(" ", notes.time);
  //console.log(datetime);
  const notesQuery =
    "INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat) VALUES ($1, $2, $3, $4, $5) RETURNING ID";

  const notesInputData = [
    datetime,
    notes.photo_url,
    Number(notes.flock_size),
    notes.vocalization,
    notes.habitat,
  ];

  pool.query(
    notesQuery,
    notesInputData,
    (notesQueryError, notesQueryResult) => {
      if (notesQueryError) {
        console.error("Notes query error", notesQueryError);
        return;
      }
      console.table(notesQueryResult.rows); //return id for notes_id
      const behaviourArray = notes.behaviour;
      const noteId = notesQueryResult.rows[0].id;
      console.log(`noteId =${noteId}`);

      behaviourArray.forEach((behaviour) => {
        const behaviourQuery = `INSERT INTO behaviour (actions,notes_id) VALUES ($1, $2) returning actions`;
        const behaviourData = [behaviour, noteId];
        pool.query(
          behaviourQuery,
          behaviourData,
          (behaviourQueryError, behaviourQueryResult) => {
            if (behaviourQueryError) {
              console.log("behaviour query error", behaviourQueryError);
            } else {
              console.log(behaviourQueryResult.rows);
            }
          }
        );
      });
      res.send("post success");
    }
  );
});

app.get("/note/:id", (req, res) => {
  const { id } = req.params;
  //console.log(id);
  let sqlQuery = `SELECT * FROM notes INNER JOIN behaviour ON notes.id = behaviour.notes_id WHERE notes.id=${id}`;
  //console.log(sqlQuery);

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
