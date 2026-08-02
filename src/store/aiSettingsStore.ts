export interface AiSettings {
  apiKey: string;
  model: string;
  temperature: number;
  enabled: boolean;
}

const STORAGE_KEY = 'pulsedesk_ai_settings';

const defaults: AiSettings = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  enabled: false,
};

export const aiSettingsStore = {
  get(): AiSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  },

  save(patch: Partial<AiSettings>): AiSettings {
    const next = { ...aiSettingsStore.get(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  isConfigured(): boolean {
    const { apiKey, enabled } = aiSettingsStore.get();
    return enabled && apiKey.startsWith('sk-');
  },
};
