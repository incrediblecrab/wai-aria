import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation, Severity } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
import { getRuleById } from './wcag-rules';
import Color from 'color';

export class ColorContrastRule extends BaseRule {
  id = 'color-contrast';

  analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[] {
    if (file.type !== 'html' || !file.dom) {
      return [];
    }

    const violations: Violation[] = [];
    const rule = getRuleById(this.id)!;

    // Get all text elements that might have color styling
    const textElements = analyzer.extractElements(
      file.dom, 
      'p, span, div, h1, h2, h3, h4, h5, h6, a, button, label, li, td, th'
    );

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
          } else if (contrast.ratio < minRatio + 0.5) {
            // Close to failing - warn
            violations.push({
              ruleId: this.id,
              severity: Severity.WARNING,
              message: `Low color contrast: ${contrast.ratio.toFixed(2)}:1 (close to minimum: ${minRatio}:1)`,
              element: analyzer.getElementContext(element),
              selector: analyzer.getElementSelector(element),
              line: analyzer.getElementLineNumber(element),
              suggestion: 'Consider increasing contrast for better accessibility'
            });
          }
        }
      } catch (error) {
        // Skip elements where we can't calculate contrast
        continue;
      }
    }

    return violations;
  }

  private calculateContrast(element: Element): { ratio: number; foreground: string; background: string } | null {
    try {
      const computedStyle = this.getComputedStyle(element);
      const foregroundColor = this.parseColor(computedStyle.color || '#000000');
      const backgroundColor = this.getBackgroundColor(element);

      if (!foregroundColor || !backgroundColor) {
        return null;
      }

      const contrast = Color(foregroundColor).contrast(Color(backgroundColor));
      
      return {
        ratio: Math.round(contrast * 100) / 100,
        foreground: foregroundColor,
        background: backgroundColor
      };
    } catch (error) {
      return null;
    }
  }

  private getComputedStyle(element: Element): CSSStyleDeclaration {
    // In a real browser environment, you'd use window.getComputedStyle
    // For JSDOM, we'll simulate basic style computation
    const htmlElement = element as HTMLElement;
    const style = htmlElement.style;
    
    // Basic fallback - in real implementation, you'd parse CSS files
    return {
      color: style.color || '#000000',
      backgroundColor: style.backgroundColor || 'transparent',
      fontSize: style.fontSize || '16px',
      fontWeight: style.fontWeight || 'normal'
    } as CSSStyleDeclaration;
  }

  private getBackgroundColor(element: Element): string {
    let currentElement = element;
    
    while (currentElement && currentElement !== element.ownerDocument!.body) {
      const style = this.getComputedStyle(currentElement);
      const bgColor = this.parseColor(style.backgroundColor);
      
      if (bgColor && bgColor !== 'transparent' && !bgColor.includes('rgba(0, 0, 0, 0)')) {
        return bgColor;
      }
      
      currentElement = currentElement.parentElement!;
    }
    
    // Default to white background
    return '#ffffff';
  }

  private parseColor(colorValue: string): string {
    if (!colorValue || colorValue === 'transparent') {
      return '';
    }

    try {
      // Handle common color keywords
      const colorKeywords: Record<string, string> = {
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
      return Color(colorValue).hex();
    } catch (error) {
      return colorValue;
    }
  }

  private isLargeText(element: Element): boolean {
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