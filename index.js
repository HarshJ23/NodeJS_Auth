// // const http = require("http")
// import http from "http"
// import gf from "./feature.js";
// import {gf2 , gf3} from "./feature.js"
// import {generateLove} from "./feature.js";
// import fs from "fs";


//  const about = fs.readFile("./index.html" , ()=>{
//     console.log("File read");
// })

// console.log(about);

// // const gf = require("./feature")
// console.log(gf);
// console.log(gf2);
// console.log(gf3);
// console.log(generateLove());
           
// const server = http.createServer((req , res)=>{
//     console.log(req.method);
// //   console.log(req.url);
// // res.end("<p>Noiceee</p>")
// if(req.url ==="/"){
//     res.end(`<h1> love is ${generateLove()}</h1>`)
// }
// else if(req.url ==="/about"){
//     res.end("<p>About page</p>")
// }
// else{
//     res.end("<p>Page not found</p>")
// }
// })

// server.listen(5000,()=>{
//     console.log("server is working");
// })


// Express.js
import express from 'express';
import path from 'path';
import mongoose from 'mongoose'; 
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken"; 
import bcrypt from "bcrypt"; 




mongoose.connect("mongodb://127.0.0.1:27017" ,{
    dBName: "backend", 
}).then(()=>console.log("database connected")).catch((e)=>console.log(e));

// to add data in database , first we need to create schemas
const messageSchema = new mongoose.Schema({
    name : String , 
    email : String , 
});

// to add user , create new schema 
const userSchema = new mongoose.Schema({
    name:String , 
    email : String , 
    password : String,
})

// create a model for user collection 
const User = mongoose.model("User" , userSchema);

// after creating schemas , create model :- basically a collection.
const Message = mongoose.model("Message"  , messageSchema) 


// line 52 is creation of our server with Express.JS 
const app = express();
const users = [];

        // using middlewares(line 57 and 60)
// using .use to serve static folder - public
app.use(express.static(path.join(path.resolve() , "public")));

// this middleware is used to access formdata
app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

// setting up view engine for express.js
app.set("view engine"  , "ejs");

const isAuthenticated = async (req , res , next)=>{
const {token} = req.cookies;
if(token){
    const decoded = jwt.verify(token , "jdsandnjnn");
   req.user = await User.findById(decoded._id);
    next();
}
else{
    res.redirect("/login");
}
}

app.post("/login"  , async (req, res)=>{
    const { name , email , password} = req.body;

    let user = await User.findOne({email});
    if(!user){
     return res.redirect("/register");
    }

    const isMatch = await bcrypt.compare(password , user.password);
    if(!isMatch){
        return res.render("login" , { email , message:"Incorrect Password"});
    }
    // res.redirect("/logout" , {name});
    const token = jwt.sign({_id : user._id}, "jdsandnjnn" );
    console.log(token);
    
    // name of cookie is "token" and it's value is user._id 
    res.cookie("token", token ,{
        httpOnly: true ,
    });
    
    res.redirect("/");
})



// function for register 
app.post("/register" ,  async (req , res)=>{
    const {name , email , password} = req.body;
    console.log(req.body);
    let user = await User.findOne({email});
    
    if(user){
        return res.redirect("/login");
    }
    
    // password is hashed before it is stored in database.
    const hashedPassword = await bcrypt.hash(password , 10);

    user = await User.create({
        name, 
        email ,
        password : hashedPassword , 
    });
    
    const token = jwt.sign({_id : user._id}, "jdsandnjnn" );
    console.log(token);
    
    // name of cookie is "token" and it's value is user._id 
    res.cookie("token", token ,{
        httpOnly: true ,
    });
    res.redirect("/");
})

// line 45 is doing the function of line 21
app.get("/" , isAuthenticated ,  (req , res)=>{
console.log(req.user);
    res.render("logout.ejs" , {name:req.user.name});

});


app.get("/register" ,   (req , res)=>{
        res.render("register.ejs");
    });


app.get("/login" , (req, res)=>{
    res.render("login.ejs");
})


// function for logout
app.get( "/logout" , (req, res)=>{
    res.cookie("token" , null ,{
        expires:new Date(Date.now()),
    });

   res.redirect("/");
})





// this api code for getting the form responses in the console.
// once contact endpoint is hit , below code will run , post method


// app.get("/add" , (req , res)=>{
//     await Message.create({name: "Harsh" , email:"hajwajiwar@gmail.com"});
//         res.send("nice");
        
//     })



// users page will show form data in json format



// listening of server to see ; 5000 is the localhost number.
app.listen(5000 , ()=>{
    console.log("Server is working");
})