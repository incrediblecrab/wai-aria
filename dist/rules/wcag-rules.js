"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WCAG_RULES = void 0;
exports.getRulesByLevel = getRulesByLevel;
exports.getRuleById = getRuleById;
const types_1 = require("../types");
exports.WCAG_RULES = {
    'img-alt': {
        id: 'img-alt',
        name: 'Images must have alternative text',
        description: 'All img elements must have an alt attribute or be marked as decorative',
        level: types_1.ComplianceLevel.A,
        severity: types_1.Severity.ERROR,
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        tags: ['images', 'alt-text', 'wcag111']
    },
    'heading-order': {
        id: 'heading-order',
        name: 'Headings must be in correct order',
        description: 'Heading levels should not be skipped and should follow logical order',
        level: types_1.ComplianceLevel.AA,
        severity: types_1.Severity.ERROR,
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
        tags: ['headings', 'structure', 'wcag246']
    },
    'form-label': {
        id: 'form-label',
        name: 'Form inputs must have labels',
        description: 'All form inputs must have associated labels or aria-label attributes',
        level: types_1.ComplianceLevel.A,
        severity: types_1.Severity.ERROR,
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
        tags: ['forms', 'labels', 'wcag332']
    },
    'link-name': {
        id: 'link-name',
        name: 'Links must have accessible names',
        description: 'All links must have text or an accessible name',
        level: types_1.ComplianceLevel.A,
        severity: types_1.Severity.ERROR,
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
        tags: ['links', 'accessibility', 'wcag244']
    },
    'color-contrast': {
        id: 'color-contrast',
        name: 'Text must have sufficient color contrast',
        description: 'Text must have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text',
        level: types_1.ComplianceLevel.AA,
        severity: types_1.Severity.ERROR,
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        tags: ['color', 'contrast', 'wcag143']
    },
    'aria-valid': {
        id: 'aria-valid',
        name: 'ARIA attributes must be valid',
        description: 'ARIA attributes must have valid values and be used correctly',
        level: types_1.ComplianceLevel.A,
        severity: types_1.Severity.ERROR,
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/parsing.html',
        tags: ['aria', 'validation', 'wcag411']
    }
};
function getRulesByLevel(level) {
    const levelOrder = { [types_1.ComplianceLevel.A]: 1, [types_1.ComplianceLevel.AA]: 2, [types_1.ComplianceLevel.AAA]: 3 };
    const targetLevel = levelOrder[level];
    return Object.values(exports.WCAG_RULES).filter(rule => levelOrder[rule.level] <= targetLevel);
}
function getRuleById(id) {
    return exports.WCAG_RULES[id];
}
//# sourceMappingURL=wcag-rules.js.map