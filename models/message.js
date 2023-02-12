const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    message: {
        type:String,
    },
    senderid: {
        type: Schema.Types.ObjectId,
         ref: 'Camps',
    },
    receiverid: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    } 
})

const Msg = mongoose.model('Msg', messageSchema);
module.exports = Msg;