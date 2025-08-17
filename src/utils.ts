import { marked } from "marked";
import DOMPurify from "dompurify";

export const markdownToHtml = (md: string): string => {
    const raw = marked.parse(md, { async: false });
    return DOMPurify.sanitize(raw);
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
