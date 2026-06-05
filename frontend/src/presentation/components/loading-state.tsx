interface LoadingStateProps {
  title?: string;
  message?: string;
}

export const LoadingState = ({
  title = 'Loading',
  message = 'Please wait while we prepare your experience.',
}: LoadingStateProps) => {
  return (
    <div className="animate-fade-in rounded-4xl border border-white/60 bg-white/80 p-8 shadow-panel backdrop-blur">
      <div className="flex flex-col items-center gap-5 py-4 text-center sm:flex-row sm:text-left">
        {/* Three-dot pulse loader */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="dot-bounce h-3 w-3 rounded-full bg-brand-500" />
          <span className="dot-bounce h-3 w-3 rounded-full bg-gold-500" />
          <span className="dot-bounce h-3 w-3 rounded-full bg-brand-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      </div>
    </div>
  );
};
