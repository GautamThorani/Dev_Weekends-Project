import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res)=>{
    const {name, email, password} = req.body;

    if (!name || !email || !password){
        return res.json({
            sucess: false, message: 'Missing Details'
        });
    }

    try{

        const existing = await userModel.findOne({email})

        if(existing){
            return res.json({
                sucess: false, message: 'User Already Exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 5);

        const user = new userModel({
        name,
        email,
        password: hashedPassword
        })

        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.cookie(
            'token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        // Sending Welcome email
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Great Stack',
            text: `Welcome to Great Stack. Your account has been created with email id: ${email}`
        }

        await transporter.sendMail(mailOption);

        return res.json({
            sucess: true
        })

    } catch (error) {
        return res.json({
            sucess: false, message: error.message
        })
    }
}

export const login = async (req, res)=>{
    const {email, password} = req.body;

    if(!email || !password) {
        return res.json({
            sucess: false,
            message: "Email and Password are required!"
        })
    }

    try{
        const  user = await userModel.findOne({email});

        if(!user) {
            return res.json({
            sucess: false,
            message: "Invalid Email"
        })
        }

        const isMatch = await bcrypt.compare(password, user.password) 

        if(!isMatch) {
            return res.json({
            sucess: false,
            message: "Invalid Password"
        })
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.cookie(
            'token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({
            success: true
        })

    } catch(error){
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async (req, res)=> {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 
            'none' : 'strict',
        })

        return res.json({
            success: true,
            message: "Logged Out"
        })
        
    } catch (error){
        return res.json({
            success: false,
            message: error.message
        })
    }
}
// Send Verfication OTP to User's Email
export const sendVerifyOtp = async (req, res)=>{
    try{
        // const {userId} = req.body;
        const userId = req.user.id; // ✅ Get from req.user instead of req.body

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({
                success: false,
                text: 'Account Already Verified'
            })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExipireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification Otp',
            text: `Your OTP is ${otp}. Verify Your account using this OTP`
        }

        await transporter.sendMail(mailOption);

        return res.json({
            success : true,
            message : "Verification OTP sent On email"
        })
    } catch (error){
        return res.json({
            success: false,
            message: error.message
        })
    }
}
// Verify the Email using otp
export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.user?.id;

    if (!userId || !otp){

        return res.json({
            success : false,
            message : "Missing Details for Email Verification"
        })
    }

    try {
        const user = await userModel.findById(userId);

        if (!user){
            return res.json({
            success: false,
            message: "User Not Found"
        })
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({
            success: false,
            message: "Invalid OTP"
        })
        }

        if (user.verifyOtpExipireAt < Date.now()){
            return res.json({
            success: false,
            message: "OTP Expired"
        })
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExipireAt = 0;

        await user.save()

        return res.json({
            success: true,
            message: 'Email Verified Successfully'
        })
    } catch {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const isAuthenticated = async (req, res) => {
    try{
        return res.json({
            success : true
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

// Send Password reset Opt
export const sendResetOtp = async (req, res)=> {
    const { email }= req.body;

    if(!email){
        return res.json({
            success: false,
            message: "Email is Required"
        })
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({
            success: false,
            message: "User Not Found"
        })
        }
        
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;    
        user.resetOtpExpireAT = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset otp',
            text: `Your OTP for resetting password is ${otp}. Use this OTP to proceed with resetting your password.`
        }

        await transporter.sendMail(mailOption);

        return res.json({
            success: true,
            message: "OTP sent to Your Email"
        })
    } catch (error){
        return res.json({
            success: false,
            message: error.message
        })
    }
}


// Reset User Password

export const resetPassword = async (req, res) =>{
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
            return res.json({
            success: false,
            message: "Email, OTP, and NewPassword are required"
        })
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({
            success: false,
            message: "User not found"
        })
        }

        if (user.resetOtp === "" || user.resetOtp !== otp ){
            return res.json({
            success: false,
            message: "Invalid OTP"
        })
        }

        if(user.resetOtpExpireAT < Date.now()){
            return res.json({
            success: false,
            message: "OTP Expired"
        })
        } 

        const hashedPassword = await bcrypt.hash(newPassword, 5);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAT = 0;

        await user.save();

        return res.json({
            success: true,
            message: "Password has been reset successfully"
        })

        
    } catch (error) {
            return res.json({
            success: false,
            message: error.message
        })
    }
}

