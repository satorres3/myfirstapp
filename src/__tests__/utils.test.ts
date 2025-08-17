// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { markdownToHtml } from "../utils";

describe("markdownToHtml", () => {
  it("converts headings", () => {
    const html = markdownToHtml("# Title");
    expect(html).toContain("<h1>Title</h1>");
  });

  it("converts lists", () => {
    const html = markdownToHtml("- item1\n- item2");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>item1</li>");
    expect(html).toContain("<li>item2</li>");
  });

  it("sanitizes malicious input", () => {
    const html = markdownToHtml('<img src="x" onerror="alert(1)">');
    expect(html).toContain('src="x"');
    expect(html).not.toContain("onerror");
  });
});
