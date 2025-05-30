import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChevronRight, Copy, Save, Download, Languages, Sparkles, Brain, Check, X, 
  AlertCircle, FileText, Clock, Star, Loader2, Key, Shield, Database, 
  Terminal, Zap, RefreshCw, Lock, Unlock, Cpu, Code, Maximize, Minimize
} from 'lucide-react';
import type { 
  PromptType, Language, Domain, Complexity, OutputLength, SavedPrompt, 
  ApiKeyStatus, ApiKeyStorage, ApiKeyState, CyberEffect, CyberAnimationState 
} from './types';
import { 
  translations, DEFAULT_LANGUAGE, MIN_RAW_REQUEST_LENGTH, MAX_RAW_REQUEST_LENGTH, 
  DOMAIN_OPTIONS, OUTPUT_LENGTH_OPTIONS, API_KEY_STORAGE_OPTIONS, DEFAULT_API_KEY_STORAGE 
} from './constants';
import { 
  generateStructuredPromptWithGemini, validateApiKey, saveApiKey, 
  getStoredApiKey, clearStoredApiKey 
} from './services/geminiService';

const App: React.FC = () => {
  // Language and UI state
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [step, setStep] = useState(0); // Start at step 0 for API key entry
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [animationState, setAnimationState] = useState<CyberAnimationState>('idle');
  
  // API Key state
  const [apiKeyState, setApiKeyState] = useState<ApiKeyState>({
    key: '',
    status: 'unset',
    storage: DEFAULT_API_KEY_STORAGE,
    errorMessage: undefined,
    lastValidated: undefined
  });
  
  // Prompt building state
  const [rawRequest, setRawRequest] = useState('');
  const [promptType, setPromptType] = useState<PromptType>('MVP');
  
  // Analysis results
  const [analyzedDomain, setAnalyzedDomain] = useState<Domain>('other');
  const [analyzedComplexity, setAnalyzedComplexity] = useState<Complexity>('simple');
  const [recommendedType, setRecommendedType] = useState<PromptType>('MVP');

  // User-configurable variables
  const [selectedDomain, setSelectedDomain] = useState<Domain>('technical');
  const [outputLength, setOutputLength] = useState<OutputLength>('medium');
  const [expertRole, setExpertRole] = useState('');
  const [mission, setMission] = useState('');
  const [constraints, setConstraints] = useState('');
  
  // Output state
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  
  // Refs for animations
  const terminalRef = useRef<HTMLDivElement>(null);
  const promptContainerRef = useRef<HTMLDivElement>(null);
  
  const t = translations[language];

  // Load saved prompts and API key on mount
  useEffect(() => {
    // Load saved prompts
    const saved = localStorage.getItem('cyberprompt-saved-prompts');
    if (saved) {
      try {
        setSavedPrompts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved prompts from localStorage", e);
        localStorage.removeItem('cyberprompt-saved-prompts');
      }
    }
    
    // Check for stored API key
    const storedApiKey = getStoredApiKey();
    if (storedApiKey && storedApiKey.key) {
      setApiKeyState({
        ...storedApiKey,
        status: 'validating'
      });
      
      // Validate the stored API key
      validateApiKey(storedApiKey.key)
        .then(isValid => {
          if (isValid) {
            setApiKeyState(prev => ({
              ...prev,
              status: 'valid',
              lastValidated: Date.now()
            }));
            setStep(1); // Move to request input step
            
            // Update storage if needed
            saveApiKey(storedApiKey.key, storedApiKey.storage);
          } else {
            setApiKeyState(prev => ({
              ...prev,
              status: 'invalid',
              errorMessage: t.apiKey.invalidMessage
            }));
          }
        })
        .catch(() => {
          setApiKeyState(prev => ({
            ...prev,
            status: 'invalid',
            errorMessage: t.apiKey.invalidMessage
          }));
        });
    }
    
    // Terminal typing effect
    if (terminalRef.current && effectsEnabled) {
      const terminalText = "CyberPrompt v2.0 initialized. Ready for input.";
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < terminalText.length) {
          if (terminalRef.current) {
            terminalRef.current.textContent = `> ${terminalText.substring(0, i + 1)}`;
            i++;
          }
        } else {
          clearInterval(typeInterval);
          if (terminalRef.current) {
            terminalRef.current.textContent = `> ${terminalText} _`;
            
            // Add blinking cursor
            const cursorInterval = setInterval(() => {
              if (terminalRef.current) {
                if (terminalRef.current.textContent?.endsWith('_')) {
                  terminalRef.current.textContent = terminalRef.current.textContent.replace('_', ' ');
                } else {
                  terminalRef.current.textContent = `${terminalRef.current.textContent?.replace(' ', '')}_`;
                }
              }
            }, 500);
            
            // Clean up interval
            return () => clearInterval(cursorInterval);
          }
        }
      }, 50);
      
      return () => clearInterval(typeInterval);
    }
  }, [t.apiKey.invalidMessage, effectsEnabled]);

  // Analyze user request to determine domain, complexity, and recommended approach
  const analyzeUserRequest = useCallback((request: string): { domain: Domain; complexity: Complexity; recommendedType: PromptType } => {
    const educationKeywords = ['cours', 'leçon', 'lesson', 'élève', 'student', 'apprendre', 'learn', 'enseigner', 'teach', 'pédagogie', 'pedagogy'];
    const technicalKeywords = ['code', 'algorithm', 'database', 'api', 'système', 'system', 'technique', 'software', 'hardware', 'network', 'program', 'develop'];
    const creativeKeywords = ['story', 'histoire', 'créer', 'create', 'design', 'art', 'écrire', 'write', 'roman', 'poème', 'scénario'];
    const analysisKeywords = ['analyser', 'analyze', 'rapport', 'report', 'données', 'data', 'évaluer', 'evaluate', 'recherche', 'research'];
    
    const requestLower = request.toLowerCase();
    
    let detectedDomain: Domain = 'other';
    if (educationKeywords.some(k => requestLower.includes(k))) detectedDomain = 'education';
    else if (technicalKeywords.some(k => requestLower.includes(k))) detectedDomain = 'technical';
    else if (creativeKeywords.some(k => requestLower.includes(k))) detectedDomain = 'creative';
    else if (analysisKeywords.some(k => requestLower.includes(k))) detectedDomain = 'analysis';
    
    const complexIndicators = ['plusieurs', 'multiple', 'complexe', 'complex', 'détaillé', 'detailed', 'approfondi', 'comprehensive', 'stratégie', 'strategy'];
    const isComplex = complexIndicators.some(k => requestLower.includes(k)) || request.length > 250;
    
    return {
      domain: detectedDomain,
      complexity: isComplex ? 'complex' : 'simple',
      recommendedType: isComplex ? 'AGENTIC' : 'MVP'
    };
  }, []);

  // Handle API key validation
  const handleValidateApiKey = async () => {
    if (!apiKeyState.key || apiKeyState.key.trim().length < 10) {
      setApiKeyState(prev => ({
        ...prev,
        status: 'invalid',
        errorMessage: t.apiKey.invalidMessage
      }));
      return;
    }
    
    setApiKeyState(prev => ({
      ...prev,
      status: 'validating',
      errorMessage: undefined
    }));
    
    setAnimationState('loading');
    
    try {
      const isValid = await validateApiKey(apiKeyState.key);
      
      if (isValid) {
        // Save API key if storage option is selected
        if (apiKeyState.storage !== 'none') {
          saveApiKey(apiKeyState.key, apiKeyState.storage);
        }
        
        setApiKeyState(prev => ({
          ...prev,
          status: 'valid',
          lastValidated: Date.now()
        }));
        
        showNotification(t.notifications.apiKeyValid, 'success');
        setAnimationState('success');
        
        // Move to next step after a brief delay
        setTimeout(() => {
          setStep(1);
          setAnimationState('idle');
        }, 1000);
      } else {
        setApiKeyState(prev => ({
          ...prev,
          status: 'invalid',
          errorMessage: t.apiKey.invalidMessage
        }));
        
        showNotification(t.notifications.apiKeyInvalid, 'error');
        setAnimationState('error');
      }
    } catch (error) {
      console.error('API key validation error:', error);
      
      setApiKeyState(prev => ({
        ...prev,
        status: 'invalid',
        errorMessage: t.apiKey.invalidMessage
      }));
      
      showNotification(t.notifications.apiKeyInvalid, 'error');
      setAnimationState('error');
    }
  };

  // Handle request analysis
  const handleAnalyzeRequest = () => {
    if (rawRequest.length >= MIN_RAW_REQUEST_LENGTH) {
      const analysis = analyzeUserRequest(rawRequest);
      setAnalyzedDomain(analysis.domain);
      setAnalyzedComplexity(analysis.complexity);
      setRecommendedType(analysis.recommendedType);
      
      // Pre-fill form based on analysis
      setSelectedDomain(analysis.domain); 
      setPromptType(analysis.recommendedType);
      
      setAnimationState('active');
      setTimeout(() => {
        setStep(2);
        setAnimationState('idle');
      }, 500);
    }
  };
  
  // Handle prompt generation
  const handleGeneratePrompt = async () => {
    if (apiKeyState.status !== 'valid') {
      showNotification(t.notifications.apiKeyRequired, 'error');
      setStep(0); // Go back to API key step
      return;
    }
    
    setIsGenerating(true);
    setAnimationState('loading');
    setStep(4); // Move to step 4 to show generating state

    try {
      const result = await generateStructuredPromptWithGemini({
        rawRequest,
        promptType,
        domain: selectedDomain,
        language,
        outputLength,
        expertRole,
        mission,
        constraints,
        apiKey: apiKeyState.key
      });
      
      setGeneratedPrompt(result);
      setAnimationState('success');
      
      // Scroll to the generated prompt with a subtle animation
      if (promptContainerRef.current && effectsEnabled) {
        promptContainerRef.current.classList.add('animate-pulse-cyan');
        setTimeout(() => {
          promptContainerRef.current?.classList.remove('animate-pulse-cyan');
        }, 2000);
      }
    } catch (error) {
      console.error("Error in handleGeneratePrompt:", error);
      setGeneratedPrompt(t.generation.error + (error instanceof Error ? ` ${error.message}` : ''));
      showNotification(t.notifications.apiError, 'error');
      setAnimationState('error');
      
      // If the error is related to an invalid API key, go back to API key step
      if (error instanceof Error && 
          (error.message.includes('API key') || 
           error.message.includes('apiKey'))) {
        setApiKeyState(prev => ({
          ...prev,
          status: 'invalid',
          errorMessage: error.message
        }));
        
        setTimeout(() => {
          setStep(0); // Go back to API key step
        }, 2000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => setNotification(''), 3000);
  };

  // Copy generated prompt to clipboard
  const copyToClipboard = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      showNotification(t.notifications.copied, 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showNotification(t.notifications.copyFailed, 'error');
    }
  };

  // Save prompt to library
  const savePrompt = () => {
    if (!generatedPrompt) return;
    const newPromptData: SavedPrompt = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      rawRequest,
      generatedPrompt,
      type: promptType,
      domain: selectedDomain,
      language,
      tags: [selectedDomain, promptType]
    };
    
    const updatedPrompts = [newPromptData, ...savedPrompts];
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('cyberprompt-saved-prompts', JSON.stringify(updatedPrompts));
    showNotification(t.notifications.saved, 'success');
    
    // Add glitch effect to notification
    if (effectsEnabled) {
      const notificationElement = document.querySelector('.notification');
      if (notificationElement) {
        notificationElement.classList.add('glitch-effect');
        setTimeout(() => {
          notificationElement.classList.remove('glitch-effect');
        }, 1000);
      }
    }
  };

  // Export prompt as text file
  const exportPrompt = () => {
    if (!generatedPrompt) return;
    const blob = new Blob([generatedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberprompt-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset form to start over
  const resetForm = () => {
    setStep(1); // Go back to request input, not API key
    setRawRequest('');
    setGeneratedPrompt('');
    setExpertRole('');
    setMission('');
    setConstraints('');
    setAnimationState('idle');
    
    // Reset analysis too
    setAnalyzedDomain('other');
    setAnalyzedComplexity('simple');
    setRecommendedType('MVP');
    
    // Reset configurable options to defaults
    setSelectedDomain('technical');
    setOutputLength('medium');
    setPromptType('MVP');
  };

  // Load prompt from library
  const loadPromptFromLibrary = (promptData: SavedPrompt) => {
    setRawRequest(promptData.rawRequest);
    setGeneratedPrompt(promptData.generatedPrompt);
    setPromptType(promptData.type);
    setSelectedDomain(promptData.domain);
    
    // Switch to language of saved prompt
    setLanguage(promptData.language);
    setShowLibrary(false);
    setStep(4); // Go directly to view the loaded prompt
    setIsGenerating(false);
    setAnimationState('active');
    
    setTimeout(() => {
      setAnimationState('idle');
    }, 500);
  };
  
  // Handle API key reset
  const handleResetApiKey = () => {
    clearStoredApiKey();
    setApiKeyState({
      key: '',
      status: 'unset',
      storage: DEFAULT_API_KEY_STORAGE,
      errorMessage: undefined,
      lastValidated: undefined
    });
    setStep(0); // Go back to API key step
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text font-inter">
      {/* Header */}
      <header className="bg-cyber-card-bg border-b border-cyber-border shadow-cyber">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Cpu className="text-cyber-accent-primary mr-2 h-8 w-8" />
            <div>
              <h1 className="font-rajdhani font-bold text-2xl tracking-wider">
                <span className="neon-text">CYBER</span>
                <span className="neon-text-magenta">PROMPT</span>
              </h1>
              <p className="text-xs text-cyber-muted-text">v2.0 // BYOK EDITION</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* API Key Status Indicator */}
            {apiKeyState.status === 'valid' ? (
              <div className="hidden sm:flex items-center text-cyber-success text-sm">
                <Shield className="w-4 h-4 mr-1" />
                <span>API: ACTIVE</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center text-cyber-error text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>API: {apiKeyState.status.toUpperCase()}</span>
              </div>
            )}
            
            {/* Effects Toggle */}
            <button
              onClick={() => setEffectsEnabled(!effectsEnabled)}
              className="px-2 py-1 rounded text-xs border border-cyber-border text-cyber-muted-text hover:text-cyber-accent-primary hover:border-cyber-accent-primary transition-colors"
            >
              {effectsEnabled ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
            </button>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyber-border hover:border-cyber-accent-primary text-cyber-accent-primary transition-colors"
              aria-label={language === 'fr' ? 'Switch to English' : 'Passer au Français'}
            >
              <Languages className="w-5 h-5" />
              <span className="font-mono">{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl"> 
        {/* Terminal Effect */}
        <div className="bg-black/50 rounded-lg border border-cyber-border p-3 mb-6 font-mono text-sm text-cyber-accent-primary overflow-hidden">
          <div ref={terminalRef} className="whitespace-nowrap overflow-hidden">
            &gt; Initializing system...
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h2 className="font-rajdhani text-3xl md:text-4xl font-bold mb-3">
            <span className="neon-text">{t.app.title}</span>
          </h2>
          <p className="text-cyber-accent-secondary text-lg">{t.app.subtitle}</p>
        </div>

        {/* Step 0: API Key Input */}
        {step === 0 && (
          <div className={`bg-cyber-card-bg rounded-lg border border-cyber-border shadow-cyber p-6 md:p-8 transition-all duration-300 ${animationState === 'loading' ? 'animate-pulse-cyan' : ''}`}>
            <div className="flex items-center mb-4 pb-2 border-b border-cyber-border">
              <Key className="text-cyber-accent-primary mr-2 h-6 w-6" />
              <h2 className="text-xl font-rajdhani font-semibold text-cyber-text">{t.apiKey.title}</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="apiKeyInput" className="block text-sm font-medium text-cyber-text mb-2">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    id="apiKeyInput"
                    type="password"
                    value={apiKeyState.key}
                    onChange={(e) => setApiKeyState(prev => ({ ...prev, key: e.target.value }))}
                    placeholder={t.apiKey.placeholder}
                    className="w-full p-3 bg-cyber-bg border-2 border-cyber-border rounded-lg focus:border-cyber-accent-primary focus:ring-1 focus:ring-cyber-accent-primary outline-none font-mono text-base"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {apiKeyState.status === 'valid' && <Check className="h-5 w-5 text-cyber-success" />}
                    {apiKeyState.status === 'invalid' && <X className="h-5 w-5 text-cyber-error" />}
                    {apiKeyState.status === 'validating' && <Loader2 className="h-5 w-5 text-cyber-accent-primary animate-spin" />}
                  </div>
                </div>
                {apiKeyState.errorMessage && (
                  <p className="mt-2 text-sm text-cyber-error">{apiKeyState.errorMessage}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyber-text mb-2">
                  {t.apiKey.storagePrompt}
                </label>
                <div className="flex flex-wrap gap-3">
                  {API_KEY_STORAGE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setApiKeyState(prev => ({ ...prev, storage: option.value }))}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        apiKeyState.storage === option.value
                          ? 'border-cyber-accent-primary text-cyber-accent-primary bg-cyber-accent-primary/10'
                          : 'border-cyber-border text-cyber-muted-text hover:border-cyber-accent-primary/50'
                      }`}
                    >
                      {option.value === 'session' && <Clock className="inline-block mr-1 h-4 w-4" />}
                      {option.value === 'local' && <Database className="inline-block mr-1 h-4 w-4" />}
                      {option.value === 'none' && <X className="inline-block mr-1 h-4 w-4" />}
                      {t.apiKey[option.labelToken]}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-cyber-bg/50 rounded-lg p-4 border-l-4 border-cyber-accent-tertiary">
                <p className="text-sm text-cyber-muted-text">{t.apiKey.securityNote}</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleValidateApiKey}
                  disabled={!apiKeyState.key || apiKeyState.status === 'validating'}
                  className={`px-5 py-3 rounded-lg font-rajdhani font-semibold transition-all flex items-center gap-2 ${
                    !apiKeyState.key || apiKeyState.status === 'validating'
                      ? 'bg-cyber-border text-cyber-muted-text cursor-not-allowed' 
                      : 'bg-cyber-accent-primary text-black hover:shadow-cyber cursor-pointer'
                  }`}
                >
                  {apiKeyState.status === 'validating' ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                  {t.apiKey.saveButton}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Input */}
        {step === 1 && (
          <div className={`bg-cyber-card-bg rounded-lg border border-cyber-border shadow-cyber p-6 md:p-8 transition-all duration-300 ${animationState === 'active' ? 'animate-pulse-cyan' : ''}`}>
            <div className="flex items-center mb-4 pb-2 border-b border-cyber-border">
              <Terminal className="text-cyber-accent-primary mr-2 h-6 w-6" />
              <label htmlFor="rawRequestInput" className="text-xl font-rajdhani font-semibold text-cyber-text">
                {t.input.placeholder}
              </label>
            </div>
            
            <textarea
              id="rawRequestInput"
              value={rawRequest}
              onChange={(e) => setRawRequest(e.target.value)}
              placeholder={language === 'fr' 
                ? "Exemple: Je veux créer un algorithme d'analyse de données pour identifier des tendances dans les logs système..."
                : "Example: I want to create a data analysis algorithm to identify trends in system logs..."
              }
              className="w-full h-40 p-3 bg-cyber-bg border-2 border-cyber-border rounded-lg focus:border-cyber-accent-primary focus:ring-1 focus:ring-cyber-accent-primary outline-none resize-none font-inter text-base"
              maxLength={MAX_RAW_REQUEST_LENGTH}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-3 sm:space-y-0">
              <span className={`text-sm ${rawRequest.length < MIN_RAW_REQUEST_LENGTH && rawRequest.length > 0 ? 'text-cyber-error' : 'text-cyber-muted-text'}`}>
                {rawRequest.length}/{MAX_RAW_REQUEST_LENGTH} {t.input.charCount}
                {rawRequest.length > 0 && rawRequest.length < MIN_RAW_REQUEST_LENGTH && (
                  <span className="ml-2">({t.input.minCharWarning})</span>
                )}
              </span>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLibrary(true)}
                  className="px-5 py-2.5 border-2 border-cyber-accent-primary text-cyber-accent-primary rounded-lg font-semibold hover:bg-cyber-accent-primary/10 transition-colors flex items-center gap-2 text-sm"
                >
                  <Database className="w-4 h-4" />
                  {t.actions.viewLibrary}
                </button>
                
                <button
                  onClick={handleAnalyzeRequest}
                  disabled={rawRequest.length < MIN_RAW_REQUEST_LENGTH}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                    rawRequest.length < MIN_RAW_REQUEST_LENGTH 
                      ? 'bg-cyber-border text-cyber-muted-text cursor-not-allowed' 
                      : 'bg-cyber-accent-primary text-black hover:shadow-cyber cursor-pointer'
                  }`}
                >
                  {t.input.button}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Analysis & Approach Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className={`bg-cyber-card-bg rounded-lg border border-cyber-border shadow-cyber p-6 md:p-8 transition-all duration-300 ${animationState === 'active' ? 'animate-pulse-cyan' : ''}`}>
              <div className="flex items-center mb-5 pb-2 border-b border-cyber-border">
                <Brain className="text-cyber-accent-primary mr-2 h-6 w-6" />
                <h2 className="text-xl font-rajdhani font-semibold text-cyber-text">
                  {t.analysis.title}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 text-center">
                {[
                  { Icon: Code, label: t.analysis.domain, value: t.domains[analyzedDomain], color: 'text-cyber-accent-primary' },
                  { Icon: Sparkles, label: t.analysis.complexity, value: analyzedComplexity === 'complex' ? t.analysis.complex : t.analysis.simple, color: 'text-cyber-accent-secondary' },
                  { Icon: Terminal, label: t.analysis.recommendation, value: recommendedType, color: 'text-cyber-info' }
                ].map(item => (
                  <div key={item.label} className="p-4 bg-cyber-bg/50 rounded-lg border border-cyber-border">
                    <item.Icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                    <p className="font-mono text-sm text-cyber-muted-text">{item.label}</p>
                    <p className="text-lg font-rajdhani font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-cyber-card-bg rounded-lg border border-cyber-border shadow-cyber p-6 md:p-8">
              <div className="flex items-center mb-5 pb-2 border-b border-cyber-border">
                <Zap className="text-cyber-accent-primary mr-2 h-6 w-6" />
                <h2 className="text-xl font-rajdhani font-semibold text-cyber-text">
                  {t.approach.title}
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { type: 'MVP' as PromptType, title: t.approach.mvp.title, subtitle: t.approach.mvp.subtitle, description: t.approach.mvp.description },
                  { type: 'AGENTIC' as PromptType, title: t.approach.agentique.title, subtitle: t.approach.agentique.subtitle, description: t.approach.agentique.description }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => setPromptType(item.type)}
                    className={`p-5 rounded-lg border-2 text-left transition-all ${
                      promptType === item.type
                        ? 'border-cyber-accent-primary bg-cyber-accent-primary/10 shadow-cyber'
                        : 'border-cyber-border hover:border-cyber-accent-primary/50 hover:bg-cyber-bg/50'
                    }`}
                  >
                    <h3 className="text-lg font-rajdhani font-semibold text-cyber-text mb-1">{item.title}</h3>
                    <p className="text-xs text-cyber-muted-text mb-2 font-mono">{item.subtitle}</p>
                    <p className="text-sm text-cyber-text">{item.description}</p>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => {
                    setAnimationState('active');
                    setTimeout(() => {
                      setStep(1);
                      setAnimationState('idle');
                    }, 300);
                  }}
                  className="px-5 py-2.5 border-2 border-cyber-border text-cyber-muted-text rounded-lg font-semibold hover:border-cyber-accent-primary hover:text-cyber-accent-primary transition-colors text-sm"
                >
                  {t.variables.back}
                </button>
                
                <button
                  onClick={() => {
                    setAnimationState('active');
                    setTimeout(() => {
                      setStep(3);
                      setAnimationState('idle');
                    }, 300);
                  }}
                  className="px-5 py-2.5 bg-cyber-accent-primary text-black rounded-lg font-semibold hover:shadow-cyber transition-all flex items-center gap-2 text-sm"
                >
                  {t.variables.next}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Variable Extraction */}
        {step === 3 && (
          <div className={`bg-cyber-card-bg rounded-lg border border-cyber-border shadow-cyber p-6 md:p-8 transition-all duration-300 ${animationState === 'active' ? 'animate-pulse-cyan' : ''}`}>
            <div className="flex items-center mb-5 pb-2 border-b border-cyber-border">
              <Cpu className="text-cyber-accent-primary mr-2 h-6 w-6" />
              <h2 className="text-xl font-rajdhani font-semibold text-cyber-text">
                {t.variables.title}
              </h2>
            </div>
            
            <div className="space-y-5">
              {[
                { label: t.variables.domain, value: selectedDomain, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDomain(e.target.value as Domain), options: DOMAIN_OPTIONS.map(opt => ({ value: opt.value, label: t.domains[opt.labelToken] })) },
                { label: t.variables.outputLength, value: outputLength, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setOutputLength(e.target.value as OutputLength), options: OUTPUT_LENGTH_OPTIONS.map(opt => ({ value: opt.value, label: t.lengths[opt.labelToken] })) }
              ].map(item => (
                <div key={item.label}>
                  <label className="block text-sm font-medium text-cyber-text mb-1.5">{item.label}</label>
                  <select 
                    value={item.value} 
                    onChange={item.onChange} 
                    className="w-full p-3 bg-cyber-bg border-2 border-cyber-border rounded-lg focus:border-cyber-accent-primary focus:ring-1 focus:ring-cyber-accent-primary outline-none text-base"
                  >
                    {item.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              ))}
              
              {[
                { label: t.variables.expertRole, value: expertRole, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setExpertRole(e.target.value), placeholder: t.variables.expertRolePlaceholder, type: 'input' },
                { label: t.variables.mission, value: mission, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setMission(e.target.value), placeholder: t.variables.missionPlaceholder, type: 'input' },
                { label: t.variables.constraints, value: constraints, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setConstraints(e.target.value), placeholder: t.variables.constraintsPlaceholder, type: 'textarea' }
              ].map(item => (
                <div key={item.label}>
                  <label className="block text-sm font-medium text-cyber-text mb-1.5">{item.label}</label>
                  {item.type === 'input' ? (
                    <input 
                      type="text" 
                      value={item.value} 
                      onChange={item.onChange as (e: React.ChangeEvent<HTMLInputElement>) => void} 
                      placeholder={item.placeholder} 
                      className="w-full p-3 bg-cyber-bg border-2 border-cyber-border rounded-lg focus:border-cyber-accent-primary focus:ring-1 focus:ring-cyber-accent-primary outline-none text-base" 
                    />
                  ) : (
                    <textarea 
                      value={item.value} 
                      onChange={item.onChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void} 
                      placeholder={item.placeholder} 
                      className="w-full h-32 p-3 bg-cyber-bg border-2 border-cyber-border rounded-lg focus:border-cyber-accent-primary focus:ring-1 focus:ring-cyber-accent-primary outline-none resize-none text-base" 
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={() => {
                  setAnimationState('active');
                  setTimeout(() => {
                    setStep(2);
                    setAnimationState('idle');
                  }, 300);
                }} 
                className="px-5 py-2.5 border-2 border-cyber-border text-cyber-muted-text rounded-lg font-semibold hover:border-cyber-accent-primary hover:text-cyber-accent-primary transition-colors text-sm"
              >
                {t.variables.back}
              </button>
              
              <button 
                onClick={handleGeneratePrompt} 
                className="px-5 py-2.5 bg-cyber-accent-primary text-black rounded-lg font-semibold hover:shadow-cyber transition-all flex items-center gap-2 text-sm"
              >
                {t.actions.generate} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Generated Prompt */}
        {step === 4 && (
          <div 
            ref={promptContainerRef}
            className={`bg-cyber-card-bg rounded-lg border border-cyber-border shadow-cyber p-6 md:p-8 transition-all duration-300 ${
              animationState === 'loading' ? 'animate-pulse-cyan' : 
              animationState === 'success' ? 'border-cyber-success shadow-cyber-success' : 
              animationState === 'error' ? 'border-cyber-error shadow-cyber-error' : ''
            }`}
          >
            <div className="flex items-center mb-5 pb-2 border-b border-cyber-border">
              <Code className="text-cyber-accent-primary mr-2 h-6 w-6" />
              <h2 className="text-xl font-rajdhani font-semibold text-cyber-text">
                {t.generation.title}
              </h2>
            </div>
            
            {isGenerating ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-cyber-accent-primary mb-4" />
                <p className="text-cyber-muted-text text-lg font-mono">{t.generation.generating}</p>
                
                {/* Animated progress bar */}
                <div className="mt-6 w-64 h-2 bg-cyber-bg rounded-full overflow-hidden mx-auto">
                  <div className="h-full cyber-border rounded-full w-full animate-border-flow"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-cyber-bg/70 rounded-lg border-l-4 border-cyber-accent-primary p-4 font-mono text-sm text-cyber-text whitespace-pre-wrap max-h-[500px] overflow-y-auto shadow-inner">
                  {generatedPrompt || "No prompt generated yet."}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <button 
                    onClick={copyToClipboard} 
                    className="w-full px-4 py-2.5 bg-cyber-accent-primary text-black rounded-lg font-semibold hover:shadow-cyber transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />{t.actions.copy}
                  </button>
                  
                  <button 
                    onClick={savePrompt} 
                    className="w-full px-4 py-2.5 border-2 border-cyber-accent-primary text-cyber-accent-primary rounded-lg font-semibold hover:bg-cyber-accent-primary/10 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />{t.actions.save}
                  </button>
                  
                  <button 
                    onClick={exportPrompt} 
                    className="w-full px-4 py-2.5 border-2 border-cyber-accent-primary text-cyber-accent-primary rounded-lg font-semibold hover:bg-cyber-accent-primary/10 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />{t.actions.export}
                  </button>
                </div>
                
                <button 
                  onClick={resetForm} 
                  className="w-full mt-4 px-5 py-3 bg-cyber-accent-tertiary text-white rounded-lg font-semibold hover:shadow-cyber transition-all text-base font-rajdhani"
                >
                  {t.actions.newPrompt}
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer with API Key Reset */}
      <footer className="bg-cyber-card-bg border-t border-cyber-border mt-8 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-cyber-muted-text text-sm mb-4 sm:mb-0">
            <span className="font-mono">CyberPrompt v2.0</span> | <span>BYOK Edition</span>
          </div>
          
          {apiKeyState.status === 'valid' && (
            <button
              onClick={handleResetApiKey}
              className="px-3 py-1.5 text-xs border border-cyber-border rounded-md text-cyber-muted-text hover:text-cyber-error hover:border-cyber-error transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset API Key
            </button>
          )}
        </div>
      </footer>

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-cyber-card-bg rounded-lg border border-cyber-border shadow-cyber-lg max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-cyber-border flex justify-between items-center">
              <div className="flex items-center">
                <Database className="text-cyber-accent-primary mr-2 h-5 w-5" />
                <h2 className="text-xl font-rajdhani font-semibold text-cyber-text">{t.library.title}</h2>
              </div>
              <button 
                onClick={() => setShowLibrary(false)} 
                className="p-2 hover:bg-cyber-bg rounded-full text-cyber-muted-text hover:text-cyber-accent-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-grow">
              {savedPrompts.length === 0 ? (
                <div className="text-center text-cyber-muted-text py-10 border-2 border-dashed border-cyber-border rounded-lg">
                  <Database className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>{t.library.empty}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedPrompts.map((prompt) => (
                    <div 
                      key={prompt.id} 
                      className="border border-cyber-border rounded-lg p-4 hover:bg-cyber-bg/50 hover:border-cyber-accent-primary/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="font-semibold text-cyber-text text-sm break-all">
                          {prompt.rawRequest.substring(0, 70)}{prompt.rawRequest.length > 70 ? '...' : ''}
                        </p>
                        <button 
                          onClick={() => loadPromptFromLibrary(prompt)} 
                          className="ml-3 px-3 py-1.5 bg-cyber-accent-primary text-black rounded-md text-xs hover:shadow-cyber whitespace-nowrap"
                        >
                          {t.actions.usePrompt}
                        </button>
                      </div>
                      
                      <div className="flex items-center text-xs text-cyber-muted-text">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(prompt.timestamp).toLocaleDateString(language)} 
                        <span className="mx-2">•</span> 
                        <Code className="w-3 h-3 mr-1" />
                        {prompt.type} 
                        <span className="mx-2">•</span> 
                        <Terminal className="w-3 h-3 mr-1" />
                        {t.domains[prompt.domain]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`notification fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-cyber-lg flex items-center gap-3 z-[100] ${
          notificationType === 'success' 
            ? 'bg-cyber-bg border border-cyber-success text-cyber-success' 
            : 'bg-cyber-bg border border-cyber-error text-cyber-error'
        }`}>
          {notificationType === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-mono text-sm">{notification}</span>
        </div>
      )}
    </div>
  );
}

export default App;
