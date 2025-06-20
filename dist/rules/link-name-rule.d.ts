import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
export declare class LinkNameRule extends BaseRule {
    id: string;
    analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[];
    private getAccessibleName;
    private isGenericLinkText;
}
//# sourceMappingURL=link-name-rule.d.ts.map