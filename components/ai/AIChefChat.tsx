"use client";

import { useState, useRef, useEffect } from "react";
import { useAIChat } from "@/lib/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  savedRecipeId?: string;
}

function parseRecipeText(recipeText: string) {
  const lines = recipeText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const titleLine = lines.find((line) => /recipe title|^title[:\s]/i.test(line)) || lines[0];
  const title = titleLine
    ? titleLine
        .replace(/recipe title[:\s-]*/i, "")
        .replace(/^title[:\s-]*/i, "")
        .trim()
    : "AI Chef Recipe";

  const ingredientsStart = lines.findIndex((line) => /^ingredients?[:\s]/i.test(line));
  const equipmentStart = lines.findIndex((line) =>
    /^(equipment|tools|equipment needed)[:\s]/i.test(line)
  );
  const stepsStart = lines.findIndex((line) =>
    /(^instructions?|^steps?|^directions?)[:\s]/i.test(line)
  );

  let ingredientsList: string[] = [];
  let stepsList: string[] = [];
  let equipmentList: string[] = [];

  if (ingredientsStart !== -1) {
    const ingredientsEndCandidates = [equipmentStart, stepsStart].filter((i) => i !== -1);
    const ingredientsEnd =
      ingredientsEndCandidates.length > 0 ? Math.min(...ingredientsEndCandidates) : lines.length;
    ingredientsList = lines
      .slice(ingredientsStart + 1, ingredientsEnd)
      .map((line) => line.replace(/^[-*\d\.]+\s*/, "").trim())
      .filter((line) => line && !/(^instructions?|^steps?|^directions?)[:\s]/i.test(line));
  }

  if (equipmentStart !== -1) {
    const equipmentEnd = stepsStart !== -1 ? stepsStart : lines.length;
    equipmentList = lines
      .slice(equipmentStart + 1, equipmentEnd)
      .map((line) => line.replace(/^[-*\d\.]+\s*/, "").trim())
      .filter((line) => line && !/(^instructions?|^steps?|^directions?)[:\s]/i.test(line));
  }

  if (stepsStart !== -1) {
    stepsList = lines
      .slice(stepsStart + 1)
      .map((line) => line.replace(/^[-*\d\.]+\s*/, "").trim())
      .filter((line) => line && !/(^tips?|^notes?)[:\s]/i.test(line));
  }

  if (ingredientsList.length === 0) {
    ingredientsList = lines
      .filter(
        (line) =>
          /^[-*]/.test(line) &&
          !/(instructions?|steps?|directions?|tips?|notes?|servings?|cooking time|prep time)/i.test(
            line
          )
      )
      .map((line) => line.replace(/^[-*]+\s*/, "").trim());
  }

  if (stepsList.length === 0) {
    const numberedSteps = lines
      .filter((line) => /^\d+\./.test(line))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    stepsList =
      numberedSteps.length > 0
        ? numberedSteps
        : lines.filter(
            (line) =>
              !/^(ingredients?|instructions?|steps?|directions?|tips?|notes?|servings?|cooking time|prep time)[:\s]/i.test(
                line
              )
          );
  }

  return { title, ingredientsList, stepsList, equipmentList };
}

export function AIChefChatClient() {
  const { sendMessage, loading, error } = useAIChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [savingMessageIdx, setSavingMessageIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractKeywords = (text: string) => {
    const stopWords = new Set([
      "the",
      "and",
      "for",
      "with",
      "that",
      "this",
      "how",
      "what",
      "when",
      "where",
      "why",
      "are",
      "is",
      "to",
      "a",
      "an",
      "of",
      "in",
      "on",
      "it",
      "i",
      "you",
      "we",
      "me",
      "my",
      "your",
      "our",
    ]);

    return Array.from(
      new Set(
        text
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((word) => word.length > 2 && !stopWords.has(word))
      )
    ).slice(0, 8);
  };

  const inferTopic = (text: string) => {
    const normalized = text.toLowerCase();
    if (normalized.includes("how to") || normalized.includes("technique")) {
      return "cooking_technique";
    }
    if (normalized.includes("recipe") || normalized.includes("make")) {
      return "recipe_help";
    }
    return "general_cooking";
  };

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

    const conversationHistory = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await sendMessage(input, context, {
      conversationHistory,
      topic: inferTopic(input),
      extractedKeywords: extractKeywords(input),
    });

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

  const handleSaveRecipe = async (messageIdx: number, recipeText: string) => {
    setSavingMessageIdx(messageIdx);

    try {
      const { title, ingredientsList, stepsList, equipmentList } = parseRecipeText(recipeText);

      // Save to database
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          cuisine: "General",
          skill: "Intermediate",
          dietary: [],
          cookingTime: null,
          ingredients:
            ingredientsList.length > 0
              ? ingredientsList
              : ["See recipe text above for ingredients"],
          steps: stepsList.length > 0 ? stepsList : ["See recipe text above for instructions"],
          equipment:
            equipmentList.length > 0 ? equipmentList : ["See recipe text above for equipment"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      const data = await response.json();

      // Update message with saved recipe ID
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === messageIdx ? { ...msg, savedRecipeId: data.recipeId } : msg
        )
      );
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to save recipe");
    } finally {
      setSavingMessageIdx(null);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] sm:h-screen sm:max-h-[600px] bg-white rounded-lg border">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-3 px-4">
              <div className="text-4xl sm:text-5xl">👨‍🍳</div>
              <h3 className="text-base sm:text-lg font-semibold">Start a conversation</h3>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-xs">
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
            <div className="flex flex-col gap-2 max-w-xs sm:max-w-sm lg:max-w-md">
              <Card
                className={`px-3 sm:px-4 py-2 sm:py-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </Card>

              {/* Save button for assistant messages with recipes */}
              {message.role === "assistant" && message.content.length > 200 && (
                <div className="flex gap-2 flex-wrap">
                  {message.savedRecipeId ? (
                    <Link href={`/recipes/${message.savedRecipeId}`}>
                      <Button
                        size="sm"
                        className="text-xs"
                        style={{ backgroundColor: "#0D5F3A", color: "#fff" }}
                      >
                        ✓ View Recipe
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSaveRecipe(idx, message.content)}
                      disabled={savingMessageIdx === idx}
                      className="text-xs"
                      style={{ backgroundColor: "#7A8854", color: "#fff" }}
                    >
                      {savingMessageIdx === idx ? "Saving..." : "💾 Save Recipe"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Card className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-bl-none">
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
            <Card className="bg-red-100 border-red-300 px-3 sm:px-4 py-2 sm:py-3">
              <p className="text-xs sm:text-sm text-red-700">{localError}</p>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-2 sm:p-4 bg-gray-50 rounded-b-lg flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI Chef..."
          disabled={loading}
          className="flex-1 text-sm"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 sm:px-6 text-sm sm:text-base"
          style={{
            backgroundColor: loading ? "#ccc" : "#0D5F3A",
            color: "#fff",
          }}
        >
          {loading ? "..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
