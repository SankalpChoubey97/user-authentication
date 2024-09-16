import { ObjectId } from "mongodb";
import { getDB } from "../../config/mongodb.js";
import { ApplicationError } from "../../error-handler/applicationError.js";
import bcrypt from 'bcrypt';

export default class UserRepository{
    async signUp(newUser){
        try{
            const db = getDB();
            const userCollection = db.collection("users");
            await userCollection.insertOne(newUser);
        }catch(err){
            throw new ApplicationError("Database issue",404);
        }
    }

    async findByEmail(email) {
        try {
            const db = getDB();
            const collection = db.collection("users");
            const user = await collection.findOne({ email });
            
            if (user) {
                user._id = user._id.toString(); // convert _id to string
            }
        
            return user;
        } catch (err) {
            throw new ApplicationError("Database issue", 404);
        }
    }

    async findById(id) {
        try {
            const db = getDB();
            const collection = db.collection("users");
    
            // Find user by _id using ObjectId
            const user = await collection.findOne({ _id: new ObjectId(id) });
    
            // If user is found, convert _id to string
            if (user) {
                user._id = user._id.toString();
            }
    
            return user; // Return the user with _id as string
        } catch (err) {
            throw new ApplicationError("Database issue", 404);
        }
    }

    async changePassword(id, password) {
        try {
            const db = getDB();
            const collection = db.collection("users");
    
            // Find user by ID and update the password field
            await collection.updateOne(
                { _id: new ObjectId(id) },  // Find by ObjectId
                { $set: { password: password } }  // Update the password field
            );
            
        } catch (err) {
            throw new ApplicationError("Database issue", 404);
        }
    }

    async getOTP(email){
        try{
            const db = getDB();
            const collection = db.collection("otp");

            // Generate a 6 digit random number
            const otp = Math.floor(100000 + Math.random() * 900000);
            const hashedOTP = await bcrypt.hash(otp.toString(), 12);
    
            // Check if otp collection already has a record with the given email
            const existingOTP = await collection.findOne({ email: email });
    
            if (existingOTP) {
                // If OTP already exists for the email, update it, also remove validate field from it
                await collection.updateOne({ email: email }, { $set: { otp: hashedOTP }, $unset: { validated: "" } });
            } else {
                // If OTP doesn't exist for the email, create a new record
                await collection.insertOne({ email: email, otp: hashedOTP });
            }
    
            // Set timeout to delete OTP after 15 minutes
            setTimeout(async () => {
                await collection.deleteOne({ email: email });
                console.log("OTP deleted from collection after 15 minutes");
            }, 15 * 60 * 1000);
    
            return otp;
        }catch(err){
            throw new ApplicationError("Database issue", 404);
        }
    }

    async validateOTP(email,otp){
        try{
            const db = getDB();
            const collection = db.collection("otp");

            const user = await collection.findOne({ email: email });
            console.log("users",user);

            if(!user){
                return {message:"failure",status:"no user found"};
            }

            const result = await bcrypt.compare(otp.toString(), user.otp);
            if(!result){
                return {message:"failure",status:"Otp you've entered is either wrong or expired, please enter correct otp"}
            }

            // If OTP is valid, delete the user OTP record from the collection
            await collection.deleteOne({ email: email });

            return {message:"success",status:"Otp validated, you can proceed to change password now"}
        }catch(err){
            throw new ApplicationError("Something went wrong with database", 404);
        }
    }

}