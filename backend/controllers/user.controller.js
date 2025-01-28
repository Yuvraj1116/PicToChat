import { User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDatauri from "../utils/dataurl.js";
import cloudinary from "../utils/cloudinary.js";
import {Post} from "../models/post.model.js";

//Register page code
export  const register = async(req,res)=>{
    try{
        const {username,email,password} = req.body;
        if(!username||!email||!password){
            return res.status(401).json({
                message:"Something Went Wrong,please Check",
                success:false
            });
        };
        let  user = await User.findOne({email});
        if(user){
            return res.status(401).json({
                message:"Try another email account",
                success:false
            });
        };
        const hashedPassword = await bcrypt.hash(password,10);
        await User.create({
            username,
            email,
            password:hashedPassword,
        });
        return res.status(201).json({
            message:"Account Created Successfully.",
            success:true,
        });


    } catch(err){
        console.log(err);       
    };
};

//Login page Code 

export const login = async(req,res)=>{
    try{    
        const{email,password} = req.body;
        if(!email||!password){
            return res.status(401).json({
                message:"Something Went Wrong,please Check",
                success:false
            });
        };
        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false
            });
        };
        const isPassword = await bcrypt.compare(password,user.password);
        if(!isPassword){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false
            });   
        };

            //Coookie Token
            const token = await jwt.sign({userId:user._id},process.env.SECRET_kEY,{expiresIn:'1d'});

            //populate each post id in the posts array
            const populatedPosts = await Promise.all(
                user.posts.map( async (postId)=>{
                    const post = await  Post.findById(postId);
                    if(post.author.equals(user._id)){
                        return post
                    }
                    return null;
                })
            )
            user = {
                    _id:user._id,
                    username:user.username,
                    email:user.email,
                    profilePicture:user.profilePicture,
                    bio:user.bio,
                    followers:user.followers,
                    following:user.following,
                    posts:populatedPosts,
            }

        return res.cookie('token',token, {httpOnly:true,sameSite:'strict',maxAge:1*24*60*60*1000}).json({
            message:`Welcome back ${user.username}`,
            success:true,
            user
        });
    }catch(err){
        console.log(err)
    }

};

//Logout page Code

export const logout = async(req,res) => {
    try {
            return res.cookie("token","", {maxAge:0}).json({
                message:"Logged Out Successfully",
                success:true,
            }); 
    } catch (err) {
        console.log(err)
    }
};

// Get Profile

export const getprofile = async(req,res)=>{
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts',createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,
            success:true,
        });
    } catch (err) { 
        console.log(err);
    }
};

//Edit Profile

export const editProfile = async(req,res)=>{
    try {
        const userId = req.id;
        const{bio,gender,} = req.body;
        const profilePicture = req.file
        let cloudResponse;
        if(profilePicture){
            const fileuri =  getDatauri(profilePicture); 
            cloudResponse =  await cloudinary.uploader.upload(fileuri);
        } 
        const user = await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({
                message:"User Not Found",
                success:false,
            })
        } ;

        if(bio) user.bio = bio;
        if(gender) user.gender = gender

        if(profilePicture) user.profilePicture = cloudResponse.secure_url; 

        await user.save();
        return res.status(200).json({
            message:"Profile Updated",
            success:true,
            user  
        });
    } catch (err) {
        console.log(err);
    }
}

//Suggeset User Code....

export const getSuggestedUsers = async(req,res)=>{
    try {
        const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUsers){
            return res.status(400).json({
                message:"Currently don't have any users",
            })
        };
        return res.status(200).json({
            success:true,
            users:suggestedUsers,       
    })
    } catch (err) {
        console.log(err);
    }
};

//Follow or unfollow code

export const followOrUnfollow = async(req,res)=>{
    try {
        const followkarnewala = req.id;
        const jiskokarunga = req.params.id;
        if(followkarnewala === jiskokarunga){
            return res.status(400).json({
                message:"You can't follow/unfollow Yourself",
                success: false 
            });
        }
        const user = await User.findById(followkarnewala);
        const targetUser = await User.findById(jiskokarunga);

        if(!user||!targetUser){
            return res.status(400).json({
                message:"User not Found",
                success: false 
            });         
        }
        // now i check Follow Krana Hai YA Unfollow

        const isFollowing  =user.following.includes(jiskokarunga);
        if(isFollowing){
            //unfollow Logic Code
            await Promise.all([
                User.updateOne({_id:followkarnewala},{$pull:{following:jiskokarunga}}),
                User.updateOne({_id:jiskokarunga},{$pull:{following:followkarnewala}}),
            ]);
        return res.status(200).json({message:'Unfollowed  Succwssfully',success:true})
        }else{
            //Follow Logic Code
            await Promise.all([
                User.updateOne({_id:followkarnewala},{$push:{following:jiskokarunga}}),
                User.updateOne({_id:jiskokarunga},{$push:{followers:followkarnewala}}),
            ]);
        return res.status(200).json({message:'followed Successfully',success:true})

        }

    } catch (err) {
        console.log(err)
    }
} 
