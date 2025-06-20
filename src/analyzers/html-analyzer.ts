import { JSDOM } from 'jsdom';
import { ParsedFile, Violation } from '../types';

export class HTMLAnalyzer {
  parseHTML(file: ParsedFile): ParsedFile {
    if (file.type !== 'html') {
      throw new Error('HTMLAnalyzer can only parse HTML files');
    }

    try {
      const dom = new JSDOM(file.content, {
        contentType: 'text/html',
        includeNodeLocations: true
      });

      return {
        ...file,
        dom: dom.window.document
      };
    } catch (error) {
      throw new Error(`Failed to parse HTML for ${file.filePath}: ${error}`);
    }
  }

  extractElements(document: Document, selector: string): Element[] {
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (error) {
      console.warn(`Invalid selector "${selector}":`, error);
      return [];
    }
  }

  getElementContext(element: Element, maxLength: number = 100): string {
    const outerHTML = element.outerHTML;
    if (outerHTML.length <= maxLength) {
      return outerHTML;
    }
    return outerHTML.substring(0, maxLength) + '...';
  }

  getElementSelector(element: Element): string {
    const tagName = element.tagName.toLowerCase();
    const id = element.id;
    const className = element.className;

    if (id) {
      return `${tagName}#${id}`;
    }

    if (className && typeof className === 'string') {
      const classes = className.trim().split(/\s+/).slice(0, 2);
      return `${tagName}.${classes.join('.')}`;
    }

    return tagName;
  }

  hasAttribute(element: Element, attribute: string): boolean {
    return element.hasAttribute(attribute);
  }

  getAttribute(element: Element, attribute: string): string | null {
    return element.getAttribute(attribute);
  }

  getTextContent(element: Element): string {
    return element.textContent?.trim() || '';
  }

  isVisible(element: Element): boolean {
    // Basic visibility check - can be enhanced later
    const style = (element as HTMLElement).style;
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }

    // Check for hidden attribute
    if (element.hasAttribute('hidden')) {
      return false;
    }

    // Check for aria-hidden
    if (element.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    return true;
  }

  getElementLineNumber(element: Element): number | undefined {
    // JSDOM provides node locations in some cases
    // This is a simplified implementation
    return undefined;
  }
}