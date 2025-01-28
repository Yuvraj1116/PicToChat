import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";

const Profile = () => {
    const params = useParams();
    const userId = params.id;
    useGetUserProfile(userId);
    const [activeTab,setActiveTab] = useState('posts');


    const { userProfile,user } = useSelector(store => store.auth);

    const isLoggedInUserProfile= user?._id == userProfile?._id;
    const isFollowing = false;

    const handleTabChange = (tab)=>{
        setActiveTab(tab);
    }

    const displayedPost = activeTab=='posts' ? userProfile?.posts : userProfile?.bookmarks;

    return (
        <div className="flex max-w-4xl justify-center mx-auto pl-10">
            <div className="flex flex-col gap-20 p-8">
                <div className="grid grid-cols-2 ">
                    <section className="flex items-center justify-center">
                        <Avatar className='h-32 w-32' >
                            <AvatarImage src={userProfile?.profilePicture} alt='ProfilePicture' />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </section>
                    <section>
                        <div className="flex flex-col gap-5">
                            <div className="flex item-center gap-4">
                            <span>{userProfile?.username}</span>
                            {
                                isLoggedInUserProfile? (
                            <>
                            <Link to="/account/edit"><Button variant='secondary' className=' hover:bggray-200 h-8'>Edit profile</Button></Link> 
                            <Button variant='secondary' className=' hover:bggray-200 h-8'>View arcive</Button>
                            <Button variant='secondary' className=' hover:bggray-200 h-8'>Ad tools</Button>
                            </>    
                             ): (
                                isFollowing ?(
                                    <>
                                    <Button variant='secondary' className='h-8 rounded' >Unfollow</Button>    
                                    <Button variant='secondary' className='h-8 rounded' >Message</Button>
                                    </>    
                                ):(
                                <Button className='bg-[#0095f6] hover:bg-[#3192d2] h-8 rounded' >Follow</Button>
                                )
                             )

                            }
                            </div>
                            <div className="flex items-center gap-5">
                                <p> <span className="font-semibold">{userProfile?.posts.length}</span>posts</p>
                                <p> <span className="font-semibold">{userProfile?.followers.length}</span>followers</p>
                                <p> <span className="font-semibold">{userProfile?.following.length}</span>following</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="font-semibold">{userProfile?.bio || "Bio Here"}</span>
                                <Badge className='w-fit ' variant='secondary'><AtSign/> <sapn className='pl-1'>{userProfile?.username}</sapn> </Badge>
                                <span> I Am The Devloper 👨‍💻</span>
                                <span> ❤️ Coding Anthusiast </span>
                                <sapn> Night Mode On 🌗🌑🌓</sapn>
                            </div>
                        </div>
                    </section>
                </div>
                    <div className="border-t border-t-gray-200">
                        <div className="flex items-center justify-center gap-10 text-sm">
                            <span className={`py-3 cursor-pointer ${activeTab == 'posts' ? 'font-bold':''}`} onClick={()=>handleTabChange('posts')}>POSTS</span>
                            <span className={`py-3 cursor-pointer ${activeTab == 'saved' ? 'font-bold':''}`} onClick={()=>handleTabChange('saved')} >SAVED</span>
                            <span className="py-3 cursor-pointer">REELS</span>
                            <span className="py-3 cursor-pointer">TAG</span>
                        </div>
                            <div className="grid grid-cols-3 gap-1">
                                {
                                    displayedPost?.map((post)=>{
                                        return(
                                            <div key={post?._id} className="relative group cursor-pointer">
                                                <img src={post.image}  alt="PostImage" className="rounded my-2 w-full h-64 aspect-squre object-cover"/>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded transition-opacity duration-300">
                                                    <div className="flex items-center text-white space-x-4"> 
                                                        <button className='flex items-center gap-2 hover:text-gray-300'>
                                                            <Heart/>
                                                            <span>{post?.likes.length}</span>
                                                        </button>
                                                        <button className='flex items-center gap-2 hover:text-gray-300'>
                                                            <MessageCircle/>
                                                            <span>{post?.comments.length}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>

                    </div>
            </div>
        </div>
    )
}

export default Profile