import { ScanResult } from '../types';

export class JSONFormatter {
  format(result: ScanResult, pretty: boolean = true): string {
    const output = {
      timestamp: new Date().toISOString(),
      wcagVersion: '2.1',
      complianceLevel: result.compliance.level,
      summary: result.summary,
      compliance: result.compliance,
      files: result.files.map(file => ({
        filePath: file.filePath,
        violationCount: file.violations.length,
        passedRuleCount: file.passedRules.length,
        skippedRuleCount: file.skippedRules.length,
        violations: file.violations.map(violation => ({
          ruleId: violation.ruleId,
          severity: violation.severity,
          message: violation.message,
          element: violation.element,
          selector: violation.selector,
          line: violation.line,
          column: violation.column,
          context: violation.context,
          suggestion: violation.suggestion
        })),
        passedRules: file.passedRules,
        skippedRules: file.skippedRules
      })),
      metadata: {
        generator: 'wcag-checker',
        version: '1.0.0',
        scanDuration: undefined // Could be added later
      }
    };

    return pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output);
  }

  formatSummaryOnly(result: ScanResult): string {
    const summary = {
      timestamp: new Date().toISOString(),
      compliance: result.compliance,
      summary: result.summary,
      fileCount: result.files.length,
      filesWithViolations: result.files.filter(f => f.violations.length > 0).length
    };

    return JSON.stringify(summary, null, 2);
  }
}