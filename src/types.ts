export interface FunctionParameter {
    name: string;
    type: 'string' | 'number' | 'textarea';
    description: string;
}

export interface AppFunction {
    id: string;
    name: string;
    description: string;
    icon: string;
    parameters: FunctionParameter[];
    promptTemplate: string;
    enabled: boolean;
}

export interface Container {
    id: string;
    name: string;
    description: string;
    icon: string;
    quickQuestions: string[];
    availableModels: string[];
    availablePersonas: string[];
    selectedModel: string;
    selectedPersona: string;
    functions: AppFunction[];
    accessControl: string[];
}

export interface ContainerConfig {
    key: string;
    name: string;
    icon: string | null;
    route: string;
}

export type ChatHistory = { role: 'user' | 'model'; text: string }[];
