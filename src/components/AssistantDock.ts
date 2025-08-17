export class AssistantDock {
    private el: HTMLElement;
    private controller: AbortController | null = null;

    constructor(el: HTMLElement) {
        this.el = el;
    }

    async send(prompt: string, endpoint: string) {
        this.controller?.abort();
        this.controller = new AbortController();
        const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ prompt }),
            headers: { 'Content-Type': 'application/json' },
            signal: this.controller.signal
        });
        if (!response.body) {
            this.el.textContent = await response.text();
            return;
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let text = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            text += decoder.decode(value, { stream: true });
            this.el.textContent = text;
        }
    }

    abort() {
        this.controller?.abort();
    }
}
