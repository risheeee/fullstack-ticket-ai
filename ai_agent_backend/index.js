import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("✅ MongoDB Connected !!");
        app.listen(PORT, () => console.log("Server running at http://locahost:3000"))
    })
    .catch((err) => console.error("❌ MongoDB error: ", err));