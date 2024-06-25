const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const readline = require("readline");
const csrf = require("csurf");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const MongoDBStore = require("connect-mongodb-session")(expressSession);
const cors = require("cors");

const postRoutes = require("./routes/Posts");
const reelsRoutes = require("./routes/Reels");
const userRoutes = require("./routes/Users");
const storiesRoutes = require("./routes/Stories");
const chatRoutes = require("./routes/Chat");
const notificationRoutes = require("./routes/Notification");

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({
    secret: "helloworld",
    resave: false,
    saveUninitialized: false,
    store: new MongoDBStore({
        uri: "mongodb+srv://eren28:28eren57@cluster0.n2gcnhz.mongodb.net/instagramDb?retryWrites=true&w=majority",
        collection: "Sessions"
    }),
    cookie: {maxAge: 1000 * 60 * 60 * 24}
}));
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
// app.use(csrf());



app.use("/posts", postRoutes);
app.use("/auth", userRoutes);
app.use("/stories", storiesRoutes);
app.use("/reels", reelsRoutes);
app.use("/chats", chatRoutes);
app.use("/notification", notificationRoutes);

app.use("/uploads/posts", express.static(path.join(__dirname, "public/uploads/posts")));
app.use("/uploads/reels", express.static(path.join(__dirname, "public/uploads/reels")));
app.use("/uploads/stories", express.static(path.join(__dirname, "public/uploads/stories")));

app.get("/", (req, res)=>{
    res.locals.csrfToken = req.csrfToken();
    res.send(res.locals);
});


// var rl = readline.createInterface({input: process.stdin, output: process.stdout});
// rl.question("Do you want to connect mongodb \ny/n: ", (answer)=>{
//     if (answer == "y") {
        
//     } else{
//         console.log("I'm waiting");
//     }
// });
mongoose.connect("mongodb+srv://eren28:28eren57@cluster0.n2gcnhz.mongodb.net/instagramDb?retryWrites=true&w=majority")
    .then(()=>{
        console.log("Mongodb connected");
        app.listen(3000, ()=>console.log("Listening a port 3000"));
    }).catch((e)=>console.log("connection failed", e));

