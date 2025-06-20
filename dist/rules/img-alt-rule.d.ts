import { BaseRule } from '../core/compliance-engine';
import { ParsedFile, Violation } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
export declare class ImgAltRule extends BaseRule {
    id: string;
    analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[];
}
//# sourceMappingURL=img-alt-rule.d.ts.map