import express from "express";
import pg from "pg";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());

app.get("/note", (req, res) => {
  res.render("postNote");
});

app.listen(3006);
