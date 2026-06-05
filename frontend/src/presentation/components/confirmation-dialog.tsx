interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isOpen: boolean;
  isBusy?: boolean;
  tone?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  isOpen,
  isBusy = false,
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) => {
  if (!isOpen) {
    return null;
  }

  const confirmButtonClassName =
    tone === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-ink text-white hover:bg-slate-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white p-6 shadow-panel sm:p-8"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Confirmation</p>
        <h2 id="confirmation-dialog-title" className="mt-3 text-2xl font-bold text-ink">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmButtonClassName}`}
          >
            {isBusy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
