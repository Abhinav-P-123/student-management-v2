const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.mongodbConnectionString);

var studentSchema = mongoose.Schema({
    studentName: {
        type: String,
        required: [true, "Please check the student name, the value cannot be empty"],
        maxLength: 26
    },
    studentAdNo: {
        type: String,
        required: [true, "Please check the student Addmission Number, the value cannot be empty"],
    },
    studentClass: {
        type: String,
        required: [true, "Please check the student class, the value cannot be empty"],
    },
    createdBy: {
        type: String,
        required: [true, "Please check the student class, the value cannot be empty"],
    }
})

module.exports = mongoose.model("student", studentSchema);

