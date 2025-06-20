import { ParsedFile, Violation, ScanResult, ScanOptions } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
export declare abstract class BaseRule {
    abstract id: string;
    abstract analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[];
}
export declare class ComplianceEngine {
    private htmlAnalyzer;
    private rules;
    private options;
    constructor(options?: Partial<ScanOptions>);
    registerRule(rule: BaseRule): void;
    analyzeFiles(files: ParsedFile[]): Promise<ScanResult>;
    private analyzeFile;
    private getApplicableRules;
    private generateScanResult;
    updateOptions(options: Partial<ScanOptions>): void;
}
//# sourceMappingURL=compliance-engine.d.ts.map