import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation, Severity } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
import { getRuleById } from './wcag-rules';

export class ImgAltRule extends BaseRule {
  id = 'img-alt';

  analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[] {
    if (file.type !== 'html' || !file.dom) {
      return [];
    }

    const violations: Violation[] = [];
    const images = analyzer.extractElements(file.dom, 'img');
    const rule = getRuleById(this.id)!;

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
      } else if (hasAlt && alt && alt.trim() === '' && !isDecorative) {
        // Empty alt text but not marked as decorative
        violations.push({
          ruleId: this.id,
          severity: Severity.WARNING,
          message: 'Image has empty alt text but is not marked as decorative',
          element: analyzer.getElementContext(img),
          selector: analyzer.getElementSelector(img),
          line: analyzer.getElementLineNumber(img),
          suggestion: 'Add meaningful alt text or use role="presentation" if decorative'
        });
      } else if (hasAlt && alt && alt.trim().length > 125) {
        // Alt text too long
        violations.push({
          ruleId: this.id,
          severity: Severity.INFO,
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