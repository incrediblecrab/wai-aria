import { FileScanner } from './core/scanner';
import { ComplianceEngine } from './core/compliance-engine';
import { ScanOptions, ScanResult, ComplianceLevel } from './types';
import { ImgAltRule } from './rules/img-alt-rule';
import { FormLabelRule } from './rules/form-label-rule';
import { LinkNameRule } from './rules/link-name-rule';
import { HeadingOrderRule } from './rules/heading-order-rule';
import { ColorContrastRule } from './rules/color-contrast-rule';
import { AriaValidRule } from './rules/aria-valid-rule';

export class WCAGChecker {
  private scanner: FileScanner;
  private engine: ComplianceEngine;

  constructor(options: Partial<ScanOptions> = {}) {
    this.scanner = new FileScanner(options);
    this.engine = new ComplianceEngine(options);
    
    // Register default rules
    this.engine.registerRule(new ImgAltRule());
    this.engine.registerRule(new FormLabelRule());
    this.engine.registerRule(new LinkNameRule());
    this.engine.registerRule(new HeadingOrderRule());
    this.engine.registerRule(new ColorContrastRule());
    this.engine.registerRule(new AriaValidRule());
  }

  async scan(directory: string): Promise<ScanResult> {
    // Discover and parse files
    const files = await this.scanner.scanDirectory(directory);
    
    if (files.length === 0) {
      throw new Error(`No files found to scan in ${directory}`);
    }

    // Analyze files for WCAG compliance
    const result = await this.engine.analyzeFiles(files);
    
    return result;
  }

  updateOptions(options: Partial<ScanOptions>): void {
    this.scanner.updateOptions(options);
    this.engine.updateOptions(options);
  }

  registerRule(rule: any): void {
    this.engine.registerRule(rule);
  }
}

// Export types and enums for consumers
export * from './types';
export { ComplianceLevel } from './types';

// Export main class as default
export default WCAGChecker;