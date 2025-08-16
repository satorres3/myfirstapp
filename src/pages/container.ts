import { Container } from "../types";

export interface ContainerCallbacks {
    showPage: (page: any) => void;
    submitChat: () => void;
    handleFileSelect: (file: File | string) => void;
    clearAttachment: () => void;
    getCurrentContainerId: () => string | null;
    setCurrentContainerId: (id: string | null) => void;
    containers: Container[];
}

export const initContainerPage = (cb: ContainerCallbacks) => {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const backToHubBtns = document.querySelectorAll('.back-to-hub-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement | null;
    const attachmentBtn = document.getElementById('attachment-btn');
    const attachmentOptions = document.getElementById('attachment-options');
    const uploadComputerBtn = document.getElementById('upload-computer-btn');
    const uploadSharepointBtn = document.getElementById('upload-sharepoint-btn');
    const fileUploadInput = document.getElementById('file-upload-input') as HTMLInputElement | null;
    const removeAttachmentBtn = document.getElementById('remove-attachment-btn');
    const quickQuestionsContainer = document.getElementById('quick-questions-container');
    const modelSelect = document.getElementById('model-select') as HTMLSelectElement | null;
    const personaSelect = document.getElementById('persona-select') as HTMLSelectElement | null;

    const openSharePointPicker = async (): Promise<string | null> => {
        // Placeholder for SharePoint picker integration
        return null;
    };

    const processUpload = (fileOrRef: File | string) => {
        if (fileOrRef instanceof File) {
            // Local file selected
            cb.handleFileSelect(fileOrRef);
        } else {
            // SharePoint file reference
            cb.handleFileSelect(fileOrRef);
        }
    };

    sidebarToggleBtn?.addEventListener('click', () => {
        document.getElementById('container-page')?.classList.toggle('sidebar-open');
    });

    backToHubBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cb.setCurrentContainerId(null);
            cb.showPage('hub');
        });
    });

    chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        cb.submitChat();
    });

    chatInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            cb.submitChat();
        }
    });

    chatInput?.addEventListener('input', () => {
        if (chatInput) {
            chatInput.style.height = 'auto';
            chatInput.style.height = `${chatInput.scrollHeight}px`;
        }
    });

    attachmentBtn?.addEventListener('click', () => {
        attachmentOptions?.classList.toggle('hidden');
    });

    uploadComputerBtn?.addEventListener('click', () => {
        fileUploadInput?.click();
    });

    fileUploadInput?.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            processUpload(target.files[0]);
        }
    });

    uploadSharepointBtn?.addEventListener('click', async () => {
        const sharePointRef = await openSharePointPicker();
        if (sharePointRef) {
            processUpload(sharePointRef);
        }
    });

    removeAttachmentBtn?.addEventListener('click', cb.clearAttachment);

    quickQuestionsContainer?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('quick-question') && chatInput) {
            chatInput.value = target.textContent || '';
            chatInput.focus();
        }
    });

    [modelSelect, personaSelect].forEach(sel => {
        sel?.addEventListener('change', () => {
            const currentId = cb.getCurrentContainerId();
            if (!currentId) return;
            const container = cb.containers.find(c => c.id === currentId);
            if (container && modelSelect && personaSelect) {
                container.selectedModel = modelSelect.value;
                container.selectedPersona = personaSelect.value;
            }
        });
    });
};
