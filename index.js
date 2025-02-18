import "dotenv/config";
import express from "express";
import { validationResult } from "express-validator";
import {
  notesValidationMessages,
  commentValidationMessages,
  loginValidationMessages,
  speciesValidationMessages,
} from "./validator.js";
import pg from "pg";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import session from "express-session";
import jsSHA from "jssha";
import { getHashString, getHashedCookie } from "./hash.js";

const { Pool } = pg;
// set the way we will connect to the server
// create separate DB connection configs for production vs non-production environments.
// ensure our server still works on our local machines.
let pgConnectionConfigs;
if (process.env.ENV === "PRODUCTION") {
  // determine how we connect to the remote Postgres server
  pgConnectionConfigs = {
    user: "postgres",
    // set DB_PASSWORD as an environment variable for security.
    password: process.env.DB_PASSWORD,
    host: "localhost",
    database: "birding",
    port: 5432,
  };
} else {
  // determine how we connect to the local Postgres server
  pgConnectionConfigs = {
    user: "ameliawibi",
    host: "localhost",
    database: "birding",
    port: 5432, // Postgres server always runs on this port
  };
}

// create the var we'll use
const pool = new Pool(pgConnectionConfigs);
// initialise the SHA object
const shaObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });

let errorMessage = [];
let sessionData = {};
const salt = process.env.SECRET_KEY;

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
//session middleware
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);
app.use(cookieParser());

app.get("/signup", (req, res) => {
  let ejsData = {
    error: errorMessage,
  };
  //console.log(ejsData);
  errorMessage = [];
  res.render("signUp", ejsData);
});

app.post("/signup", loginValidationMessages, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //store error message and session data
    errorMessage = errors.errors;
    res.redirect("/signup");
    return;
  }
  const hashedPassword = getHashString(req.body.password);
  const values = [req.body.email, hashedPassword];

  pool.query(
    `INSERT INTO users (user_email,user_password) VALUES ($1, $2)`,
    values,
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
  let ejsData = {
    error: errorMessage,
  };
  //console.log(ejsData);
  errorMessage = [];
  res.render("login", ejsData);
});

app.post("/login", loginValidationMessages, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //store error message and session data
    errorMessage = errors.errors;
    res.redirect("/login");
    return;
  }
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
        //store error message and session data
        errorMessage = "User does not exists";
        res.redirect("/login");
        return;
      }

      const user = result.rows[0];
      const hashedPassword = getHashString(req.body.password);
      if (user.user_password === hashedPassword) {
        res.cookie("userID", `${user.id}`);

        const hashedCookieString = getHashedCookie(user.id, salt);
        res.cookie("loggedInHash", hashedCookieString);

        res.redirect("/");
      } else {
        // password didn't match
        // the error for password and user are the same. don't tell the user which error they got for security reasons, otherwise people can guess if a person is a user of a given service.
        //store error message and session data
        errorMessage = "User does not exists";
        res.redirect("/login");
      }
    }
  );
});

app.get("/logout", (req, res) => {
  res.clearCookie("loggedInHash");
  res.clearCookie("userID");
  req.session.destroy();
  res.redirect("/login");
});

