// File: services/geminiService.js

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { 
  translations, 
  GEMINI_MODEL_NAME, 
  API_KEY_STORAGE_KEY, 
  API_KEY_VALIDATION_INTERVAL,
  DEFAULT_API_KEY_STORAGE
} from '../constants.js';

// Meta-prompt translations - moved from server to client for BYOK system
const metaPromptTranslations = {
  en: {
    systemInstructionBase: "You are an expert prompt engineering assistant. Your task is to generate a highly effective, structured prompt based on the user's specifications. The final prompt you generate MUST be in English. Do not add any explanatory text before or after the generated prompt. Only output the prompt itself, adhering strictly to the provided template structure.",
    userQueryHeader: "Please generate a structured prompt. Here are the details:",
    rawRequestLabel: "User's Goal / Raw Request:",
    promptTypeLabel: "Chosen Prompt Structure Type:",
    domainLabel: "Domain:",
    outputLengthLabel: "Desired Output Length for the AI using the generated prompt:",
    expertRoleLabel: "Expert Role for the AI using the generated prompt:",
    missionLabel: "Main Mission for the AI using the generated prompt:",
    constraintsLabel: "Constraints for the AI using the generated prompt (one per line):",
    noneSpecified: "None specified",
    finalPromptLangLabel: "The language for the final prompt itself MUST be: English.",
    constructPromptInstruction: "Now, based on whether the type is MVP or AGENTIC, construct the prompt using the following templates and information.",
    mvpTemplateHeader: "For an \"MVP\" type prompt, use this template:",
    mvpSystemRole: "You are an excellent {expertRolePlaceholder}: knowledgeable, precise, pedagogical. Your mission is to {missionPlaceholder}.",
    mvpExpertPlaceholder: "Expert",
    mvpMissionPlaceholder: "help effectively",
    mvpMainTasksInstruction: "[From the User's Goal / Raw Request above, please extract and list the primary actionable task(s) the AI should perform, stated clearly. If the request is broad, summarize it into a core objective. Ensure this is concise and directly actionable.]",
    mvpExpectedOutputFormat: "Expected output format:",
    mvpLength: "Length:",
    mvpStyle: "Style: Clear and structured",
    mvpLanguage: "Language: English",
    mvpExampleInstruction: "(Generate a concise, highly relevant example snippet (typically 1-2 sentences) demonstrating the *beginning* of how an AI might respond when fulfilling the generated prompt. This example should be directly related to the user's raw request and specified domain, hinting at the initial steps or tone. For instance, if the request is 'analyze a company report', an example could be 'To begin the analysis of this company report, I will first examine its executive summary and financial statements...' or if the request is 'create a lesson plan on photosynthesis', an example might be 'Okay, I will start by outlining the key learning objectives for a lesson on photosynthesis for [target audience if specified, otherwise general].'. Ensure this example is distinct and illustrative of the AI's starting point.)",
    mvpFooter: "Ensure the entire output is *only* the prompt text, starting with \"<s>:\" and ending appropriately based on the template. Do not add any other commentary.",
    agenticTemplateHeader: "For an \"AGENTIC\" type prompt, use this template. This prompt is for an AI capable of autonomous action, thinking, and iteration. It MUST include self-assessment capabilities.",
    agenticTitleInstruction: "[Generate a concise and descriptive title (max 5-7 words) derived from the user's raw request.]",
    agenticRole: "{expertRolePlaceholder} (Agentic AI)",
    agenticExpertPlaceholder: "Expert Analyst",
    agenticNote: "*Note: \"Agentic AI\" means an AI capable of acting autonomously, thinking, and iterating on its work.*",
    agenticContext: "Context:",
    agenticInstructionsHeader: "Instructions:",
    agenticAnalysisHeader: "1.  Analysis of Provided Information:",
    agenticAnalysisTasks: [
        "Thoroughly analyze all provided elements related to the Context.",
        "Identify key points, implications, and any underlying assumptions.",
        "Note any gaps or ambiguities that might require clarification or assumptions."
    ],
    agenticThinkingHeader: "2.  Deliberate Thinking & Planning:",
    agenticThinkingTasks: [
        "Consider multiple perspectives or approaches to address the Context.",
        "Evaluate the pros and cons of different strategies.",
        "Formulate a clear plan or methodology for execution. Justify the chosen approach."
    ],
    agenticDevelopmentHeader: "3.  Structured Development & Execution:",
    agenticDevelopmentTasks: [
        "Present findings, solutions, or creations in a logical, well-organized order.",
        "Use clear sections, subsections, and formatting (e.g., bullet points, tables) as appropriate.",
        "Provide concrete examples, evidence, or code snippets where applicable to support the output."
    ],
    agenticSelfAssessmentHeader: "4.  Self-Assessment and Continuous Improvement:",
    agenticSelfAssessmentQuestion1: "At the end of its work, the AI executing this prompt **must always ask the user verbatim**:\n    \"🤔 Would you like me to evaluate this result against key criteria and provide suggestions for improvement? (Yes/No)\"",
    agenticSelfAssessmentInstruction: "If the user responds \"Yes\" (or similar affirmative), the AI should then perform a self-assessment using the following evaluation method, presenting it in a table:",
    agenticEvaluationCriteria: {
        education: ['Pedagogical Clarity', 'Level Appropriateness', 'Learner Engagement', 'Logical Progression'],
        technical: ['Technical Accuracy', 'Completeness of Analysis', 'Rigorous Methodology', 'Actionable Recommendations'],
        other: ['Originality', 'Coherence', 'Impact', 'Quality of Execution']
    },
    agenticEvalTableHeader: "| Criterion                     | Rating (/10) | Justification for Rating | Concrete Suggestions for Improvement |\n    |-------------------------------|--------------|--------------------------|--------------------------------------|",
    agenticSelfAssessmentQuestion2: "After presenting the evaluation, the AI **must also ask the user verbatim**:\n    \"Based on the evaluation above, would you like me to attempt to improve the draft? (Yes/No)\"",
    agenticFooter: "Ensure the entire output is *only* the prompt text, starting with \"Title:\" and ending appropriately based on the template. Do not add any other commentary.",
  },
  fr: {
    systemInstructionBase: "Vous êtes un assistant expert en ingénierie de prompts. Votre tâche est de générer un prompt structuré, hautement efficace, basé sur les spécifications de l'utilisateur. Le prompt final que vous générez DOIT être en Français. N'ajoutez aucun texte explicatif avant ou après le prompt généré. Ne retournez que le prompt lui-même, en respectant strictement la structure du modèle fourni.",
    userQueryHeader: "Veuillez générer un prompt structuré. Voici les détails :",
    rawRequestLabel: "Objectif / Demande brute de l'utilisateur :",
    promptTypeLabel: "Type de structure de prompt choisi :",
    domainLabel: "Domaine :",
    outputLengthLabel: "Longueur de sortie souhaitée pour l'IA utilisant le prompt généré :",
    expertRoleLabel: "Rôle d'expert pour l'IA utilisant le prompt généré :",
    missionLabel: "Mission principale pour l'IA utilisant le prompt généré :",
    constraintsLabel: "Contraintes pour l'IA utilisant le prompt généré (une par ligne) :",
    noneSpecified: "Aucune spécifiée",
    finalPromptLangLabel: "La langue du prompt final lui-même DOIT être : Français.",
    constructPromptInstruction: "Maintenant, selon que le type est MVP ou AGENTIQUE, construisez le prompt en utilisant les modèles et informations suivants.",
    mvpTemplateHeader: "Pour un prompt de type \"MVP\", utilisez ce modèle :",
    mvpSystemRole: "Vous êtes un excellent {expertRolePlaceholder} : compétent, précis, pédagogue. Votre mission est d'{missionPlaceholder}.",
    mvpExpertPlaceholder: "Expert",
    mvpMissionPlaceholder: "aider efficacement",
    mvpMainTasksInstruction: "[À partir de l'Objectif / Demande brute de l'utilisateur ci-dessus, veuillez extraire et lister la ou les tâches principales actionnables que l'IA doit effectuer, énoncées clairement. Si la demande est large, résumez-la en un objectif principal. Assurez-vous que cela soit concis et directement actionnable.]",
    mvpExpectedOutputFormat: "Format de sortie attendu :",
    mvpLength: "Longueur :",
    mvpStyle: "Style : Clair et structuré",
    mvpLanguage: "Langue : Français",
    mvpExampleInstruction: "(Générez un exemple concis et très pertinent (typiquement 1-2 phrases) démontrant le *début* de la manière dont une IA pourrait répondre en exécutant le prompt généré. Cet exemple doit être directement lié à la demande brute de l'utilisateur et au domaine spécifié, suggérant les étapes initiales ou le ton. Par exemple, si la demande est 'analyser un rapport d'entreprise', un exemple pourrait être 'Pour commencer l'analyse de ce rapport d'entreprise, j'examinerai d'abord son résumé analytique et ses états financiers...' ou si la demande est 'créer un plan de cours sur la photosynthèse', un exemple pourrait être 'Bien, je vais commencer par définir les objectifs d'apprentissage clés pour une leçon sur la photosynthèse pour [public cible si spécifié, sinon général].'. Assurez-vous que cet exemple soit distinct et illustratif du point de départ de l'IA.)",
    mvpFooter: "Assurez-vous que l'ensemble de la sortie soit *uniquement* le texte du prompt, commençant par \"<s>:\" et se terminant de manière appropriée selon le modèle. N'ajoutez aucun autre commentaire.",
    agenticTemplateHeader: "Pour un prompt de type \"AGENTIQUE\", utilisez ce modèle. Ce prompt est destiné à une IA capable d'action autonome, de réflexion et d'itération. Il DOIT inclure des capacités d'auto-évaluation.",
    agenticTitleInstruction: "[Générez un titre concis et descriptif (max 5-7 mots) dérivé de la demande brute de l'utilisateur.]",
    agenticRole: "{expertRolePlaceholder} (IA Agentique)",
    agenticExpertPlaceholder: "Analyste Expert",
    agenticNote: "*Note : \"IA Agentique\" signifie une IA capable d'agir de manière autonome, de réfléchir et d'itérer sur son travail.*",
    agenticContext: "Contexte :",
    agenticInstructionsHeader: "Instructions :",
    agenticAnalysisHeader: "1.  Analyse des Informations Fournies :",
    agenticAnalysisTasks: [
        "Analyser en profondeur tous les éléments fournis relatifs au Contexte.",
        "Identifier les points clés, les implications et toutes les hypothèses sous-jacentes.",
        "Noter les lacunes ou ambiguïtés qui pourraient nécessiter des éclaircissements ou des suppositions."
    ],
    agenticThinkingHeader: "2.  Réflexion Approfondie & Planification :",
    agenticThinkingTasks: [
        "Considérer de multiples perspectives ou approches pour aborder le Contexte.",
        "Évaluer les avantages et inconvénients des différentes stratégies.",
        "Formuler un plan ou une méthodologie claire pour l'exécution. Justifier l'approche choisie."
    ],
    agenticDevelopmentHeader: "3.  Développement Structuré & Exécution :",
    agenticDevelopmentTasks: [
        "Présenter les résultats, solutions ou créations dans un ordre logique et bien organisé.",
        "Utiliser des sections, sous-sections et mises en forme claires (par ex., listes à puces, tableaux) selon les besoins.",
        "Fournir des exemples concrets, des preuves ou des extraits de code le cas échéant pour étayer la sortie."
    ],
    agenticSelfAssessmentHeader: "4.  Auto-évaluation et Amélioration Continue :",
    agenticSelfAssessmentQuestion1: "À la fin de son travail, l'IA exécutant ce prompt **doit toujours demander à l'utilisateur textuellement** :\n    \"🤔 Souhaitez-vous que j'évalue ce résultat par rapport à des critères clés et que je fournisse des suggestions d'amélioration ? (Oui/Non)\"",
    agenticSelfAssessmentInstruction: "Si l'utilisateur répond \"Oui\" (ou une affirmation similaire), l'IA doit alors effectuer une auto-évaluation en utilisant la méthode d'évaluation suivante, en la présentant dans un tableau :",
    agenticEvaluationCriteria: {
        education: ['Clarté Pédagogique', 'Adéquation au Niveau', 'Engagement de l\'Apprenant', 'Progression Logique'],
        technical: ['Exactitude Technique', 'Complétude de l\'Analyse', 'Méthodologie Rigoureuse', 'Recommandations Actionnables'],
        other: ['Originalité', 'Cohérence', 'Impact', 'Qualité d\'Exécution']
    },
    agenticEvalTableHeader: "| Critère                       | Note (/10)   | Justification de la Note | Suggestions Concrètes d'Amélioration |\n    |-------------------------------|--------------|--------------------------|--------------------------------------|",
    agenticSelfAssessmentQuestion2: "Après avoir présenté l'évaluation, l'IA **doit également demander à l'utilisateur textuellement** :\n    \"Sur la base de l'évaluation ci-dessus, souhaitez-vous que j'essaie d'améliorer le brouillon ? (Oui/Non)\"",
    agenticFooter: "Assurez-vous que l'ensemble de la sortie soit *uniquement* le texte du prompt, commençant par \"Titre:\" et se terminant de manière appropriée selon le modèle. N'ajoutez aucun autre commentaire.",
  }
};

