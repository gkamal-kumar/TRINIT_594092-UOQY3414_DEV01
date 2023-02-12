const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    title: {
        type:String
    },
    message: {
        type:String
    },
    sender: {
        type: Schema.Types.ObjectId,
         ref: 'Camps'
    },
    user: [{
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }],
    money: [{
        type: Number
    }]
  
})

const Posts = mongoose.model('Posts', postSchema);
module.exports = Posts;