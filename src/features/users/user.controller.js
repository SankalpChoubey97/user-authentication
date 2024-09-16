import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import UserRepository from "./user.repository.js";
import nodemailer from "nodemailer";

export default class UserController{
    constructor(){
        this.userRepository=new UserRepository();
    }
    
    getSignIn(req,res,next){
        // Get the message from query parameters, or set to null if not provided
        const message = req.query.message || null;
        return res.render("signin",{message});
    }

    getSignUp(req,res,next){
        return res.render("signup");
    }

    async signUp(req,res,next){
        try{
            const {name,email,password}=req.body;
            //hashing password
            const hashedPassword=await bcrypt.hash(password,12);
            const user={name,email,password:hashedPassword};
            await this.userRepository.signUp(user);
            return res.json({message:"success"});
        }catch(err){
            console.log("Inside signup Error");
            next(err);
        }
    }

    async signIn(req, res, next) {
        try {
          const { email, password } = req.body;
          //find user by email
          const user = await this.userRepository.findByEmail(email);

          if (!user) {
            return res.json({message:"failure",error:"Incorrect credentials"});
          } else {
            //compare encrypted password
            const result = await bcrypt.compare(password, user.password);
            if (result) {
              //create token
              const token = jwt.sign(
                { email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
              );
      
              // Send token in response

                return res.json({message:"success",token});
            } else {
                return res.json({message:"failure",error:"Incorrect credentials"});
            }
          }
        } catch (err) {
          console.log("Inside signin controller error", err);
          next(err);
        }
      }

    async getHome(req,res,next){
      try{
        const email=req.email
        const user=await this.userRepository.findByEmail(email);
        return res.render("home",{user});
      }catch(err){
        console.log("Inside get home controller error");
        next(err);
      }
    }

    async getChangePassword(req,res,next){
      try{
        const {id}=req.params;
        const user=await this.userRepository.findById(id);
        return res.render("change_password",{user});
      }catch(err){
        console.log("Inside get change password controller error");
        next(err);
      }
    }

    async changePassword(req,res,next){
      try{
        const {id}=req.params;
        const {newPassword}=req.body;
        const hashedPassword=await bcrypt.hash(newPassword,12);
        await this.userRepository.changePassword(id,hashedPassword);
        return res.json({message:"success"});
      }catch(err){
        console.log("Inside change password controller error");
        next(err);
      }
    }

    getForgotPasswordPage(req,res,next){
      return res.render("forgot_password");
    }

    async getOTP(req,res,next){
      try{
        const {email}=req.body;
        const otp=await this.userRepository.getOTP(email);
        let transporter=nodemailer.createTransport({
          service:'gmail',
          auth:{
            user: 'codingninjas2k16@gmail.com',
            pass: 'slwvvlczduktvhdj'
          }
        });

        // Setup email data
        let mailOptions = {
            from: 'codingninjas2k16@gmail.com',
            to: email,
            subject: 'OTP',
            text: 'Your OTP for password change is '+otp+'. This is valid only for next 15 mins'
        };

        // Send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log(error);
              return res.json({message:"failure",error:"error while sending otp to your mail, please try again later"});
          }
          return res.json({message:"success",status:"OTP sent successfully to your email. Its valid for next 15 mins only"});
        });
      }catch(err){
        console.log(err);
        console.log("Inside get OTP controller error");
        next(err);
      }
    }

    async validateOTP(req,res,next){
      try{
          const {email,otp}=req.body;
          const result=await this.userRepository.validateOTP(email,otp);
          console.log(result)
          return res.json({message:result.message,status:result.status});
      }catch(err){
          console.log("Inside validate OTP error controller");
          next(err);
      }
    }

    getResetPassword(req,res,next){
      console.log("Inside get reset password");
      const {email}=req.params;
      return res.render("reset_password",{email});
    }

    async resetPassword(req,res,next){
      try{
        const {email,password}=req.body;

        const hashedPassword=await bcrypt.hash(password,12);
        const user=await this.userRepository.findByEmail(email);

        await this.userRepository.changePassword(user._id,hashedPassword);

        return res.json({message:"success"});
      }catch(err){
        console.log("Inside reset password error controller");
        next(err);
      }
    }

}