// API Key Management Functions
export const validateApiKey = async (apiKey) => {
  if (!apiKey || apiKey.trim().length < 10) {
    return false;
  }
  
  try {
    // Create a minimal test query to validate the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
    
    // Simple validation request with minimal tokens
    const result = await model.generateContent('Test API key validity');
    return result.response.text().length > 0;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
};

export const saveApiKey = (apiKey, storage) => {
  if (storage === 'none' || !apiKey) {
    return;
  }
  
  const storageObj = storage === 'session' ? sessionStorage : localStorage;
  const apiKeyData = {
    key: apiKey,
    status: 'valid',
    storage,
    lastValidated: Date.now()
  };
  
  try {
    storageObj.setItem(API_KEY_STORAGE_KEY, JSON.stringify(apiKeyData));
  } catch (error) {
    console.error('Failed to save API key to storage:', error);
  }
};

export const getStoredApiKey = () => {
  let storedData = null;
  
  // Try session storage first
  storedData = sessionStorage.getItem(API_KEY_STORAGE_KEY);
  
  // If not found, try local storage
  if (!storedData) {
    storedData = localStorage.getItem(API_KEY_STORAGE_KEY);
  }
  
  if (!storedData) {
    return null;
  }
  
  try {
    const apiKeyData = JSON.parse(storedData);
    
    // Check if validation has expired
    if (apiKeyData.lastValidated && 
        Date.now() - apiKeyData.lastValidated > API_KEY_VALIDATION_INTERVAL) {
      apiKeyData.status = 'validating';
    }
    
    return apiKeyData;
  } catch (error) {
    console.error('Failed to parse stored API key data:', error);
    return null;
  }
};

export const clearStoredApiKey = () => {
  sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

// Main prompt generation function
export const generateStructuredPromptWithGemini = async (params) => {
  const { apiKey, language } = params;
  const t = translations[language] || translations.en;
  
  if (!apiKey) {
    throw new Error(t.notifications.apiKeyRequired);
  }
  
  try {
    // Initialize the Gemini API with the provided key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: GEMINI_MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }
      ]
    });
    
    // Construct the meta-prompt
    const metaPrompt = constructMetaPrompt(params);
    
    // Generate the prompt using Gemini
    const result = await model.generateContent(metaPrompt.userQuery, {
      systemInstruction: metaPrompt.systemInstruction
    });
    
    const generatedText = result.response.text();
    
    if (!generatedText) {
      throw new Error(t.generation.error);
    }
    
    return generatedText;
  } catch (error) {
    console.error('Error generating prompt with Gemini:', error);
    
    // Handle specific API errors
    if (error.message?.includes('API key not valid') || 
        error.message?.includes('API_KEY_INVALID')) {
      throw new Error(t.notifications.apiKeyInvalid);
    } else if (error.message?.toLowerCase().includes('quota')) {
      throw new Error(`${t.notifications.apiError} - Quota exceeded`);
    } else if (error.message) {
      throw new Error(`${t.notifications.apiError} - ${error.message}`);
    } else {
      throw new Error(t.notifications.apiError);
    }
  }
};

