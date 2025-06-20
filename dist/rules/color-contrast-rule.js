"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorContrastRule = void 0;
const compliance_engine_1 = require("../core/compliance-engine");
const types_1 = require("../types");
const wcag_rules_1 = require("./wcag-rules");
const color_1 = __importDefault(require("color"));
class ColorContrastRule extends compliance_engine_1.BaseRule {
    constructor() {
        super(...arguments);
        this.id = 'color-contrast';
    }
    analyze(file, analyzer) {
        if (file.type !== 'html' || !file.dom) {
            return [];
        }
        const violations = [];
        const rule = (0, wcag_rules_1.getRuleById)(this.id);
        // Get all text elements that might have color styling
        const textElements = analyzer.extractElements(file.dom, 'p, span, div, h1, h2, h3, h4, h5, h6, a, button, label, li, td, th');
        for (const element of textElements) {
            if (!analyzer.isVisible(element) || !analyzer.getTextContent(element)) {
                continue;
            }
            try {
                const contrast = this.calculateContrast(element);
                if (contrast && contrast.ratio > 0) {
                    const isLargeText = this.isLargeText(element);
                    const minRatio = isLargeText ? 3.0 : 4.5;
                    if (contrast.ratio < minRatio) {
                        violations.push({
                            ruleId: this.id,
                            severity: rule.severity,
                            message: `Insufficient color contrast: ${contrast.ratio.toFixed(2)}:1 (minimum: ${minRatio}:1)`,
                            element: analyzer.getElementContext(element),
                            selector: analyzer.getElementSelector(element),
                            line: analyzer.getElementLineNumber(element),
                            suggestion: `Increase contrast between text (${contrast.foreground}) and background (${contrast.background})`
                        });
                    }
                    else if (contrast.ratio < minRatio + 0.5) {
                        // Close to failing - warn
                        violations.push({
                            ruleId: this.id,
                            severity: types_1.Severity.WARNING,
                            message: `Low color contrast: ${contrast.ratio.toFixed(2)}:1 (close to minimum: ${minRatio}:1)`,
                            element: analyzer.getElementContext(element),
                            selector: analyzer.getElementSelector(element),
                            line: analyzer.getElementLineNumber(element),
                            suggestion: 'Consider increasing contrast for better accessibility'
                        });
                    }
                }
            }
            catch (error) {
                // Skip elements where we can't calculate contrast
                continue;
            }
        }
        return violations;
    }
    calculateContrast(element) {
        try {
            const computedStyle = this.getComputedStyle(element);
            const foregroundColor = this.parseColor(computedStyle.color || '#000000');
            const backgroundColor = this.getBackgroundColor(element);
            if (!foregroundColor || !backgroundColor) {
                return null;
            }
            const contrast = (0, color_1.default)(foregroundColor).contrast((0, color_1.default)(backgroundColor));
            return {
                ratio: Math.round(contrast * 100) / 100,
                foreground: foregroundColor,
                background: backgroundColor
            };
        }
        catch (error) {
            return null;
        }
    }
    getComputedStyle(element) {
        // In a real browser environment, you'd use window.getComputedStyle
        // For JSDOM, we'll simulate basic style computation
        const htmlElement = element;
        const style = htmlElement.style;
        // Basic fallback - in real implementation, you'd parse CSS files
        return {
            color: style.color || '#000000',
            backgroundColor: style.backgroundColor || 'transparent',
            fontSize: style.fontSize || '16px',
            fontWeight: style.fontWeight || 'normal'
        };
    }
    getBackgroundColor(element) {
        let currentElement = element;
        while (currentElement && currentElement !== element.ownerDocument.body) {
            const style = this.getComputedStyle(currentElement);
            const bgColor = this.parseColor(style.backgroundColor);
            if (bgColor && bgColor !== 'transparent' && !bgColor.includes('rgba(0, 0, 0, 0)')) {
                return bgColor;
            }
            currentElement = currentElement.parentElement;
        }
        // Default to white background
        return '#ffffff';
    }
    parseColor(colorValue) {
        if (!colorValue || colorValue === 'transparent') {
            return '';
        }
        try {
            // Handle common color keywords
            const colorKeywords = {
                'black': '#000000',
                'white': '#ffffff',
                'red': '#ff0000',
                'green': '#008000',
                'blue': '#0000ff',
                'yellow': '#ffff00',
                'cyan': '#00ffff',
                'magenta': '#ff00ff',
                'gray': '#808080',
                'grey': '#808080'
            };
            const normalized = colorValue.toLowerCase().trim();
            if (colorKeywords[normalized]) {
                return colorKeywords[normalized];
            }
            // Try to parse with color library
            return (0, color_1.default)(colorValue).hex();
        }
        catch (error) {
            return colorValue;
        }
    }
    isLargeText(element) {
        const style = this.getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize || '16');
        const fontWeight = style.fontWeight || 'normal';
        // Large text is 18pt+ (24px+) or 14pt+ (19px+) and bold
        const isBold = fontWeight === 'bold' ||
            fontWeight === 'bolder' ||
            parseInt(fontWeight) >= 700;
        return fontSize >= 24 || (fontSize >= 19 && isBold);
    }
}
exports.ColorContrastRule = ColorContrastRule;
//# sourceMappingURL=color-contrast-rule.js.map