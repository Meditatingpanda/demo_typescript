import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { AppError } from "../utils/AppError";
import { generateReplyStream } from "../services/agent.service";

const chatController = {
     getChatHistory: async (req: Request, res: Response, next: NextFunction) => {
          try {
               const { id } = req.params;

               const sessionId = req.headers["x-session-id"];

               if (!sessionId || typeof sessionId !== "string") {
                    return next(new AppError("Session ID is required", 400));
               }

               const conversation = await prisma.conversation.findFirst({
                    where: { id, sessionId },
                    include: {
                         messages: {
                              orderBy: { createdAt: "asc" },
                         },
                    },
               });

               if (!conversation) {
                    return res.status(200).json({ messages: [] });
               }

               res.status(200).json({ messages: conversation.messages });
          } catch (error) {
               next(error);
          }
     },

     sendMessage: async (req: Request, res: Response, next: NextFunction) => {
          let { message, conversationId } = req.body;

          const sessionId = req.headers["x-session-id"];

          if (!message) {
               return next(new AppError("Message is required", 400));
          }

          if (!sessionId || typeof sessionId !== "string") {
               return next(new AppError("Session ID is required", 400));
          }

          try {
               let conversation;
               if (conversationId) {
                    conversation = await prisma.conversation.findUnique({
                         where: { id: conversationId },
                    });
               }

               if (!conversation) {
                    if (!sessionId) {
                         return next(new AppError("Session ID is required", 400));
                    }
                    conversation = await prisma.conversation.create({
                         data: {
                              sessionId,
                         },
                    });
               }

               await prisma.message.create({
                    data: {
                         conversationId: conversation.id,
                         sender: "user",
                         text: message,
                    },
               });

               res.setHeader("Content-Type", "text/event-stream");
               res.setHeader("Cache-Control", "no-cache");
               res.setHeader("Connection", "keep-alive");
               if (sessionId) {
                    res.setHeader("X-Session-Id", sessionId);
               }
               res.setHeader("X-Conversation-Id", conversation.id);

               const previousMessages = await prisma.message.findMany({
                    where: { conversationId: conversation.id },
                    orderBy: { createdAt: "asc" },
                    take: 20, // Limit context
               });

               try {
                    const stream = await generateReplyStream(previousMessages, message);
                    let fullAiResponse = "";

                    for await (const chunk of stream) {
                         const chunkText = chunk.text;
                         if (chunkText) {
                              fullAiResponse += chunkText;

                              const data = JSON.stringify({
                                   text: chunkText,
                                   sessionId,
                                   conversationId: conversation.id,
                              });
                              res.write(`data: ${data}\n\n`);
                         }
                    }

                    await prisma.message.create({
                         data: {
                              conversationId: conversation.id,
                              sender: "ai",
                              text: fullAiResponse,
                         },
                    });

                    res.write("event: end\n");
                    res.write(
                         `data: ${JSON.stringify({
                              sessionId,
                              conversationId: conversation.id,
                         })}\n\n`
                    );
                    res.end();
               } catch (aiError: any) {
                    console.error("AI Error:", aiError, typeof aiError);

                    let errorMessage = aiError?.message || "Something went wrong";

                    const tryExtractMessage = (msg: any): string | null => {
                         try {
                              if (typeof msg === 'string' && msg.trim().startsWith('{')) {
                                   const parsed = JSON.parse(msg);
                                   if (parsed.error && parsed.error.message) {
                                        return tryExtractMessage(parsed.error.message) || parsed.error.message;
                                   } else if (parsed.message) {
                                        return tryExtractMessage(parsed.message) || parsed.message;
                                   }
                              }
                         } catch (e) {
                              // Ignore parsing errors
                         }
                         return null;
                    };

                    const extracted = tryExtractMessage(errorMessage);
                    if (extracted) {
                         errorMessage = extracted;
                    }

                    res.write(
                         `event: error\ndata: ${JSON.stringify({
                              error: errorMessage,
                         })}\n\n`
                    );
                    res.end();
               }
          } catch (error) {
               if (!res.headersSent) {
                    next(error);
               } else {
                    console.error("Controller Error after headers:", error);
                    res.end();
               }
          }
     },

     listAllChats: async (req: Request, res: Response, next: NextFunction) => {
          const sessionId = req.headers["x-session-id"];

          try {
               if (!sessionId || typeof sessionId !== "string") {
                    return next(new AppError("Session ID is required", 400));
               }

               const conversations = await prisma.conversation.findMany({
                    where: { sessionId },
                    include: {
                         messages: true,
                    },
               });
               const conversationWithFirstMessage = conversations.map((conversation) => {
                    const firstMessage = conversation.messages[0];
                    return {
                         id: conversation.id,
                         createdAt: conversation.createdAt,
                         sessionId: conversation.sessionId,
                         firstMessage,
                    };
               });
               res.json(conversationWithFirstMessage);
          } catch (error) {
               next(error);
          }
     },
};

export default chatController;
