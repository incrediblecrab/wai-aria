import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
export declare class ColorContrastRule extends BaseRule {
    id: string;
    analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[];
    private calculateContrast;
    private getComputedStyle;
    private getBackgroundColor;
    private parseColor;
    private isLargeText;
}
//# sourceMappingURL=color-contrast-rule.d.ts.map