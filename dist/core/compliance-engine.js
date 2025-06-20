"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceEngine = exports.BaseRule = void 0;
const types_1 = require("../types");
const html_analyzer_1 = require("../analyzers/html-analyzer");
const wcag_rules_1 = require("../rules/wcag-rules");
class BaseRule {
}
exports.BaseRule = BaseRule;
class ComplianceEngine {
    constructor(options = {}) {
        this.htmlAnalyzer = new html_analyzer_1.HTMLAnalyzer();
        this.rules = new Map();
        this.options = {
            level: types_1.ComplianceLevel.AA,
            rules: [],
            ignoreRules: [],
            failOnError: true,
            maxWarnings: 0,
            ...options
        };
    }
    registerRule(rule) {
        this.rules.set(rule.id, rule);
    }
    async analyzeFiles(files) {
        const fileResults = [];
        for (const file of files) {
            const result = await this.analyzeFile(file);
            fileResults.push(result);
        }
        return this.generateScanResult(fileResults);
    }
    async analyzeFile(file) {
        const violations = [];
        const passedRules = [];
        const skippedRules = [];
        // Parse HTML if needed
        let parsedFile = file;
        if (file.type === 'html' && !file.dom) {
            try {
                parsedFile = this.htmlAnalyzer.parseHTML(file);
            }
            catch (error) {
                violations.push({
                    ruleId: 'parse-error',
                    severity: types_1.Severity.ERROR,
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
                }
                else {
                    passedRules.push(ruleId);
                }
            }
            catch (error) {
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
    getApplicableRules() {
        const applicableRules = new Map();
        // Get rules for the specified compliance level
        const levelRules = (0, wcag_rules_1.getRulesByLevel)(this.options.level || types_1.ComplianceLevel.AA);
        // Filter rules based on options
        for (const [ruleId, rule] of this.rules) {
            const ruleConfig = (0, wcag_rules_1.getRuleById)(ruleId);
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
            }
            else {
                applicableRules.set(ruleId, rule);
            }
        }
        return applicableRules;
    }
    generateScanResult(fileResults) {
        const allViolations = fileResults.flatMap(f => f.violations);
        const errorCount = allViolations.filter(v => v.severity === types_1.Severity.ERROR).length;
        const warningCount = allViolations.filter(v => v.severity === types_1.Severity.WARNING).length;
        const infoCount = allViolations.filter(v => v.severity === types_1.Severity.INFO).length;
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
                level: this.options.level || types_1.ComplianceLevel.AA,
                percentage: Math.round(overallPercentage * 100) / 100,
                breakdown: {
                    [types_1.ComplianceLevel.A]: 0,
                    [types_1.ComplianceLevel.AA]: 0,
                    [types_1.ComplianceLevel.AAA]: 0
                }
            }
        };
    }
    updateOptions(options) {
        this.options = { ...this.options, ...options };
    }
}
exports.ComplianceEngine = ComplianceEngine;
//# sourceMappingURL=compliance-engine.js.map