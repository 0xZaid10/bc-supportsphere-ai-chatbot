import { GoogleGenAI } from '@google/genai';
import { AIClassificationResult } from '../types';

/**
 * Defines the expected structure of the AI's JSON response.
 */
export interface AIResponse {
    classification: string;
    response: string;
}

export interface AIProcessResult {
    classification: string;
    response: string;
    shouldCreateTicket: boolean;
}

// Define valid classification categories for the AI to use.
const VALID_CLASSIFICATIONS = ["billing", "bug", "feature", "account", "general"];
const TICKET_CLASSIFICATIONS = ["billing", "bug", "account"];

/**
 * AIService class encapsulates all interactions with the Google Gemini API.
 */
class AIService {
    private genAI: GoogleGenAI;
    private modelName: string = 'gemini-2.5-flash';
    private conversationHistory: Map<string, Array<{ role: string; text: string }>>;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('FATAL ERROR: GEMINI_API_KEY environment variable is not set.');
            throw new Error('GEMINI_API_KEY environment variable must be set.');
        }

        this.genAI = new GoogleGenAI({ apiKey });
        this.conversationHistory = new Map();
    }

    /**
     * Constructs the prompt for the Gemini model.
     */
    private buildPrompt(message: string, language: string, history: Array<{ role: string; text: string }>): string {
        const langInstruction = language === 'es' ? 'Spanish' : 'English';
        const historyString = history
            .map(h => `${h.role}: ${h.text}`)
            .join('\n');

        return `
You are an AI customer support assistant for a SaaS company.
Your task is to analyze the user's message, classify it, and generate a helpful response.

**Instructions:**
1. **Analyze and Classify:** Classify the user's message into ONE of the following categories: ${VALID_CLASSIFICATIONS.join(', ')}. The "general" category is for simple greetings or questions that don't fit other categories.
2. **Generate Response:** Write a helpful, empathetic response in ${langInstruction}.
3. **Output Format:** You MUST respond with a valid JSON object in this exact format:
{
  "classification": "<category>",
  "response": "<your response to the user>"
}

**Conversation History:**
${historyString || 'No previous conversation.'}

**Current User Message:**
${message}

Respond ONLY with the JSON object, no additional text.`;
    }

    /**
     * Processes a user message and returns a classification and response.
     */
    async processUserMessage(
        message: string,
        sessionId: string,
        language: string
    ): Promise<AIProcessResult> {
        const history = this.conversationHistory.get(sessionId) || [];

        const prompt = this.buildPrompt(message, language, history);

        try {
            const result = await this.genAI.models.generateContent({
                model: this.modelName,
                contents: prompt,
            });

            const text = result.text || '';

            // Parse the JSON response
            let parsed: AIResponse;
            try {
                // Extract JSON from the response (in case there's extra text)
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No JSON found in response');
                }
                parsed = JSON.parse(jsonMatch[0]);
            } catch {
                console.error('Failed to parse AI response as JSON:', text);
                parsed = {
                    classification: 'general',
                    response: text || 'I apologize, but I encountered an issue processing your request. Please try again.',
                };
            }

            // Validate classification
            if (!VALID_CLASSIFICATIONS.includes(parsed.classification)) {
                parsed.classification = 'general';
            }

            // Update conversation history
            history.push({ role: 'user', text: message });
            history.push({ role: 'assistant', text: parsed.response });
            // Keep history manageable
            if (history.length > 20) {
                history.splice(0, 2);
            }
            this.conversationHistory.set(sessionId, history);

            const shouldCreateTicket = TICKET_CLASSIFICATIONS.includes(parsed.classification);

            return {
                classification: parsed.classification,
                response: parsed.response,
                shouldCreateTicket,
            };
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw new Error('Failed to process message with AI service.');
        }
    }
}

export const aiService = new AIService();
export default aiService;
