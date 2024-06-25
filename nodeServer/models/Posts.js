const mongoose = require("mongoose");

const likeAndUnlikeSchema = mongoose.Schema({userId: {type: mongoose.Schema.Types.ObjectId, ref: "users"}});

const commentSchema = mongoose.Schema({
    comment: String,
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users"}
});

const postsSchema = mongoose.Schema({
    title: String,
    description: String,
    postUrl: String,
    views: {
        type: Number,
        default: 0
    },
    like: {type: [likeAndUnlikeSchema], default: null},
    unLike: {type: [likeAndUnlikeSchema], default: null},
    comments: {type: [commentSchema], default: null},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
    complaintCount: {type: Number, default: 0}
});

const Posts = mongoose.model("Posts", postsSchema);

module.exports = Posts;