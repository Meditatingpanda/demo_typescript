import clsx from "clsx";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  sender: "user" | "ai";
  text: string;
}

export const MessageBubble = ({ sender, text }: MessageBubbleProps) => {
  const isUser = sender === "user";

  return (
    <div
      className={clsx(
        "flex w-full mt-2 space-x-3 max-w-3xl mx-auto p-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-zinc-400" />
        </div>
      )}

      <div
        className={clsx(
          "relative px-5 py-4 text-sm shadow-sm max-w-[85%] leading-relaxed",
          isUser
            ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-900/10"
            : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-2xl rounded-tl-sm"
        )}
      >
        <div className="whitespace-pre-wrap">{text}</div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
          <User size={16} className="text-zinc-500" />
        </div>
      )}
    </div>
  );
};
