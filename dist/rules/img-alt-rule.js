"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImgAltRule = void 0;
const compliance_engine_1 = require("../core/compliance-engine");
const types_1 = require("../types");
const wcag_rules_1 = require("./wcag-rules");
class ImgAltRule extends compliance_engine_1.BaseRule {
    constructor() {
        super(...arguments);
        this.id = 'img-alt';
    }
    analyze(file, analyzer) {
        if (file.type !== 'html' || !file.dom) {
            return [];
        }
        const violations = [];
        const images = analyzer.extractElements(file.dom, 'img');
        const rule = (0, wcag_rules_1.getRuleById)(this.id);
        for (const img of images) {
            // Skip if image is not visible
            if (!analyzer.isVisible(img)) {
                continue;
            }
            const alt = analyzer.getAttribute(img, 'alt');
            const src = analyzer.getAttribute(img, 'src');
            const role = analyzer.getAttribute(img, 'role');
            const ariaLabel = analyzer.getAttribute(img, 'aria-label');
            const ariaLabelledBy = analyzer.getAttribute(img, 'aria-labelledby');
            // Check if image has alternative text
            const hasAlt = alt !== null;
            const hasAriaLabel = ariaLabel !== null && ariaLabel.trim() !== '';
            const hasAriaLabelledBy = ariaLabelledBy !== null && ariaLabelledBy.trim() !== '';
            const isDecorative = role === 'presentation' || role === 'none' || alt === '';
            if (!hasAlt && !hasAriaLabel && !hasAriaLabelledBy && !isDecorative) {
                violations.push({
                    ruleId: this.id,
                    severity: rule.severity,
                    message: 'Image must have an alt attribute or be marked as decorative',
                    element: analyzer.getElementContext(img),
                    selector: analyzer.getElementSelector(img),
                    line: analyzer.getElementLineNumber(img),
                    suggestion: `Add alt="${src ? `Description of ${src}` : 'Image description'}" or role="presentation" if decorative`
                });
            }
            else if (hasAlt && alt && alt.trim() === '' && !isDecorative) {
                // Empty alt text but not marked as decorative
                violations.push({
                    ruleId: this.id,
                    severity: types_1.Severity.WARNING,
                    message: 'Image has empty alt text but is not marked as decorative',
                    element: analyzer.getElementContext(img),
                    selector: analyzer.getElementSelector(img),
                    line: analyzer.getElementLineNumber(img),
                    suggestion: 'Add meaningful alt text or use role="presentation" if decorative'
                });
            }
            else if (hasAlt && alt && alt.trim().length > 125) {
                // Alt text too long
                violations.push({
                    ruleId: this.id,
                    severity: types_1.Severity.INFO,
                    message: 'Alt text is longer than 125 characters, consider using a shorter description',
                    element: analyzer.getElementContext(img),
                    selector: analyzer.getElementSelector(img),
                    line: analyzer.getElementLineNumber(img),
                    suggestion: 'Keep alt text concise and descriptive'
                });
            }
        }
        return violations;
    }
}
exports.ImgAltRule = ImgAltRule;
//# sourceMappingURL=img-alt-rule.js.map