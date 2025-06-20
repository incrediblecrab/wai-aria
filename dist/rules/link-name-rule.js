"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkNameRule = void 0;
const compliance_engine_1 = require("../core/compliance-engine");
const types_1 = require("../types");
const wcag_rules_1 = require("./wcag-rules");
class LinkNameRule extends compliance_engine_1.BaseRule {
    constructor() {
        super(...arguments);
        this.id = 'link-name';
    }
    analyze(file, analyzer) {
        if (file.type !== 'html' || !file.dom) {
            return [];
        }
        const violations = [];
        const links = analyzer.extractElements(file.dom, 'a[href]');
        const rule = (0, wcag_rules_1.getRuleById)(this.id);
        for (const link of links) {
            if (!analyzer.isVisible(link)) {
                continue;
            }
            const accessibleName = this.getAccessibleName(link, analyzer);
            if (!accessibleName || accessibleName.trim() === '') {
                violations.push({
                    ruleId: this.id,
                    severity: rule.severity,
                    message: 'Link must have accessible text or an accessible name',
                    element: analyzer.getElementContext(link),
                    selector: analyzer.getElementSelector(link),
                    line: analyzer.getElementLineNumber(link),
                    suggestion: 'Add text content, aria-label, aria-labelledby, or title attribute'
                });
            }
            else if (this.isGenericLinkText(accessibleName)) {
                violations.push({
                    ruleId: this.id,
                    severity: types_1.Severity.WARNING,
                    message: 'Link text is not descriptive enough',
                    element: analyzer.getElementContext(link),
                    selector: analyzer.getElementSelector(link),
                    line: analyzer.getElementLineNumber(link),
                    suggestion: 'Use more descriptive link text that explains the link purpose'
                });
            }
        }
        return violations;
    }
    getAccessibleName(link, analyzer) {
        // Check aria-label first
        const ariaLabel = analyzer.getAttribute(link, 'aria-label');
        if (ariaLabel && ariaLabel.trim()) {
            return ariaLabel.trim();
        }
        // Check aria-labelledby
        const ariaLabelledBy = analyzer.getAttribute(link, 'aria-labelledby');
        if (ariaLabelledBy) {
            const labelElements = ariaLabelledBy.split(' ')
                .map(id => link.ownerDocument.getElementById(id))
                .filter(el => el !== null);
            if (labelElements.length > 0) {
                return labelElements.map(el => analyzer.getTextContent(el)).join(' ');
            }
        }
        // Get text content (including alt text from images)
        let textContent = '';
        // Check for images with alt text
        const images = Array.from(link.querySelectorAll('img[alt]'));
        if (images.length > 0) {
            const altTexts = images
                .map(img => analyzer.getAttribute(img, 'alt') || '')
                .filter(alt => alt.trim() !== '');
            if (altTexts.length > 0) {
                textContent += altTexts.join(' ');
            }
        }
        // Add regular text content
        const linkText = analyzer.getTextContent(link);
        if (linkText) {
            textContent += (textContent ? ' ' : '') + linkText;
        }
        // Fallback to title attribute
        if (!textContent.trim()) {
            const title = analyzer.getAttribute(link, 'title');
            if (title && title.trim()) {
                return title.trim();
            }
        }
        return textContent.trim();
    }
    isGenericLinkText(text) {
        const genericTexts = [
            'click here',
            'read more',
            'more',
            'link',
            'here',
            'this',
            'continue',
            'go',
            'next',
            'previous',
            'prev'
        ];
        const normalizedText = text.toLowerCase().trim();
        return genericTexts.includes(normalizedText);
    }
}
exports.LinkNameRule = LinkNameRule;
//# sourceMappingURL=link-name-rule.js.map