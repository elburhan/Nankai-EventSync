import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { eventFormSchema } from '../../business/schemas/event.schema';
import { EVENT_CATEGORIES, getEventCategoryTranslationKey } from '../../shared/constants/event-category';
import type { EventFormValues, EventStatus } from '../../shared/types/event';

interface EventFormProps {
  mode: 'create' | 'edit';
  initialValues: EventFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: EventFormValues) => Promise<void>;
}

const statusOptions: EventStatus[] = ['published', 'draft', 'cancelled', 'completed'];

export const EventForm = ({ mode, initialValues, isSubmitting, submitLabel, onSubmit }: EventFormProps) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<EventFormValues>(initialValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const posterPreview = useMemo(() => {
    if (values.posterFile) {
      return URL.createObjectURL(values.posterFile);
    }

    if (!values.removePoster) {
      return values.posterUrl;
    }

    return undefined;
  }, [values.posterFile, values.posterUrl, values.removePoster]);

  useEffect(() => {
    return () => {
      if (values.posterFile && posterPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(posterPreview);
      }
    };
  }, [posterPreview, values.posterFile]);

  const handleChange = (field: keyof EventFormValues, value: string | boolean | File | null) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const parsedValues = eventFormSchema.parse(values);
      await onSubmit(parsedValues);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('toasts.genericError'));
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
            {mode === 'create' ? t('eventForm.createEyebrow') : t('eventForm.editEyebrow')}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink">
            {mode === 'create' ? t('eventForm.createTitle') : t('eventForm.editTitle')}
          </h1>
          <p className="mt-3 text-sm text-slate-600">{t('eventForm.description')}</p>

          <div className="mt-8 grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.titleLabel')}</span>
              <input
                value={values.title}
                onChange={(event) => handleChange('title', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="Nankai Innovation Showcase"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.descriptionLabel')}</span>
              <textarea
                value={values.description}
                onChange={(event) => handleChange('description', event.target.value)}
                rows={6}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="Tell students what the event is about, who it is for, and what they should expect."
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.categoryLabel')}</span>
                <select
                  value={values.category}
                  onChange={(event) => handleChange('category', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  required
                >
                  {EVENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(getEventCategoryTranslationKey(category))}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.locationLabel')}</span>
                <input
                  value={values.location}
                  onChange={(event) => handleChange('location', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  placeholder="Student Center Hall A"
                  required
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.startLabel')}</span>
                <input
                  type="datetime-local"
                  value={values.startAt}
                  onChange={(event) => handleChange('startAt', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.endLabel')}</span>
                <input
                  type="datetime-local"
                  value={values.endAt}
                  onChange={(event) => handleChange('endAt', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  required
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.timezoneLabel')}</span>
                <input
                  value={values.timezone}
                  onChange={(event) => handleChange('timezone', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  placeholder="Asia/Shanghai"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.capacityLabel')}</span>
                <input
                  type="number"
                  min="1"
                  value={values.capacity}
                  onChange={(event) => handleChange('capacity', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  placeholder="120"
                />
                <span className="mt-2 block text-xs text-slate-500">{t('eventForm.capacityHint')}</span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('eventForm.tagsLabel')}</span>
                <input
                  value={values.tags}
                  onChange={(event) => handleChange('tags', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  placeholder="ai, campus, showcase"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">{t('eventForm.publishSettings')}</p>
            <div className="mt-5 space-y-3">
              {statusOptions.map((status) => {
                const isActive = values.status === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleChange('status', status)}
                    className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${
                      isActive
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
                    }`}
                  >
                    <p className="font-semibold">{t(`eventForm.labels.${status}`)}</p>
                    <p className="mt-1 text-sm opacity-80">{t(`eventForm.descriptions.${status}`)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-panel backdrop-blur sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">{t('eventForm.posterUpload')}</p>
            <p className="mt-3 text-sm text-slate-600">{t('eventForm.posterDescription')}</p>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-brand-200 bg-brand-50/60 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50">
              <span className="text-sm font-semibold text-brand-800">{t('eventForm.choosePoster')}</span>
              <span className="mt-2 text-sm text-slate-600">{t('eventForm.maxPoster')}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  handleChange('posterFile', file);
                  if (file) {
                    handleChange('removePoster', false);
                  }
                }}
              />
            </label>

            {posterPreview ? (
              <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-slate-100">
                <img src={posterPreview} alt="Poster preview" className="h-64 w-full object-cover" />
              </div>
            ) : (
              <div className="mt-6 rounded-[1.75rem] bg-slate-100 px-5 py-10 text-center text-sm text-slate-500">
                {t('eventForm.posterPreviewEmpty')}
              </div>
            )}

            {initialValues.posterUrl ? (
              <label className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={values.removePoster}
                  onChange={(event) => handleChange('removePoster', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                {t('eventForm.removePoster')}
              </label>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[1.5rem] bg-ink px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t('eventForm.saving') : submitLabel}
          </button>
        </section>
      </div>
    </form>
  );
};
