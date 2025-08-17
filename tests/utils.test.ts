// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '../src/utils';

describe('markdownToHtml', () => {
  it('renders benign markdown', () => {
    const result = markdownToHtml('# Hello');
    expect(result.trim()).toBe('<h1>Hello</h1>');
  });

  it('sanitizes malicious markdown', () => {
    const result = markdownToHtml('[xss](javascript:alert(1)) <img src=x onerror=alert(1) />');
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('<script>');
  });
});
