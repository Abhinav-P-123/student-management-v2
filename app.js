const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const students = require("./students");
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
const port = 2000;
app.use(bodyParser.urlencoded({ extended: false }))
app.use("/", students);
app.listen(port);