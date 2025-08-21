"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/api";
import Streamdown from "streamdown";

interface Doc {
  pageContent?: string;
  metaData?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const { getToken, isSignedIn } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const api = axiosInstance();

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    if (!isSignedIn) {
      console.error("User not signed in");
      return;
    }

    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { role: "user", content: message }]);

      const token = await getToken(); // Get Clerk token

      const res = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/chat-with-pdf`,
        { message }
      );

      const data = res.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.message,
          documents: data?.docs,
        },
      ]);

      setMessage("");
    } catch (error: any) {
      console.error("❌ Chat error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show sign-in message if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-gray-600">Please sign in to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800">Chat with PDF</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation about your PDF document</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 text-blue-800 ml-auto max-w-xs"
                : "bg-green-100 text-green-800 mr-auto max-w-md"
            }`}
          >
            <div className="font-semibold capitalize mb-1">{msg.role}</div>
            {msg.role === "assistant" ? (
              <Streamdown>{msg.content || ""}</Streamdown>
            ) : (
              <div className="whitespace-pre-wrap">{msg.content}</div>
            )}
            {msg.documents && msg.documents.length > 0 && (
              <div className="mt-2 text-xs opacity-70">
                Sources: {msg.documents.length} documents
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="bg-green-100 text-green-800 mr-auto max-w-md p-3 rounded-lg">
            <div className="font-semibold capitalize mb-1">Assistant</div>
            <div className="flex items-center space-x-1">
              <div className="animate-pulse">Thinking...</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-green-600 rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-green-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-green-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <Input
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !isLoading && handleSendChatMessage()
            }
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendChatMessage}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
