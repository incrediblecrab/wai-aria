#!/bin/bash

# CI/CD Integration Example
# This script demonstrates how to use wcag-checker in continuous integration

echo "🚀 WCAG Checker CI Integration Example"
echo "======================================"

# Set strict error handling
set -e

# Configuration
COMPLIANCE_LEVEL=${COMPLIANCE_LEVEL:-"AA"}
SOURCE_DIR=${SOURCE_DIR:-"./src"}
FAIL_THRESHOLD=${FAIL_THRESHOLD:-0}
REPORT_FORMAT=${REPORT_FORMAT:-"json"}

echo "📋 Configuration:"
echo "  Compliance Level: $COMPLIANCE_LEVEL"
echo "  Source Directory: $SOURCE_DIR" 
echo "  Fail Threshold: $FAIL_THRESHOLD errors"
echo "  Report Format: $REPORT_FORMAT"
echo ""

# Install wcag-checker if not available
if ! command -v wcag-checker &> /dev/null; then
    echo "📦 Installing wcag-checker..."
    npm install -g wcag-checker
fi

# Create reports directory
mkdir -p reports

echo "🔍 Running accessibility scan..."

# Run the scan and capture output
if wcag-checker scan "$SOURCE_DIR" \
    --level "$COMPLIANCE_LEVEL" \
    --format "$REPORT_FORMAT" \
    --output "reports/accessibility-report.$REPORT_FORMAT" \
    --fail-on-error; then
    
    echo "✅ Accessibility scan completed successfully!"
    echo "📄 Report saved to reports/accessibility-report.$REPORT_FORMAT"
    
    # Generate additional HTML report for human review
    wcag-checker scan "$SOURCE_DIR" \
        --level "$COMPLIANCE_LEVEL" \
        --format html \
        --output "reports/accessibility-report.html"
    
    echo "📊 HTML report available at reports/accessibility-report.html"
    
else
    EXIT_CODE=$?
    echo "❌ Accessibility scan failed with exit code $EXIT_CODE"
    
    # Still generate reports for review
    wcag-checker scan "$SOURCE_DIR" \
        --level "$COMPLIANCE_LEVEL" \
        --format html \
        --output "reports/accessibility-report.html" || true
    
    echo "📄 Reports generated for review despite failures"
    echo "🔗 Check reports/accessibility-report.html for details"
    
    # Exit with the original error code
    exit $EXIT_CODE
fi

# Parse JSON report for additional analysis (if using JSON format)
if [ "$REPORT_FORMAT" = "json" ]; then
    echo ""
    echo "📊 Quick Stats:"
    
    # Extract key metrics using jq if available
    if command -v jq &> /dev/null; then
        TOTAL_FILES=$(jq '.summary.totalFiles' reports/accessibility-report.json)
        TOTAL_VIOLATIONS=$(jq '.summary.totalViolations' reports/accessibility-report.json)
        ERROR_COUNT=$(jq '.summary.errorCount' reports/accessibility-report.json)
        COMPLIANCE=$(jq '.compliance.percentage' reports/accessibility-report.json)
        
        echo "  📁 Files scanned: $TOTAL_FILES"
        echo "  🎯 Compliance: $COMPLIANCE%"
        echo "  ⚠️  Total violations: $TOTAL_VIOLATIONS"
        echo "  🚨 Errors: $ERROR_COUNT"
        
        # Set build status based on compliance percentage
        if (( $(echo "$COMPLIANCE >= 90" | bc -l) )); then
            echo "🎉 Excellent accessibility compliance!"
        elif (( $(echo "$COMPLIANCE >= 75" | bc -l) )); then
            echo "👍 Good accessibility compliance"
        else
            echo "⚠️  Accessibility compliance needs improvement"
        fi
    else
        echo "  💡 Install 'jq' for detailed JSON analysis"
    fi
fi

echo ""
echo "✨ CI integration complete!"
echo "💡 Consider adding this script to your .github/workflows or CI configuration"