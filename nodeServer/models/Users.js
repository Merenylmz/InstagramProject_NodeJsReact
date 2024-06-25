const mongoose = require("mongoose");

const postsSchema = mongoose.Schema({postId: {type: mongoose.Schema.Types.ObjectId, ref: "posts"}});
const reelsSchema = mongoose.Schema({reelId: {type: mongoose.Schema.Types.ObjectId, ref: "reels"}});
const savedPostSchema = mongoose.Schema({videoId: {type: mongoose.Schema.Types.ObjectId}});
const followerAndFollowingSchema = mongoose.Schema({userId: {type: mongoose.Schema.Types.ObjectId, ref: "users"}});
const storySchema = mongoose.Schema({storyUrl: String, title: String, createdTime: {type: Date, default: Date.now()}});
const chatsSchema = mongoose.Schema({
    chatId: {type: mongoose.Schema.Types.ObjectId, ref: "chats"}, 
    toUser: {_id: {type: mongoose.Schema.Types.ObjectId, ref: "users"}, 
    name: String, 
    profilePhoto: {type: String, nullable: true}}});

const notificationSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users"}, 
    postId: {type: mongoose.Schema.Types.ObjectId, ref: "posts"}, 
    isRead: {default: false, type: Boolean}, 
    details: {nullable: true, type: String}});

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    profilePhoto: {type: String, default: null},
    bioTxt: {type: String, default: null},
    isAdmin: {type: Boolean, default: false},
    stories: {type: [storySchema], default: []},
    posts: {type: [postsSchema], default: []},
    reels: {type: [reelsSchema], default: []},
    savedPost: {type: [savedPostSchema], default: []},
    chats: {type: [chatsSchema], default: []},
    follower: {type: [followerAndFollowingSchema], default: []},
    following: {type: [followerAndFollowingSchema], default: []},
    notification: {type: [notificationSchema], default: []},
    rememberToken: {type: String, default: null}
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;