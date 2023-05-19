const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const students = require("./controllers/students")
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
const port = 2000;
app.use(bodyParser.urlencoded({ extended: false }))
app.use("/student", students);
app.listen(port);