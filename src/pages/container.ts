import { ContainerSidebar } from '../components/ContainerSidebar';
import { AssistantDock } from '../components/AssistantDock';

const plugins: Record<string, () => Promise<{ default: (el: HTMLElement) => void }>> = {
    dataSecurity: () => import('../plugins/dataSecurity/index.ts'),
    sales: () => import('../plugins/sales/index.ts')
};

export function initWorkspace() {
    const sidebarEl = document.getElementById('workspace-sidebar');
    const mainEl = document.getElementById('workspace-main');
    const assistantEl = document.getElementById('assistant-root');
    if (!sidebarEl || !mainEl || !assistantEl) return;

    const sidebar = new ContainerSidebar(sidebarEl);
    const assistant = new AssistantDock(assistantEl);

    Object.keys(plugins).forEach(key => {
        sidebar.register({
            id: key,
            label: key,
            onSelect: async () => {
                mainEl.innerHTML = '';
                const mod = await plugins[key]();
                mod.default(mainEl);
            }
        });
    });

    const first = Object.keys(plugins)[0];
    if (first) sidebar.select(first);

    // Simple assistant demo
    const input = document.createElement('textarea');
    input.setAttribute('rows', '1');
    const send = document.createElement('button');
    send.textContent = 'Ask';
    send.addEventListener('click', () => assistant.send(input.value, '/api/assistant/'));
    const abortBtn = document.createElement('button');
    abortBtn.textContent = 'Abort';
    abortBtn.addEventListener('click', () => assistant.abort());
    assistantEl.appendChild(input);
    assistantEl.appendChild(send);
    assistantEl.appendChild(abortBtn);
}

document.addEventListener('DOMContentLoaded', initWorkspace);
