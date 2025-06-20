import { ParsedFile } from '../types';
export declare class HTMLAnalyzer {
    parseHTML(file: ParsedFile): ParsedFile;
    extractElements(document: Document, selector: string): Element[];
    getElementContext(element: Element, maxLength?: number): string;
    getElementSelector(element: Element): string;
    hasAttribute(element: Element, attribute: string): boolean;
    getAttribute(element: Element, attribute: string): string | null;
    getTextContent(element: Element): string;
    isVisible(element: Element): boolean;
    getElementLineNumber(element: Element): number | undefined;
}
//# sourceMappingURL=html-analyzer.d.ts.map