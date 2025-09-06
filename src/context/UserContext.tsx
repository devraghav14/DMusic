/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import toast, {Toaster } from 'react-hot-toast';
import { USER_SERVICE } from "../serviceUrls";

const server = `${USER_SERVICE}`;

export interface User{
    _id : string,
    name : string,
    email : string,
    role : string,
    playlist : string[],
}

interface UserContextType{
    user : User | null,
    isAuth : boolean,
    loading : boolean,
    btnLoading : boolean,
    loginUser : (
        email : string,
        password : string,
        navigate : (path : string) => void,
    ) => Promise<void>,
    registerUser : (
        name: string,
        email : string,
        password : string,
        navigate : (path : string) => void,
    ) => Promise<void>,
    addToPlaylist : (id : string) => void,
    logoutUser : () => Promise<void>,
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps{
    children : ReactNode
}

export const UserProvider : React.FC<UserProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);

    async function registerUser(name:string, email:string, password : string, navigate:(path:string) => void) {
        setBtnLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/v1/user/register`,{
                name,email, password
            });
            toast.success(data.message);
            localStorage.setItem("token", data.token);
            setUser(data.user);
            setIsAuth(true);
            setBtnLoading(false);
            navigate("/");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error : any) {
            toast.error(error.response?.data?.message || "An error occured while signing/logging in");
            setBtnLoading(false);
        }
    }

    async function loginUser(email:string, password : string, navigate:(path:string) => void) {
        setBtnLoading(true);
        try {
            const {data} = await axios.post(`${server}/api/v1/user/login`,{
                email, password
            });
            toast.success(data.message);
            localStorage.setItem("token", data.token);
            setUser(data.user);
            setIsAuth(true);
            setBtnLoading(false);
            navigate("/");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error : any) {
            toast.error(error.response?.data?.message || "An error occured while signing/logging in");
            setBtnLoading(false);
        }
    }

    async function fetchUser() {
        try {
            const {data} = await axios.get(`${server}/api/v1/user/me`, {
                headers: {
                    token : localStorage.getItem("token"),
                },
            });
            setUser(data);
            setIsAuth(true);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function logoutUser() {
        localStorage.clear();
        setUser(null);
        setIsAuth(false);

        toast.success("User logged out successfully!");
    }

    async function addToPlaylist(id : string){
        try {
            const {data} = await axios.post(`${server}/api/v1/song/${id}`,{},{
                headers:{
                    token : localStorage.getItem("token")
                },
            });
            toast.success(data.message);
            fetchUser();
            return data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error : any) {
            toast.error(error?.response?.data?.message || "An error occured");
        }
    }

    useEffect(() => {
        fetchUser();
    },[]);


    return <UserContext.Provider value={{user , isAuth, loading, btnLoading, loginUser, registerUser, logoutUser, addToPlaylist}}>
        {children}
        <Toaster/>
        </UserContext.Provider>
}

export const useUserData = () : UserContextType => {
    const context = useContext(UserContext);
    if(!context){
        throw new Error("useUserData must be used within user context provider.")
    }
    return context;
}