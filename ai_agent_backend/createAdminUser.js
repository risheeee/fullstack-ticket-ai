import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to MongoDB using the same connection string from your main app
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error: ", err));

const createAdminUser = async () => {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const adminUser = new User({
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin",
            skills: ["admin", "management"]
        });

        await adminUser.save();
        console.log("Admin user created successfully");
        process.exit(0); // Exit after successful creation
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1); // Exit with error
    }
};

createAdminUser();