// Helper function to construct the meta-prompt
const constructMetaPrompt = (params) => {
  const {
    rawRequest,
    promptType,
    domain,
    language,
    outputLength,
    expertRole,
    mission,
    constraints,
  } = params;
  
  const tMeta = metaPromptTranslations[language] || metaPromptTranslations.en;
  
  const finalPromptTargetLanguageString = language === 'fr' ? 'Français' : 'English';
  const formattedConstraints = constraints.split('\n').filter(c => c.trim()).map(c => `- ${c.trim()}`).join('\n');
  
  let systemInstruction = tMeta.systemInstructionBase.replace(
    language === 'fr' ? 'English' : 'Français', 
    finalPromptTargetLanguageString
  );
  
  let userQuery = `
${tMeta.userQueryHeader}

${tMeta.rawRequestLabel}
"${rawRequest}"

${tMeta.promptTypeLabel} ${promptType}
${tMeta.domainLabel} ${domain}
${tMeta.outputLengthLabel} ${outputLength}
${tMeta.expertRoleLabel} ${expertRole || (promptType === 'MVP' ? tMeta.mvpExpertPlaceholder : tMeta.agenticExpertPlaceholder)}
${tMeta.missionLabel} ${mission || tMeta.mvpMissionPlaceholder}
${tMeta.constraintsLabel}
${constraints ? formattedConstraints : tMeta.noneSpecified}
${language === 'fr' ? tMeta.finalPromptLangLabel.replace('English', 'Français') : tMeta.finalPromptLangLabel.replace('Français', 'English')}

${tMeta.constructPromptInstruction}
`;

  if (promptType === 'MVP') {
    userQuery += `
${tMeta.mvpTemplateHeader}

<s>:
${tMeta.mvpSystemRole
    .replace('{expertRolePlaceholder}', expertRole || tMeta.mvpExpertPlaceholder)
    .replace('{missionPlaceholder}', mission || tMeta.mvpMissionPlaceholder)}

<User>:
${rawRequest}

Main tasks:
${formattedConstraints ? formattedConstraints : tMeta.mvpMainTasksInstruction}

${tMeta.mvpExpectedOutputFormat}
- ${tMeta.mvpLength} ${outputLength}
- ${tMeta.mvpStyle}
- ${tMeta.mvpLanguage.replace(language === 'fr' ? 'English' : 'Français', finalPromptTargetLanguageString)}

<Example>:
${tMeta.mvpExampleInstruction}

${tMeta.mvpFooter}
`;
  } else { // AGENTIC
    const criteriaDomain = (domain === 'education' || domain === 'technical') ? domain : 'other';
    const evaluationCriteriaList = tMeta.agenticEvaluationCriteria[criteriaDomain];
    
    const criteriaTableMarkdown = evaluationCriteriaList.map(c => 
      `| ${c.padEnd(29)} |              |                          |                                      |`
    ).join('\n');

    userQuery += `
${tMeta.agenticTemplateHeader}

Title: Advanced Prompt - ${tMeta.agenticTitleInstruction}

Role: ${tMeta.agenticRole.replace('{expertRolePlaceholder}', expertRole || tMeta.agenticExpertPlaceholder)}
${tMeta.agenticNote}

${tMeta.agenticContext}
${rawRequest}

${tMeta.agenticInstructionsHeader}

${tMeta.agenticAnalysisHeader}
${tMeta.agenticAnalysisTasks.map(task => `    -   ${task}`).join('\n')}

${tMeta.agenticThinkingHeader}
${tMeta.agenticThinkingTasks.map(task => `    -   ${task}`).join('\n')}

${tMeta.agenticDevelopmentHeader}
${tMeta.agenticDevelopmentTasks.map(task => `    -   ${task}`).join('\n')}

${tMeta.agenticSelfAssessmentHeader}
    ${tMeta.agenticSelfAssessmentQuestion1}

    ${tMeta.agenticSelfAssessmentInstruction}
    ${tMeta.agenticEvalTableHeader}
${criteriaTableMarkdown}

    ${tMeta.agenticSelfAssessmentQuestion2}

${tMeta.agenticFooter}
`;
  }

  return { systemInstruction, userQuery };
};
