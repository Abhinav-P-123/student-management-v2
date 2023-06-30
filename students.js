const express = require("express"), app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const router = express.Router();
const student = require("./models/student-mongo")
const MongoStore = require("connect-mongo")
const localStrategy = require("passport-local")
const users = require("./models/user-mongo");
const bcrypt = require("bcrypt")
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"));

require("dotenv").config();

router.use(session({
    secret: process.env.SessionSecret,
    store: MongoStore.create({
        mongoUrl: process.env.mongodbConnectionString,
        touchAfter: 24 * 3600
    }),
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000
    },
    resave: false,
    saveUninitialized: true,
}))

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(
    (user, done) => {
        done(null, user);
    }
)

passport.deserializeUser(
    (user, done) => {
        users.find({ _id: user._id }).then(data => {
            done(null, data)
        })
    }
)

passport.use(new localStrategy(
    (username, password, done) => {
        users.find({ username: username }).then(data => {
            if (data.length > 0) {
                bcrypt.compare(password, data[0].password).then(
                    (res) => {
                        if (res == true) {
                            done(null, data[0]);
                        } else if (res == false) {
                            done(null, false)
                        }
                    })
            } else if (data.length == 0) {
                done(null, false)
            }
        })
    }
));

router.route("/login").get((req, res, next) => {
    if (req.isAuthenticated() == false) {
        return next();
    } else if (req.isUnauthenticated() == false) {
        res.redirect("/")
    }
}, (req, res) => {
    res.render("login")
}).post(passport.authenticate(
    "local", {
    successRedirect: "/",
    failureRedirect: "/login?error=true"
}
))

router.get("/", (req, res, next) => {
    if (req.isAuthenticated() == true) {
        return next();
    } else if (req.isUnauthenticated() == true) {
        res.redirect("/login")
    }
}, (req, res) => {
    student.find({ createdBy: req.session.passport.user.username }).then(students => {
        res.render("studentList", { students: students, searchString: "", })
    })
    console.log("User requested for all the students")
})

router.post("/search", (req, res) => {
    var studentName = req.body.studentName;
    student.find({ studentName: RegExp(studentName, "i"), createdBy: req.session.passport.user.username }).then(students => {
        res.render("studentList", {
            students: students, searchString: studentName,
        })
    })
    console.log(`User search for ${req.body.studentName} keywords`)
})

router.get("/update/:id", (req, res, next) => {
    if (req.isAuthenticated() == true) {
        return next();
    } else if (req.isUnauthenticated() == true) {
        res.redirect("/login")
    }
}, (req, res) => {
    var studentId = req.params.id;
    var studentName = req.body.studentName;
    var studentAdNo = req.body.studentAdNo;
    var studentClass = req.body.studentClass;
    console.log(req.body.studentName)
    student.findOne({ studentAdNo: studentId, createdBy: req.session.passport.user.username }).then(students => {
        res.render("studentAddEdit", {
            Name: students.studentName,
            AddmissionNumber: students.studentAdNo,
            Class: students.studentClass,
            functionText: "Update student"
        })
    })
    console.log("User requested for update page")
})

router.post("/update/:id", (req, res) => {
    var studentId = req.params.id;
    student.updateOne({ studentAdNo: studentId, createdBy: req.session.passport.user.username }, {
        studentName: req.body.studentName,
        studentAdNo: req.body.studentAdNo,
        studentClass: req.body.studentClass
    }).then(data => {
        res.redirect("/")
    })
    console.log(`User updated id ${req.params.id}`)
})

router.get("/add", (req, res, next) => {
    if (req.isAuthenticated() == true) {
        return next();
    } else if (req.isUnauthenticated() == true) {
        res.redirect("/login")
    }
}, (req, res) => {
    res.render("studentAddEdit", {
        functionText: "Add new student"
    })
})

router.post("/add", (req, res) => {
    var studentName = req.body.studentName;
    var studentAdNo = req.body.studentAdNo;
    var studentClass = req.body.studentClass;
    student.find({ studentAdNo: studentAdNo, createdBy: req.session.passport.user.username }).then(data => {
        if (data.length == 0) {
            student.insertMany({
                studentName: studentName,
                studentAdNo: studentAdNo,
                studentClass: studentClass,
                createdBy: req.session.passport.user.username,
            }).then(data => {
                console.log(data);
                res.redirect("/")
            })
        } else if (data.length > 0) {
            res.render("messagePage", {
                messageing: "Addmission Number Dupplication",
                messageDescription: "Addmission Number has already been used for another student"
            })
        }
    })
    console.log("User added a new student")
})

router.get("/delete/:id", (req, res, next) => {
    if (req.isAuthenticated() == true) {
        return next();
    } else if (req.isUnauthenticated() == true) {
        res.redirect("/login")
    }
}, (req, res) => {
    student.deleteOne({ studentAdNo: req.params.id, createdBy: req.session.passport.user.username }).then(data => {
        res.redirect("/");
    })
    console.log("User requsted for deletion of a student")
})

router.route("/signup").get((req, res, next) => {
    if (req.isAuthenticated() == false) {
        return next();
    } else if (req.isUnauthenticated() == false) {
        res.redirect("/")
    }
}, (req, res) => {
    res.render("signup", { error: "" })
}).post((req, res) => {
    users.find({ username: req.body.username }).then(data => {
        if (data.length == 0) {
            bcrypt.hash(req.body.password, 15).then(hash => {
                users.insertMany([{
                    username: req.body.username,
                    password: hash
                }])
            })
            console.log(`new user have been added username - ${req.body.username}`)
            res.redirect("/login")
        } else if (data.length > 0) {
            res.render("signup", { error: "username already exists" })
        }
    })
})

router.get("/logout", function (req, res) {
    req.logout((err) => {
        if (err) {
            console.log(err)
        }
        res.redirect('/');
    });
})

module.exports = router;