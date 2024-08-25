//sec/app/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import availableModels from '@/lib/AiModelName'; // Import models from AiModelName.ts
import Link from 'next/link';
import React from 'react';
import { debounce } from 'lodash';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ id: string; label: string; model: string; messages: { role: string; content: string }[] }[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');

  // Track the selected model
  const [selectedModel, setSelectedModel] = useState<string>(''); // Changed from null to an empty string
  // Token limit (example: 4096 tokens for GPT models)
  const TOKEN_LIMIT = 4096;

  // Create a ref for the message container
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the message container
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  // Load chat history and last selected model from localStorage on component mount
  useEffect(() => {
    const storedChats = localStorage.getItem('chatHistory');
    try {
      const storedModel = localStorage.getItem('selectedModel');
      if (storedModel) {
        setSelectedModel(storedModel); // Restore the last selected model from localStorage
      }
    } catch (error) {
      console.error("Error retrieving selected model from localStorage:", error);
      localStorage.removeItem('selectedModel'); // If corrupted, reset storage
    }

    if (storedChats) {
      try {
        const parsedChats = JSON.parse(storedChats);
        setChatHistory(parsedChats); // Restore chat history from localStorage
      } catch (error) {
        console.error("Error parsing localStorage chatHistory:", error);
        localStorage.removeItem('chatHistory'); // If corrupted, reset storage
      }
    }
  }, []);

  // Save chat history and selected model to localStorage whenever they change
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem('selectedModel', selectedModel);
    }
  }, [selectedModel]);

  // Scroll to bottom whenever messages change (after new messages are added)
  useEffect(() => {
    scrollToBottom(); // Scroll down after each message is added
  }, [messages]);

  // Handle selecting a chat session from the sidebar and restoring the model
  const selectChat = (id: string) => {
    const chat = chatHistory.find((chat) => chat.id === id);
    if (chat) {
      setMessages(chat.messages);
      setSelectedModel(chat.model); // Restore the selected model for this chat
      setSelectedChat(id);
    }
  };

  // Create a new chat session
  const newChatSession = () => {
    setMessages([]);
    setSelectedChat(null);
  };

  // Generate a label by combining multiple messages if the label is below 15 characters
  const generateLabelFromMessages = (messages: { role: string; content: string }[]) => {
    let label = messages[0].content;
    let i = 1;
    while (label.length < 15 && i < messages.length) {
      label += ' ' + messages[i].content;
      i++;
    }
    return label.length > 30 ? label.substring(0, 30) + '...' : label;  // Limit label to 30 characters
  };

  // Function to limit message context based on token length
  const limitMessageContext = (messages: { role: string; content: string }[]) => {
    let tokenCount = 0;
    const limitedMessages: { role: string; content: string }[] = [];

    // Reverse loop to prioritize recent messages (chatbot remembers recent history better)
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = message.content.split(/\s+/).length; // Basic token estimation with regex
      tokenCount += messageTokens;

      if (tokenCount > TOKEN_LIMIT) break; // Stop if token limit exceeded

      limitedMessages.unshift(message); // Add to the front to preserve order
    }

    return limitedMessages;
  };

  // Debounced sendMessage function
  const debouncedSendMessage = debounce(() => {
    sendMessage();
  }, 300);

  // Send a message and update the chat history
  const sendMessage = async () => {
    if (!input) return;

    setIsLoading(true);
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      // Limit message context to TOKEN_LIMIT before sending
      const limitedMessages = limitMessageContext(newMessages);

      const res = await fetch('/api/aimlapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          model: selectedModel, // Send selected model with the request
          messages: limitedMessages // Send only the relevant message context
        }),
      });

      const data = await res.json();
      const updatedMessages = [...newMessages, { role: 'assistant', content: data.data }];
      setMessages(updatedMessages);

      if (!selectedChat) {
        // New chat session, generate label by combining multiple messages if needed
        const chatId = Date.now().toString();
        const label = generateLabelFromMessages(updatedMessages); // Generate label
        setChatHistory([{ id: chatId, label: label, model: selectedModel, messages: updatedMessages }, ...chatHistory]);
        setSelectedChat(chatId);
      } else {
        // Update existing chat
        const updatedHistory = chatHistory.map((chat) =>
          chat.id === selectedChat ? { ...chat, messages: updatedMessages } : chat
        );
        setChatHistory(updatedHistory);

        // Update label if it is below 15 characters by combining messages
        const chatToUpdate = updatedHistory.find(chat => chat.id === selectedChat);
        if (chatToUpdate && chatToUpdate.label.length < 15) {
          const newLabel = generateLabelFromMessages(chatToUpdate.messages);
          setChatHistory(updatedHistory.map(chat =>
            chat.id === selectedChat ? { ...chat, label: newLabel } : chat
          ));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a chat label
  const handleEditLabel = (id: string) => {
    setEditingLabel(id);
    const chat = chatHistory.find((chat) => chat.id === id);
    if (chat) setNewLabel(chat.label);
  };

  const saveLabel = (id: string) => {
    setChatHistory(chatHistory.map(chat => chat.id === id ? { ...chat, label: newLabel } : chat));
    setEditingLabel(null);  // Close the edit input
  };

  // Handle deleting a chat
  const deleteChat = (id: string) => {
    setChatHistory(chatHistory.filter(chat => chat.id !== id));
    if (selectedChat === id) {
      setMessages([]);  // Clear messages if the deleted chat was active
      setSelectedChat(null);
    }
  };

  return (
    <div className="flex h-screen text-sm">
      {/* Sidebar */}
      <div className="w-1/4 bg-pink-200 p-4 space-y-4">
        <button
          onClick={newChatSession}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">
          New Chat
        </button>

        {/* Dropdown to select a model */}
        <div className="mb-4">
          <label className="text-sm text-gray-800">Select Model:</label>
          <div className='flex'>
            <select
              className="w-full bg-white text-blue-800 p-2 rounded-md"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {availableModels.map((model) => (
                <option key={model.model_string_for_api} value={model.model_string_for_api}>
                  {model.model_name} - {model.organization}
                </option>
              ))}
            </select>
            <div className='text-blue-500 border-2 border-blue-500 rounded-md p-2  ' >
              <Link href="/models">More..</Link>
            </div>
          </div>
        </div>
        {/* Chat history with a scrollbar */}
        <div className="overflow-y-auto space-y-2 h-[calc(100vh-180px)]">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between">
              {editingLabel === chat.id ? (
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 bg-gray-700 text-white py-1 px-2 rounded-md"
                />
              ) : (
                <button
                  onClick={() => selectChat(chat.id)}
                  className={`flex-1 text-left py-2 px-4 rounded-md ${selectedChat === chat.id ? 'bg-blue-200' : 'bg-gray-400'}`}
                >
                  {chat.label}
                </button>
              )}

              {editingLabel === chat.id ? (
                <button onClick={() => saveLabel(chat.id)} className="ml-2 text-green-400">
                  Save
                </button>
              ) : (
                <button onClick={() => handleEditLabel(chat.id)} className="ml-2">
                  <Image src="/pencil.svg" alt="Edit" width={15} height={15} />
                </button>
              )}
              <button onClick={() => deleteChat(chat.id)} className="ml-2">
                <Image src="/trash.svg" alt="Delete" width={15} height={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-col w-3/4 h-full bg-gray-100 justify-between">
        {/* Messages */}
        <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
          {isLoading && <div className="text-center text-gray-500">Generating response...</div>}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-300">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && debouncedSendMessage()}
          />
        </div>
      </div>
    </div>
  );
}

// Memoized Message component to avoid re-rendering
const Message = React.memo(({ message }: { message: { role: string; content: string } }) => (
  <div
    className={`p-3 mb-4 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-900'}`}
  >
    {message.content}
  </div>
));

// Set display name to fix the ESLint issue
Message.displayName = 'Message';
