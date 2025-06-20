#!/usr/bin/env node

// Advanced usage example with custom configuration
const WCAGChecker = require('../dist/index.js').default;
const { ComplianceLevel } = require('../dist/index.js');
const { JSONFormatter } = require('../dist/formatters/json-formatter.js');
const { HTMLFormatter } = require('../dist/formatters/html-formatter.js');
const { writeFileSync } = require('fs');

async function advancedExample() {
  console.log('⚙️  Advanced WCAG Checker Example\n');

  // Create checker with custom options
  const checker = new WCAGChecker({
    level: ComplianceLevel.AAA,
    include: ['**/*.html', '**/*.htm'],
    exclude: ['node_modules/**', 'dist/**', 'build/**'],
    rules: ['img-alt', 'form-label', 'link-name', 'heading-order'],
    failOnError: false
  });
  
  try {
    console.log('🎯 Configuration:');
    console.log('- Compliance Level: AAA');
    console.log('- Include: HTML files only');
    console.log('- Exclude: Build directories');
    console.log('- Rules: Core accessibility rules\n');
    
    // Scan with custom configuration
    const results = await checker.scan('.');
    
    // Generate different output formats
    console.log('📄 Generating reports...');
    
    // JSON Report
    const jsonFormatter = new JSONFormatter();
    const jsonReport = jsonFormatter.format(results);
    writeFileSync('accessibility-report.json', jsonReport);
    console.log('✅ JSON report saved to accessibility-report.json');
    
    // HTML Report
    const htmlFormatter = new HTMLFormatter();
    const htmlReport = htmlFormatter.format(results);
    writeFileSync('accessibility-report.html', htmlReport);
    console.log('✅ HTML report saved to accessibility-report.html');
    
    // Summary output
    console.log('\n📈 Summary Report:');
    console.log('='.repeat(50));
    console.log(`Compliance Level: ${results.compliance.level}`);
    console.log(`Overall Score: ${results.compliance.percentage}%`);
    console.log(`Files Processed: ${results.summary.totalFiles}`);
    console.log(`Total Issues: ${results.summary.totalViolations}`);
    console.log(`  - Errors: ${results.summary.errorCount}`);
    console.log(`  - Warnings: ${results.summary.warningCount}`);
    console.log(`  - Info: ${results.summary.infoCount}`);
    console.log(`Rules Passed: ${results.summary.passedRules}`);
    console.log(`Rules Failed: ${results.summary.failedRules}`);
    
    // File breakdown
    if (results.files.length > 0) {
      console.log('\n📁 File Breakdown:');
      results.files.forEach(file => {
        const status = file.violations.length === 0 ? '✅' : '❌';
        console.log(`${status} ${file.filePath} (${file.violations.length} issues)`);
      });
    }
    
    // Rule-specific analysis
    const ruleBreakdown = {};
    results.files.forEach(file => {
      file.violations.forEach(violation => {
        if (!ruleBreakdown[violation.ruleId]) {
          ruleBreakdown[violation.ruleId] = 0;
        }
        ruleBreakdown[violation.ruleId]++;
      });
    });
    
    if (Object.keys(ruleBreakdown).length > 0) {
      console.log('\n📋 Rule Breakdown:');
      Object.entries(ruleBreakdown)
        .sort(([,a], [,b]) => b - a)
        .forEach(([rule, count]) => {
          console.log(`  ${rule}: ${count} violations`);
        });
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (results.compliance.percentage >= 90) {
      console.log('🎉 Excellent! Your site has great accessibility compliance.');
    } else if (results.compliance.percentage >= 75) {
      console.log('👍 Good compliance level. Focus on fixing remaining errors.');
    } else if (results.compliance.percentage >= 50) {
      console.log('⚠️  Moderate compliance. Several accessibility issues need attention.');
    } else {
      console.log('🚨 Low compliance. Significant accessibility improvements needed.');
    }
    
    console.log('\nNext steps:');
    console.log('1. Review the HTML report for detailed violation information');
    console.log('2. Fix errors before warnings for maximum impact');
    console.log('3. Test with screen readers after making changes');
    console.log('4. Consider integrating this check into your CI/CD pipeline');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  advancedExample();
}

module.exports = advancedExample;