const mongoose = require('mongoose');
const { Schema } = mongoose;

const campsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true,'Password Requied']
    },
    recentActivity: [{
        type: Schema.Types.ObjectId,
        ref: 'Posts'
    }],
    address: String,
    phoneNumber: Number,
    description: String,
})

const Camps = mongoose.model('Camps', campsSchema);
module.exports = Camps;