import { useNotification } from '../../shared/hooks/use-notification';
import { className } from '../../shared/utils/class-name';

const toneStyles: Record<'success' | 'error' | 'info', string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-brand-200 bg-brand-50 text-brand-900',
};

export const ToastViewport = () => {
  const { notifications, dismiss } = useNotification();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:px-6 lg:px-8">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={className(
            'pointer-events-auto ml-auto w-full max-w-sm rounded-[1.5rem] border px-4 py-4 shadow-panel backdrop-blur',
            toneStyles[notification.tone],
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">{notification.title}</p>
              {notification.description ? <p className="mt-1 text-sm opacity-80">{notification.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(notification.id)}
              className="rounded-full px-2 py-1 text-xs font-semibold transition hover:bg-white/70"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
