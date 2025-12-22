import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import { useChat } from "../hooks/useChat";
import { useParams } from "react-router-dom";

export const ChatLayout = () => {
  const { conversationId } = useParams();
  const {
    messages,
    conversations,
    activeConversationId,
    isLoading,
    sendMessage,
    loadConversation,
    createNewChat,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (
      conversationId &&
      conversationId !== activeConversationId &&
      conversationId !== undefined
    ) {
      loadConversation(conversationId);
    }
  }, [conversationId, loadConversation, activeConversationId]);

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden font-sans text-zinc-100">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={loadConversation}
        onNewChat={createNewChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
    </div>
  );
};
