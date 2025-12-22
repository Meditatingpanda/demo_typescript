import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AppError } from '../utils/AppError';
import { generateReplyStream } from '../services/agent.service';
import { v4 as uuidv4 } from 'uuid';

const chatController = {
     getChatHistory: async (req: Request, res: Response, next: NextFunction) => {
          try {
               const { id } = req.params;

               const conversation = await prisma.conversation.findFirst({
                    where: { id },
                    include: {
                         messages: {
                              orderBy: { createdAt: 'asc' },
                         },
                    },
               });

               if (!conversation) {
                    // Return empty history if session doesn't exist yet, or 404.
                    // Returning empty list is handled gracefully by frontend usually.
                    return res.status(200).json({ messages: [] });
               }

               res.status(200).json({ messages: conversation.messages });
          } catch (error) {
               next(error);
          }
     },

     sendMessage: async (req: Request, res: Response, next: NextFunction) => {
          let { message, conversationId, sessionId } = req.body;

          if (!message) {
               return next(new AppError('Message is required', 400));
          }

          try {
               // 1. Find or Create Conversation
               let conversation;
               if (conversationId) {
                    conversation = await prisma.conversation.findUnique({
                         where: { id: conversationId },
                    });
               }

               if (!conversation) {
                    if (!sessionId) {
                         return next(new AppError('Session ID is required', 400));
                    }
                    conversation = await prisma.conversation.create({
                         data: {
                              sessionId,
                         },
                    });
               }

               // 2. Save User Message
               await prisma.message.create({
                    data: {
                         conversationId: conversation.id,
                         sender: 'user',
                         text: message,
                    },
               });

               // 3. Prepare for Streaming
               res.setHeader('Content-Type', 'text/event-stream');
               res.setHeader('Cache-Control', 'no-cache');
               res.setHeader('Connection', 'keep-alive');
               if (sessionId) {
                    res.setHeader('X-Session-Id', sessionId); // Send back sessionId in header or first chunk if needed
               }

               // 4. Get Chat History for Context
               const previousMessages = await prisma.message.findMany({
                    where: { conversationId: conversation.id },
                    orderBy: { createdAt: 'asc' },
                    take: 20, // Limit context
               });

               // 5. Call AI Service
               try {
                    const stream = await generateReplyStream(previousMessages, message);
                    let fullAiResponse = '';

                    for await (const chunk of stream) {
                         const chunkText = chunk.text;
                         if (chunkText) {
                              fullAiResponse += chunkText;
                              // Send chunk to client
                              // Format: data: <json_string>\n\n
                              const data = JSON.stringify({ text: chunkText, sessionId });
                              res.write(`data: ${data}\n\n`);
                         }
                    }

                    // 6. Save AI Message
                    await prisma.message.create({
                         data: {
                              conversationId: conversation.id,
                              sender: 'ai',
                              text: fullAiResponse,
                         },
                    });

                    // End stream
                    res.write('event: end\n');
                    res.write(`data: ${JSON.stringify({ sessionId })}\n\n`);
                    res.end();

               } catch (aiError) {
                    console.error('AI Error:', aiError);
                    // If headers already sent, we can't send error status. Send error event.
                    res.write(`event: error\ndata: ${JSON.stringify({ message: 'Error generating response' })}\n\n`);
                    res.end();
               }

          } catch (error) {
               // If headers not sent, normal error handling works
               if (!res.headersSent) {
                    next(error);
               } else {
                    console.error('Controller Error after headers:', error);
                    res.end();
               }
          }
     },

     listAllChats: async (req: Request, res: Response, next: NextFunction) => {
          try {
               const conversations = await prisma.conversation.findMany({
                    include: {
                         _count: {
                              select: { messages: true }
                         }
                    }
               });
               res.json(conversations);
          } catch (error) {
               next(error);
          }
     }
};

export default chatController;
