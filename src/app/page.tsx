'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ id: string; label: string; messages: { role: string; content: string }[] }[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');

  // Token limit (example: 4096 tokens for GPT models)
  const TOKEN_LIMIT = 4096;

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const storedChats = localStorage.getItem('chatHistory');
    if (storedChats) {
      try {
        const parsedChats = JSON.parse(storedChats);
        setChatHistory(parsedChats); // Restore from localStorage
      } catch (error) {
        console.error("Error parsing localStorage chatHistory:", error);
        localStorage.removeItem('chatHistory'); // If corrupted, reset storage
      }
    }
  }, []);

  // Save chat history to localStorage whenever chatHistory updates
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Handle selecting a chat session from the sidebar
  const selectChat = (id: string) => {
    const chat = chatHistory.find((chat) => chat.id === id);
    if (chat) {
      setMessages(chat.messages);
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
      const messageTokens = message.content.split(' ').length; // Basic token estimation
      tokenCount += messageTokens;

      if (tokenCount > TOKEN_LIMIT) break; // Stop if token limit exceeded

      limitedMessages.unshift(message); // Add to the front to preserve order
    }

    return limitedMessages;
  };

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

      console.log('Message context being sent to API:', limitedMessages)

      const res = await fetch('/api/aimlapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
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
        setChatHistory([{ id: chatId, label: label, messages: updatedMessages }, ...chatHistory]);
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white p-4 space-y-4">
        <button
          onClick={newChatSession}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">
          New Chat
        </button>
        <div className="overflow-y-auto space-y-2">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between">
              {/* Show label or edit input */}
              {editingLabel === chat.id ? (
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 bg-gray-700 text-white py-1 px-2 rounded-md"
                />
              ) : (
                <button
                  onClick={() => selectChat(chat.id)}
                  className={`flex-1 text-left py-2 px-4 rounded-md ${selectedChat === chat.id ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                >
                  {chat.label}
                </button>
              )}

              {/* Edit and Delete Icons */}
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
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 mb-4 rounded-lg ${message.role === 'user'
                ? 'bg-blue-500 text-white self-end'
                : 'bg-gray-200 text-gray-900'
                }`}
            >
              {message.content}
            </div>
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
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
        </div>
      </div>
    </div>
  );
}
