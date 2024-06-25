const express = require("express");
const Users = require("../models/Users");
const router = express.Router();
const multer = require("multer");
const csrf = require("../middleware/csrf");
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "public/uploads/stories");
    },
    filename: (req, file, cb)=>{
        const fileName = `posts_${Date.now()}_${file.originalname}`;
        cb(null, fileName);
    }
});
const uploads = multer({storage: storage});

router.get("/", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("Please give valid userid");
        }
        let notLateStoriesArray = [];

        user.stories.map(story=>{
            const storyTime = new Date(story.createdTime);
            const currentTime = new Date();
            const diffDay = (currentTime.getTime() - storyTime.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDay <= 1) {
                notLateStoriesArray.push(story);
            }
        });

        res.send(notLateStoriesArray);
    } catch (error) {
        console.log(error);
        
    }
});

router.post("/add", csrf, uploads.fields([{name: "storyUrl", maxCount: 1}]), async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("Please give valid userid");
        }
        
        const storyFile = req.files["storyUrl"][0];

        const storyUrl = `http://localhost:3000/uploads/stories/${storyFile.filename}`;
        user.stories.push({createdTime: Date.now(), storyUrl: storyUrl});

        await user.save();


        res.send(user);
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;