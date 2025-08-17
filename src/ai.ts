import { GoogleGenAI, Type } from "@google/genai";
import { AppFunction } from "./types";

export const generateSuggestions = async (
    ai: GoogleGenAI,
    containerName: string,
    suggestionType: 'questions' | 'personas'
): Promise<string[]> => {
    const prompt = suggestionType === 'questions'
        ? `Based on a container named '${containerName}', generate 4 diverse and insightful 'quick questions' a user might ask an AI assistant in this context. Focus on actionable and common queries.`
        : `Based on a container named '${containerName}', generate 4 creative and distinct 'personas' for an AI assistant. Examples: 'Concise Expert', 'Friendly Guide', 'Data-driven Analyst', 'Creative Brainstormer'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonString = response.text;
        if (!jsonString) {
            return [];
        }
        const parsed = JSON.parse(jsonString);
        return parsed.suggestions || [];
    } catch (error) {
        console.error(`Error generating ${suggestionType}:`, error);
        alert(`Sorry, I couldn't generate suggestions. Please try again.`);
        return [];
    }
};

export const generateFunction = async (
    ai: GoogleGenAI,
    functionIcons: string[],
    userRequest: string
): Promise<Omit<AppFunction, 'id' | 'enabled'> | null> => {
    const prompt = `Based on the user request for a function: "${userRequest}", generate a configuration for it. The function should run inside a chat application.
         - Define a short, clear 'name'.
         - Write a concise one-sentence 'description'.
         - Select a suitable SVG 'icon' from the provided list.
         - Define 1 to 3 input 'parameters' the user needs to provide (name, type, description). Parameter 'type' must be one of: 'string', 'number', 'textarea'.
         - Create a detailed 'promptTemplate' to be sent to another AI model. The prompt template must use placeholders like {parameterName} for each parameter defined.

        Available icons:
        ${functionIcons.join('\n')}
        `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        icon: { type: Type.STRING },
                        parameters: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                },
                                required: ['name', 'type', 'description']
                            }
                        },
                        promptTemplate: { type: Type.STRING }
                    },
                    required: ['name', 'description', 'icon', 'parameters', 'promptTemplate']
                }
            }
        });
        const jsonString = response.text;
        if (!jsonString) {
            return null;
        }
        const parsed = JSON.parse(jsonString);
        if (Array.isArray(parsed.parameters)) {
            for (const param of parsed.parameters) {
                if (!['string', 'number', 'textarea'].includes(param.type)) {
                    param.type = 'string';
                }
            }
        }
        return parsed;
    } catch (error) {
        console.error(`Error generating function:`, error);
        alert(`Sorry, I couldn't generate the function. The model might have returned an invalid structure. Please try again with a different request.`);
        return null;
    }
};
