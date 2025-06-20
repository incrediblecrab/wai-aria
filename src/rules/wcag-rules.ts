import { WCAGRule, ComplianceLevel, Severity } from '../types';

export const WCAG_RULES: Record<string, WCAGRule> = {
  'img-alt': {
    id: 'img-alt',
    name: 'Images must have alternative text',
    description: 'All img elements must have an alt attribute or be marked as decorative',
    level: ComplianceLevel.A,
    severity: Severity.ERROR,
    helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
    tags: ['images', 'alt-text', 'wcag111']
  },
  'heading-order': {
    id: 'heading-order',
    name: 'Headings must be in correct order',
    description: 'Heading levels should not be skipped and should follow logical order',
    level: ComplianceLevel.AA,
    severity: Severity.ERROR,
    helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
    tags: ['headings', 'structure', 'wcag246']
  },
  'form-label': {
    id: 'form-label',
    name: 'Form inputs must have labels',
    description: 'All form inputs must have associated labels or aria-label attributes',
    level: ComplianceLevel.A,
    severity: Severity.ERROR,
    helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
    tags: ['forms', 'labels', 'wcag332']
  },
  'link-name': {
    id: 'link-name',
    name: 'Links must have accessible names',
    description: 'All links must have text or an accessible name',
    level: ComplianceLevel.A,
    severity: Severity.ERROR,
    helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
    tags: ['links', 'accessibility', 'wcag244']
  },
  'color-contrast': {
    id: 'color-contrast',
    name: 'Text must have sufficient color contrast',
    description: 'Text must have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text',
    level: ComplianceLevel.AA,
    severity: Severity.ERROR,
    helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
    tags: ['color', 'contrast', 'wcag143']
  },
  'aria-valid': {
    id: 'aria-valid',
    name: 'ARIA attributes must be valid',
    description: 'ARIA attributes must have valid values and be used correctly',
    level: ComplianceLevel.A,
    severity: Severity.ERROR,
    helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/parsing.html',
    tags: ['aria', 'validation', 'wcag411']
  }
};

export function getRulesByLevel(level: ComplianceLevel): WCAGRule[] {
  const levelOrder = { [ComplianceLevel.A]: 1, [ComplianceLevel.AA]: 2, [ComplianceLevel.AAA]: 3 };
  const targetLevel = levelOrder[level];
  
  return Object.values(WCAG_RULES).filter(rule => 
    levelOrder[rule.level] <= targetLevel
  );
}

export function getRuleById(id: string): WCAGRule | undefined {
  return WCAG_RULES[id];
}