import { useRef, useEffect } from "react";
import { Message } from "@/types/claim";
import MessageBubble from "./MessageBubble";
import AttachmentCard from "./AttachmentCard";
import TypingIndicator from "./TypingIndicator";

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  onDeleteAttachment: (id: string) => void;
}

const ChatWindow = ({ messages, isTyping, onDeleteAttachment }: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
      {messages.map((msg) =>
        msg.type === 'attachment' && msg.attachment ? (
          <div key={msg.id} className="flex justify-end animate-fade-in">
            <div className="max-w-[75%]">
              <AttachmentCard attachment={msg.attachment} onDelete={onDeleteAttachment} />
            </div>
          </div>
        ) : (
          <MessageBubble key={msg.id} message={msg} />
        )
      )}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
