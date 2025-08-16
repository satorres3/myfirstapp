import { Container, AppFunction } from "../types";

export interface SettingsCallbacks {
    showPage: (page: any) => void;
    generateSuggestions: (containerName: string, type: 'questions' | 'personas') => Promise<string[]>;
    generateFunction: (userRequest: string) => Promise<Omit<AppFunction, 'id' | 'enabled'> | null>;
    getCurrentSettingsContainer: () => Container | undefined;
    renderContainerSettings: (id: string) => void;
}

export const initSettingsPage = (cb: SettingsCallbacks) => {
    const backToSettingsBtn = document.getElementById('back-to-settings-btn');
    const addQuickQuestionForm = document.getElementById('add-quick-question-form') as HTMLFormElement | null;
    const newQuickQuestionInput = document.getElementById('new-quick-question-input') as HTMLInputElement;
    const addPersonaForm = document.getElementById('add-persona-form') as HTMLFormElement | null;
    const newPersonaInput = document.getElementById('new-persona-input') as HTMLInputElement;
    const addAccessorForm = document.getElementById('add-accessor-form') as HTMLFormElement | null;
    const newAccessorInput = document.getElementById('new-accessor-input') as HTMLInputElement;
    const addFunctionForm = document.getElementById('add-function-form') as HTMLFormElement | null;
    const newFunctionInput = document.getElementById('new-function-input') as HTMLInputElement;
    const generateFunctionBtn = document.getElementById('generate-function-btn') as HTMLButtonElement;
    const suggestQuestionsBtn = document.getElementById('suggest-questions-btn') as HTMLButtonElement;
    const suggestPersonasBtn = document.getElementById('suggest-personas-btn') as HTMLButtonElement;
    const editContainerNameInput = document.getElementById('edit-container-name') as HTMLInputElement;

    backToSettingsBtn?.addEventListener('click', () => cb.showPage('settings'));

    addQuickQuestionForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const container = cb.getCurrentSettingsContainer();
        const newValue = newQuickQuestionInput.value.trim();
        if (container && newValue) {
            container.quickQuestions.push(newValue);
            cb.renderContainerSettings(container.id);
            newQuickQuestionInput.value = '';
        }
    });

    addPersonaForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const container = cb.getCurrentSettingsContainer();
        const newValue = newPersonaInput.value.trim();
        if (container && newValue) {
            container.availablePersonas.push(newValue);
            cb.renderContainerSettings(container.id);
            newPersonaInput.value = '';
        }
    });

    addAccessorForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const container = cb.getCurrentSettingsContainer();
        const newValue = newAccessorInput.value.trim();
        if (container && newValue) {
            container.accessControl.push(newValue);
            cb.renderContainerSettings(container.id);
            newAccessorInput.value = '';
        }
    });

    addFunctionForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const container = cb.getCurrentSettingsContainer();
        const userRequest = newFunctionInput.value.trim();
        if (!container || !userRequest) return;
        generateFunctionBtn.disabled = true;
        generateFunctionBtn.querySelector('span')!.textContent = 'Generating...';
        const funcData = await cb.generateFunction(userRequest);
        if (funcData) {
            const newFunc: AppFunction = { ...funcData, id: `func_${Date.now()}`, enabled: true };
            container.functions.push(newFunc);
            cb.renderContainerSettings(container.id);
            newFunctionInput.value = '';
        }
        generateFunctionBtn.disabled = false;
        generateFunctionBtn.querySelector('span')!.textContent = 'Generate with AI';
    });

    editContainerNameInput?.addEventListener('change', () => {
        const container = cb.getCurrentSettingsContainer();
        const newName = editContainerNameInput.value.trim();
        if (container && newName) {
            container.name = newName;
            cb.renderContainerSettings(container.id);
        }
    });

    suggestQuestionsBtn?.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        const container = cb.getCurrentSettingsContainer();
        if (!container) return;
        btn.disabled = true;
        btn.textContent = 'Generating...';
        const suggestions = await cb.generateSuggestions(container.name, 'questions');
        if (suggestions.length > 0) {
            container.quickQuestions.push(...suggestions);
            cb.renderContainerSettings(container.id);
        }
        btn.disabled = false;
        btn.textContent = 'Suggest with AI';
    });

    suggestPersonasBtn?.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        const container = cb.getCurrentSettingsContainer();
        if (!container) return;
        btn.disabled = true;
        btn.textContent = 'Generating...';
        const suggestions = await cb.generateSuggestions(container.name, 'personas');
        if (suggestions.length > 0) {
            container.availablePersonas.push(...suggestions);
            cb.renderContainerSettings(container.id);
        }
        btn.disabled = false;
        btn.textContent = 'Suggest with AI';
    });
};
