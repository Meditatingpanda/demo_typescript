import { MessageSquarePlus, MessageSquare } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  sessionId: string;
  createdAt: string;
  _count?: {
    messages: number;
  };
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({
  conversations,
  activeConversationId,
  onNewChat,
  isOpen,
  setIsOpen,
}: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-30 w-72 bg-zinc-950 border-r border-zinc-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 justify-center px-4 py-3 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-medium transition-all shadow-lg shadow-zinc-900/10 active:scale-[0.98]"
            >
              <MessageSquarePlus size={20} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Recent Chats
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-10 text-zinc-600 text-sm">
                No history yet
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    navigate(`/chat/${conv.id}`);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all text-left group",
                    activeConversationId === conv.id
                      ? "bg-zinc-900 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                  )}
                >
                  <MessageSquare
                    size={18}
                    className={clsx(
                      activeConversationId === conv.id
                        ? "text-indigo-500"
                        : "text-zinc-600 group-hover:text-zinc-500"
                    )}
                  />
                  <div className="flex-1 truncate">
                    <span className="font-medium block">
                      {new Date(conv.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(conv.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {conv._count?.messages
                        ? ` • ${conv._count.messages} msgs`
                        : ""}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-900 bg-zinc-950/50">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-zinc-900 shadow-md">
                AI
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-200">
                  AI Assistant
                </div>
                <p className="text-xs text-zinc-500">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
