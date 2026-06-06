interface RsvpActionCardProps {
  isPrivilegedUser: boolean;
  isAdmin: boolean;
  isAttending: boolean;
  isBusy: boolean;
  onToggleRsvp: () => Promise<void>;
}

export const RsvpActionCard = ({
  isPrivilegedUser,
  isAdmin,
  isAttending,
  isBusy,
  onToggleRsvp,
}: RsvpActionCardProps) => {
  if (isPrivilegedUser) {
    return (
      <div className="rounded-4xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            {isAdmin ? 'Admin Access' : 'Organizer Access'}
          </p>
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink">
          {isAdmin ? 'You can moderate this event room' : 'You are hosting this event'}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          {isAdmin
            ? 'You can communicate in this event room without creating an RSVP.'
            : 'You already have full access to the event room and can communicate with attendees live.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-4xl border p-6 shadow-panel transition-all ${
        isAttending
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
          : 'border-white/60 bg-white/90 backdrop-blur'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            isAttending ? 'bg-emerald-100 text-emerald-600' : 'bg-gold-50 text-gold-600'
          }`}
        >
          {isAttending ? (
            /* Check icon */
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            /* Calendar icon */
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          )}
        </div>
        <p className={`text-xs font-semibold uppercase tracking-widest ${isAttending ? 'text-emerald-600' : 'text-gold-600'}`}>
          Participation
        </p>
      </div>

      <h2 className="mt-4 text-lg font-bold text-ink">
        {isAttending ? 'You are attending' : 'Join the live event room'}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
        {isAttending
          ? 'Cancel if your plans change.'
          : 'RSVP to unlock attendee-only chat and become part of the live classroom demo.'}
      </p>

      <button
        type="button"
        onClick={() => void onToggleRsvp()}
        disabled={isBusy}
        className={`mt-5 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          isAttending
            ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300'
            : 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-sm hover:from-gold-600 hover:to-gold-700 focus:ring-gold-400'
        }`}
      >
        {isBusy ? 'Saving...' : isAttending ? 'Cancel RSVP' : 'Join Event'}
      </button>
    </div>
  );
};
