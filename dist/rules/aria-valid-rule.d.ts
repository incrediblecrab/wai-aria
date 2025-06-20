import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
export declare class AriaValidRule extends BaseRule {
    id: string;
    private readonly VALID_ARIA_ATTRIBUTES;
    private readonly VALID_ROLES;
    analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[];
    private validateIdReferences;
    private checkConflictingAttributes;
    private isFocusable;
}
//# sourceMappingURL=aria-valid-rule.d.ts.map