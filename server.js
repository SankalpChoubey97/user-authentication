import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import ejsLayouts from 'express-ejs-layouts';
import { connectToMongoDB } from './src/config/mongodb.js';
import userRouter from './src/features/users/user.routes.js';
import { ApplicationError } from './src/error-handler/applicationError.js';

dotenv.config();

const server = express();

server.use(ejsLayouts);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');
const resolvedPath = path.resolve();
const filePath = path.join(resolvedPath, 'src', 'views');
server.set('views', filePath);  // Set the path for EJS files

// Middleware to prevent caching for specific routes
server.use('/api/users/home', (req, res, next) => {
    console.log("cache control");
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

server.use("/api/users",userRouter);

server.use((err, req, res, next) => {
    if (err instanceof ApplicationError) {
        const error = err.message;
        return res.render("signin", { error });
    }

    console.log("Inside error handler");
    console.log(err);
    const error = "Something went wrong, please try later";
    return res.render("signin", { error });
});

server.use((req, res) => {
    res.status(404).send("API not found");
});

server.listen(3200, () => {
    console.log("server is running at 3200");
    connectToMongoDB();
});
