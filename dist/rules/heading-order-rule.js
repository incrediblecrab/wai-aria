"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadingOrderRule = void 0;
const compliance_engine_1 = require("../core/compliance-engine");
const types_1 = require("../types");
const wcag_rules_1 = require("./wcag-rules");
class HeadingOrderRule extends compliance_engine_1.BaseRule {
    constructor() {
        super(...arguments);
        this.id = 'heading-order';
    }
    analyze(file, analyzer) {
        if (file.type !== 'html' || !file.dom) {
            return [];
        }
        const violations = [];
        const headings = analyzer.extractElements(file.dom, 'h1, h2, h3, h4, h5, h6');
        const rule = (0, wcag_rules_1.getRuleById)(this.id);
        if (headings.length === 0) {
            return violations;
        }
        // Filter out hidden headings
        const visibleHeadings = headings.filter(h => analyzer.isVisible(h));
        if (visibleHeadings.length === 0) {
            return violations;
        }
        let previousLevel = 0;
        let hasH1 = false;
        for (let i = 0; i < visibleHeadings.length; i++) {
            const heading = visibleHeadings[i];
            const level = parseInt(heading.tagName.charAt(1));
            if (level === 1) {
                hasH1 = true;
                if (i > 0) {
                    // H1 should typically be the first heading
                    violations.push({
                        ruleId: this.id,
                        severity: types_1.Severity.WARNING,
                        message: 'H1 should typically be the first heading on the page',
                        element: analyzer.getElementContext(heading),
                        selector: analyzer.getElementSelector(heading),
                        line: analyzer.getElementLineNumber(heading),
                        suggestion: 'Consider using H1 as the main page heading'
                    });
                }
            }
            if (i === 0) {
                previousLevel = level;
                continue;
            }
            // Check for skipped levels
            if (level > previousLevel + 1) {
                violations.push({
                    ruleId: this.id,
                    severity: rule.severity,
                    message: `Heading level ${level} follows heading level ${previousLevel}, skipping level ${previousLevel + 1}`,
                    element: analyzer.getElementContext(heading),
                    selector: analyzer.getElementSelector(heading),
                    line: analyzer.getElementLineNumber(heading),
                    suggestion: `Use H${previousLevel + 1} instead of H${level}, or add intermediate heading levels`
                });
            }
            previousLevel = level;
        }
        // Check if page has an H1
        if (!hasH1 && visibleHeadings.length > 0) {
            violations.push({
                ruleId: this.id,
                severity: types_1.Severity.WARNING,
                message: 'Page should have at least one H1 heading',
                element: analyzer.getElementContext(visibleHeadings[0]),
                selector: 'document',
                line: 1,
                suggestion: 'Add an H1 heading to establish the main topic of the page'
            });
        }
        // Check for multiple H1s
        const h1Count = visibleHeadings.filter(h => h.tagName === 'H1').length;
        if (h1Count > 1) {
            const h1Elements = visibleHeadings.filter(h => h.tagName === 'H1');
            for (let i = 1; i < h1Elements.length; i++) {
                violations.push({
                    ruleId: this.id,
                    severity: types_1.Severity.WARNING,
                    message: 'Multiple H1 headings found, consider using H2-H6 for subheadings',
                    element: analyzer.getElementContext(h1Elements[i]),
                    selector: analyzer.getElementSelector(h1Elements[i]),
                    line: analyzer.getElementLineNumber(h1Elements[i]),
                    suggestion: 'Use only one H1 per page, or use H2-H6 for section headings'
                });
            }
        }
        // Check for empty headings
        for (const heading of visibleHeadings) {
            const text = analyzer.getTextContent(heading);
            if (!text || text.trim() === '') {
                violations.push({
                    ruleId: this.id,
                    severity: rule.severity,
                    message: 'Heading element is empty',
                    element: analyzer.getElementContext(heading),
                    selector: analyzer.getElementSelector(heading),
                    line: analyzer.getElementLineNumber(heading),
                    suggestion: 'Add descriptive text to the heading'
                });
            }
        }
        return violations;
    }
}
exports.HeadingOrderRule = HeadingOrderRule;
//# sourceMappingURL=heading-order-rule.js.map