export declare enum ComplianceLevel {
    A = "A",
    AA = "AA",
    AAA = "AAA"
}
export declare enum Severity {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}
export interface WCAGRule {
    id: string;
    name: string;
    description: string;
    level: ComplianceLevel;
    severity: Severity;
    helpUrl?: string;
    tags: string[];
}
export interface Violation {
    ruleId: string;
    severity: Severity;
    message: string;
    element?: string;
    line?: number;
    column?: number;
    selector?: string;
    context?: string;
    suggestion?: string;
}
export interface FileResult {
    filePath: string;
    violations: Violation[];
    passedRules: string[];
    skippedRules: string[];
}
export interface ScanResult {
    files: FileResult[];
    summary: {
        totalFiles: number;
        totalViolations: number;
        errorCount: number;
        warningCount: number;
        infoCount: number;
        passedRules: number;
        failedRules: number;
    };
    compliance: {
        level: ComplianceLevel;
        percentage: number;
        breakdown: Record<ComplianceLevel, number>;
    };
}
export interface ScanOptions {
    level: ComplianceLevel;
    include: string[];
    exclude: string[];
    rules: string[];
    ignoreRules: string[];
    outputFormat: 'json' | 'html' | 'text';
    outputFile?: string;
    failOnError: boolean;
    maxWarnings: number;
}
export interface ParsedFile {
    filePath: string;
    content: string;
    type: 'html' | 'css' | 'js' | 'jsx' | 'ts' | 'tsx';
    ast?: any;
    dom?: Document;
}
//# sourceMappingURL=types.d.ts.map