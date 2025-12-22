import express from "express";
import chatController from "../controllers/chat.controller";

const router = express.Router();

router.post("/chat/message", chatController.sendMessage);
router.get("/chat/:id", chatController.getChatHistory);
router.get("/chat", chatController.listAllChats);

export default router;