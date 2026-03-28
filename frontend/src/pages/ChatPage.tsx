import React from 'react';
import ChatbotWidget from '../components/ChatbotWidget';

const ChatPage: React.FC = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="w-full max-w-2xl">
        <ChatbotWidget />
      </div>
    </main>
  );
};

export default ChatPage;