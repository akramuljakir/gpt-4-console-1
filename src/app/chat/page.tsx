// src/app/chat/page.tsx (Home Page for Chat)
'use client';
import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const sendMessage = async () => {
        if (!input) return;

        setIsLoading(true);

        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');

        // Fetch response from your API
        const res = await fetch('/api/aimlapi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: input }),
        });

        const data = await res.json();
        setIsLoading(false);

        // Add AI response
        setMessages([...newMessages, { role: 'assistant', content: data.data }]);

        // Scroll to bottom when new messages are added
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll to bottom when component mounts or messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`max-w-lg rounded-xl p-4 ${message.role === 'user'
                                ? 'bg-blue-500 text-white self-end'
                                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100 text-gray-900 self-start'
                            }`}
                    >
                        {message.content}
                    </div>
                ))}
                {isLoading && (
                    <div className="text-center text-gray-500 dark:text-gray-400">Generating response...</div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Chat Input Area */}
            <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600">
                <input
                    type="text"
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
            </div>
        </div>
    );
}
