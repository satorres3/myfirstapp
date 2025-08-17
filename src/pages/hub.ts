import { Container, ContainerConfig } from "../types";

export interface HubPageCallbacks {
    showPage: (page: any) => void;
    openAddContainerModal: () => void;
    closeAddContainerModal: () => void;
    validateModalForm: () => void;
    addContainer: (data: Omit<Container, 'id'>) => void;
    selectIcon: (icon: string) => void;
    getSelectedIcon: () => string | null;
    openContainer: (containerId: string) => void;
    openSettingsDetail: (containerId: string) => void;
}

export const initHubPage = (cb: HubPageCallbacks) => {
    const settingsBtn = document.getElementById('settings-btn');
    const addContainerBtn = document.getElementById('add-container-btn');
    const addContainerModal = document.getElementById('add-container-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelContainerBtn = document.getElementById('cancel-container-btn');
    const addContainerForm = document.getElementById('add-container-form') as HTMLFormElement | null;
    const containerNameInput = document.getElementById('container-name-input') as HTMLInputElement;
    const containerDescInput = document.getElementById('container-desc-input') as HTMLTextAreaElement;
    const containerIconSelector = document.getElementById('container-icon-selector');
    const containerGrid = document.getElementById('container-grid');
    const containerList = document.getElementById('container-list');

    const DEFAULT_ICON = 'icons/default.svg';
    const getIconHtml = (icon: string | null) => {
        const iconRef = (icon && icon.trim()) || DEFAULT_ICON;
        return iconRef.startsWith('<') ? iconRef : `<img src="/static/${iconRef}" alt="icon">`;
    };

    const renderContainerConfigs = (configs: ContainerConfig[]) => {
        if (!containerGrid) return;
        containerGrid.innerHTML = '';
        configs.forEach(cfg => {
            const card = document.createElement('a');
            card.className = 'container-card';
            card.href = cfg.route;
            card.innerHTML = `
                <div class="container-icon">${getIconHtml(cfg.icon)}</div>
                <h2 class="container-title">${cfg.name}</h2>
            `;
            containerGrid.appendChild(card);
        });
    };

    const fetchContainerConfigs = async () => {
        try {
            const res = await fetch('/api/container-configs/');
            if (!res.ok) throw new Error('Failed to fetch container configs');
            const data: ContainerConfig[] = await res.json();
            renderContainerConfigs(data);
        } catch (err) {
            console.error('Error fetching container configs:', err);
        }
    };

    fetchContainerConfigs();

    settingsBtn?.addEventListener('click', () => cb.showPage('settings'));
    addContainerBtn?.addEventListener('click', cb.openAddContainerModal);
    closeModalBtn?.addEventListener('click', cb.closeAddContainerModal);
    cancelContainerBtn?.addEventListener('click', cb.closeAddContainerModal);
    addContainerModal?.addEventListener('click', (e) => {
        if (e.target === addContainerModal) cb.closeAddContainerModal();
    });
    addContainerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        cb.addContainer({
            name: containerNameInput.value.trim(),
            description: containerDescInput.value.trim() || 'A newly created container.',
            icon: cb.getSelectedIcon()!,
            quickQuestions: [],
            availableModels: ['gemini-2.5-flash'],
            availablePersonas: ['Helpful Assistant'],
            selectedModel: 'gemini-2.5-flash',
            selectedPersona: 'Helpful Assistant',
            functions: [],
            accessControl: []
        });
        cb.closeAddContainerModal();
    });
    containerNameInput?.addEventListener('input', cb.validateModalForm);
    containerIconSelector?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const iconButton = target.closest('.icon-option');
        if (iconButton) {
            containerIconSelector.querySelector('.selected')?.classList.remove('selected');
            iconButton.classList.add('selected');
            cb.selectIcon(iconButton.getAttribute('data-icon') || '');
            cb.validateModalForm();
        }
    });
    containerGrid?.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('.container-card');
        const containerId = card?.getAttribute('data-container-id');
        if (containerId) cb.openContainer(containerId);
    });
    containerList?.addEventListener('click', (e) => {
        const listItem = (e.target as HTMLElement).closest('.container-list-item');
        const containerId = listItem?.getAttribute('data-container-id');
        if (containerId) cb.openSettingsDetail(containerId);
    });
};
