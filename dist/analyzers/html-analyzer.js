"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLAnalyzer = void 0;
const jsdom_1 = require("jsdom");
class HTMLAnalyzer {
    parseHTML(file) {
        if (file.type !== 'html') {
            throw new Error('HTMLAnalyzer can only parse HTML files');
        }
        try {
            const dom = new jsdom_1.JSDOM(file.content, {
                contentType: 'text/html',
                includeNodeLocations: true
            });
            return {
                ...file,
                dom: dom.window.document
            };
        }
        catch (error) {
            throw new Error(`Failed to parse HTML for ${file.filePath}: ${error}`);
        }
    }
    extractElements(document, selector) {
        try {
            return Array.from(document.querySelectorAll(selector));
        }
        catch (error) {
            console.warn(`Invalid selector "${selector}":`, error);
            return [];
        }
    }
    getElementContext(element, maxLength = 100) {
        const outerHTML = element.outerHTML;
        if (outerHTML.length <= maxLength) {
            return outerHTML;
        }
        return outerHTML.substring(0, maxLength) + '...';
    }
    getElementSelector(element) {
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
    hasAttribute(element, attribute) {
        return element.hasAttribute(attribute);
    }
    getAttribute(element, attribute) {
        return element.getAttribute(attribute);
    }
    getTextContent(element) {
        return element.textContent?.trim() || '';
    }
    isVisible(element) {
        // Basic visibility check - can be enhanced later
        const style = element.style;
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
    getElementLineNumber(element) {
        // JSDOM provides node locations in some cases
        // This is a simplified implementation
        return undefined;
    }
}
exports.HTMLAnalyzer = HTMLAnalyzer;
//# sourceMappingURL=html-analyzer.js.map