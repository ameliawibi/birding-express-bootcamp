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

app.get("/signup", (req, res) => {
  res.render("signUp");
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  pool.query(
    `INSERT INTO users (user_email,user_password) VALUES ('${email}','${password}')`,
    (error, queryResult) => {
      if (error) {
        console.log("Error executing query", error.stack);
        return res.status(503).send("Service is unavailable");
      }
      res.redirect("/login");
    }
  );
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  //console.log("request came in");
  const values = [req.body.email.toLowerCase()];
  //console.log(values);

  pool.query(
    "SELECT * from users WHERE user_email=$1",
    values,
    (error, result) => {
      if (error) {
        console.log("Error executing query", error.stack);
        res.status(503).send("Service is unavailable");
        return;
      }

      if (result.rows.length === 0) {
        // we didnt find a user with that email.
        // the error for password and user are the same. don't tell the user which error they got for security reasons, otherwise people can guess if a person is a user of a given service.
        res.status(403).send("User does not exist");
        return;
      }

      const user = result.rows[0];

      if (user.user_password === req.body.password) {
        res.cookie("loggedIn", true);
        res.cookie("userID", `${user.id}`);
        res.redirect("/");
      } else {
        // password didn't match
        // the error for password and user are the same. don't tell the user which error they got for security reasons, otherwise people can guess if a person is a user of a given service.
        res.status(403).send("User does not exist");
      }
    }
  );
});

app.get("/logout", (req, res) => {
  res.clearCookie("loggedIn");
  res.clearCookie("userID");
  res.redirect("/login");
});

app.get("/", (req, res) => {
  if (req.cookies.loggedIn === undefined) {
    res.status(403).send("sorry, please log in!");
    return;
  }

  let sqlQuery = `SELECT notes.id,notes.date_time,notes.flock_size,species.species_name FROM notes INNER JOIN species ON notes.species_id = species.id`;
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
      //console.log(ejsData);
      //res.send("homepage success");
      res.render("home", { ejsData: ejsData });
    }
  });
});

app.get("/note", (req, res) => {
  if (req.cookies.loggedIn === undefined) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  let data = {};
  pool.query("SELECT * from behaviour", (error, behaviourOptionsResult) => {
    if (error) {
      console.log("Error behaviourOptionsResult", error.stack);
      return;
    }
    data.actions = behaviourOptionsResult.rows;
    //console.log(data);
    pool.query("SELECT * from species", (error, speciesOptionsResult) => {
      if (error) {
        console.log("Error speciesOptionsResult", error.stack);
        return;
      }
      data.species = speciesOptionsResult.rows;
      //console.log(data);

      //res.send("Getting options success");
      res.render("postNote", data);
    });
  });
});

app.post("/note", (req, res) => {
  if (req.cookies.loggedIn === undefined || req.cookies.userID === undefined) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  //console.log(req.body);
  const notes = req.body;
  const datetime = notes.date.concat(" ", notes.time);
  //console.log(datetime);
  const notesQuery =
    "INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ($1, $2, $3, $4, $5) RETURNING ID";

  const notesInputData = [
    datetime,
    notes.photo_url,
    Number(notes.flock_size),
    Number(notes.species),
    Number(req.cookies.userID),
  ];

  pool.query(
    notesQuery,
    notesInputData,
    (notesQueryError, notesQueryResult) => {
      if (notesQueryError) {
        console.error("Notes query error", notesQueryError);
        return;
      }
      //console.table(notesQueryResult.rows); //return id for notes_id
      const behaviourArray = notes.behaviour;
      const noteId = notesQueryResult.rows[0].id;
      //console.log(`noteId =${noteId}`);

      behaviourArray.forEach((behaviourId) => {
        const behaviourQuery = `INSERT INTO notes_behaviour (notes_id,behaviour_id) VALUES ($1,$2) returning behaviour_id`;
        const behaviourData = [noteId, behaviourId];
        //insert action into behaviour table
        pool.query(
          behaviourQuery,
          behaviourData,
          (behaviourQueryError, behaviourQueryResult) => {
            if (behaviourQueryError) {
              console.log("behaviour query error", behaviourQueryError);
            } else {
              console.table(behaviourQueryResult.rows);
            }
          }
        );
      });
      res.redirect(`/note/${noteId}`);
    }
  );
});

app.get("/note/:id", (req, res) => {
  if (req.cookies.loggedIn === undefined) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  const { id } = req.params;
  //console.log(id);
  let sqlQuery = `SELECT * FROM notes INNER JOIN notes_behaviour ON notes.id = notes_behaviour.notes_id INNER JOIN behaviour ON behaviour.id = notes_behaviour.behaviour_id INNER JOIN species ON notes.species_id = species.id WHERE notes.id=${id}`;
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
      //console.log(ejsData);
      //res.send("get view success");
      res.render("viewNote", { ejsData: ejsData });
    }
  });
});

app.listen(3006);
