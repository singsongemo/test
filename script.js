"use client";
import React from "react";

import {
  useUpload,
  useHandleStreamResponse,
} from "../utilities/runtime-helpers";

const API_KEY = "";

function MainComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState("text");
  const [searchInput, setSearchInput] = useState("");
  const [error, setError] = useState(null);
  const [upload, { loading }] = useUpload();
  const [profileImage, setProfileImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [savedItems, setSavedItems] = useState({
    chat: [],
    image: [],
    code: [],
  });
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (message) => {
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setStreamingMessage("");
    },
  });
  const handleImageGeneration = async () => {
    if (!searchInput.trim() || loading) return;

    try {
      const response = await fetch(
        `/integrations/dall-e-3/?prompt=${encodeURIComponent(searchInput)}`
      );
      const data = await response.json();
      if (data.data && data.data[0]) {
        setGeneratedImage(data.data[0]);
        setSearchInput("");
      }
    } catch (err) {
      setError("Failed to generate image");
    }
  };
  const handleSubmit = async () => {
    if (!searchInput.trim() || loading) return;

    const userMessage = { role: "user", content: searchInput };
    setMessages((prev) => [...prev, userMessage]);
    setSearchInput("");

    const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        stream: true,
      }),
    });

    handleStreamResponse(response);
  };
  const mockUser = {
    name: "John Doe",
    image: "/profile-placeholder.jpg",
  };
  const modes = [
    { id: "text", icon: "fa-keyboard", label: "Content Generation" },
    { id: "image", icon: "fa-image", label: "Image Creation" },
    { id: "code", icon: "fa-code", label: "Coding" },
  ];

  const recentActivity = [
    { id: 1, type: "chat", title: "Recent Chat 1", timestamp: "2 hours ago" },
    {
      id: 2,
      type: "image",
      title: "Generated Image",
      timestamp: "4 hours ago",
    },
    { id: 3, type: "code", title: "Code Snippet", timestamp: "Yesterday" },
  ];
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { url, error } = await upload({ file });
      if (error) {
        setError(error);
        return;
      }
      setProfileImage(url);
    }
  };
  const handleSaveItem = (item, type) => {
    setSavedItems((prev) => ({
      ...prev,
      [type]: [...prev[type], item],
    }));
  };
  const handleImageSelect = (imageId) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraActive(true);
    } catch (err) {
      setError("Camera access denied");
    }
  };

  if (!API_KEY) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] font-roboto flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-500 mb-4">
            API Key Required
          </h2>
          <p>Please add your OpenAI API key to use this chat interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-roboto">
      <nav className="bg-white shadow-lg p-4 fixed w-full top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#333] hover:text-[#666]"
            >
              <img
                src={mockUser.image}
                alt="User profile"
                className="w-10 h-10 rounded-full"
              />
            </button>
            <h1 className="text-xl font-semibold hidden md:block">
              Welcome, {mockUser.name}
            </h1>
          </div>
          <div className="flex-1 max-w-2xl mx-4">
            <div className="flex items-center bg-[#f5f5f5] rounded-lg p-2">
              <i className="fas fa-search text-[#666] mx-2"></i>
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent outline-none"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCameraCapture}
                  className="p-2 hover:bg-[#e0e0e0] rounded"
                >
                  <i className="fas fa-camera"></i>
                </button>
                <button className="p-2 hover:bg-[#e0e0e0] rounded">
                  <i className="fas fa-microphone"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white w-64 shadow-xl transition-transform duration-200 ease-in-out z-50`}
      >
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={profileImage || mockUser.image}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-4"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="profile-upload"
            />
            <label
              htmlFor="profile-upload"
              className="cursor-pointer text-sm text-[#666] hover:text-[#333]"
            >
              Change Photo
            </label>
          </div>
          <div className="space-y-4">
            <button className="w-full text-left px-4 py-2 hover:bg-[#f5f5f5] rounded">
              <i className="fas fa-cog mr-2"></i> Settings
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-[#f5f5f5] rounded">
              <i className="fas fa-question-circle mr-2"></i> Help Center
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-[#f5f5f5] rounded">
              <i className="fas fa-comment mr-2"></i> Send Us Feedback
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-[#f5f5f5] rounded">
              <i className="fas fa-sign-out-alt mr-2"></i> Sign Out
            </button>
          </div>
        </div>
      </div>

      <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="my-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`p-6 rounded-lg shadow-md flex flex-col items-center justify-center space-y-2 transition-colors ${
                  selectedMode === mode.id
                    ? "bg-[#007AFF] text-white"
                    : "bg-white text-[#333] hover:bg-[#f5f5f5]"
                }`}
              >
                <i className={`fas ${mode.icon} text-2xl`}></i>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-[400px] overflow-y-auto mb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-[#007AFF] text-white"
                        : "bg-[#f5f5f5] text-[#333]"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {streamingMessage && (
                <div className="text-left">
                  <div className="inline-block p-3 rounded-lg bg-[#f5f5f5] text-[#333]">
                    {streamingMessage}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-[#007AFF]"
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0056b3] disabled:opacity-50"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainComponent;