interface AttendeeCounterProps {
  isLive: boolean;
}

export const AttendeeCounter = ({ isLive }: AttendeeCounterProps) => {
  return (
    <div className="rounded-4xl border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Live Event Room
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            RSVP and chat stay synchronized in real time while you are viewing this event.
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
            isLive
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${isLive ? 'animate-pulse-slow bg-emerald-500' : 'bg-slate-400'}`}
            aria-hidden="true"
          />
          {isLive ? 'Live' : 'Connecting'}
        </span>
      </div>
    </div>
  );
};
