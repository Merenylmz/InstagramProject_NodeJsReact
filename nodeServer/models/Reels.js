const mongoose = require("mongoose");

const likeSchema = mongoose.Schema({userId: {type: mongoose.Schema.Types.ObjectId, ref: "users"}});
const commentSchema = mongoose.Schema({
    comment: String,
    user:{
        _id: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
        name: String,
        profilePhoto: String
    } 
});

const reelSchema = mongoose.Schema({
    title: String,
    description: String,
    reelsUrl: String,
    views: {type: Number, default: 0},
    like: {type: [likeSchema], default: []},
    comments: {type: [commentSchema], default: []},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users"}
});

const Reels = mongoose.model("Reels", reelSchema);

module.exports = Reels;