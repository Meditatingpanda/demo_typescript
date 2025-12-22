import express from "express";
import chatController from "../controllers/chat.controller";
const router = express.Router();

router.get("/chat/:id", chatController.getChatHistory);

router.post("/chat", chatController.createChat);

router.get("/chat/list", chatController.listAllChats);

export default router;