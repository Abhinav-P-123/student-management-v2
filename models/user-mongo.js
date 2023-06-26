const mongoose = require("mongoose")
mongoose.connect(process.env.mongodbConnectionString);

var userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("user", userSchema);

