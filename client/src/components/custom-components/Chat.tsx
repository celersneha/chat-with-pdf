"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
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

const ChatComponent: React.FC<{ selectedFileIds: string[] }> = ({
  selectedFileIds,
}) => {
  const { getToken, isSignedIn } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages, isLoading]);

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sessionId");
      const sid = crypto.randomUUID();
      sessionStorage.setItem("sessionId", sid);
      setSessionId(sid);
    }
  }, []);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;
    if (!isSignedIn) {
      console.error("User not signed in");
      return;
    }
    if (!selectedFileIds || selectedFileIds.length === 0) {
      return;
    }
    if (!sessionId) return; // Wait for sessionId

    try {
      setIsLoading(true);
      setError(null);
      setSummary(null);
      setMessages((prev) => [...prev, { role: "user", content: message }]);

      const token = await getToken();
      const api = axiosInstance(token ?? undefined);

      const res = await api.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/chat-with-pdf`,
        { message, fileIds: selectedFileIds, sessionId }
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
      setSummary(data?.data?.summary || null);
    } catch (error: any) {
      console.error("❌ Chat error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
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

  if (!isSignedIn) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="bg-[var(--color-surface)] p-6 rounded-2xl text-center border border-[var(--color-accent)]/30 shadow">
          <p className="text-[var(--color-secondary)]">
            Please sign in to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-[var(--color-surface)] rounded-2xl  shadow">
      {/* Chat Header */}
      <div className=" p-4 bg-[var(--color-background)] rounded-t-2xl">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">
          Chat with PDF
        </h2>
      </div>

      {error && <div className="text-red-500 text-xs px-4 py-1">{error}</div>}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[var(--color-secondary)] mt-8">
            <p>Start a conversation about your PDF document</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            <div
              className={`p-3 rounded-xl ${
                msg.role === "user"
                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] ml-auto max-w-xs"
                  : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] mr-auto max-w-md"
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
          </React.Fragment>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] mr-auto max-w-md p-3 rounded-xl">
            <div className="font-semibold capitalize mb-1">Assistant</div>
            <div className="flex items-center space-x-1">
              <div className="animate-pulse">Thinking...</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-[var(--color-accent)] rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-[var(--color-accent)] rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-[var(--color-accent)] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Show summary at end of chat window */}
        {summary !== null && summary.trim().length > 0 && (
          <div className="bg-[#fff0f3] border border-[#f43f5e]/30 text-[#c81e41] rounded-md px-4 py-2 my-2 text-sm max-w-md mr-auto">
            <strong>Summary:</strong> {summary}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className=" p-4 bg-[var(--color-surface)] rounded-b-2xl">
        <div className="flex gap-3">
          <Input
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !isLoading && handleSendChatMessage()
            }
            className="flex-1  rounded-lg"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendChatMessage}
            disabled={!message.trim() || isLoading || !selectedFileIds.length}
            className="bg-[var(--color-accent)] hover:bg-[#c81e41] text-white font-semibold rounded-lg"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
        {!selectedFileIds.length && (
          <div className="text-xs text-[var(--color-accent)] mt-2">
            Please select at least one file to ask a question.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
