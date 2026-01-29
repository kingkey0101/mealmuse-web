"use client";

import { useState, useRef, useEffect } from "react";
import { useAIChat } from "@/lib/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIChefChatClient() {
  const { sendMessage, loading, error } = useAIChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLocalError(null);

    // Get context from previous messages for better continuity
    const context = messages
      .map((m) => `${m.role === "user" ? "User" : "AI Chef"}: ${m.content}`)
      .join("\n");

    // Get AI response
    const response = await sendMessage(input, context);

    if (!response) {
      setLocalError(error || "Failed to get response from AI Chef");
      return;
    }

    const assistantMessage: Message = {
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <div className="flex flex-col h-screen max-h-[600px] bg-white rounded-lg border">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-3">
              <div className="text-5xl">👨‍🍳</div>
              <h3 className="text-lg font-semibold">Start a conversation</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Ask me about recipes, cooking techniques, ingredient substitutes, or any culinary
                questions!
              </p>
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card
              className={`max-w-xs lg:max-w-md px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card className="bg-gray-100 px-4 py-3 rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
              </div>
            </Card>
          </div>
        )}

        {localError && (
          <div className="flex justify-start">
            <Card className="bg-red-100 border-red-300 px-4 py-3">
              <p className="text-sm text-red-700">{localError}</p>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 bg-gray-50 rounded-b-lg flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI Chef..."
          disabled={loading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6"
          style={{
            backgroundColor: loading ? "#ccc" : "#0D5F3A",
            color: "#fff",
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
