"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function InboxPage() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "John Doe",
      platform: "WhatsApp",
      body: "Hello, I have a question about your product.",
      timestamp: new Date().toISOString(),
      isRead: false,
      aiTags: ["lead", "inquiry"],
    },
    {
      id: "2",
      sender: "Jane Smith",
      platform: "Instagram",
      body: "Can you help me with my recent order?",
      timestamp: new Date().toISOString(),
      isRead: true,
      aiTags: ["support", "order"],
    },
  ]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Inbox</h1>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`
                  p-4 border rounded-lg 
                  ${message.isRead ? "bg-white" : "bg-blue-50 border-blue-200"}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">{message.sender}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {message.platform}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{message.body}</p>
                <div className="mt-2 flex space-x-2">
                  {message.aiTags.map((tag) => (
                    <span
                      key={tag}
                      className="
                        px-2 py-1 rounded-full text-xs 
                        bg-blue-100 text-blue-800
                      "
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
