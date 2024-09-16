import express from "express";
import UserController from "./user.controller.js";
import { changePasswordValidate, resetPasswordValidate, signUpValidate, validateEmailId } from "../../middlewares/users.middleware.js";
import jwtAuth from "../../middlewares/jwt.middleware.js";

const userRouter=express.Router();
const userController=new UserController();

userRouter.get("/signIn",(req,res,next)=>{
    userController.getSignIn(req,res,next)
});

userRouter.get("/signup",(req,res,next)=>{
    userController.getSignUp(req,res,next)
});

userRouter.post("/signup",signUpValidate,(req,res,next)=>{
    userController.signUp(req,res,next)
});

userRouter.post("/signIn",(req,res,next)=>{
    userController.signIn(req,res,next)
})

userRouter.get("/home",jwtAuth,(req,res,next)=>{
    userController.getHome(req,res,next)
})

userRouter.get("/home/change_password/:id",jwtAuth,(req,res,next)=>{
    userController.getChangePassword(req,res,next)
})

userRouter.post("/home/change_password/:id",jwtAuth,changePasswordValidate,(req,res,next)=>{
    userController.changePassword(req,res,next)
})

userRouter.get("/signIn/forgot_password",(req,res,next)=>{
    userController.getForgotPasswordPage(req,res,next)
});

userRouter.post("/signIn/forgot_password/get_otp",validateEmailId,(req,res,next)=>{
    userController.getOTP(req,res,next)
});

userRouter.post("/signIn/forgot_password/submit_otp",(req,res,next)=>{
    userController.validateOTP(req,res,next)
})

userRouter.get("/signIn/forgot_password/reset_password/:email",(req,res,next)=>{
    userController.getResetPassword(req,res,next)
})

userRouter.post("/signIn/forgot_password/reset_password",resetPasswordValidate,(req,res,next)=>{
    userController.resetPassword(req,res,next)
})

export default userRouter;