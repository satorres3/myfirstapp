export const markdownToHtml = (md: string): string => {
    let html = md
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return html
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
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
