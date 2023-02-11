const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: [true,'Email Requied']
    },
    address: String,
    phoneNumber: Number,
    description: String
})

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('Users', userSchema);
module.exports = User;