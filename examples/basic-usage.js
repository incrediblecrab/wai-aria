#!/usr/bin/env node

// Basic usage example
const WCAGChecker = require('../dist/index.js').default;
const { ComplianceLevel } = require('../dist/index.js');

async function basicExample() {
  console.log('🔍 Basic WCAG Checker Example\n');

  // Create checker with default options
  const checker = new WCAGChecker();
  
  try {
    // Scan current directory
    const results = await checker.scan('.');
    
    console.log('📊 Scan Results:');
    console.log(`Files scanned: ${results.summary.totalFiles}`);
    console.log(`Violations found: ${results.summary.totalViolations}`);
    console.log(`Compliance: ${results.compliance.percentage}%`);
    
    if (results.summary.totalViolations > 0) {
      console.log('\n❌ Issues found:');
      results.files.forEach(file => {
        if (file.violations.length > 0) {
          console.log(`\n${file.filePath}:`);
          file.violations.forEach(violation => {
            console.log(`  - ${violation.severity.toUpperCase()}: ${violation.message}`);
          });
        }
      });
    } else {
      console.log('\n✅ No violations found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  basicExample();
}

module.exports = basicExample;