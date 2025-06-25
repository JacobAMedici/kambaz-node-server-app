import express from "express";
import Lab5 from "./Lab5/index.js";
import cors from "cors";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import PiazzaRoutes from "./Kambaz/Posts/routes.js";
import "dotenv/config";
import session from "express-session";
import ModuleRoutes from "./Kambaz/Modules/routes.js";
import Hello from "./Hello.js";
import mongoose from "mongoose";
const app = express();

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kambaz"
mongoose.connect(CONNECTION_STRING);
app.use(express.json());

app.use(
    cors({
        credentials: true,
        origin: process.env.NETLIFY_URL || "http://localhost:5173"
    })
);
const sessionOptions = {
    secret: process.env.SESSION_SECRET || "kambaz",
    resave: false,
    saveUninitialized: false,
};
if (process.env.NODE_ENV !== "development") {
    sessionOptions.proxy = true;
    sessionOptions.cookie = {
        sameSite: "none",
        secure: true,
        domain: process.env.NODE_SERVER_DOMAIN,
    };
}
app.use(session(sessionOptions));

UserRoutes(app);
CourseRoutes(app)
ModuleRoutes(app);
Lab5(app);
Hello(app);
PiazzaRoutes(app);
app.listen(process.env.PORT || 4000);