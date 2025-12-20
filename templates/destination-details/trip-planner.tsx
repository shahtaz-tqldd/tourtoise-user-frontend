import React, { useState } from "react";
import { ChatMessage } from "./_types";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { TourDestination } from "../destination/_types";

interface TripPlannerProps {
  destination: TourDestination;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ destination }) => {
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text:
        "Hello! I'm your AI travel assistant. I can help you plan your trip to " +
        destination.name +
        ". What would you like to know?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setMessageInput("");

    // Simulate AI response
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text:
          "Thank you for your question. Based on your interests, I recommend visiting the temples in the morning when it's less crowded. Would you like me to create a detailed itinerary for your " +
          destination.name +
          " trip?",
        sender: "agent",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, agentMessage]);
    }, 1000);
  };
  return (
    <div className="lg:col-span-2 fixed md:static inset-0 md:inset-unset bg-black/50 md:bg-transparent z-20 flex md:block items-end">
      <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 h-[calc(100vh-8rem)] flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <Typography as="h2" size="sm" className="font-semibold">
            Plan Your Trip
          </Typography>
          <Typography as="p" size="sm" className="text-gray-500">
            Ask our AI assistant to create a personalized itinerary
          </Typography>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.sender === "user"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about your trip..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSendMessage} size="sm" className="p-2">
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
