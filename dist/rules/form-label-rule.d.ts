import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
export declare class FormLabelRule extends BaseRule {
    id: string;
    analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[];
    private hasAssociatedLabel;
}
//# sourceMappingURL=form-label-rule.d.ts.map