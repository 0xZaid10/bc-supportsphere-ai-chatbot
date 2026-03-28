import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const UserIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
    You
  </div>
);

const BotIcon: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white flex-shrink-0">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM10 11a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" fillRule="evenodd" />
    </svg>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const wrapperClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-blue-500 text-white'
    : 'bg-gray-200 text-gray-800';
  const messageContainerClasses = isUser
    ? 'flex items-end gap-2.5 flex-row-reverse'
    : 'flex items-end gap-2.5';

  const formatClassification = (classification?: string) => {
    if (!classification) return '';
    return classification
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className={`w-full ${wrapperClasses}`}>
      <div className={messageContainerClasses}>
        <div className="flex-shrink-0">
          {isUser ? <UserIcon /> : <BotIcon />}
        </div>
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 shadow-md ${bubbleClasses}`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          {message.ticketId && (
            <p className="text-xs mt-2 pt-2 border-t border-gray-300/50 font-semibold">
              Ticket Created: #{message.ticketId}
            </p>
          )}
          {message.classification && message.classification !== 'general_question' && (
            <p className="text-xs mt-1 italic opacity-80">
              Category: {formatClassification(message.classification)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;