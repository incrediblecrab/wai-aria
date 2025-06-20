#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const index_1 = __importDefault(require("./index"));
const html_formatter_1 = require("./formatters/html-formatter");
const json_formatter_1 = require("./formatters/json-formatter");
const program = new commander_1.Command();
program
    .name('wcag-checker')
    .description('WCAG 2.1 compliance checker for web applications')
    .version('1.0.0');
program
    .command('scan')
    .description('Scan directory for WCAG compliance issues')
    .argument('<directory>', 'Directory to scan')
    .option('-l, --level <level>', 'Compliance level (A, AA, AAA)', 'AA')
    .option('-f, --format <format>', 'Output format (json, html, text)', 'text')
    .option('-o, --output <file>', 'Output file path')
    .option('--fail-on-error', 'Exit with error code if violations found', false)
    .option('--include <patterns...>', 'File patterns to include')
    .option('--exclude <patterns...>', 'File patterns to exclude')
    .action(async (directory, options) => {
    try {
        console.log(chalk_1.default.blue(`Scanning ${directory} for WCAG ${options.level} compliance...`));
        const checker = new index_1.default({
            level: options.level,
            include: options.include,
            exclude: options.exclude,
            outputFormat: options.format,
            outputFile: options.output,
            failOnError: options.failOnError
        });
        const result = await checker.scan(directory);
        // Output results
        const output = formatResults(result, options.format);
        if (options.output) {
            (0, fs_1.writeFileSync)(options.output, output);
            console.log(chalk_1.default.green(`Report saved to ${options.output}`));
        }
        else {
            if (options.format === 'text') {
                printTextResults(result);
            }
            else {
                console.log(output);
            }
        }
        // Exit with error code if violations found and failOnError is true
        if (options.failOnError && result.summary.errorCount > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error);
        process.exit(1);
    }
});
function printTextResults(result) {
    console.log('\n' + chalk_1.default.bold('WCAG Compliance Report'));
    console.log('========================\n');
    console.log(chalk_1.default.blue('Summary:'));
    console.log(`  Files scanned: ${result.summary.totalFiles}`);
    console.log(`  Total violations: ${result.summary.totalViolations}`);
    console.log(`  Errors: ${chalk_1.default.red(result.summary.errorCount)}`);
    console.log(`  Warnings: ${chalk_1.default.yellow(result.summary.warningCount)}`);
    console.log(`  Info: ${chalk_1.default.blue(result.summary.infoCount)}`);
    console.log(`  Compliance: ${result.compliance.percentage}%`);
    if (result.summary.totalViolations > 0) {
        console.log('\n' + chalk_1.default.yellow('Violations found:'));
        result.files.forEach((file) => {
            if (file.violations.length > 0) {
                console.log(`\n${chalk_1.default.underline(file.filePath)}:`);
                file.violations.forEach((violation) => {
                    const color = violation.severity === 'error' ? chalk_1.default.red :
                        violation.severity === 'warning' ? chalk_1.default.yellow : chalk_1.default.blue;
                    console.log(`  ${color(violation.severity.toUpperCase())}: ${violation.message}`);
                    if (violation.element) {
                        console.log(`    Element: ${violation.element}`);
                    }
                });
            }
        });
    }
    else {
        console.log('\n' + chalk_1.default.green('✓ No violations found!'));
    }
}
function formatResults(result, format) {
    switch (format) {
        case 'json':
            return new json_formatter_1.JSONFormatter().format(result);
        case 'html':
            return new html_formatter_1.HTMLFormatter().format(result);
        case 'text':
        default:
            return ''; // Text format is handled by printTextResults
    }
}
program.parse();
//# sourceMappingURL=cli.js.map