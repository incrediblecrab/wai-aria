import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation, Severity } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
import { getRuleById } from './wcag-rules';

export class FormLabelRule extends BaseRule {
  id = 'form-label';

  analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[] {
    if (file.type !== 'html' || !file.dom) {
      return [];
    }

    const violations: Violation[] = [];
    const rule = getRuleById(this.id)!;

    // Check input elements
    const inputs = analyzer.extractElements(file.dom, 'input[type]:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])');
    const textareas = analyzer.extractElements(file.dom, 'textarea');
    const selects = analyzer.extractElements(file.dom, 'select');

    const formElements = [...inputs, ...textareas, ...selects];

    for (const element of formElements) {
      if (!analyzer.isVisible(element)) {
        continue;
      }

      const hasLabel = this.hasAssociatedLabel(element, analyzer);
      const hasAriaLabel = analyzer.getAttribute(element, 'aria-label');
      const hasAriaLabelledBy = analyzer.getAttribute(element, 'aria-labelledby');
      const hasTitle = analyzer.getAttribute(element, 'title');
      const placeholder = analyzer.getAttribute(element, 'placeholder');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
        violations.push({
          ruleId: this.id,
          severity: rule.severity,
          message: 'Form input must have an associated label',
          element: analyzer.getElementContext(element),
          selector: analyzer.getElementSelector(element),
          line: analyzer.getElementLineNumber(element),
          suggestion: 'Add a <label> element, aria-label, aria-labelledby, or title attribute'
        });
      } else if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && hasTitle) {
        // Using title as fallback is not ideal
        violations.push({
          ruleId: this.id,
          severity: Severity.WARNING,
          message: 'Form input relies on title attribute for labeling, consider using a proper label',
          element: analyzer.getElementContext(element),
          selector: analyzer.getElementSelector(element),
          line: analyzer.getElementLineNumber(element),
          suggestion: 'Add a <label> element or aria-label for better accessibility'
        });
      } else if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle && placeholder) {
        // Only placeholder, not accessible
        violations.push({
          ruleId: this.id,
          severity: rule.severity,
          message: 'Form input only has placeholder text, which is not accessible as a label',
          element: analyzer.getElementContext(element),
          selector: analyzer.getElementSelector(element),
          line: analyzer.getElementLineNumber(element),
          suggestion: 'Add a proper label in addition to the placeholder text'
        });
      }
    }

    return violations;
  }

  private hasAssociatedLabel(element: Element, analyzer: HTMLAnalyzer): boolean {
    const id = analyzer.getAttribute(element, 'id');
    
    // Check for label with for attribute
    if (id) {
      const label = analyzer.extractElements(element.ownerDocument!, `label[for="${id}"]`);
      if (label.length > 0) {
        return true;
      }
    }

    // Check if input is wrapped in a label
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === 'label') {
        return true;
      }
      parent = parent.parentElement;
    }

    return false;
  }
}