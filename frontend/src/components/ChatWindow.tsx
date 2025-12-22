import { useRef, useEffect, useState } from "react";
import { Send, Menu, Loader2, Bot } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import clsx from "clsx";

interface Message {
  id?: string;
  sender: "user" | "ai";
  text: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onOpenSidebar: () => void;
}

export const ChatWindow = ({
  messages,
  isLoading,
  onSendMessage,
  onOpenSidebar,
}: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setInput(target.value);

    // Auto-grow
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
      {/* Header */}
      <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-4 lg:px-8 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 -ml-2 text-zinc-400 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            <h1 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">
              Assistant
            </h1>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 text-zinc-500 p-8">
            <div className="relative">
              <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center transform rotate-3 transition-transform hover:rotate-6 shadow-2xl shadow-black">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500" />
              </div>
              <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full -z-10" />
            </div>
            <div>
              <h3 className="text-zinc-200 font-medium mb-2 text-lg">
                How can I help you today?
              </h3>
              <p className="text-sm max-w-xs mx-auto text-zinc-500 leading-relaxed">
                I can assist you with code, analysis, creative writing, and
                more.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id || idx}
                sender={msg.sender}
                text={msg.text}
              />
            ))}
            {isLoading && (
              <div className="flex w-full mt-2 space-x-3 max-w-3xl mx-auto p-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-zinc-400" />
                </div>
                <div className="px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm shadow-sm flex items-center">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6 bg-transparent">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="relative w-full pl-5 pr-14 py-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-zinc-100 placeholder:text-zinc-600 focus:ring-0 focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-xl max-h-[200px] overflow-y-auto"
            style={{ minHeight: "60px" }}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2.5 p-2.5 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 z-10"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-3">
          <p className="text-[10px] text-zinc-600 font-medium tracking-wide">
            AI can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
};
