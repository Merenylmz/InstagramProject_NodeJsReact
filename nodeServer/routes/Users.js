const express = require("express");
const Users = require("../models/Users");
const router = express.Router();
const Bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../helpers/sendMail");

router.post("/login", async(req, res)=>{
    try {
        const user = await Users.findOne({email: req.body.email});
        if (!user) {
            return res.send({isAuth: false, message: "User is not Found"});
        }

        const match = await Bcrypt.compare(req.body.password, user.password);
        if (match) {
            return res.send({isAuth: true, message: "Authenticated Successfully", user});
        }

        res.send({isAuth: false, message: "Login operation not successfully, please try valid info again"});
    } catch (error) {
        console.log(error);
    }
}); 

router.post("/register", async(req, res)=>{
    try {
        const user = await Users.findOne({email: req.body.email});
        if (user) {
            return res.send({isSuccess: false, message: "This user already exists"});
        }

        const hashedPassword = await Bcrypt.hash(req.body.password, 10);

        const newUser = new Users({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        await newUser.save();

        res.send({isSuccess: true, message: "New User is saved succesfully"});
    } catch (error) {
        console.log(error);
    }
});

router.post("/forgotpassword", async(req, res)=>{
    try {
        const user = await Users.findOne({email: req.body.email});
        if (!user) {
            return res.send("Please give valid userid");
        }

        const token = crypto.randomBytes(32).toString("hex");
        user.rememberToken = token;
        await user.save();

        await transporter.sendMail({
            from: "myma_ilsender@hotmail.com",
            to: req.body.email,
            subject: "Forgot Password Mail",
            html: `
                <h1>Forgot Password Mail</h1>
                <p>Şifrenizi değiştirmek için linke tıklayın</p>
                <a href="http://localhost:3000/auth/newpassword/${token}">Şifreni değiştir</a>
            `
        });

        res.send("Maile Bakın");
    } catch (error) {
        console.log(error);
    }
});

router.post("/newpassword/:token", async(req, res)=>{
    try {
        const user = await Users.findOne({rememberToken: req.params.token});
        if (!user) {
            return res.send("Please give valid userid");
        }
        
        user.password = await Bcrypt.hash(req.body.password, 11);
        user.rememberToken = null;
        await user.save()

        res.send({operation: true, message: "Successfully"});
    } catch (error) {
        console.log(error);
    }
});

router.get("/newfollowing", async(req, res)=>{
    try {
        let status = "Followed";
        const myuser = await Users.findOne({_id: req.query.myuserid});//takip etmek istiyen kişi
        if (!myuser) {
            return res.send("Kullanıcı bulunamadı");
        }
        const followingUser = await Users.findOne({_id: req.query.userid});//takip edilen kişi bu
        if (!followingUser) {
            return res.send("Kullanıcı bulunamadı");
        }

        const isitFollowing = myuser.following.some(f => f.userId == req.query.userid);
        const isitFollower = followingUser.follower.some(f => f.userId == req.query.myuserid);

        if (isitFollowing) {
            const index = myuser.following.findIndex(f =>f.userId == req.query.myuserid);
            myuser.following.splice(index, 1);
            
            if (isitFollower) {
                const num = followingUser.follower.findIndex(f=>f.userId == req.query.myuserid);
                followingUser.follower.splice(num, 1);
            }
            status = "Unfollowed";

        } else {
            myuser.following.push({userId: req.query.userid});
            followingUser.follower.push({userId: req.query.myuserid});
        }
        
        await myuser.save();
        await followingUser.save();

        res.send({myUser: myuser, user: followingUser, status});
    } catch (error) {
        console.log(error);
    }
});

router.get("/allusers", async(req, res)=>{
    try {
        const users = await Users.find().select("_id , name , profilePhoto");

        res.send(users);
    } catch (error) {
        console.log(error);
    }
});

router.get("/getfollowing", async(req, res)=>{
    try {
        const following = await Users.findOne({_id: req.query.userid}).select("following");

        res.send(following);
    } catch (error) {
        console.log(error);
    }
});

router.get("/search", async(req, res)=>{
    try {
        if (!req.query.searchtxt) {return res.send({message: "Lütfen aranacak bir kelime giriniz", isSuccess: false});}

        const users = await Users.find({
            name: {
                "$regex": `^${req.query.searchtxt}`,
                "$options": "i"
            }
        }).select("name , _id , profilePhoto , stories");

        if (!users) {
            return res.send({message: "Kullanıcı bulunamadı", isSuccess: false});
        }

        res.send({users, isSuccess: true});
    } catch (error) {
        console.log(error);
    }
});

router.get("/userdetails", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) { return res.send("User is not found"); }

        res.send(user);
    } catch (error) {
        console.log(error);
    }
}); 

router.get("/readnotification", async(req, res)=>{
    try {
       const user = await Users.findOne({_id: req.query.userid});
       user.notification.find(a=>a._id==req.query.notificationid).isRead = true;

       await user.save();

       res.send(user.notification);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;