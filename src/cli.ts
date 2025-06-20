#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import WCAGChecker, { ComplianceLevel, ScanResult } from './index';
import { HTMLFormatter } from './formatters/html-formatter';
import { JSONFormatter } from './formatters/json-formatter';

const program = new Command();

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
      console.log(chalk.blue(`Scanning ${directory} for WCAG ${options.level} compliance...`));
      
      const checker = new WCAGChecker({
        level: options.level as ComplianceLevel,
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
        writeFileSync(options.output, output);
        console.log(chalk.green(`Report saved to ${options.output}`));
      } else {
        if (options.format === 'text') {
          printTextResults(result);
        } else {
          console.log(output);
        }
      }

      // Exit with error code if violations found and failOnError is true
      if (options.failOnError && result.summary.errorCount > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

function printTextResults(result: any): void {
  console.log('\n' + chalk.bold('WCAG Compliance Report'));
  console.log('========================\n');
  
  console.log(chalk.blue('Summary:'));
  console.log(`  Files scanned: ${result.summary.totalFiles}`);
  console.log(`  Total violations: ${result.summary.totalViolations}`);
  console.log(`  Errors: ${chalk.red(result.summary.errorCount)}`);
  console.log(`  Warnings: ${chalk.yellow(result.summary.warningCount)}`);
  console.log(`  Info: ${chalk.blue(result.summary.infoCount)}`);
  console.log(`  Compliance: ${result.compliance.percentage}%`);
  
  if (result.summary.totalViolations > 0) {
    console.log('\n' + chalk.yellow('Violations found:'));
    result.files.forEach((file: any) => {
      if (file.violations.length > 0) {
        console.log(`\n${chalk.underline(file.filePath)}:`);
        file.violations.forEach((violation: any) => {
          const color = violation.severity === 'error' ? chalk.red : 
                       violation.severity === 'warning' ? chalk.yellow : chalk.blue;
          console.log(`  ${color(violation.severity.toUpperCase())}: ${violation.message}`);
          if (violation.element) {
            console.log(`    Element: ${violation.element}`);
          }
        });
      }
    });
  } else {
    console.log('\n' + chalk.green('✓ No violations found!'));
  }
}

function formatResults(result: ScanResult, format: string): string {
  switch (format) {
    case 'json':
      return new JSONFormatter().format(result);
    case 'html':
      return new HTMLFormatter().format(result);
    case 'text':
    default:
      return ''; // Text format is handled by printTextResults
  }
}

program.parse();