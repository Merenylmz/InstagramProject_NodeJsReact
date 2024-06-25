const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");
const Users = require("../models/Users");
const multer = require("multer");
const csrf = require("../middleware/csrf");
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "public/uploads/posts");
    },
    filename: (req, file, cb)=>{
        const fileName = `posts_${Date.now()}_${file.originalname}`;
        cb(null, fileName);
    }
});
const uploads = multer({storage: storage});

router.get("/homelist", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if(!user){return console.log("Kullanıcı bulunamadı");}
        const posts = await Posts.find({userId: {$in: user.following.map(f=>f.userId)}});

        res.send(posts);
    } catch (error) {
        console.log(error);
    }
});

router.get("/views", async(req, res)=>{
    try {
        const post = await Posts.findOne({_id: req.query.postid});
        if (!post) {
            return res.send("Please give valid postid");
        }
        post.views += 1;
        await post.save();

        res.send({viewsCount: post.views});
    } catch (error) {
        console.log(error);
    }
});

router.get("/like", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("Please give valid user id");
        }
        const post = await Posts.findOne({_id: req.query.postid});
        if (!post) {
            return res.send("Please give valid post id");
        }

        const postOwnerUser = await Users.findOne({_id: post.userId});
        if (!postOwnerUser) {return res.send("Postun Kullanıcısı Bulunamadı");}

        const isitUnlike = post.unLike.find(data=>data.userId == req.query.userid);
        if (isitUnlike) {
            const index = post.unLike.findIndex(data => data.userId == req.query.userid);
            post.unLike.splice(index, 1);
        } else {
            const isitLike = post.like.find(data=>data.userId == req.query.userid);
            console.log(isitLike);
            if (isitLike) {
                const index = post.like.findIndex(data=>data.userId == req.query.userid);
                post.like.splice(index, 1);
                await post.save();
                return res.send({likeCount: post.like.length, unLikeCount: post.unLike.length});
            } 
        }
        post.like.push({userId: user._id});
        postOwnerUser.notification.push({
            userId: req.query.userid,
            postId: req.query.postid,
            details: `${user.name} Kişisi Postunuzu beğendi.`
        });

        await post.save();
        await postOwnerUser.save();
        res.send({likeCount: post.like.length, unLikeCount: post.unLike.length});
    } catch (error) {
        console.log(error);
    }
});

router.get("/unlike", async(req, res)=>{
    try {
        const post = await Posts.findOne({_id: req.query.postid});
        if (!post) {
            return res.send("Please give valid post id");
        }
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("Please give valid user id");
        }

        const isitLike = post.like.find((data)=>data.userId == req.query.userid);
        if (isitLike) {
            const index = post.like.findIndex(data => data.userId == req.query.userid);
            post.like.splice(index, 1);
        } else {
            const isitUnLike = post.unLike.find(data=>data.userId == req.query.userid);
            if (isitUnLike) {
                const index = post.unLike.findIndex(data=>data.userId == req.query.userid);
                post.unLike.splice(index, 1);
                await post.save();
                return res.send({likeCount: post.like.length, unLikeCount: post.unLike.length});
            } 
        }
        post.unLike.push({userId: req.query.userid});
        await post.save();

        res.send({likeCount: post.like.length, unLikeCount: post.unLike.length});
    } catch (error) {
        console.log(error);
    } 
});

router.get("/", async(req, res)=>{
    try {
        const posts = await Posts.find()

        res.send(posts);
    } catch (error) {
        console.log(error);
    }
});

router.get("/:id", async(req, res)=>{
    try {
        const post = await Posts.findOne({_id: req.params.id});

        res.send(post);
    } catch (error) {
        console.log(error);
    }
});

router.post("/", csrf, uploads.fields([{name: "postUrl", maxCount:1}]) , async(req, res)=>{
    try {

        const postFile = req.files["postUrl"][0];

        const user = await Users.findOne({_id: req.query.userid});
        if (!user|| !postFile) {
            return res.send("Please try again");
        }

        const postUrl = `http://localhost:3000/uploads/posts/${postFile.filename}`;
        const newPost = new Posts({
            title: req.body.title,
            description: req.body.description,
            userId: req.query.userid,
            postUrl: postUrl
        });
        

        await newPost.save();

        user.posts.push(newPost._id);
        await user.save();


        res.send(newPost);
    } catch (error) {
        console.log(error);
    }
}); 

router.delete("/:id", async(req, res)=>{
    try{
        await Posts.findOneAndDelete({_id: req.params.id});

        res.send(true);
    } catch(error){
        console.log(error);
    }
});

router.put("/:id", csrf, uploads.fields([{name: "postUrl", maxCount: 1}]), async(req, res)=>{
    try {
        const postFile = req.files["postUrl"][0];
        const postUrl = `http://localhost:8000/api/uploads/posts/${postFile.fileName}`;

        const post = await Posts.findOneAndUpdate({_id: req.params.id}, {
            title: req.body.title,
            description: req.body.description,
            userId: req.query.userid,
            postUrl: postUrl
        });
        if (!post) {
            return res.send("please give valid postid");
        }

        
    } catch (error) {
        console.log(error);
    }
});

router.get("/user/:id", async(req, res)=>{
    try {
        const {id} = req.params;

        const user = await Users.findOne({_id: id});
        if (!user) {
            return res.send("user is not found");
        }

        const posts = await Posts.find({userId: id});

        res.send(posts);
    } catch (error) {
        console.log(error);
    }
});

router.post("/addcomments", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid});
        if (!user) {
            return res.send("Please give valid user info");
        }
        const post = await Posts.findOne({_id: req.query.postid});
        if (!post) {
            return res.send("Please give valid post info");
        }
        const postUser = await Users.findOne({_id: post.userId});
        if (!postUser) {
            return res.send("Please give valid post user");
        }

        post.comments.push({
            comment: req.body.comment,
            userId: req.query.userid
        });

        postUser.notification.push({
            userId: req.query.userid,
            postId: req.query.postid,
            details: `${user.name} kişisi Postunuza yorum yaptı`
        })
        await post.save();
        await postUser.save();


        res.send("Succesfully");
    } catch (error) {
        console.log(error);
    }
});



module.exports = router