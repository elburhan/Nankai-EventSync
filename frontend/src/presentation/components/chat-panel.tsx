import type { EventMessage } from '../../shared/types/event';
import { EmptyState } from './empty-state';
import { ChatComposer } from './chat-composer';
import { ChatMessageList } from './chat-message-list';

interface ChatPanelProps {
  currentUserId: string | null;
  messages: EventMessage[];
  canChat: boolean;
  isSending: boolean;
  onSend: (body: string) => Promise<void>;
}

export const ChatPanel = ({
  currentUserId,
  messages,
  canChat,
  isSending,
  onSend,
}: ChatPanelProps) => {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Event Room Chat</p>
      <h2 className="mt-2 text-2xl font-bold text-ink">Live conversation</h2>
      <p className="mt-2 text-sm text-slate-600">
        Organizers and attendees can coordinate instantly inside the room.
      </p>

      <div className="mt-6 max-h-[28rem] overflow-y-auto pr-1">
        {messages.length > 0 ? (
          <ChatMessageList currentUserId={currentUserId} messages={messages} />
        ) : (
          <EmptyState
            title="No messages yet"
            message="Start the conversation with timing updates, logistics, or a welcome note."
          />
        )}
      </div>

      <ChatComposer canChat={canChat} isSending={isSending} onSend={onSend} />
    </section>
  );
};
