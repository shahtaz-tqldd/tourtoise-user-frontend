"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  Star,
  DollarSign,
  Info,
  Check,
  X,
  MessageSquare,
  Send,
  ChevronRight,
  Utensils,
  Home,
  Car,
  User,
  Shield,
  Tag,
  Camera,
  Sun,
  Languages,
  Heart,
  Share2,
  ArrowLeft,
  TreePalm,
} from "lucide-react";
import Container from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { TourDestination } from "../_types";
import { DESTINATIONS } from "../destination/_demo-data";

// Chat message interface
interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
}

const DestinationDetailsPage = () => {
  const params = useParams();
  const [destination] = useState<TourDestination>(DESTINATIONS[0]);
  const [activeImage, setActiveImage] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: destination.price.currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Container className="!pt-32 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Destination Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Back Button and Actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Back to Destinations
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Heart size={18} />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 size={18} />
                Share
              </Button>
            </div>
          </div>

          {/* Title and Basic Info */}
          <div>
            <Typography as="h1" size="xl" className="font-bold mb-2">
              {destination.name}
            </Typography>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>
                  {destination.location.region}, {destination.location.country}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span>{destination.rating}</span>
                <span>({destination.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <Image
                src={destination.images.gallery[activeImage]}
                alt={destination.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {destination.images.gallery.map((image, index) => (
                <div
                  key={index}
                  className={`relative h-24 rounded-lg overflow-hidden cursor-pointer ${
                    activeImage === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={image}
                    alt={`${destination.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Typography as="h2" size="xl" className="font-semibold mb-3">
              About this destination
            </Typography>
            <Typography as="p" size="sm" className="text-gray-600">
              {destination.description}
            </Typography>
          </div>

          {/* Highlights */}
          <div>
            <Typography as="h2" size="xl" className="font-semibold mb-3">
              Highlights
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {destination.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check
                    size={18}
                    className="text-green-500 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-gray-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-primary" />
                <Typography as="h3" size="sm" className="font-semibold">
                  Duration
                </Typography>
              </div>
              <Typography as="p" size="sm" className="text-gray-600">
                {destination.duration.minDays} - {destination.duration.maxDays}{" "}
                days
              </Typography>
            </div>

            {/* Difficulty */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TreePalm size={20} className="text-primary" />
                <Typography as="h3" size="sm" className="font-semibold">
                  Difficulty
                </Typography>
              </div>
              <Typography as="p" size="sm" className="text-gray-600">
                {destination.difficulty}
              </Typography>
            </div>

            {/* Group Size */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-primary" />
                <Typography as="h3" size="sm" className="font-semibold">
                  Group Size
                </Typography>
              </div>
              <Typography as="p" size="sm" className="text-gray-600">
                {destination.groupSize.min} - {destination.groupSize.max} people
              </Typography>
            </div>

            {/* Best Season */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun size={20} className="text-primary" />
                <Typography as="h3" size="sm" className="font-semibold">
                  Best Season
                </Typography>
              </div>
              <Typography as="p" size="sm" className="text-gray-600">
                {destination.bestSeason.join(", ")}
              </Typography>
            </div>
          </div>

          {/* Included/Excluded */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Typography as="h2" size="xl" className="font-semibold mb-3">
                What's Included
              </Typography>
              <ul className="space-y-2">
                {destination.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check
                      size={18}
                      className="text-green-500 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Typography as="h2" size="xl" className="font-semibold mb-3">
                What's Not Included
              </Typography>
              <ul className="space-y-2">
                {destination.excluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <X
                      size={18}
                      className="text-red-500 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <Typography as="h2" size="xl" className="font-semibold">
              Additional Information
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Accommodation */}
              <div className="flex items-start gap-3">
                <Home size={20} className="text-primary mt-0.5" />
                <div>
                  <Typography as="h3" size="sm" className="font-semibold">
                    Accommodation
                  </Typography>
                  <Typography as="p" size="sm" className="text-gray-600">
                    {destination.accommodation.type}{" "}
                    {destination.accommodation.rating &&
                      `(${destination.accommodation.rating} stars)`}
                  </Typography>
                </div>
              </div>

              {/* Transportation */}
              <div className="flex items-start gap-3">
                <Car size={20} className="text-primary mt-0.5" />
                <div>
                  <Typography as="h3" size="sm" className="font-semibold">
                    Transportation
                  </Typography>
                  <Typography as="p" size="sm" className="text-gray-600">
                    {destination.transportation.join(", ")}
                  </Typography>
                </div>
              </div>

              {/* Activities */}
              <div className="flex items-start gap-3">
                <Camera size={20} className="text-primary mt-0.5" />
                <div>
                  <Typography as="h3" size="sm" className="font-semibold">
                    Activities
                  </Typography>
                  <Typography as="p" size="sm" className="text-gray-600">
                    {destination.activities.join(", ")}
                  </Typography>
                </div>
              </div>

              {/* Languages */}
              <div className="flex items-start gap-3">
                <Languages size={20} className="text-primary mt-0.5" />
                <div>
                  <Typography as="h3" size="sm" className="font-semibold">
                    Languages
                  </Typography>
                  <Typography as="p" size="sm" className="text-gray-600">
                    {destination.languages.join(", ")}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-amber-600 mt-0.5" />
              <div>
                <Typography
                  as="h3"
                  size="sm"
                  className="font-semibold text-amber-800"
                >
                  Cancellation Policy
                </Typography>
                <Typography as="p" size="sm" className="text-amber-700">
                  {destination.cancellationPolicy.freeCancellation
                    ? `Free cancellation up to ${destination.cancellationPolicy.deadline}. ${destination.cancellationPolicy.fee} after the deadline.`
                    : `No free cancellation. ${destination.cancellationPolicy.fee} applies to all cancellations.`}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Chat Interface (Desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-100 h-[calc(100vh-8rem)] flex flex-col">
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
      </div>

      {/* Floating Action Button (Mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        >
          <MessageSquare size={24} />
        </Button>
      </div>

      {/* Mobile Chat Modal */}
      {isChatOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Typography as="h2" size="sm" className="font-semibold">
                Plan Your Trip
              </Typography>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
              >
                <X size={20} />
              </Button>
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
      )}
    </Container>
  );
};

export default DestinationDetailsPage;
