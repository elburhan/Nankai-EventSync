import { env } from '../config/env';

interface GroqRecommendationCandidate {
  id: string;
  title: string;
  category: string;
  startAt: string;
  tags: string[];
}

interface GroqRecommendationProfile {
  currentDate: string;
  favoriteCategories: string[];
  favoriteTags: string[];
  pastRsvpTitles: string[];
}

interface GroqRecommendationResult {
  eventId: string;
  reason: string;
}

// EventSync uses Llama 3.x through Groq's OpenAI-compatible API for recommendation ranking.
const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const isGroqRecommendationResult = (value: unknown): value is GroqRecommendationResult => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'eventId' in value &&
    typeof value.eventId === 'string' &&
    value.eventId.trim().length > 0 &&
    'reason' in value &&
    typeof value.reason === 'string' &&
    value.reason.trim().length > 0
  );
};

export const groqRecommendationClient = {
  isConfigured(): boolean {
    return Boolean(env.GROQ_API_KEY);
  },

  async generateRecommendations(
    profile: GroqRecommendationProfile,
    candidates: GroqRecommendationCandidate[],
    limit: number,
  ): Promise<GroqRecommendationResult[]> {
    if (!env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured.');
    }

    const systemPrompt = [
      'You are an event recommendation assistant for a university campus platform.',
      'You must recommend upcoming events for one user from the provided candidate events only.',
      'Return strict JSON with this shape: {"recommendations":[{"eventId":"...","reason":"..."}]}.',
      'Each reason must be short, specific, and student-friendly.',
      'Do not recommend events that are not in the candidate list.',
      'Do not include markdown or explanation outside the JSON.',
      'We are using Llama 3.1 style prompting via Groq for recommendation ranking.',
    ].join(' ');

    const userPrompt = JSON.stringify(
      {
        profile,
        limit,
        candidates,
      },
      null,
      2,
    );

    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Groq recommendation request failed: ${response.status} ${responseText}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };

    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Groq recommendation response did not include content.');
    }

    const parsed = JSON.parse(content) as {
      recommendations?: unknown[];
    };

    const allowedCandidateIds = new Set(candidates.map((candidate) => candidate.id));

    return Array.isArray(parsed.recommendations)
      ? parsed.recommendations
        .filter(isGroqRecommendationResult)
        .filter((recommendation) => allowedCandidateIds.has(recommendation.eventId))
        .map((recommendation) => ({
          eventId: recommendation.eventId,
          reason: recommendation.reason.trim(),
        }))
        .slice(0, limit)
      : [];
  },
};
