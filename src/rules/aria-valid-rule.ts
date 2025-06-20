import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation, Severity } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
import { getRuleById } from './wcag-rules';

interface AriaAttribute {
  name: string;
  allowedValues?: string[];
  allowedTypes?: ('string' | 'number' | 'boolean' | 'token' | 'idref' | 'idref-list')[];
  required?: boolean;
}

export class AriaValidRule extends BaseRule {
  id = 'aria-valid';

  private readonly VALID_ARIA_ATTRIBUTES: Record<string, AriaAttribute> = {
    'aria-label': { name: 'aria-label', allowedTypes: ['string'] },
    'aria-labelledby': { name: 'aria-labelledby', allowedTypes: ['idref-list'] },
    'aria-describedby': { name: 'aria-describedby', allowedTypes: ['idref-list'] },
    'aria-hidden': { name: 'aria-hidden', allowedValues: ['true', 'false'], allowedTypes: ['boolean'] },
    'aria-expanded': { name: 'aria-expanded', allowedValues: ['true', 'false', 'undefined'], allowedTypes: ['boolean'] },
    'aria-selected': { name: 'aria-selected', allowedValues: ['true', 'false', 'undefined'], allowedTypes: ['boolean'] },
    'aria-checked': { name: 'aria-checked', allowedValues: ['true', 'false', 'mixed', 'undefined'], allowedTypes: ['boolean'] },
    'aria-disabled': { name: 'aria-disabled', allowedValues: ['true', 'false'], allowedTypes: ['boolean'] },
    'aria-readonly': { name: 'aria-readonly', allowedValues: ['true', 'false'], allowedTypes: ['boolean'] },
    'aria-required': { name: 'aria-required', allowedValues: ['true', 'false'], allowedTypes: ['boolean'] },
    'aria-invalid': { name: 'aria-invalid', allowedValues: ['true', 'false', 'grammar', 'spelling'], allowedTypes: ['boolean', 'token'] },
    'aria-live': { name: 'aria-live', allowedValues: ['off', 'polite', 'assertive'], allowedTypes: ['token'] },
    'aria-atomic': { name: 'aria-atomic', allowedValues: ['true', 'false'], allowedTypes: ['boolean'] },
    'aria-busy': { name: 'aria-busy', allowedValues: ['true', 'false'], allowedTypes: ['boolean'] },
    'aria-controls': { name: 'aria-controls', allowedTypes: ['idref-list'] },
    'aria-owns': { name: 'aria-owns', allowedTypes: ['idref-list'] },
    'aria-flowto': { name: 'aria-flowto', allowedTypes: ['idref-list'] },
    'aria-activedescendant': { name: 'aria-activedescendant', allowedTypes: ['idref'] },
    'aria-level': { name: 'aria-level', allowedTypes: ['number'] },
    'aria-posinset': { name: 'aria-posinset', allowedTypes: ['number'] },
    'aria-setsize': { name: 'aria-setsize', allowedTypes: ['number'] },
    'aria-valuemin': { name: 'aria-valuemin', allowedTypes: ['number'] },
    'aria-valuemax': { name: 'aria-valuemax', allowedTypes: ['number'] },
    'aria-valuenow': { name: 'aria-valuenow', allowedTypes: ['number'] },
    'aria-valuetext': { name: 'aria-valuetext', allowedTypes: ['string'] }
  };

  private readonly VALID_ROLES = [
    'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
    'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
    'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group',
    'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee',
    'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
    'none', 'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
    'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox',
    'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist',
    'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
    'treeitem'
  ];

  analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[] {
    if (file.type !== 'html' || !file.dom) {
      return [];
    }

    const violations: Violation[] = [];
    const rule = getRuleById(this.id)!;

    // Get all elements with ARIA attributes or roles
    const ariaElements = analyzer.extractElements(file.dom, '[role], [aria-label], [aria-labelledby], [aria-describedby], [aria-hidden], [aria-expanded], [aria-selected], [aria-checked], [aria-disabled], [aria-readonly], [aria-required], [aria-invalid], [aria-live], [aria-atomic], [aria-busy], [aria-controls], [aria-owns], [aria-flowto], [aria-activedescendant], [aria-level], [aria-posinset], [aria-setsize], [aria-valuemin], [aria-valuemax], [aria-valuenow], [aria-valuetext]');

    for (const element of ariaElements) {
      // Validate role attribute
      const role = analyzer.getAttribute(element, 'role');
      if (role) {
        const roles = role.split(/\s+/);
        for (const singleRole of roles) {
          if (!this.VALID_ROLES.includes(singleRole)) {
            violations.push({
              ruleId: this.id,
              severity: rule.severity,
              message: `Invalid ARIA role: "${singleRole}"`,
              element: analyzer.getElementContext(element),
              selector: analyzer.getElementSelector(element),
              line: analyzer.getElementLineNumber(element),
              suggestion: `Use a valid ARIA role. Valid roles include: ${this.VALID_ROLES.slice(0, 10).join(', ')}, etc.`
            });
          }
        }
      }

      // Validate ARIA attributes
      for (const attr of Array.from(element.attributes)) {
        if (attr.name.startsWith('aria-')) {
          const ariaAttr = this.VALID_ARIA_ATTRIBUTES[attr.name];
          
          if (!ariaAttr) {
            violations.push({
              ruleId: this.id,
              severity: rule.severity,
              message: `Invalid ARIA attribute: "${attr.name}"`,
              element: analyzer.getElementContext(element),
              selector: analyzer.getElementSelector(element),
              line: analyzer.getElementLineNumber(element),
              suggestion: 'Remove the invalid ARIA attribute or use a valid one'
            });
            continue;
          }

          // Validate attribute value
          const value = attr.value.trim();
          if (ariaAttr.allowedValues && !ariaAttr.allowedValues.includes(value)) {
            violations.push({
              ruleId: this.id,
              severity: rule.severity,
              message: `Invalid value "${value}" for ARIA attribute "${attr.name}". Allowed values: ${ariaAttr.allowedValues.join(', ')}`,
              element: analyzer.getElementContext(element),
              selector: analyzer.getElementSelector(element),
              line: analyzer.getElementLineNumber(element),
              suggestion: `Use one of the allowed values: ${ariaAttr.allowedValues.join(', ')}`
            });
          }

          // Validate ID references
          if (ariaAttr.allowedTypes?.includes('idref') || ariaAttr.allowedTypes?.includes('idref-list')) {
            this.validateIdReferences(element, attr.name, value, analyzer, violations);
          }

          // Check for empty required attributes
          if (value === '' && (attr.name === 'aria-label' || attr.name === 'aria-labelledby')) {
            violations.push({
              ruleId: this.id,
              severity: Severity.WARNING,
              message: `Empty ${attr.name} attribute provides no accessibility benefit`,
              element: analyzer.getElementContext(element),
              selector: analyzer.getElementSelector(element),
              line: analyzer.getElementLineNumber(element),
              suggestion: `Provide meaningful text for ${attr.name} or remove the attribute`
            });
          }
        }
      }

      // Check for conflicting ARIA attributes
      this.checkConflictingAttributes(element, analyzer, violations);
    }

    return violations;
  }

  private validateIdReferences(element: Element, attrName: string, value: string, analyzer: HTMLAnalyzer, violations: Violation[]): void {
    if (!value.trim()) return;

    const ids = value.split(/\s+/).filter(id => id.trim());
    const document = element.ownerDocument!;

    for (const id of ids) {
      const referencedElement = document.getElementById(id);
      if (!referencedElement) {
        violations.push({
          ruleId: this.id,
          severity: Severity.ERROR,
          message: `${attrName} references non-existent ID: "${id}"`,
          element: analyzer.getElementContext(element),
          selector: analyzer.getElementSelector(element),
          line: analyzer.getElementLineNumber(element),
          suggestion: `Ensure element with id="${id}" exists or remove the reference`
        });
      }
    }
  }

  private checkConflictingAttributes(element: Element, analyzer: HTMLAnalyzer, violations: Violation[]): void {
    const ariaLabel = analyzer.getAttribute(element, 'aria-label');
    const ariaLabelledBy = analyzer.getAttribute(element, 'aria-labelledby');

    // Both aria-label and aria-labelledby present
    if (ariaLabel && ariaLabelledBy) {
      violations.push({
        ruleId: this.id,
        severity: Severity.WARNING,
        message: 'Element has both aria-label and aria-labelledby. aria-labelledby takes precedence.',
        element: analyzer.getElementContext(element),
        selector: analyzer.getElementSelector(element),
        line: analyzer.getElementLineNumber(element),
        suggestion: 'Use either aria-label or aria-labelledby, not both'
      });
    }

    // Check aria-hidden on focusable elements
    const ariaHidden = analyzer.getAttribute(element, 'aria-hidden');
    if (ariaHidden === 'true' && this.isFocusable(element)) {
      violations.push({
        ruleId: this.id,
        severity: Severity.ERROR,
        message: 'Focusable element should not have aria-hidden="true"',
        element: analyzer.getElementContext(element),
        selector: analyzer.getElementSelector(element),
        line: analyzer.getElementLineNumber(element),
        suggestion: 'Remove aria-hidden="true" from focusable elements or make them non-focusable'
      });
    }
  }

  private isFocusable(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];
    
    if (focusableTags.includes(tagName)) {
      return true;
    }

    // Check for tabindex
    const tabindex = element.getAttribute('tabindex');
    if (tabindex !== null && parseInt(tabindex) >= 0) {
      return true;
    }

    return false;
  }
}