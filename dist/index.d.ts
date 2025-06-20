import { ScanOptions, ScanResult } from './types';
export declare class WCAGChecker {
    private scanner;
    private engine;
    constructor(options?: Partial<ScanOptions>);
    scan(directory: string): Promise<ScanResult>;
    updateOptions(options: Partial<ScanOptions>): void;
    registerRule(rule: any): void;
}
export * from './types';
export { ComplianceLevel } from './types';
export default WCAGChecker;
//# sourceMappingURL=index.d.ts.map