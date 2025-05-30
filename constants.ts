import type { Language, Domain, OutputLength, Translations, ApiKeyStorage } from './types';

export const DEFAULT_LANGUAGE: Language = 'en';
export const MIN_RAW_REQUEST_LENGTH = 10;
export const MAX_RAW_REQUEST_LENGTH = 2000;

// API Key related constants
export const API_KEY_STORAGE_OPTIONS: { value: ApiKeyStorage; labelToken: keyof Translations['en']['apiKey'] }[] = [
  { value: 'session', labelToken: 'sessionStorage' },
  { value: 'local', labelToken: 'localStorage' },
  { value: 'none', labelToken: 'noStorage' },
];

export const DEFAULT_API_KEY_STORAGE: ApiKeyStorage = 'session';
export const API_KEY_STORAGE_KEY = 'cyberprompt-gemini-api-key';
export const API_KEY_VALIDATION_INTERVAL = 86400000; // 24 hours in milliseconds

export const DOMAIN_OPTIONS: { value: Domain; labelToken: keyof Translations['en']['domains'] }[] = [
  { value: 'education', labelToken: 'education' },
  { value: 'technical', labelToken: 'technical' },
  { value: 'creative', labelToken: 'creative' },
  { value: 'analysis', labelToken: 'analysis' },
  { value: 'other', labelToken: 'other' },
];

export const OUTPUT_LENGTH_OPTIONS: { value: OutputLength; labelToken: keyof Translations['en']['lengths'] }[] = [
  { value: 'short', labelToken: 'short' },
  { value: 'medium', labelToken: 'medium' },
  { value: 'long', labelToken: 'long' },
];

export const GEMINI_MODEL_NAME = 'gemini-1.5-pro';
export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com';

