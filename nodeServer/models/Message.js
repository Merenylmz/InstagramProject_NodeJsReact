const mongoose = require("mongoose");
const messageSchema = mongoose.Schema({
    chatId: {type: mongoose.Schema.Types.ObjectId, ref: "chat"},
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "users"},
    body: String,
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;