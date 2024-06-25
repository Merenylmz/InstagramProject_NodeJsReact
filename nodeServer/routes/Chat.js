const express = require("express");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Users = require("../models/Users");
const router = express.Router();


router.post("/newchat", async(req, res)=>{
    try {
        const user1 = await Users.findOne({_id: req.query.user1id});
        const user2 = await Users.findOne({_id: req.query.user2id});
        
        if (user1.chats.some((c)=>c.toUser._id == req.query.user2id) || user2.chats.some((c)=>c.toUser._id == req.query.user1id)) {
            return res.send({message: "This Chat is Already exists", status: false});
        } 

        const newChat = new Chat({
            user1Id: req.query.user1id,
            user2Id: req.query.user2id
        });

        await newChat.save();

        user1.chats.push({chatId: newChat._id, toUser: {_id: req.query.user2id, name: user2.name, profilePhoto: user2.profilePhoto}});
        await user1.save();

        user2.chats.push({chatId: newChat._id, toUser: {_id: req.query.user1id, name: user1.name, profilePhoto: user1.profilePhoto}});
        await user2.save();


        res.send({newChat, status: true});
    } catch (error) {
        console.log(error);
    }
});

router.post("/send", async(req, res)=>{
    try {
        const chat = await Chat.findOne({_id: req.query.chatid});
        if(!chat){console.log("Chat's not found");}

        const newMessage = new Message({
            chatId: req.query.chatid,
            senderId: req.query.senderid,
            receiverId: req.query.receiverid,
            body: req.body.message
        });

        const receiverUser = await Users.findOne({_id: req.query.receiverid});
        if (!receiverUser) {
            return res.send("Mesajı alan kullanıcı bulunamadı");
        }
        receiverUser.notification.push({
            userId: req.query.senderid,
            postId: null,
            details: "Bir mesajınız var"
        });


        chat.messages.push({
            senderId: req.query.senderid,
            message: req.body.message
        });

        await newMessage.save();
        await chat.save();
        await receiverUser.save();


        res.send({dbMessage: newMessage, message: req.body.message});
    } catch (error) {
        console.log(error);
    }
});

router.get("/getmessage", async(req, res)=>{
    try {
        const chat = await Chat.findOne({_id: req.query.chatid});
        if (!chat) {
            return res.send("Chat is not Found");
        }

        res.send(chat);
    } catch (error) {
        console.log(error);
    }
});

router.get("/getchats", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("user is not found");
        }

        res.send(user.chats);
    } catch (error) {
        console.log(error);
    }
});



module.exports = router;