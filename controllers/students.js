const bodyParser = require("body-parser")
const express = require("express");
const app = express();

const router = express.Router();
const student = require("../models/mongodb")
const mongoose = require("mongoose");
app.set("view engine", "ejs");
app.use(express.static("public"))

router.get("/", (req, res) => {
    student.find({}).then(students => {
        res.render("studentList", { students: students, searchString: "" })
    })
})

router.post("/search/", (req, res) => {
    var studentName = req.body.studentName;
<<<<<<< HEAD
    student.find({ studentName: { $regex: new RegExp(studentName) } }).then(students => {
        res.render("studentList", { students: students, searchString: studentName })
=======
    student.find({ studentName: { $regex: `/${studentName}/` } }).then(students => {
        res.render("studentList", { students: students })
>>>>>>> parent of 8de158b (changing the search query)
    })
})

router.get("/update/:id", (req, res) => {
    var studentId = req.params.id;
    var studentName = req.body.studentName;
    var studentAdNo = req.body.studentAdNo;
    var studentClass = req.body.studentClass;
    console.log(req.body.studentName)
    student.findOne({ studentAdNo: studentId }).then(students => {
        res.render("studentAddEdit", {
            Name: students.studentName,
            AddmissionNumber: students.studentAdNo,
            Class: students.studentClass,
            functionText: "Update student"
        })
    })
})

router.post("/update/:id", (req, res) => {
    var studentId = req.params.id;
    student.updateOne({ studentAdNo: studentId }, {
        studentName: req.body.studentName,
        studentAdNo: req.body.studentAdNo,
        studentClass: req.body.studentClass
    }).then(data => {
        res.redirect("/student")
    })
})

router.get("/add", (req, res) => {
    res.render("studentAddEdit", {
        functionText: "Add new student"
    })
})

router.post("/add", (req, res) => {
    var studentName = req.body.studentName;
    var studentAdNo = req.body.studentAdNo;
    var studentClass = req.body.studentClass;
    student.find({ studentAdNo: studentAdNo }).then(data => {
        if (data.length == 0) {
            student.insertMany({
                studentName: studentName,
                studentAdNo: studentAdNo,
                studentClass: studentClass
            }).then(data => {
                console.log(data);
                res.redirect("/student")
            })
        } else if (data.length > 0) {
            res.render("messagePage", {
                messageHeading: "Addmission Number Dupplication",
                messageDescription: "Addmission Number has already been used for another student"
            })
        }
    })
})

router.get("/delete/:id", (req, res) => {
    student.deleteOne({ studentAdNo: req.params.id }).then(data => {
        res.redirect("/student");

    })
})
module.exports = router;