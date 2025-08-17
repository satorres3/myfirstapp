export interface SidebarItem {
    id: string;
    label: string;
    onSelect: () => void;
}

export class ContainerSidebar {
    private el: HTMLElement;
    private items: SidebarItem[] = [];
    private selectedId: string | null = null;

    constructor(el: HTMLElement) {
        this.el = el;
        this.el.addEventListener('keydown', (e) => this.onKeydown(e));
    }

    register(item: SidebarItem) {
        this.items.push(item);
        const btn = document.createElement('button');
        btn.textContent = item.label;
        btn.className = 'sidebar-item';
        btn.setAttribute('data-id', item.id);
        btn.addEventListener('click', () => this.select(item.id));
        this.el.appendChild(btn);
    }

    select(id: string) {
        this.selectedId = id;
        this.items.forEach(it => {
            const btn = this.el.querySelector<HTMLButtonElement>(`[data-id="${it.id}"]`);
            if (btn) {
                const selected = it.id === id;
                btn.setAttribute('aria-current', selected ? 'page' : 'false');
                btn.classList.toggle('active', selected);
            }
        });
        const item = this.items.find(i => i.id === id);
        item?.onSelect();
    }

    private onKeydown(e: KeyboardEvent) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const currentIndex = this.items.findIndex(i => i.id === this.selectedId);
        let nextIndex = currentIndex;
        if (e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % this.items.length;
        if (e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + this.items.length) % this.items.length;
        this.select(this.items[nextIndex].id);
        const btn = this.el.querySelector<HTMLButtonElement>(`[data-id="${this.items[nextIndex].id}"]`);
        btn?.focus();
    }
}
