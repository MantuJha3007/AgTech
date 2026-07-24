const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email must be unique"]
    },
    password:{
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        enum: ['landowner', 'tenant'],
        required: [true, "Role is required"]
    },
    location: {
        type: String,
        required: [true, "Location is required"]
    },
    verified:{
        type: Boolean,
        default: false
    }
})

const userModel = mongoose.model("users", userSchema)

module.exports = userModel;