export const translations: Translations = {
  fr: {
    app: {
      title: "Brainspire",
      subtitle: "Prompt Builder"
    },
    apiKey: {
      title: "Configuration de l'API",
      placeholder: "Saisissez votre clé API Gemini...",
      saveButton: "Initialiser le système",
      validMessage: "Clé API validée et opérationnelle",
      invalidMessage: "Clé API non valide ou inaccessible",
      storagePrompt: "Méthode de stockage de la clé:",
      sessionStorage: "Mémoire temporaire (session)",
      localStorage: "Stockage persistant (local)",
      noStorage: "Ne pas stocker",
      securityNote: "Note: Votre clé API reste sur votre appareil et n'est jamais transmise à nos serveurs."
    },
    input: {
      placeholder: "Décrivez votre directive pour l'IA...",
      button: "Analyser la requête",
      charCount: "caractères",
      minCharWarning: `Minimum ${MIN_RAW_REQUEST_LENGTH} caractères requis`
    },
    analysis: {
      title: "Analyse de la requête",
      domain: "Domaine détecté",
      complexity: "Complexité calculée",
      recommendation: "Protocole recommandé",
      simple: "Standard",
      complex: "Avancé"
    },
    approach: {
      title: "Sélection du protocole",
      mvp: {
        title: "MVP",
        subtitle: "(Recommandé pour tâches standard)",
        description: "Architecture System-User-Exemple"
      },
      agentique: {
        title: "AGENTIQUE",
        subtitle: "(Pour opérations complexes)",
        description: "Avec auto-évaluation et itération autonome"
      }
    },
    variables: {
      title: "Calibration des paramètres",
      domain: "Domaine",
      outputLength: "Volume de sortie",
      expertRole: "Rôle d'expertise",
      mission: "Directive principale",
      constraints: "Paramètres (un par ligne)",
      next: "Continuer",
      back: "Retour",
      expertRolePlaceholder: "Ex: Ingénieur Système",
      missionPlaceholder: "Ex: optimiser les processus techniques",
      constraintsPlaceholder: "Ex:\nDurée: 30 minutes\nFormat: JSON\nComplexité: Niveau expert"
    },
    generation: {
      generating: "Compilation en cours...",
      title: "Prompt optimisé",
      error: "Erreur de génération. Vérifiez votre clé API et réessayez."
    },
    actions: {
      copy: "Copier",
      save: "Sauvegarder",
      export: "Exporter",
      generate: "Générer le prompt",
      newPrompt: "Nouvelle requête",
      viewLibrary: "Base de données",
      copiedSuccess: "Copié!",
      copyError: "Échec de copie",
      savedSuccess: "Sauvegardé!",
      usePrompt: "Utiliser"
    },
    library: {
      title: "Base de données des prompts",
      empty: "Aucun prompt enregistré",
      close: "Fermer",
      filter: "Filtrer",
      sortBy: "Trier par",
      deletePrompt: "Supprimer",
      exportAll: "Exporter tout"
    },
    domains: {
      education: "Éducation",
      technical: "Technique",
      creative: "Créatif",
      analysis: "Analyse",
      other: "Autre"
    },
    lengths: {
      short: "Concis",
      medium: "Standard",
      long: "Étendu"
    },
    notifications: {
      copied: "Prompt copié dans le presse-papiers!",
      copyFailed: "Échec de la copie du prompt.",
      saved: "Prompt sauvegardé dans la base de données!",
      apiError: "Erreur de l'API Gemini. Vérifiez votre clé API et réessayez.",
      apiKeyRequired: "Clé API Gemini requise pour continuer.",
      apiKeyValid: "Clé API validée avec succès.",
      apiKeyInvalid: "Clé API invalide. Vérifiez et réessayez."
    },
    theme: {
      toggleLabel: "Mode d'affichage",
      darkMode: "Mode sombre",
      lightMode: "Mode clair",
      effectsLabel: "Effets visuels",
      effectsOn: "Activés",
      effectsOff: "Désactivés"
    }
  },
  en: {
    app: {
      title: "Brainspire",
      subtitle: "Prompt Builder"
    },
    apiKey: {
      title: "API Configuration",
      placeholder: "Enter your Gemini API key...",
      saveButton: "Initialize System",
      validMessage: "API key validated and operational",
      invalidMessage: "API key invalid or inaccessible",
      storagePrompt: "Key storage method:",
      sessionStorage: "Temporary memory (session)",
      localStorage: "Persistent storage (local)",
      noStorage: "Don't store",
      securityNote: "Note: Your API key stays on your device and is never transmitted to our servers."
    },
    input: {
      placeholder: "Describe your directive for the AI...",
      button: "Analyze Request",
      charCount: "characters",
      minCharWarning: `Minimum ${MIN_RAW_REQUEST_LENGTH} characters required`
    },
    analysis: {
      title: "Request Analysis",
      domain: "Detected Domain",
      complexity: "Calculated Complexity",
      recommendation: "Recommended Protocol",
      simple: "Standard",
      complex: "Advanced"
    },
    approach: {
      title: "Protocol Selection",
      mvp: {
        title: "MVP",
        subtitle: "(Recommended for standard tasks)",
        description: "System-User-Example architecture"
      },
      agentique: {
        title: "AGENTIC",
        subtitle: "(For complex operations)",
        description: "With self-assessment and autonomous iteration"
      }
    },
    variables: {
      title: "Parameter Calibration",
      domain: "Domain",
      outputLength: "Output Volume",
      expertRole: "Expertise Role",
      mission: "Primary Directive",
      constraints: "Parameters (one per line)",
      next: "Continue",
      back: "Back",
      expertRolePlaceholder: "Ex: Systems Engineer",
      missionPlaceholder: "Ex: optimize technical processes",
      constraintsPlaceholder: "Ex:\nDuration: 30 minutes\nFormat: JSON\nComplexity: Expert level"
    },
    generation: {
      generating: "Compiling...",
      title: "Optimized Prompt",
      error: "Generation error. Check your API key and try again."
    },
    actions: {
      copy: "Copy",
      save: "Save",
      export: "Export",
      generate: "Generate Prompt",
      newPrompt: "New Request",
      viewLibrary: "Database",
      copiedSuccess: "Copied!",
      copyError: "Copy failed",
      savedSuccess: "Saved!",
      usePrompt: "Use"
    },
    library: {
      title: "Prompt Database",
      empty: "No saved prompts",
      close: "Close",
      filter: "Filter",
      sortBy: "Sort by",
      deletePrompt: "Delete",
      exportAll: "Export All"
    },
    domains: {
      education: "Education",
      technical: "Technical",
      creative: "Creative",
      analysis: "Analysis",
      other: "Other"
    },
    lengths: {
      short: "Concise",
      medium: "Standard",
      long: "Extended"
    },
    notifications: {
      copied: "Prompt copied to clipboard!",
      copyFailed: "Failed to copy prompt.",
      saved: "Prompt saved to database!",
      apiError: "Gemini API error. Check your API key and try again.",
      apiKeyRequired: "Gemini API key required to proceed.",
      apiKeyValid: "API key successfully validated.",
      apiKeyInvalid: "Invalid API key. Please check and try again."
    },
    theme: {
      toggleLabel: "Display Mode",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      effectsLabel: "Visual Effects",
      effectsOn: "Enabled",
      effectsOff: "Disabled"
    }
  }
};
