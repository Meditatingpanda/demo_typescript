
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

export interface Message {
    id?: string;
    sender: 'user' | 'ai';
    text: string;
    createdAt?: string;
}

export interface Conversation {
    id: string;
    sessionId: string;
    createdAt: string;
    firstMessage: Message;
}

const apiBase = 'http://localhost:3000/api';

export const useChat = () => {
    const [sessionId, setSessionId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Initialize Session ID
    useEffect(() => {
        let storedSessionId = localStorage.getItem('chat_session_id');
        if (!storedSessionId) {
            storedSessionId = uuidv4();
            localStorage.setItem('chat_session_id', storedSessionId);
        }
        setSessionId(storedSessionId);
    }, []);

    // list all previous conversations 
    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch(`${apiBase}/chat`, {
                headers: {
                    'X-Session-Id': localStorage.getItem('chat_session_id') || ''
                }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data.sort((a: Conversation, b: Conversation) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ));
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Load specific conversation
    const loadConversation = useCallback(async (id: string) => {

        console.log('Loading conversation', id);
        if (id === activeConversationId && messages.length > 0) return;

        setIsLoading(true);
        setActiveConversationId(id);
        try {
            const res = await fetch(`${apiBase}/chat/${id}`, {
                headers: {
                    'X-Session-Id': localStorage.getItem('chat_session_id') || ''
                }
            });
            if (res.ok) {
                const data = await res.json();

                setMessages(data.messages || []);
                if (data.messages.length === 0) {
                    navigate('/');
                }
            }
        } catch (error) {
            console.error('Failed to load conversation', error);

        } finally {
            setIsLoading(false);
        }
    }, [activeConversationId, messages.length]);

    const createNewChat = () => {
        setActiveConversationId(null);
        setMessages([]);
        navigate('/');
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        // Optimistic Update
        const userMessage: Message = { sender: 'user', text };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch(`${apiBase}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Session-Id': localStorage.getItem('chat_session_id') || '' },
                body: JSON.stringify({
                    message: text,
                    conversationId: activeConversationId
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error('Failed to send message');
            }


            const headerConvId = response.headers.get('X-Conversation-Id');
            if (headerConvId && !activeConversationId) {
                setActiveConversationId(headerConvId);
                navigate(`/chat/${headerConvId}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = '';

            // Placeholder for AI token streaming
            setMessages((prev) => [...prev, { sender: 'ai', text: '' }]);

            let isFirstChunk = true;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6);
                        if (jsonStr.trim() === '[DONE]') continue;

                        try {
                            const data = JSON.parse(jsonStr);


                            if (data.conversationId && !activeConversationId && isFirstChunk) {
                                setActiveConversationId(data.conversationId);
                                navigate(`/chat/${data.conversationId}`);
                            }
                            isFirstChunk = false;

                            if (data.text) {
                                aiResponseText += data.text;

                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg.sender === 'ai') {
                                        lastMsg.text = aiResponseText;
                                    }
                                    return newMessages;
                                });
                            }

                            if (data.error) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg.sender === 'ai') {
                                        lastMsg.text = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            // console.error("Error parsing chunk", e, line);
                        }
                    }
                }
            }


            if (!activeConversationId) {
                await fetchConversations();
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        sessionId,
        messages,
        conversations,
        activeConversationId,
        isLoading,
        sendMessage,
        loadConversation,
        createNewChat
    };
};
