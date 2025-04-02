import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import chatroomRoutes from "./routes/chatroomRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import directMessageRoutes from "./routes/directMessageRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatrooms", chatroomRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/direct-messages", directMessageRoutes);
app.use("/api", postRoutes);
app.use("/api", commentRoutes);

export default app;
