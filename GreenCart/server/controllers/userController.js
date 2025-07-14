import User from "../models/User.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// register User :/api/user/register

export const register = async (req, res)=> {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.json({
                success: false,
                message: "missing Details"
            })
        }
        
        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.json({
                success: false,
                message: "User Already Exist"
            }) 
        }

        const hashedPassword = await bcrypt.hash(password, 5)

        const user = await User.create({name, email, password: hashedPassword})

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})

        res.cookie('token', token, {
            httpOnly: true, //Prevent Javascript to access cookie
            secure: process.env.NODE_ENV === "production", //use Secure cookie in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //CSFR protection
            maxAge: 7 * 24 * 60 * 60 * 1000 // Expire in & days
        })

        return res.json({
                success: true,
                user: {
                    email: user.email,
                    name: user.name
                }
            }) 

    } catch (error) {
        console.log(error.message)
        return res.json({
                success: false,
                message: error.message
            }) 
    }
}

// Login User: /api/user/login

export const login = async (req, res)=> {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.json({
                success: false,
                message: "Email And Password are required"
            }) 
        }

        const user = await User.findOne({email});

        if(!user){
            return res.json({
                success: false,
                message: "Invalid Email or Password"
            }) 
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.json({
                success: false,
                message: "Invalid email or Password"
            }) 
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})

        res.cookie('token', token, {
            httpOnly: true, //Prevent Javascript to access cookie
            secure: process.env.NODE_ENV === "production", //use Secure cookie in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //CSFR protection
            maxAge: 7 * 24 * 60 * 60 * 1000 // Expire in & days
        })

        return res.json({
                success: true,
                user: {
                    email: user.email,
                    name: user.name}
            })

    } catch (error) {
        console.log(error.message)
        return res.json({
                success: false,
                message: error.message
            }) 
    }
}
// Check Auth : = /api/user/is-auth
export const isAuth = async (req, res)=>{
    try {
        if (!req.userId) {
        return res.status(401).json(
            { 
                success: false,
                message: "Not Authorized" 
            });
        }
        const user = await User.findById(req.userId).select("-password")
        return res.json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error.message)
        return res.json({
                success: false,
                message: error.message
            }) 
    }
}

//logout User : /api/user/logout
export const logout = async (req, res)=>{
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", 
        })

        return res.json({
            success: true,
            message: "LoggedOut"
        })
    } catch (error) {
        console.log(error.message)
        return res.json({
                success: false,
                message: error.message
            }) 
    }
}