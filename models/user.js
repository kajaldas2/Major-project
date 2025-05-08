const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// Apply the plugin to the SCHEMA, not the model
userSchema.plugin(passportLocalMongoose);

// Now create the model
module.exports = mongoose.model("User", userSchema);
