import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import Logo from "./Logo";



const Login =()=>{
    const [input,setInput] =useState({
        email:"",
        password:""
    });
    const [loading,setLoading] = useState(false);
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    const dispacth = useDispatch();


    const changeEventHandler =(e)=>{
        setInput({...input,[e.target.name]:e.target.value});
    };
    const signupHandler = async (e)=>{
        e.preventDefault();
        try {
        setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/user/login',input,{
                headers:{ 
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                dispacth(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    email:"",
                    password:""
                });
            }
        } catch (err) {
            console.log(err)
            toast.error(err.response.data.message);
        } finally{
            setLoading(false);
        }
    }
    useEffect(()=>{
         if(user){
            navigate("/");
         }
    },[]);
    return(
        <div className="flex items-center w-screen h-screen justify-center">
            <form onSubmit={signupHandler} className="shadow-lg flex flex-col gap-5 p-8">
                <div className="my-4">
                    {/* yaha par logo lagana hai svg me  */}
                    <div className="flex items-center justify-center">
                    <Logo/>
                    </div>

                    {/* yaha logo laga raha hu  */}
                    <p className="text-sm text-center">Login to see Photos & videos from your friends</p>
                </div>
                <div>
                    <span className=" font-medium">Email</span>
                    <Input 
                    type="email"
                    name="email"
                    value={input.email}
                    onChange={changeEventHandler}
                    className = "focus-visible:ring-transparent my-2"
                    />                    
                </div>
                <div>
                    <span className=" font-medium">Password</span>
                    <Input 
                    type="password"
                    name="password"
                    value={input.password}
                    onChange={changeEventHandler}
                    className = "focus-visible:ring-transparent my-2"
                    />                    
                </div> 
                {
                    loading ?(
                        <Button className="bg-logo">
                            <Loader2 className="mr-2 h-4 w-4 animate=spin "/>
                            Please wait..  
                        </Button>
                    ):(
                <Button type="submit" className='bg-logo rounded hover:bg-[#ff4d70]' >Login</Button>
                    )
                }
                <span className="text-center">Doesn't have an account <Link to="/signup" className="text-blue-600">Signup</Link> </span>
            </form>
        </div>
    )
} 

export default Login