const express = require("express");
const router = express.Router();
const Reels = require("../models/Reels");
const Users = require("../models/Users");
const multer = require("multer");
const csrf = require("../middleware/csrf");
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "public/uploads/reels");
    },
    filename: (req, file, cb)=>{
        const fileName = `posts_${Date.now()}_${file.originalname}`;
        cb(null, fileName);
    }
});
const uploads = multer({storage: storage});

router.get("/", async(req, res)=>{
    try {
        const reels = await Reels.find().skip(req.query.offset).limit(1);
        
        res.send(reels[0]);
    } catch (error) {
        console.log(error);
    }
});

router.post("/", csrf, uploads.fields([{name: "reelsUrl", maxCount: 1}]), async(req, res)=>{
    try {
        const reelsFile = req.files["reelsUrl"][0];
        const user = Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("Please give valid userid");
        }
        const reelsUrl = `http://localhost:3000/uploads/reels/${reelsFile.filename}`;
        const newReels = new Reels({
            title: req.body.title,
            description: req.body.description,
            reelsUrl: reelsUrl,
            userId: req.query.userid
        });
        await newReels.save();

        res.send(newReels);
    } catch (error) {
        console.log(error);
    }
});

router.delete("/{reelsid}", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("Please give valid userid");
        }

        await Reels.findOneAndDelete({_id: req.params.reelsid});

        res.send(true);
    } catch (error) {
        console.log(error);
    }
});

router.get("/like", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("Please give valid userid");
        }
        const reel = await Reels.findOne({_id: req.query.reelsid});
        if (!reel) {
            return res.send("Please give valid reelid");
        }

        const isItLike = reel.like.find((data)=>data.userId == req.query.userid);
        if (isItLike) {
            const index = reel.like.findIndex(data=>data.userId == req.query.userid);
            reel.like.splice(index, 1);
        } else {
            reel.like.push({userId: req.query.userid});
        }
        await reel.save();

        res.send({likeCount: reel.like.length});
    } catch (error) {
        console.log(error);
    }
});

router.get("/views", async(req, res)=>{
    try {
        const reel = await Reels.findOne({_id: req.query.reelid});
        if (!reel) {
            return res.send("Please give valid reelid");
        }

        reel.views += 1;

        await reel.save();

        res.send({views: reel.views});
    } catch (error) {
        console.log(error);
    }
});

router.post("/addcomment", async(req, res)=>{
    try {
        const reels = await Reels.findOne({_id: req.query.reelsid});
        const user = await Users.findOne({_id: req.query.userid});
        if (!reels) { return res.send({message: "reels is not found", status: false})}

        reels.comments.push({comment: req.body.comment, user:{
            _id: req.query.userid,
            name: user.name,
            profilePhoto: user.profilePhoto
        }});

        await reels.save();

        res.send(reels);
    } catch (error) {
        console.log(error);
    }
});

router.get("/addsaved", async(req, res)=>{
    try {
        const reels = await Reels.findOne({_id: req.query.reelsid}).select("title , userId");
        if (!reels) {return res.send("Reel is not found");}

        const user = await Users.findOne({_id: req.query.userid}).select("name , email , savedPost");
        if (!user) {return res.send("User is not found");}


        const index = user.savedPost.findIndex(s=>s.videoId == req.query.reelsid);
        if (index != -1) {
            user.savedPost.splice(index, 1);
        } else{
            user.savedPost.push({videoId: req.query.reelsid});
        }

        await user.save();

        res.send({user, reels});
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;