import { ScanResult, FileResult, Violation } from '../types';

export class HTMLFormatter {
  format(result: ScanResult): string {
    const timestamp = new Date().toISOString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WCAG Compliance Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5rem;
        }
        .header p {
            margin: 0.5rem 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .summary-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 0.5rem 0;
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-card .value {
            font-size: 2rem;
            font-weight: bold;
            margin: 0;
        }
        .summary-card.compliance .value {
            color: ${result.compliance.percentage >= 80 ? '#10b981' : result.compliance.percentage >= 60 ? '#f59e0b' : '#ef4444'};
        }
        .summary-card.errors .value { color: #ef4444; }
        .summary-card.warnings .value { color: #f59e0b; }
        .summary-card.info .value { color: #3b82f6; }
        
        .file-results {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .file-header {
            background: #f8fafc;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 600;
        }
        .file-content {
            padding: 1.5rem;
        }
        .violation {
            margin-bottom: 1.5rem;
            padding: 1rem;
            border-left: 4px solid;
            border-radius: 0 4px 4px 0;
        }
        .violation.error {
            border-color: #ef4444;
            background-color: #fef2f2;
        }
        .violation.warning {
            border-color: #f59e0b;
            background-color: #fffbeb;
        }
        .violation.info {
            border-color: #3b82f6;
            background-color: #eff6ff;
        }
        .violation-header {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        .violation-severity {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
            margin-right: 0.75rem;
        }
        .violation-severity.error {
            background: #ef4444;
            color: white;
        }
        .violation-severity.warning {
            background: #f59e0b;
            color: white;
        }
        .violation-severity.info {
            background: #3b82f6;
            color: white;
        }
        .violation-message {
            font-weight: 600;
            color: #374151;
        }
        .violation-details {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #6b7280;
        }
        .violation-element {
            background: #f3f4f6;
            padding: 0.5rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            overflow-x: auto;
            margin: 0.5rem 0;
        }
        .violation-suggestion {
            margin-top: 0.5rem;
            padding: 0.75rem;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 4px;
            border-left: 3px solid #3b82f6;
        }
        .violation-suggestion strong {
            color: #1d4ed8;
        }
        .no-violations {
            text-align: center;
            padding: 3rem;
            color: #10b981;
        }
        .no-violations .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .footer {
            text-align: center;
            margin-top: 2rem;
            padding: 1rem;
            color: #6b7280;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>WCAG Compliance Report</h1>
        <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="summary-card compliance">
            <h3>Compliance</h3>
            <p class="value">${result.compliance.percentage}%</p>
        </div>
        <div class="summary-card">
            <h3>Files Scanned</h3>
            <p class="value">${result.summary.totalFiles}</p>
        </div>
        <div class="summary-card errors">
            <h3>Errors</h3>
            <p class="value">${result.summary.errorCount}</p>
        </div>
        <div class="summary-card warnings">
            <h3>Warnings</h3>
            <p class="value">${result.summary.warningCount}</p>
        </div>
    </div>

    ${result.summary.totalViolations === 0 ? this.renderNoViolations() : this.renderViolations(result.files)}

    <div class="footer">
        <p>Generated by WCAG Checker v1.0.0</p>
    </div>
</body>
</html>`;
  }

  private renderNoViolations(): string {
    return `
    <div class="file-results">
        <div class="no-violations">
            <div class="icon">✅</div>
            <h2>Congratulations!</h2>
            <p>No accessibility violations found. Your code follows WCAG 2.1 guidelines.</p>
        </div>
    </div>`;
  }

  private renderViolations(files: FileResult[]): string {
    return files
      .filter(file => file.violations.length > 0)
      .map(file => `
        <div class="file-results" style="margin-bottom: 2rem;">
            <div class="file-header">
                📄 ${file.filePath}
                <span style="float: right; color: #6b7280;">
                    ${file.violations.length} violation${file.violations.length === 1 ? '' : 's'}
                </span>
            </div>
            <div class="file-content">
                ${file.violations.map(violation => this.renderViolation(violation)).join('')}
            </div>
        </div>
      `).join('');
  }

  private renderViolation(violation: Violation): string {
    return `
    <div class="violation ${violation.severity}">
        <div class="violation-header">
            <span class="violation-severity ${violation.severity}">${violation.severity}</span>
            <span class="violation-message">${this.escapeHtml(violation.message)}</span>
        </div>
        
        ${violation.element ? `
        <div class="violation-details">
            <strong>Element:</strong>
            <div class="violation-element">${this.escapeHtml(violation.element)}</div>
        </div>
        ` : ''}
        
        ${violation.selector ? `
        <div class="violation-details">
            <strong>Selector:</strong> <code>${this.escapeHtml(violation.selector)}</code>
        </div>
        ` : ''}
        
        ${violation.suggestion ? `
        <div class="violation-suggestion">
            <strong>💡 Suggestion:</strong> ${this.escapeHtml(violation.suggestion)}
        </div>
        ` : ''}
    </div>`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}