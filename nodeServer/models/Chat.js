const mongoose = require("mongoose");


const chatSchema = mongoose.Schema({
    user1Id: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
    user2Id: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
    messages: {type: Array, default: []}
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;