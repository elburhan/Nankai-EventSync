import { useState } from 'react';

interface ChatComposerProps {
  canChat: boolean;
  isSending: boolean;
  onSend: (body: string) => Promise<void>;
}

export const ChatComposer = ({ canChat, isSending, onSend }: ChatComposerProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    await onSend(trimmedValue);
    setValue('');
  };

  return (
    <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={!canChat || isSending}
        rows={4}
        placeholder={canChat ? 'Share updates with the room.' : 'RSVP first to unlock attendee chat.'}
        className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50"
      />
      <button
        type="submit"
        disabled={!canChat || isSending || !value.trim()}
        className="w-full rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? 'Sending...' : 'Send message'}
      </button>
    </form>
  );
};
