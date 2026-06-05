import { useEffect, useRef } from 'react';

import type { EventMessage } from '../../shared/types/event';

interface ChatMessageListProps {
  currentUserId: string | null;
  messages: EventMessage[];
}

export const ChatMessageList = ({ currentUserId, messages }: ChatMessageListProps) => {
  const containerReference = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerReference.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [messages]);

  return (
    <div ref={containerReference} className="space-y-3">
      {messages.map((message) => {
        const isCurrentUser = currentUserId === message.sender.id;

        return (
          <div
            key={message.id}
            className={`rounded-[1.5rem] px-4 py-3 ${
              isCurrentUser ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className={`text-sm font-semibold ${isCurrentUser ? 'text-white' : 'text-ink'}`}>
                {message.sender.fullName}
              </p>
              <span className={`text-xs ${isCurrentUser ? 'text-brand-100' : 'text-slate-500'}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className={`mt-2 text-sm leading-6 ${isCurrentUser ? 'text-white/90' : 'text-slate-600'}`}>
              {message.body}
            </p>
          </div>
        );
      })}
    </div>
  );
};
