const express = require("express");
const Users = require("../models/Users");
const router = express.Router();

router.get("/", async(req, res)=>{
    try {
        const user = await Users.findOne({_id: req.query.userid}).select("notification , name , email");
        if (!user) {
            return res.send("Please give valid user");
        }

        res.send(user);
    } catch (error) {
        console.log(error);
    }
});




module.exports = router;