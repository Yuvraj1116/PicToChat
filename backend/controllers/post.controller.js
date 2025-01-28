import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import {Post} from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(400).json({ message: 'Image required', })
        }

        //image Upload process Code
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        //image converted buffer to data uri/url 
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });

        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: "New Post Added",
            post,
            success: true
        });

    } catch (err) {
        console.log(err);
    }
}

//Get all Post 

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (err) {
        console.log(err)
    }
};

// users Post

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'useranme,profilePicture'
            })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username,profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        });

    } catch (err) {
        console.log(err);
    }
}

//Like Posts Code

export const likePost = async (req, res) => {
    try {
        const likeKarnewalaUserkiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            }); 
        }

        //Like Logic code 
        await post.updateOne({ $addToSet: { likes: likeKarnewalaUserkiId } });

        await post.save();

        //implement Socket Io For real Time Notification
        const user = await User.findById(likeKarnewalaUserkiId).select('username profilePicture')
        const postOwnerId = post.author.toString();
        if(postOwnerId != likeKarnewalaUserkiId){
            //emit notifiction event
            const notification = {
                type:'like',
                userId:likeKarnewalaUserkiId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }

        return res.status(200).json({
            message:'Post Liked',
            success:true
        });

    } catch (err) {
        console.log(err)
    }
}

//DisLike
export const dislikePost = async (req, res) => {
    try {
        const likeKarnewalaUserkiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            }); 
        }

        //disLike Logic code 
        await post.updateOne({ $pull: { likes: likeKarnewalaUserkiId } });

        await post.save();

        //implement Socket Io For real Time Notification
        const user = await User.findById(likeKarnewalaUserkiId).select('username profilePicture')
        const postOwnerId = post.author.toString();
        if(postOwnerId != likeKarnewalaUserkiId){
            //emit notifiction event
            const notification = {
                type:'dislike',
                userId:likeKarnewalaUserkiId,
                userDeatil:user,
                postId,
                message:'Your post was disliked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }



        return res.status(200).json({
            message:'Post Disliked',
            success:true
        });

    } catch (err) {
        console.log(err)
    }
}

// Add Comment      

export const addComment = async(req,res)=>{
    try {
        const postId = req.params.id;
        const commentKarneWalaUserKiId = req.id;


        const{text} = req.body;
        const post = await Post.findById(postId);
        if(!text){
            res.status(400).json({
                message:"text is Required",
                success:false,
            })
        };
        
        const comment = await Comment.create({
            text,
            author:commentKarneWalaUserKiId,
            post:postId
        }); 

         await comment.populate({
            path:'author',
            select:'username profilePicture'
        });


        post.comments.push(comment._id);
        await post.save();
        
        return res.status(201).json({
            message:'Comment added',
            comment,
            success:true
        })        
    } catch (err) {
        console.log(err);
    }
};

// Har Ek Post ke According  specific Comments 

export const getCommentOfPost = async(req,res)=>{

    try {
    const postId = req.params.id;
    
    
    const comments = await Comment.find({post:postId}).populate('author','username  profilePicture');

    if(!comments){
        return res.status(404).json({
            message:"Nom Comments Found",
            success:false
        });    
    }

    return res.status(200).json({success:true,comments});

    } catch (err) {
        console.log(err)
    }
}


// Delete Post from author user

export const deletePost = async(req,res)=>{
    try {
    const postId = req.params.id;
    const authorId = req.id;
    
    const post = await Post.findById(postId);
    if(!post){return res.status(404).json({message:'Page not Found',success:false})}

        //Check if the logged-in user is the Author of the Post 

        if(post.author.toString() != authorId){
            return res.status(403).json({
                message:'You are not the owner of this account',
                success:false
            });  
        }
        //Delete Post
        await Post.findByIdAndDelete(postId);

        // remove post Id From User Model
         let user = await User.findById(authorId);
         user.posts = user.posts.filter(id =>id.toString() != postId);
           await  user.save();
        // delete Posts comment whose connected to the post
          await Comment.deleteMany({post:postId});
          
          return res.status(200).json({
            message:'Post deleted',
            success:true
          });
           
        } catch (err) {
        console.log(err)
    }
}


//Bookmark/ Saved 

export const bookmarkPost = async(req,res)=>{
    try {
        let postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);

        if(!post){
            return res.status(400).json({
                message:"Post Not Found",
                success:false
            });
        }

        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            //if Post are allready saved then remove from bookmark code
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark',success:true});

        }else{
            //if Post are not saved then bookmark code
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post  bookmarked',success:true});

        }

    } catch (err) {
        console.log(err);
    }
}