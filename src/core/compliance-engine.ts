import { ParsedFile, Violation, FileResult, ScanResult, ScanOptions, ComplianceLevel, Severity } from '../types';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
import { getRulesByLevel, getRuleById } from '../rules/wcag-rules';

export abstract class BaseRule {
  abstract id: string;
  abstract analyze(file: ParsedFile, analyzer: HTMLAnalyzer): Violation[];
}

export class ComplianceEngine {
  private htmlAnalyzer: HTMLAnalyzer;
  private rules: Map<string, BaseRule>;
  private options: Partial<ScanOptions>;

  constructor(options: Partial<ScanOptions> = {}) {
    this.htmlAnalyzer = new HTMLAnalyzer();
    this.rules = new Map();
    this.options = {
      level: ComplianceLevel.AA,
      rules: [],
      ignoreRules: [],
      failOnError: true,
      maxWarnings: 0,
      ...options
    };
  }

  registerRule(rule: BaseRule): void {
    this.rules.set(rule.id, rule);
  }

  async analyzeFiles(files: ParsedFile[]): Promise<ScanResult> {
    const fileResults: FileResult[] = [];
    
    for (const file of files) {
      const result = await this.analyzeFile(file);
      fileResults.push(result);
    }
    
    return this.generateScanResult(fileResults);
  }

  private async analyzeFile(file: ParsedFile): Promise<FileResult> {
    const violations: Violation[] = [];
    const passedRules: string[] = [];
    const skippedRules: string[] = [];

    // Parse HTML if needed
    let parsedFile = file;
    if (file.type === 'html' && !file.dom) {
      try {
        parsedFile = this.htmlAnalyzer.parseHTML(file);
      } catch (error) {
        violations.push({
          ruleId: 'parse-error',
          severity: Severity.ERROR,
          message: `Failed to parse HTML: ${error}`,
          element: undefined,
          line: 1,
          column: 1
        });
        return {
          filePath: file.filePath,
          violations,
          passedRules,
          skippedRules
        };
      }
    }

    // Get applicable rules
    const applicableRules = this.getApplicableRules();
    
    // Run each rule
    for (const [ruleId, rule] of applicableRules) {
      try {
        const ruleViolations = rule.analyze(parsedFile, this.htmlAnalyzer);
        
        if (ruleViolations.length > 0) {
          violations.push(...ruleViolations);
        } else {
          passedRules.push(ruleId);
        }
      } catch (error) {
        console.warn(`Rule ${ruleId} failed on ${file.filePath}:`, error);
        skippedRules.push(ruleId);
      }
    }

    return {
      filePath: file.filePath,
      violations,
      passedRules,
      skippedRules
    };
  }

  private getApplicableRules(): Map<string, BaseRule> {
    const applicableRules = new Map<string, BaseRule>();
    
    // Get rules for the specified compliance level
    const levelRules = getRulesByLevel(this.options.level || ComplianceLevel.AA);
    
    // Filter rules based on options
    for (const [ruleId, rule] of this.rules) {
      const ruleConfig = getRuleById(ruleId);
      
      // Skip if rule is not for this compliance level
      if (!levelRules.find(r => r.id === ruleId)) {
        continue;
      }
      
      // Skip if rule is in ignore list
      if (this.options.ignoreRules?.includes(ruleId)) {
        continue;
      }
      
      // Include if in specific rules list (if provided)
      if (this.options.rules && this.options.rules.length > 0) {
        if (this.options.rules.includes(ruleId)) {
          applicableRules.set(ruleId, rule);
        }
      } else {
        applicableRules.set(ruleId, rule);
      }
    }
    
    return applicableRules;
  }

  private generateScanResult(fileResults: FileResult[]): ScanResult {
    const allViolations = fileResults.flatMap(f => f.violations);
    
    const errorCount = allViolations.filter(v => v.severity === Severity.ERROR).length;
    const warningCount = allViolations.filter(v => v.severity === Severity.WARNING).length;
    const infoCount = allViolations.filter(v => v.severity === Severity.INFO).length;
    
    const allPassedRules = new Set(fileResults.flatMap(f => f.passedRules));
    const allFailedRules = new Set(allViolations.map(v => v.ruleId));
    
    // Calculate compliance percentages
    const totalRules = this.getApplicableRules().size;
    const passedRulesCount = allPassedRules.size;
    const overallPercentage = totalRules > 0 ? (passedRulesCount / totalRules) * 100 : 100;
    
    return {
      files: fileResults,
      summary: {
        totalFiles: fileResults.length,
        totalViolations: allViolations.length,
        errorCount,
        warningCount,
        infoCount,
        passedRules: passedRulesCount,
        failedRules: allFailedRules.size
      },
      compliance: {
        level: this.options.level || ComplianceLevel.AA,
        percentage: Math.round(overallPercentage * 100) / 100,
        breakdown: {
          [ComplianceLevel.A]: 0,
          [ComplianceLevel.AA]: 0,
          [ComplianceLevel.AAA]: 0
        }
      }
    };
  }

  updateOptions(options: Partial<ScanOptions>): void {
    this.options = { ...this.options, ...options };
  }
}