interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  actionLabel,
  onAction,
}: ErrorStateProps) => {
  return (
    <div className="animate-fade-in rounded-4xl border border-red-100 bg-red-50/80 p-8 shadow-card backdrop-blur">
      <div className="flex items-start gap-4">
        {/* Warning icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
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
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold text-red-800">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-red-700">{message}</p>
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
