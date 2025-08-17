

document.addEventListener('DOMContentLoaded', () => {
    // --- Page Transition Setup ---
    document.body.classList.add('page-loaded');
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || anchor.target === '_blank' || anchor.hasAttribute('data-no-transition')) return;
        if (anchor.origin !== window.location.origin) return;
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = href;
        }, 200);
    });
    // --- CSRF Token for Django fetch requests ---
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // --- State Management ---
    let containers = [];
    let currentUser = null;
    let currentContainerId = null;
    let currentSettingsContainerId = null;
    let attachedFile = null;
    let selectedIcon = null;
    let currentRunningFunction = null;
    
    const chatHistories = {}; // Key: containerId


    // --- Header Elements ---
    const portalHeader = document.getElementById('portal-header');
    const userProfileContainer = document.getElementById('user-profile');
    
    // --- Modal Elements ---
    const addContainerModal = document.getElementById('add-container-modal');
    const addContainerForm = document.getElementById('add-container-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelContainerBtn = document.getElementById('cancel-container-btn');
    const createContainerBtn = document.getElementById('create-container-btn');
    const containerNameInput = document.getElementById('container-name-input');
    const containerDescInput = document.getElementById('container-desc-input');
    const containerIconSelector = document.getElementById('container-icon-selector');

    // --- Buttons and Forms ---
    const addContainerBtn = document.getElementById('add-container-btn');
    const chatForm = document.getElementById('chat-form');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const attachmentBtn = document.getElementById('attachment-btn');
    const attachmentOptions = document.getElementById('attachment-options');
    const uploadComputerBtn = document.getElementById('upload-computer-btn');
    const fileUploadInput = document.getElementById('file-upload-input');
    const removeAttachmentBtn = document.getElementById('remove-attachment-btn');

    // --- Chat UI Elements ---
    const chatMessagesContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const attachmentPreview = document.getElementById('attachment-preview');
    const attachmentFilename = document.getElementById('attachment-filename');
    const quickQuestionsContainer = document.getElementById('quick-questions-container');
    const modelSelect = document.getElementById('model-select');
    const personaSelect = document.getElementById('persona-select');

    // --- Content Areas ---
    const containerGrid = document.getElementById('container-grid');
    const containerList = document.getElementById('container-list');
    const containerPageTitle = document.getElementById('container-page-title');
    const sidebarContainerTitle = document.getElementById('sidebar-container-title');
    const sidebarAppsSection = document.getElementById('sidebar-apps-section');
    const containerPageEl = document.getElementById('container-page');
    const settingsDetailPage = document.getElementById('settings-detail-page');
    if (containerPageEl) {
        currentContainerId = parseInt(containerPageEl.dataset.containerId, 10);
    }
    if (settingsDetailPage) {
        currentSettingsContainerId = parseInt(settingsDetailPage.dataset.containerId, 10);
    }

    
    // --- Settings Detail Page Elements ---
    const settingsDetailTitle = document.getElementById('settings-detail-title');
    const editContainerNameInput = document.getElementById('edit-container-name');
    const quickQuestionsList = document.getElementById('quick-questions-list');
    const addQuickQuestionForm = document.getElementById('add-quick-question-form');
    const newQuickQuestionInput = document.getElementById('new-quick-question-input');
    const suggestQuestionsBtn = document.getElementById('suggest-questions-btn');
    const personasList = document.getElementById('personas-list');
    const addPersonaForm = document.getElementById('add-persona-form');
    const newPersonaInput = document.getElementById('new-persona-input');
    const suggestPersonasBtn = document.getElementById('suggest-personas-btn');
    const accessControlList = document.getElementById('access-control-list');
    const addAccessorForm = document.getElementById('add-accessor-form');
    const newAccessorInput = document.getElementById('new-accessor-input');
    const functionsList = document.getElementById('functions-list');
    const addFunctionForm = document.getElementById('add-function-form');
    const newFunctionInput = document.getElementById('new-function-input');
    const generateFunctionBtn = document.getElementById('generate-function-btn');

    // --- Function Runner Modal ---
    const functionRunnerModal = document.getElementById('function-runner-modal');
    const functionRunnerTitle = document.getElementById('function-runner-title');
    const functionRunnerForm = document.getElementById('function-runner-form');
    const functionRunnerBody = document.getElementById('function-runner-body');
    const closeFunctionRunnerBtn = document.getElementById('close-function-runner-btn');
    const cancelFunctionRunnerBtn = document.getElementById('cancel-function-runner-btn');
    
    // --- Initial Data ---
    const availableIcons = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
    ];

    const DEFAULT_ICON = 'icons/default.svg';
    const getIconHtml = (icon) => {
        const iconRef = (typeof icon === 'string' && icon.trim()) ? icon.trim() : DEFAULT_ICON;
        if (iconRef.startsWith('<')) {
            return iconRef;
        }
        return `<img src="/static/${iconRef}" alt="icon">`;
    };

    // --- API Helper ---
    const api = async (url, options = {}) => {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
        };
        const response = await fetch(url, { ...defaultOptions, ...options, headers: {...defaultOptions.headers, ...options.headers} });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.detail || 'An API error occurred');
        }
        if (response.status === 204) { // No Content
            return null;
        }
        return response.json();
    };

    // --- User Management ---
    const renderUserProfile = (user) => {
        if (!user || !userProfileContainer) return;

        const initials = (user.first_name && user.last_name) 
            ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
            : user.username[0].toUpperCase();
        
        const fullName = user.full_name || user.username;
        const avatarContent = user.avatar_url 
            ? `<img src="${user.avatar_url}" alt="${fullName}">`
            : `<span>${initials}</span>`;

        userProfileContainer.innerHTML = `
            <div class="user-avatar">${avatarContent}</div>
            <span class="user-name">${fullName}</span>
            <form action="/accounts/logout/" method="post">
                <input type="hidden" name="csrfmiddlewaretoken" value="${csrftoken}">
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        `;
        portalHeader?.classList.remove('hidden');
    };


    // --- Markdown to HTML ---
    const markdownToHtml = (md) => {
         let html = md
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\s*[\*-] (.*$)/gim, '<li>$1</li>')
            .replace(/(<\/li>\s*<li>)/g, '</li><li>')
            .replace(/((<li>.*<\/li>)+)/gs, '<ul>$1</ul>')
            .replace(/\n/g, '<br />')
            .replace(/<br \/>\s*<h[1-3]>/g, '<h$1>')
            .replace(/<\/h[1-3]>\s*<br \/>/g, '</h3>')
            .replace(/<br \/>\s*<ul>/g, '<ul>')
            .replace(/<\/ul>\s*<br \/>/g, '</ul>');
        return html;
    };

    // --- Chat UI Management ---
    const addMessageToUI = (text, sender, thinking = false) => {
        if (!chatMessagesContainer) return null;
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.setAttribute('aria-label', 'Copy message');
        copyBtn.innerHTML = `
            <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        `;
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.classList.add('copied');
                setTimeout(() => copyBtn.classList.remove('copied'), 1500);
            });
        });

        if (thinking) {
            messageDiv.classList.add('thinking');
            messageDiv.id = 'thinking-indicator';
            messageDiv.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
        } else {
             if (sender === 'bot') {
                messageDiv.innerHTML = markdownToHtml(text);
            } else {
                const textNode = document.createTextNode(text);
                messageDiv.appendChild(textNode);
            }
        }
        
        chatMessagesContainer.appendChild(messageDiv);
        if (sender !== 'user') {
            messageDiv.appendChild(copyBtn);
        }
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        return messageDiv;
    };
    
    const renderChatHistory = (containerId) => {
        if (!chatMessagesContainer) return;
        chatMessagesContainer.innerHTML = '';
        const history = chatHistories[containerId] || [];
        history.forEach(message => {
            addMessageToUI(message.text, message.role);
        });
    }

    const renderSidebar = (containerId) => {
        const container = containers.find(c => c.id === containerId);
        if (!container || !sidebarAppsSection) return;

        sidebarAppsSection.innerHTML = '';

        const enabledFunctions = (container.functions || []).filter(f => f.enabled);

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
                link.innerHTML = `${getIconHtml(func.icon)}<span>${func.name}</span>`;
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
        containerGrid.innerHTML = '';
        containerList.innerHTML = '';
        containers.forEach(container => {
            // Render Hub Card
            const card = document.createElement('a');
            card.className = 'container-card';
            card.href = `/containers/${container.id}/`;
            card.innerHTML = `
                <div class="container-icon">${getIconHtml(container.icon)}</div>
                <h2 class="container-title">${container.name}</h2>
                <p class="container-description">${container.description}</p>
            `;
            containerGrid.appendChild(card);

            // Render Settings List Item
            const listItem = document.createElement('a');
            listItem.className = 'container-list-item';
            listItem.href = `/settings/${container.id}/`;
            listItem.textContent = container.name;
            containerList.appendChild(listItem);
        });
    };

    const addContainer = async (containerData) => {
        const newContainer = await api('/api/containers/', {
            method: 'POST',
            body: JSON.stringify(containerData),
        });
        containers.push(newContainer);
        if (!chatHistories[newContainer.id]) {
            chatHistories[newContainer.id] = [];
        }
        renderAllContainers();
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = `/containers/${newContainer.id}/`;
        }, 200);
    };

    const updateContainer = async (containerId, updatedData) => {
        const updatedContainer = await api(`/api/containers/${containerId}/`, {
            method: 'PATCH',
            body: JSON.stringify(updatedData)
        });
        const index = containers.findIndex(c => c.id === containerId);
        if (index !== -1) {
            containers[index] = { ...containers[index], ...updatedContainer };
        }
        return containers[index];
    };

    // --- Settings Detail Page ---
    const renderManagedList = (containerEl, items, onRemove) => {
        if (!containerEl) return;
        containerEl.innerHTML = '';
        (items || []).forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'managed-list-item';
            el.innerHTML = `<span>${item}</span>`;
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => onRemove(index);
            el.appendChild(removeBtn);
            containerEl.appendChild(el);
        });
    };

    const renderFunctionsList = (containerId) => {
        const container = containers.find(c => c.id === containerId);
        if(!functionsList || !container || !container.functions) return;
        functionsList.innerHTML = '';
        container.functions.forEach((func, index) => {
             const el = document.createElement('div');
            el.className = 'managed-list-item function-item';
            el.innerHTML = `
                <div class="function-item-icon">${getIconHtml(func.icon)}</div>
                <div class="function-item-details">
                    <strong>${func.name}</strong>
                    <p>${func.description}</p>
                </div>
                <div class="function-controls">
                    <label class="toggle-switch">
                        <input type="checkbox" ${func.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <button class="remove-btn" aria-label="Remove function">&times;</button>
                </div>
            `;

            const toggle = el.querySelector('input[type="checkbox"]');
            toggle.addEventListener('change', async () => {
                func.enabled = toggle.checked;
                await updateContainer(container.id, { functions: container.functions });
            });

            const removeBtn = el.querySelector('.remove-btn');
            removeBtn?.addEventListener('click', async () => {
                container.functions.splice(index, 1);
                await updateContainer(container.id, { functions: container.functions });
                renderContainerSettings(container.id);
            });

            functionsList.appendChild(el);
        });
    }

    const renderContainerSettings = (containerId) => {
        const container = containers.find(c => c.id === containerId);
        if (!container || !settingsDetailTitle || !editContainerNameInput) return;
        
        currentSettingsContainerId = containerId;
        settingsDetailTitle.textContent = `Edit "${container.name}"`;
        editContainerNameInput.value = container.name;
        
        renderManagedList(quickQuestionsList, container.quickQuestions, async (index) => {
            container.quickQuestions.splice(index, 1);
            await updateContainer(container.id, { quickQuestions: container.quickQuestions });
            renderContainerSettings(container.id);
        });

        renderManagedList(personasList, container.availablePersonas, async (index) => {
            container.availablePersonas.splice(index, 1);
            await updateContainer(container.id, { availablePersonas: container.availablePersonas });
            renderContainerSettings(container.id);
        });

        renderManagedList(accessControlList, container.accessControl, async (index) => {
            container.accessControl.splice(index, 1);
            await updateContainer(container.id, { accessControl: container.accessControl });
            renderContainerSettings(container.id);
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
        containerIconSelector.innerHTML = '';
        availableIcons.forEach(iconSvg => {
            const iconOption = document.createElement('button');
            iconOption.type = 'button';
            iconOption.className = 'icon-option';
            iconOption.innerHTML = iconSvg;
            iconOption.setAttribute('data-icon', iconSvg);
            containerIconSelector.appendChild(iconOption);
        });
    };
    
    // --- AI Suggestion Logic ---
    const generateSuggestions = async (suggestionType) => {
        const container = containers.find(c => c.id === currentSettingsContainerId);
        if (!container) return [];
        
        try {
            const response = await api(`/api/containers/${container.id}/suggest_${suggestionType}/`, { method: 'POST' });
            return response.suggestions || [];
        } catch (error) {
            console.error(`Error generating ${suggestionType}:`, error);
            alert(`Sorry, I couldn't generate suggestions. Please try again.`);
            return [];
        }
    };
    
    const generateFunction = async (userRequest) => {
        const container = containers.find(c => c.id === currentSettingsContainerId);
        if (!container) return null;
         
        try {
            return await api(`/api/containers/${container.id}/generate_function/`, {
                method: 'POST',
                body: JSON.stringify({ prompt: userRequest })
            });
        } catch (error) {
            console.error(`Error generating function:`, error);
            alert(`Sorry, I couldn't generate the function. Please try again with a different request.`);
            return null;
        }
    }


    // --- Chat Logic ---
    const handleSendMessage = async (containerId, message) => {
        const container = containers.find(c => c.id === containerId);
        if(!container) return;

        // Add user message to local history immediately
        if (message) {
            if(!chatHistories[containerId]) chatHistories[containerId] = [];
            chatHistories[containerId].push({ role: 'user', text: message });
        }

        const thinkingIndicator = addMessageToUI('', 'bot', true);

        try {
            const response = await api(`/api/containers/${containerId}/chat/`, {
                method: 'POST',
                body: JSON.stringify({
                    message: message || "Describe the attached file.",
                    history: chatHistories[containerId].slice(0, -1) // Send history *without* the current user message
                })
            });
            const botResponseText = response.reply;
            chatHistories[containerId].push({ role: 'model', text: botResponseText });
            
            thinkingIndicator.remove();
            addMessageToUI(botResponseText, 'bot');

        } catch (error) {
            console.error("API Error:", error);
            thinkingIndicator.remove();
            addMessageToUI("Sorry, I encountered an error communicating with the AI. Please check the server logs.", 'bot');
        }
    };
    
    const submitChat = () => {
        const message = chatInput?.value.trim();
        if ((message) && currentContainerId) { // No file support for backend yet
            addMessageToUI(message, 'user');
            handleSendMessage(currentContainerId, message);
            chatInput.value = '';
            chatInput.style.height = 'auto';
        }
    }

    // --- Event Listeners ---
    
    // Modal Listeners
    addContainerBtn?.addEventListener('click', openAddContainerModal);
    closeModalBtn?.addEventListener('click', closeAddContainerModal);
    cancelContainerBtn?.addEventListener('click', closeAddContainerModal);
    addContainerModal?.addEventListener('click', (e) => {
        if(e.target === addContainerModal) closeAddContainerModal();
    });

    addContainerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newContainerData = {
            name: containerNameInput.value.trim(),
            description: containerDescInput.value.trim() || 'A newly created container.',
            icon: selectedIcon,
            availableModels: ['gemini-2.5-flash'], // Default value
        };
        await addContainer(newContainerData);
        closeAddContainerModal();
    });

    containerNameInput?.addEventListener('input', validateModalForm);
    
    containerIconSelector?.addEventListener('click', (e) => {
        const target = e.target;
        const iconButton = target.closest('.icon-option');
        if (iconButton) {
            containerIconSelector.querySelector('.selected')?.classList.remove('selected');
            iconButton.classList.add('selected');
            selectedIcon = iconButton.getAttribute('data-icon');
            validateModalForm();
        }
    });


    sidebarToggleBtn?.addEventListener('click', () => {
        containerPageEl?.classList.toggle('sidebar-open');
    });

    quickQuestionsContainer?.addEventListener('click', (e) => {
        const target = e.target;
        if(target.classList.contains('quick-question')) {
            chatInput.value = target.textContent || '';
            chatInput.focus();
        }
    });

    chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitChat();
    });

    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitChat();
        }
    });
    
    chatInput?.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = `${chatInput.scrollHeight}px`;
        const target = e.target;
        if(target.classList.contains('quick-question')) {
            chatInput.value = target.textContent || '';
            chatInput.focus();
        }
    });

    [modelSelect, personaSelect].forEach(sel => {
        sel?.addEventListener('change', async () => {
            if(!currentContainerId) return;
            const updatedData = {
                selectedModel: modelSelect.value,
                selectedPersona: personaSelect.value,
            };
            await updateContainer(currentContainerId, updatedData);
        });
    });

    // --- Settings Detail Page Listeners ---
    addQuickQuestionForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const container = containers.find(c => c.id === currentSettingsContainerId);
        const newValue = newQuickQuestionInput.value.trim();
        if (container && newValue) {
            const updatedQuestions = [...(container.quickQuestions || []), newValue];
            await updateContainer(container.id, { quickQuestions: updatedQuestions });
            renderContainerSettings(container.id);
            newQuickQuestionInput.value = '';
        }
    });

    addPersonaForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const container = containers.find(c => c.id === currentSettingsContainerId);
        const newValue = newPersonaInput.value.trim();
        if (container && newValue) {
            const updatedPersonas = [...(container.availablePersonas || []), newValue];
            await updateContainer(container.id, { availablePersonas: updatedPersonas });
            renderContainerSettings(container.id);
            newPersonaInput.value = '';
        }
    });
    
    addAccessorForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const container = containers.find(c => c.id === currentSettingsContainerId);
        const newValue = newAccessorInput.value.trim();
        if (container && newValue) {
            const updatedAccess = [...(container.accessControl || []), newValue];
            await updateContainer(container.id, { accessControl: updatedAccess });
            renderContainerSettings(container.id);
            newAccessorInput.value = '';
        }
    });
    
    addFunctionForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const container = containers.find(c => c.id === currentSettingsContainerId);
        const userRequest = newFunctionInput.value.trim();
        if (!container || !userRequest) return;

        generateFunctionBtn.disabled = true;
        generateFunctionBtn.querySelector('span').textContent = 'Generating...';

        const funcData = await generateFunction(userRequest);
        if (funcData) {
            const newFunc = { ...funcData, id: `func_${Date.now()}`, enabled: true };
            const updatedFunctions = [...(container.functions || []), newFunc];
            await updateContainer(container.id, { functions: updatedFunctions });
            renderContainerSettings(container.id);
            newFunctionInput.value = '';
        }

        generateFunctionBtn.disabled = false;
        generateFunctionBtn.querySelector('span').textContent = 'Generate with AI';
    });

    editContainerNameInput?.addEventListener('change', async () => {
        const newName = editContainerNameInput.value.trim();
        if (currentSettingsContainerId && newName) {
            await updateContainer(currentSettingsContainerId, { name: newName });
            renderAllContainers();
        }
    });

    suggestQuestionsBtn?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const container = containers.find(c => c.id === currentSettingsContainerId);
        if (!container) return;
        
        btn.disabled = true;
        btn.textContent = 'Generating...';
        const data = await generateSuggestions('questions');
        if (data && data.length > 0) {
            const updatedQuestions = [...(container.quickQuestions || []), ...data];
            await updateContainer(container.id, { quickQuestions: updatedQuestions });
            renderContainerSettings(container.id);
        }
        btn.disabled = false;
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM19 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg> Suggest with AI`;
    });
    
    suggestPersonasBtn?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const container = containers.find(c => c.id === currentSettingsContainerId);
        if (!container) return;

        btn.disabled = true;
        btn.textContent = 'Generating...';
        const data = await generateSuggestions('personas');
        if (data && data.length > 0) {
            const updatedPersonas = [...(container.availablePersonas || []), ...data];
            await updateContainer(container.id, { availablePersonas: updatedPersonas });
            renderContainerSettings(container.id);
        }
        btn.disabled = false;
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM19 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg> Suggest with AI`;
    });

    // --- Function Runner Logic ---
    const openFunctionRunner = (func) => {
        currentRunningFunction = func;
        if (functionRunnerTitle) functionRunnerTitle.textContent = `Run: ${func.name}`;
        if (functionRunnerBody) {
            functionRunnerBody.innerHTML = '';
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
                    input.rows = 4;
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
        if (functionRunnerForm) functionRunnerForm.reset();
        currentRunningFunction = null;
    }

    functionRunnerForm?.addEventListener('submit', e => {
        e.preventDefault();
        if (!currentRunningFunction || !currentContainerId) return;

        const formData = new FormData(e.target);
        let prompt = currentRunningFunction.promptTemplate;
        let userMessageSummary = `Running app "${currentRunningFunction.name}" with inputs:\n`;

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

    // --- Initialization ---
    const initialize = async () => {
        try {
            currentUser = await api('/api/me/');
            renderUserProfile(currentUser);
            containers = await api('/api/containers/');
            containers.forEach(c => chatHistories[c.id] = []);
            renderAllContainers();
            populateIcons();
            if (currentContainerId) {
                const container = containers.find(c => c.id === currentContainerId);
                if (container) {
                    if (containerPageTitle) containerPageTitle.textContent = `${container.name} Assistant`;
                    if (sidebarContainerTitle) sidebarContainerTitle.textContent = container.name;
                    if (quickQuestionsContainer) {
                        quickQuestionsContainer.innerHTML = '';
                        (container.quickQuestions || []).slice(0, 4).forEach(q => {
                            const bubble = document.createElement('button');
                            bubble.className = 'quick-question';
                            bubble.textContent = q;
                            quickQuestionsContainer.appendChild(bubble);
                        });
                    }
                    modelSelect.innerHTML = '';
                    personaSelect.innerHTML = '';
                    (container.availableModels || []).forEach(m => modelSelect.add(new Option(m, m, m === container.selectedModel, m === container.selectedModel)));
                    (container.availablePersonas || []).forEach(p => personaSelect.add(new Option(p, p, p === container.selectedPersona, p === container.selectedPersona)));
                    renderChatHistory(currentContainerId);
                    renderSidebar(currentContainerId);
                }
            }
            if (currentSettingsContainerId) {
                renderContainerSettings(currentSettingsContainerId);
            }
        } catch (error) {
            console.error("Initialization failed:", error);
            // If user fetch fails, it might mean they are not logged in.
            // The Django backend should have already redirected to the login page.
        }
    };

    initialize();
});
