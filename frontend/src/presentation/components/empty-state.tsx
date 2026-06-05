interface EmptyStateProps {
  title: string;
  message: string;
}

export const EmptyState = ({ title, message }: EmptyStateProps) => {
  return (
    <div className="animate-fade-in rounded-4xl border border-dashed border-slate-200 bg-white/60 p-10 text-center shadow-card backdrop-blur">
      {/* Decorative icon */}
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
    </div>
  );
};
