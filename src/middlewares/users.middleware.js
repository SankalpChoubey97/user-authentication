import { getDB } from "../config/mongodb.js";
import { ApplicationError } from "../error-handler/applicationError.js";
import UserRepository from "../features/users/user.repository.js";
import bcrypt from 'bcrypt';

const userRepository=new UserRepository();

export const signUpValidate = async (req, res, next) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const db = getDB();
        const users = db.collection("users");

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ message: "failure", error: "Please provide a valid email address" });
        }

        // Validate password format
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&!@#^(){}[\]:;<>,.?/~_+-=|\\]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.json({ message: "failure", error: "Please provide a valid password. One uppercase, one lowercase, one number, one special character and at least eight letters" });
        }

        // Check if email already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.json({ message: "failure", error: "Email already exists, please use a different email" });
        }

        // Validate that passwords match
        if (password !== confirmPassword) {
            return res.json({ message: "failure", error: "Passwords do not match, please provide the same password in both fields" });
        }

        next();
    } catch (err) {
        throw new ApplicationError("Database issue", 404);
    }
};

export const changePasswordValidate = async (req, res, next) => {
    try{
        const {id}=req.params;
        const {oldPassword,newPassword,confirmNewPassword}=req.body;

        const user=await userRepository.findById(id);
        const result = await bcrypt.compare(oldPassword, user.password);
        if(!result){
            return res.json({message:"failure",error:"Old password in not correct"});
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&!@#^(){}[\]:;<>,.?/~_+-=|\\]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.json({ message: "failure", error: "Please provide a valid new password. One uppercase, one lowercase, one number, one special character and at least eight letters" });
        }

        if(oldPassword==newPassword){
            return res.json({message:"failure",error:"old and new passwords can't be same"});
        }

        if(newPassword!=confirmNewPassword){
            return res.json({ message: "failure", error: "New passwords do not match, please provide the same password in both fields" });
        }

        next();
    }catch(err){
        throw new ApplicationError("Database issue", 404);
    }
}

export const validateEmailId = async (req, res, next) => {
    try {
      const { email } = req.body;
  
      // Query the repository for the user by email
      const result = await userRepository.findByEmail(email);
  
      // Check if result is empty, meaning the email doesn't exist
      if (!result) {
        return res.json({
          message: "failure",
          error: "This email doesn't exist. Please sign up if you're a new user.",
        });
      }
  
      // If email exists, proceed to the next middleware or handler
      next();
    } catch (err) {
      // Handle errors, e.g., database or application errors
      throw new ApplicationError("Database issue", 404);
    }
  };

export const resetPasswordValidate=async(req,res,next)=>{
    try{
        const {email,password,confirmPassword}=req.body;
        console.log(req.body);

        const user = await userRepository.findByEmail(email);
        const result = await bcrypt.compare(password, user.password);

        if(result){
            return res.json({message:"failure",error:"Can't reset password as previous password"});
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&!@#^(){}[\]:;<>,.?/~_+-=|\\]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.json({ message: "failure", error: "Please provide a valid new password. One uppercase, one lowercase, one number, one special character and at least eight letters" });
        }

        if(password!=confirmPassword){
            return res.json({ message: "failure", error: "New passwords do not match, please provide the same password in both fields" });
        }

        next();
    }catch(err){
        throw new ApplicationError("Database issue", 404);
    }
}
  