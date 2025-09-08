import { ReactNode, useState } from "react";
import { RetroButton } from "./retro-button";
import { RetroInput } from "./retro-input";

interface Message {
  id: string;
  content: string;
  sender: "user" | "other";
  timestamp: Date;
  senderName?: string;
}

interface RetroChatWindowProps {
  messages: Message[];
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
}

export function RetroChatWindow({
  messages,
  onSendMessage,
  placeholder = "Type your message...",
  className = "",
  height = "400px"
}: RetroChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`bg-card border-2 border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">Project Chat</h3>
      </div>

      {/* Messages Area */}
      <div 
        className="p-4 overflow-y-auto space-y-4"
        style={{ height }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                  message.sender === "user"
                    ? "bg-primary-500 text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.senderName && message.sender === "other" && (
                  <p className="text-xs text-muted-foreground mb-1">{message.senderName}</p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-primary-100" : "text-muted-foreground"
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      {onSendMessage && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <RetroButton
              onClick={handleSend}
              disabled={!newMessage.trim()}
              size="sm"
            >
              Send
            </RetroButton>
          </div>
        </div>
      )}
    </div>
  );
}