app.get("/", (req, res) => {
  const user_id = req.cookies.userID;
  const hashedCookieString = getHashedCookie(user_id, salt);

  if (req.cookies.loggedInHash !== hashedCookieString) {
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
  const user_id = req.cookies.userID;
  const hashedCookieString = getHashedCookie(user_id, salt);

  if (req.cookies.loggedInHash !== hashedCookieString) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  let data = {
    date: "date" in sessionData ? sessionData.date : "",
    time: "time" in sessionData ? sessionData.time : "",
    photo_url: "photo_url" in sessionData ? sessionData.photo_url : "",
    flock_size: "flock_size" in sessionData ? sessionData.flock_size : "",
    action_values:
      "action_values" in sessionData ? sessionData.action_values : [],
    species_id: "species" in sessionData ? sessionData.species : "",
  };
  console.log(data);
  sessionData = req.session;
  pool.query("SELECT * from behaviour", (error, behaviourOptionsResult) => {
    if (error) {
      console.log("Error behaviourOptionsResult", error.stack);
      return;
    }
    data.actions = behaviourOptionsResult.rows;

    console.log(data);
    pool.query("SELECT * from species", (error, speciesOptionsResult) => {
      if (error) {
        console.log("Error speciesOptionsResult", error.stack);
        return;
      }
      data.species = speciesOptionsResult.rows;
      data.error = errorMessage;
      //console.log(data);
      errorMessage = [];
      //res.send("Getting options success");
      res.render("postNote", data);
    });
  });
});

app.post("/note", notesValidationMessages, (req, res) => {
  const user_id = req.cookies.userID;
  const hashedCookieString = getHashedCookie(user_id, salt);

  if (req.cookies.loggedInHash !== hashedCookieString) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  sessionData = req.session;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //store error message and session data
    errorMessage = errors.errors;
    sessionData = {
      date: req.body.date,
      time: req.body.time,
      photo_url: req.body.photo_url,
      flock_size: req.body.flock_size,
      species: req.body.species,
      action_values: req.body.behaviour,
    };
    res.redirect("/note");
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

app.post("/species", speciesValidationMessages, (req, res) => {
  const user_id = req.cookies.userID;
  const hashedCookieString = getHashedCookie(user_id, salt);

  if (req.cookies.loggedInHash !== hashedCookieString) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage = errors.errors;
    res.redirect("/note");
    return;
  }

  let speciesData = [req.body.species_name, req.body.scientific_name];
  let speciesQuery = `INSERT INTO species (species_name,scientific_name) VALUES ($1,$2)`;
  pool.query(speciesQuery, speciesData, (error, speciesQueryResult) => {
    if (error) {
      console.log("Error executing query", error.stack);
      return;
    }
    if (speciesQueryResult.rows) {
      // this is the output
      res.redirect("/note");
    }
  });
});

app.get("/note/:id", (req, res) => {
  const user_id = req.cookies.userID;
  const hashedCookieString = getHashedCookie(user_id, salt);

  if (req.cookies.loggedInHash !== hashedCookieString) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  const { id } = req.params;

  //console.log(id);
  let sqlQuery = `SELECT * FROM notes INNER JOIN notes_behaviour ON notes.id = notes_behaviour.notes_id INNER JOIN behaviour ON behaviour.id = notes_behaviour.behaviour_id INNER JOIN species ON notes.species_id = species.id WHERE notes.id=${id}`;
  //console.log(sqlQuery);

  pool.query(sqlQuery, (error, result) => {
    if (error) {
      console.log("Error executing 1st query", error.stack);
      return;
    }
    if (result.rows.length === 0) {
      res.status(404).send("Note not found!");
      return;
    }
    if (result.rows) {
      // this is the output
      //console.table(result.rows);

      let ejsData = {
        notes_id: id,
        id: result.rows[0].id,
        date_time: result.rows[0].date_time,
        photo_url: result.rows[0].photo_url,
        flock_size: result.rows[0].flock_size,
        species_name: result.rows[0].species_name,
        scientific_name: result.rows[0].scientific_name,
        error: errorMessage,
        actions: [],
        can_edit: false,
      };
      result.rows.forEach((data) => {
        ejsData.actions.push(data.actions);
      });
      errorMessage = [];
      const noteUserId = result.rows[0].user_id;
      const hashedUserId = getHashedCookie(noteUserId, salt);
      if (hashedUserId === hashedCookieString) {
        ejsData.can_edit = true;
      }
      //console.log(ejsData);

      let commentQuery = `SELECT * FROM comments WHERE notes_id=${id}`;
      pool.query(commentQuery, (commentError, commentResult) => {
        if (commentError) {
          console.log("Error executing 2nd query", commentError.stack);
          return;
        }
        if (commentResult.rows) {
          ejsData.comments = commentResult.rows;
          //console.log(ejsData);
          res.render("viewNote", { ejsData: ejsData });
        }
      });
    }
  });
});

app.post("/note/:id/comment", commentValidationMessages, (req, res) => {
  const { id } = req.params;
  const user_id = req.cookies.userID;
  const hashedCookieString = getHashedCookie(user_id, salt);

  if (req.cookies.loggedInHash !== hashedCookieString) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage = errors.errors;
    res.redirect(`/note/${id}`);
    return;
  }

  let commentData = [req.body.comment, id, Number(req.cookies.userID)];
  let commentQuery = `INSERT INTO comments (comment,notes_id,user_id) VALUES($1,$2,$3)`;

  pool.query(commentQuery, commentData, (error, commentQueryResult) => {
    if (error) {
      console.log("Error executing query", error.stack);
      return;
    }
    if (commentQueryResult.rows) {
      // this is the output
      res.redirect(`/note/${id}`);
    }
  });
});

app.get("/note/:id/edit", (req, res) => {
  const { id } = req.params;
  const user_id = req.cookies.userID;
  const hashedCookieString = getHashedCookie(user_id, salt);

  if (req.cookies.loggedInHash !== hashedCookieString) {
    res.status(403).send("sorry, please log in!");
    return;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //store error message and session data
    errorMessage = errors.errors;
    res.redirect(`/note/${id}/edit`);
    return;
  }
  let sqlQuery = `SELECT * FROM notes INNER JOIN notes_behaviour ON notes.id = notes_behaviour.notes_id INNER JOIN behaviour ON behaviour.id = notes_behaviour.behaviour_id INNER JOIN species ON notes.species_id = species.id WHERE notes.id=${id}`;

  pool.query(sqlQuery, (error, result) => {
    if (error) {
      console.log("Error executing 1st query", error.stack);
      return;
    }
    if (result.rows.length === 0) {
      res.status(404).send("Note not found!");
      return;
    }
    if (result.rows) {
      // this is the output
      const noteUserId = result.rows[0].user_id;
      const hashedUserId = getHashedCookie(noteUserId, salt);
      if (hashedUserId !== hashedCookieString) {
        res.status(403).send("You don't have permission to edit");
        return;
      }
      let dateTimeData = result.rows[0].date_time.split(" ");
      //console.log(dateTimeData);
      let ejsData = {
        notes_id: id,
        id: result.rows[0].id,
        date: "date" in sessionData ? sessionData.date : dateTimeData[0],
        time:
          "time" in sessionData
            ? sessionData.time
            : dateTimeData[1].concat(" ", dateTimeData[2]),
        photo_url:
          "photo_url" in sessionData
            ? sessionData.photo_url
            : result.rows[0].photo_url,
        flock_size:
          "flock_size" in sessionData
            ? sessionData.flock_size
            : result.rows[0].flock_size,
        species_name: result.rows[0].species_name,
        scientific_name: result.rows[0].scientific_name,
        error: errorMessage,
        actions: [],
        action_values: [],
      };
      result.rows.forEach((data) => {
        ejsData.action_values.push(data.actions);
      });
      errorMessage = [];
      sessionData = req.session;
      //console.log(ejsData);
      pool.query(
        "SELECT * from behaviour",
        (behaviourOptionsError, behaviourOptionsResult) => {
          if (behaviourOptionsError) {
            console.log(
              "Error behaviourOptionsResult",
              behaviourOptionsError.stack
            );
            return;
          }
          ejsData.actions = behaviourOptionsResult.rows;
          pool.query(
            "SELECT * from species",
            (speciesOptionsError, speciesOptionsResult) => {
              if (speciesOptionsError) {
                console.log(
                  "Error speciesOptionsResult",
                  speciesOptionsError.stack
                );
                return;
              }
              ejsData.species = speciesOptionsResult.rows;
              //console.log(ejsData);
              errorMessage = [];
              //res.send("get edit note success");
              res.render("editNote", ejsData);
            }
          );
        }
      );
    }
  });
});

app.put("/note/:id/edit", notesValidationMessages, (req, res) => {
  const { id } = req.params;
  const user_id = req.cookies.userID;
  const hashedCookieString = getHashedCookie(user_id, salt);

  if (req.cookies.loggedInHash !== hashedCookieString) {
    res.status(403).send("sorry, please log in!");
    return;
  }
  sessionData = req.session;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //store error message and session data
    errorMessage = errors.errors;
    sessionData = {
      date: req.body.date,
      time: req.body.time,
      photo_url: req.body.photo_url,
      flock_size: req.body.flock_size,
      species: req.body.species,
      action_values: req.body.behaviour,
    };
    console.log(sessionData);
    res.redirect(`/note/${id}/edit`);
    return;
  }
  //console.log(req.body);
  const notes = req.body;
  const datetime = notes.date.concat(" ", notes.time);
  //console.log(datetime);
  const notesQuery = `UPDATE "notes" SET "date_time"=$1, "photo_url"=$2, "flock_size"=$3, "species_id" =$4 ,"user_id"=$5 WHERE id=${id} RETURNING ID`;

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

      //delete all rows of behaviour
      pool.query(
        `DELETE from notes_behaviour WHERE notes_id=${id};`,
        (deleteError, deleteResult) => {
          if (deleteError) {
            console.error("Notes query error", deleteError);
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
    }
  );
});

app.listen(3006);
