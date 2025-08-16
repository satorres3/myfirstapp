/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { FunctionParameter, AppFunction, Container, ChatHistory } from "./src/types";
import { markdownToHtml, fileToBase64 } from "./src/utils";
import { generateSuggestions, generateFunction } from "./src/ai";
import { initLoginPage } from "./src/pages/login";
import { initHubPage } from "./src/pages/hub";
import { initSettingsPage } from "./src/pages/settings";
import { initContainerPage } from "./src/pages/container";

document.addEventListener('DOMContentLoaded', () => {
    // --- Gemini AI Setup ---
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    // --- State Management ---
    let containers: Container[] = [];
    let currentContainerId: string | null = null;
    let currentSettingsContainerId: string | null = null;
    let attachedFile: File | null = null;
    let selectedIcon: string | null = null;
    let currentRunningFunction: AppFunction | null = null;
    
    const containerChats: Map<string, Chat> = new Map(); // Key: `${containerId}-${modelName}`
    const chatHistories: { [key: string]: ChatHistory } = {}; // Key: containerId

    // --- Page Views ---
    const pageViews = {
        login: document.getElementById('login-page'),
        hub: document.getElementById('hub-page'),
        settings: document.getElementById('settings-page'),
        settingsDetail: document.getElementById('settings-detail-page'),
        department: document.getElementById('container-page') // Mapped to new container-page id
    };
    
    // --- Modal Elements ---
    const addContainerModal = document.getElementById('add-container-modal');
    const addContainerForm = document.getElementById('add-container-form') as HTMLFormElement;
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelContainerBtn = document.getElementById('cancel-container-btn');
    const createContainerBtn = document.getElementById('create-container-btn') as HTMLButtonElement;
    const containerNameInput = document.getElementById('container-name-input') as HTMLInputElement;
    const containerDescInput = document.getElementById('container-desc-input') as HTMLTextAreaElement;
    const containerIconSelector = document.getElementById('container-icon-selector');

    // --- Buttons and Forms ---
    const attachmentOptions = document.getElementById('attachment-options');
    const fileUploadInput = document.getElementById('file-upload-input') as HTMLInputElement;

    // --- Chat UI Elements ---
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement;
    const attachmentPreview = document.getElementById('attachment-preview');
    const attachmentFilename = document.getElementById('attachment-filename');
    const quickQuestionsContainer = document.getElementById('quick-questions-container');
    const modelSelect = document.getElementById('model-select') as HTMLSelectElement;
    const personaSelect = document.getElementById('persona-select') as HTMLSelectElement;

    // --- Content Areas ---
    const containerGrid = document.getElementById('container-grid');
    const containerList = document.getElementById('container-list');
    const containerPageTitle = document.getElementById('container-page-title');
    const sidebarContainerTitle = document.getElementById('sidebar-container-title');
    const sidebarAppsSection = document.getElementById('sidebar-apps-section');
    
    // --- Settings Detail Page Elements ---
    const settingsDetailTitle = document.getElementById('settings-detail-title');
    const editContainerNameInput = document.getElementById('edit-container-name') as HTMLInputElement;
    const quickQuestionsList = document.getElementById('quick-questions-list');
    const addQuickQuestionForm = document.getElementById('add-quick-question-form');
    const newQuickQuestionInput = document.getElementById('new-quick-question-input') as HTMLInputElement;
    const suggestQuestionsBtn = document.getElementById('suggest-questions-btn') as HTMLButtonElement;
    const personasList = document.getElementById('personas-list');
    const addPersonaForm = document.getElementById('add-persona-form');
    const newPersonaInput = document.getElementById('new-persona-input') as HTMLInputElement;
    const suggestPersonasBtn = document.getElementById('suggest-personas-btn') as HTMLButtonElement;
    const accessControlList = document.getElementById('access-control-list');
    const addAccessorForm = document.getElementById('add-accessor-form');
    const newAccessorInput = document.getElementById('new-accessor-input') as HTMLInputElement;
    const functionsList = document.getElementById('functions-list');
    const addFunctionForm = document.getElementById('add-function-form');
    const newFunctionInput = document.getElementById('new-function-input') as HTMLInputElement;
    const generateFunctionBtn = document.getElementById('generate-function-btn') as HTMLButtonElement;

    // --- Function Runner Modal ---
    const functionRunnerModal = document.getElementById('function-runner-modal');
    const functionRunnerTitle = document.getElementById('function-runner-title');
    const functionRunnerForm = document.getElementById('function-runner-form');
    const functionRunnerBody = document.getElementById('function-runner-body');
    const closeFunctionRunnerBtn = document.getElementById('close-function-runner-btn');
    const cancelFunctionRunnerBtn = document.getElementById('cancel-function-runner-btn');
    
    // --- Initial Data ---
    const initialContainersData = [
        { 
            name: 'Data Security', 
            description: 'Protecting our digital assets and infrastructure.',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
            quickQuestions: ["What is phishing?", "Latest security threats?", "Recommend a password manager.", "How to secure my home Wi-Fi?"],
            availablePersonas: ["Helpful Assistant", "Security Expert", "Strict Enforcer"],
            accessControl: ["admin@company.com", "security-team"],
        },
        { 
            name: 'Sales', 
            description: 'Driving growth, strategy, and revenue generation.',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>`,
            quickQuestions: ["Summarize last week's leads.", "Who is our biggest competitor?", "Draft a follow-up email.", "Give me a sales pitch for Product X."],
            availablePersonas: ["Helpful Assistant", "Sales Coach", "Data Analyst"],
            accessControl: ["admin@company.com", "sales-team"],
        }
    ];
    
    const availableIcons = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
    ];

    const functionIcons = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
    ];

    // --- Page Navigation ---
    const showPage = (pageKey: keyof typeof pageViews) => {
        const pageName = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
        document.title = `The Future of Tech - ${pageName}`;
        Object.values(pageViews).forEach(page => page?.classList.add('hidden'));
        pageViews[pageKey]?.classList.remove('hidden');

        if(pageKey !== 'department') { // 'department' is the key for the container page
            pageViews.department?.classList.remove('sidebar-open');
        }
    };

    // --- Chat UI Management ---
    const addMessageToUI = (text: string, sender: 'user' | 'bot', thinking: boolean = false) => {
        if (!chatMessagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.setAttribute('aria-label', 'Copy message');
        const copyIcons = `
            <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        `;
        copyBtn.appendChild(document.createRange().createContextualFragment(copyIcons));
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.classList.add('copied');
                setTimeout(() => copyBtn.classList.remove('copied'), 1500);
            });
        });

        if (thinking) {
            messageDiv.classList.add('thinking');
            messageDiv.id = 'thinking-indicator';
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                messageDiv.appendChild(dot);
            }
        } else {
            if (sender === 'bot') {
                const fragment = document.createRange().createContextualFragment(markdownToHtml(text));
                messageDiv.appendChild(fragment);
            } else {
                messageDiv.textContent = text;
            }
        }
        
        chatMessagesContainer.appendChild(messageDiv);
        messageDiv.appendChild(copyBtn);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        return messageDiv;
    };
    
    const renderChatHistory = (containerId: string) => {
        if (!chatMessagesContainer) return;
        chatMessagesContainer.textContent = '';
        const history = chatHistories[containerId] || [];
        history.forEach(message => {
            addMessageToUI(message.text, message.role === 'user' ? 'user' : 'bot');
        });
    }

    const renderSidebar = (containerId: string) => {
        const container = containers.find(c => c.id === containerId);
        if (!container || !sidebarAppsSection) return;

        sidebarAppsSection.textContent = '';

        const enabledFunctions = container.functions.filter(f => f.enabled);

        if (enabledFunctions.length > 0) {
            const title = document.createElement('h3');
            title.className = 'sidebar-section-title';
            title.textContent = 'Apps';
            sidebarAppsSection.appendChild(title);
            
            const list = document.createElement('ul');
            enabledFunctions.forEach(func => {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.className = 'sidebar-link';
                const iconFragment = document.createRange().createContextualFragment(func.icon);
                link.appendChild(iconFragment);
                const span = document.createElement('span');
                span.textContent = func.name;
                link.appendChild(span);
                link.onclick = () => openFunctionRunner(func);
                item.appendChild(link);
                list.appendChild(item);
            });
            sidebarAppsSection.appendChild(list);
        }
    }


    // --- Container Management ---
    const renderAllContainers = () => {
        if (!containerGrid || !containerList) return;
        containerGrid.textContent = '';
        containerList.textContent = '';
        containers.forEach(container => {
            // Render Hub Card
            const card = document.createElement('div');
            card.className = 'container-card';
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('data-container-id', container.id);
            const iconDiv = document.createElement('div');
            iconDiv.className = 'container-icon';
            iconDiv.appendChild(document.createRange().createContextualFragment(container.icon));
            const titleEl = document.createElement('h2');
            titleEl.className = 'container-title';
            titleEl.textContent = container.name;
            const descP = document.createElement('p');
            descP.className = 'container-description';
            descP.textContent = container.description;
            card.append(iconDiv, titleEl, descP);
            containerGrid.appendChild(card);
            
            // Render Settings List Item
            const listItem = document.createElement('div');
            listItem.className = 'container-list-item';
            listItem.setAttribute('data-container-id', container.id);
            listItem.textContent = container.name;
            containerList.appendChild(listItem);
        });
    };

    const addContainer = (containerData: Omit<Container, 'id'>) => {
        const newContainer: Container = {
            ...containerData,
            id: `cont_${Date.now()}`
        };
        containers.push(newContainer);
        if (!chatHistories[newContainer.id]) {
            chatHistories[newContainer.id] = [];
        }
        renderAllContainers();
    };

    const openContainer = (containerId: string) => {
        const container = containers.find(c => c.id === containerId);
        if(container) {
            currentContainerId = container.id;
            if (containerPageTitle) containerPageTitle.textContent = `${container.name} Assistant`;
            if (sidebarContainerTitle) sidebarContainerTitle.textContent = container.name;

            if (quickQuestionsContainer) {
                quickQuestionsContainer.textContent = '';
                container.quickQuestions.slice(0, 4).forEach(q => {
                    const bubble = document.createElement('button');
                    bubble.className = 'quick-question';
                    bubble.textContent = q;
                    quickQuestionsContainer.appendChild(bubble);
                });
            }

            if(modelSelect) modelSelect.textContent = '';
            if(personaSelect) personaSelect.textContent = '';
            container.availableModels.forEach(m => modelSelect.add(new Option(m, m, m === container.selectedModel, m === container.selectedModel)));
            container.availablePersonas.forEach(p => personaSelect.add(new Option(p, p, p === container.selectedPersona, p === container.selectedPersona)));

            renderChatHistory(containerId);
            renderSidebar(containerId);
            showPage('department');
        }
    };

    const openSettingsDetail = (containerId: string) => {
        renderContainerSettings(containerId);
        showPage('settingsDetail');
    }

    // --- Settings Detail Page ---
    const renderManagedList = (container: HTMLElement | null, items: string[], onRemove: (index: number) => void) => {
        if (!container) return;
        container.textContent = '';
        items.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'managed-list-item';
            const span = document.createElement('span');
            span.textContent = item;
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.onclick = () => onRemove(index);
            el.append(span, removeBtn);
            container.appendChild(el);
        });
    };

    const renderFunctionsList = (containerId: string) => {
        const container = containers.find(c => c.id === containerId);
        if(!functionsList || !container) return;
        functionsList.textContent = '';
        container.functions.forEach((func, index) => {
            const el = document.createElement('div');
            el.className = 'managed-list-item function-item';

            const iconDiv = document.createElement('div');
            iconDiv.className = 'function-item-icon';
            iconDiv.appendChild(document.createRange().createContextualFragment(func.icon));

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'function-item-details';
            const strong = document.createElement('strong');
            strong.textContent = func.name;
            const p = document.createElement('p');
            p.textContent = func.description;
            detailsDiv.append(strong, p);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'function-controls';
            const label = document.createElement('label');
            label.className = 'toggle-switch';
            const input = document.createElement('input');
            input.type = 'checkbox';
            if (func.enabled) input.checked = true;
            const slider = document.createElement('span');
            slider.className = 'slider';
            label.append(input, slider);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.setAttribute('aria-label', 'Remove function');
            removeBtn.textContent = '×';
            controlsDiv.append(label, removeBtn);

            el.append(iconDiv, detailsDiv, controlsDiv);

            input.addEventListener('change', () => {
                func.enabled = input.checked;
            });

            removeBtn.addEventListener('click', () => {
                container.functions.splice(index, 1);
                renderContainerSettings(containerId);
            });
            functionsList.appendChild(el);
        });
    }
    const renderContainerSettings = (containerId: string) => {
        const container = containers.find(c => c.id === containerId);
        if (!container || !settingsDetailTitle || !editContainerNameInput) return;
        
        currentSettingsContainerId = containerId;
        settingsDetailTitle.textContent = `Edit "${container.name}"`;
        editContainerNameInput.value = container.name;

        const updateAndRerender = (updateFn: () => void) => {
            updateFn();
            renderContainerSettings(containerId);
            renderAllContainers(); // To update names in other lists
        };
        
        renderManagedList(quickQuestionsList, container.quickQuestions, (index) => {
            updateAndRerender(() => container.quickQuestions.splice(index, 1));
        });

        renderManagedList(personasList, container.availablePersonas, (index) => {
            updateAndRerender(() => container.availablePersonas.splice(index, 1));
        });

        renderManagedList(accessControlList, container.accessControl, (index) => {
            updateAndRerender(() => container.accessControl.splice(index, 1));
        });

        renderFunctionsList(containerId);
    };
    
    // --- Modal Management ---
    const validateModalForm = () => {
        const isNameValid = containerNameInput.value.trim() !== '';
        const isIconSelected = selectedIcon !== null;
        if(createContainerBtn) {
            createContainerBtn.disabled = !(isNameValid && isIconSelected);
        }
    };

    const openAddContainerModal = () => {
        addContainerModal?.classList.remove('hidden');
        validateModalForm();
    };
    
    const closeAddContainerModal = () => {
        addContainerModal?.classList.add('hidden');
        addContainerForm?.reset();
        selectedIcon = null;
        containerIconSelector?.querySelector('.selected')?.classList.remove('selected');
    };

    const populateIcons = () => {
        if (!containerIconSelector) return;
        containerIconSelector.textContent = '';
        availableIcons.forEach(iconSvg => {
            const iconOption = document.createElement('button');
            iconOption.type = 'button';
            iconOption.className = 'icon-option';
            iconOption.appendChild(document.createRange().createContextualFragment(iconSvg));
            iconOption.setAttribute('data-icon', iconSvg);
            containerIconSelector.appendChild(iconOption);
        });
    };

    const clearAttachment = () => {
        attachedFile = null;
        if (fileUploadInput) fileUploadInput.value = '';
        attachmentPreview?.classList.add('hidden');
        if (attachmentFilename) attachmentFilename.textContent = '';
    }

    const handleFileSelect = (file: File) => {
        attachedFile = file;
        if (attachmentFilename) attachmentFilename.textContent = file.name;
        attachmentPreview?.classList.remove('hidden');
        attachmentOptions?.classList.add('hidden');
    }

    // --- Chat Logic ---
    const handleSendMessage = async (containerId: string, message: string) => {
        const container = containers.find(c => c.id === containerId);
        if(!container) return;

        const chatSessionKey = `${container.id}-${container.selectedModel}`;

        if (!containerChats.has(chatSessionKey)) {
            const chat = ai.chats.create({
                model: container.selectedModel,
                config: {
                    systemInstruction: `You are an assistant for the ${container.name} container. Your persona is ${container.selectedPersona}. Your knowledge is strictly isolated to topics relevant to ${container.name}.`,
                },
            });
            containerChats.set(chatSessionKey, chat);
        }

        const chat = containerChats.get(chatSessionKey)!;
        
        if (message) { // Don't add empty user messages to history
            chatHistories[containerId].push({ role: 'user', text: message });
        }

        const thinkingIndicator = addMessageToUI('', 'bot', true);

        try {
            const parts: Part[] = [];

            if (attachedFile) {
                const base64Data = await fileToBase64(attachedFile);
                parts.push({
                    inlineData: {
                        mimeType: attachedFile.type,
                        data: base64Data
                    }
                });
            }
            
            // Add text part last for multimodal prompts
            if (message) {
                 parts.push({ text: message });
            }

            const response = await chat.sendMessage({ message: parts });
            const botResponseText = response.text;

            chatHistories[containerId].push({ role: 'model', text: botResponseText });
            
            thinkingIndicator.remove();
            addMessageToUI(botResponseText, 'bot');

        } catch (error) {
            console.error("Gemini API Error:", error);
            thinkingIndicator.remove();
            addMessageToUI("Sorry, I encountered an error. Please try again.", 'bot');
        } finally {
            clearAttachment();
        }
    };
    
    const submitChat = () => {
        const message = chatInput?.value.trim();
        if ((message || attachedFile) && currentContainerId) {
            addMessageToUI(message || `File: ${attachedFile?.name}`, 'user');
            handleSendMessage(currentContainerId, message || `Describe the attached file.`);
            if (chatInput) {
                chatInput.value = '';
                chatInput.style.height = 'auto';
            }
        }
    }

    // --- Page Initializers ---
    initLoginPage(showPage);
    initHubPage({
        showPage,
        openAddContainerModal,
        closeAddContainerModal,
        validateModalForm,
        addContainer,
        selectIcon: (icon) => { selectedIcon = icon; },
        getSelectedIcon: () => selectedIcon,
        openContainer,
        openSettingsDetail
    });
    initContainerPage({
        showPage,
        submitChat,
        handleFileSelect,
        clearAttachment,
        getCurrentContainerId: () => currentContainerId,
        setCurrentContainerId: (id) => { currentContainerId = id; },
        containers
    });
    initSettingsPage({
        showPage,
        generateSuggestions: (name, type) => generateSuggestions(ai, name, type),
        generateFunction: (req) => generateFunction(ai, functionIcons, req),
        getCurrentSettingsContainer: () => containers.find(c => c.id === currentSettingsContainerId),
        renderContainerSettings
    });

    // --- Function Runner Logic ---
    const openFunctionRunner = (func: AppFunction) => {
        currentRunningFunction = func;
        if (functionRunnerTitle) functionRunnerTitle.textContent = `Run: ${func.name}`;
        if (functionRunnerBody) {
            functionRunnerBody.textContent = ''; // Clear previous form
            func.parameters.forEach(param => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';
                const label = document.createElement('label');
                label.className = 'form-label';
                label.setAttribute('for', `param-${param.name}`);
                label.textContent = param.name;
                
                let input;
                if (param.type === 'textarea') {
                    input = document.createElement('textarea');
                    input.className = 'form-textarea';
                    (input as HTMLTextAreaElement).rows = 4;
                } else {
                    input = document.createElement('input');
                    input.className = 'form-input';
                    input.type = param.type === 'number' ? 'number' : 'text';
                }
                input.id = `param-${param.name}`;
                input.name = param.name;
                input.placeholder = param.description;
                input.required = true;

                formGroup.append(label, input);
                functionRunnerBody.appendChild(formGroup);
            });
        }
        functionRunnerModal?.classList.remove('hidden');
    }

    const closeFunctionRunner = () => {
        functionRunnerModal?.classList.add('hidden');
        if (functionRunnerForm) (functionRunnerForm as HTMLFormElement).reset();
        currentRunningFunction = null;
    }

    functionRunnerForm?.addEventListener('submit', e => {
        e.preventDefault();
        if (!currentRunningFunction || !currentContainerId) return;

        const formData = new FormData(e.target as HTMLFormElement);
        let prompt = currentRunningFunction.promptTemplate;
        let userMessageSummary = `Running function "${currentRunningFunction.name}" with inputs:\n`;

        for (const [key, value] of formData.entries()) {
            prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), String(value));
            userMessageSummary += `- ${key}: ${value}\n`;
        }
        
        addMessageToUI(userMessageSummary.trim(), 'user');
        handleSendMessage(currentContainerId, prompt);
        closeFunctionRunner();
    });

    closeFunctionRunnerBtn?.addEventListener('click', closeFunctionRunner);
    cancelFunctionRunnerBtn?.addEventListener('click', closeFunctionRunner);

    // Hide menus if clicked outside
    document.addEventListener('click', (e) => {
        const attachmentBtnEl = document.getElementById('attachment-btn');
        if (!attachmentBtnEl?.contains(e.target as Node) && !attachmentOptions?.contains(e.target as Node)) {
            attachmentOptions?.classList.add('hidden');
        }
    });


    // --- Initialization ---
    const initialize = () => {
        containers = initialContainersData.map((container, index) => ({
            ...container,
            id: `cont_init_${index}`,
            availableModels: ['gemini-2.5-flash'],
            selectedModel: 'gemini-2.5-flash',
            selectedPersona: 'Helpful Assistant',
            functions: [],
            accessControl: container.accessControl || []
        }));
        containers.forEach(c => chatHistories[c.id] = []);
        
        renderAllContainers();
        populateIcons();
        showPage('login');
    };

    initialize();
});
