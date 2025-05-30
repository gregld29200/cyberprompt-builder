export type PromptType = 'MVP' | 'AGENTIC';
export type Language = 'fr' | 'en';
export type Domain = 'education' | 'technical' | 'creative' | 'analysis' | 'other';
export type Complexity = 'auto' | 'simple' | 'complex';
export type OutputLength = 'short' | 'medium' | 'long';
export type ThemeMode = 'dark' | 'light'; // For potential theme toggle in the future

// API Key related types for BYOK functionality
export type ApiKeyStatus = 'unset' | 'validating' | 'valid' | 'invalid' | 'expired';
export type ApiKeyStorage = 'none' | 'session' | 'local';

export interface ApiKeyState {
  key: string;
  status: ApiKeyStatus;
  storage: ApiKeyStorage;
  errorMessage?: string;
  lastValidated?: number; // Timestamp
}

// UI animation and effect states for cyber theme
export type CyberEffect = 'glitch' | 'neon' | 'pulse' | 'flicker' | 'none';
export type CyberAnimationState = 'idle' | 'active' | 'loading' | 'success' | 'error';

export interface SavedPrompt {
  id: string;
  timestamp: number;
  rawRequest: string;
  generatedPrompt: string;
  type: PromptType;
  domain: Domain;
  language: Language;
  favorite?: boolean;
  tags?: string[]; // New field for categorizing saved prompts
}

// For translations structure
interface TranslationSet {
  app: {
    title: string;
    subtitle: string;
  };
  apiKey: { // New section for API key management
    title: string;
    placeholder: string;
    saveButton: string;
    validMessage: string;
    invalidMessage: string;
    storagePrompt: string;
    sessionStorage: string;
    localStorage: string;
    noStorage: string;
    securityNote: string;
  };
  input: {
    placeholder: string;
    button: string;
    charCount: string;
    minCharWarning: string;
  };
  analysis: {
    title: string;
    domain: string;
    complexity: string;
    recommendation: string;
    simple: string;
    complex: string;
  };
  approach: {
    title: string;
    mvp: {
      title: string;
      subtitle: string;
      description: string;
    };
    agentique: {
      title: string;
      subtitle: string;
      description: string;
    };
  };
  variables: {
    title: string;
    domain: string;
    outputLength: string;
    expertRole: string;
    mission: string;
    constraints: string;
    next: string;
    back: string;
    expertRolePlaceholder: string;
    missionPlaceholder: string;
    constraintsPlaceholder: string;
  };
  generation: {
    generating: string;
    title: string;
    error: string;
  };
  actions: {
    copy: string;
    save: string;
    export: string;
    generate: string;
    newPrompt: string;
    viewLibrary: string;
    copiedSuccess: string;
    copyError: string;
    savedSuccess: string;
    usePrompt: string;
  };
  library: {
    title: string;
    empty: string;
    close: string;
    filter: string; // New field for filtering saved prompts
    sortBy: string; // New field for sorting options
    deletePrompt: string; // New field for delete confirmation
    exportAll: string; // New field for exporting all prompts
  };
  domains: {
    education: string;
    technical: string;
    creative: string;
    analysis: string;
    other: string;
  };
  lengths: {
    short: string;
    medium: string;
    long: string;
  };
  notifications: {
    copied: string;
    copyFailed: string;
    saved: string;
    apiError: string;
    apiKeyRequired: string; // New notification for missing API key
    apiKeyValid: string; // New notification for valid API key
    apiKeyInvalid: string; // New notification for invalid API key
  };
  theme: { // New section for theme-related translations
    toggleLabel: string;
    darkMode: string;
    lightMode: string;
    effectsLabel: string;
    effectsOn: string;
    effectsOff: string;
  };
}

export type Translations = {
  fr: TranslationSet;
  en: TranslationSet;
};

// For UI component states in the cyber theme
export interface CyberUiState {
  animationState: CyberAnimationState;
  activeEffects: CyberEffect[];
  effectsEnabled: boolean;
}
