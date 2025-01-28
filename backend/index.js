import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app,server} from "./socket/socket.js";
import path from "path";
 
dotenv.config({});

const __dirname = path.resolve();

// Middlewares
app.use(urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.json());
const corsOption ={
    origin:process.env.URL,
    credentials:true
}
app.use(cors(corsOption));  
//Routes
 app.use("/api/v1/user",userRoute);
 app.use("/api/v1/post",postRoute);
 app.use("/api/v1/message",messageRoute);

app.use(express.static(path.join(__dirname,"/frontend/dist")));


app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
});


//server start
 server.listen(8080,()=>{
    connectDB()
    console.log("server is listining to port 8080");
})