import { WCAGRule, ComplianceLevel } from '../types';
export declare const WCAG_RULES: Record<string, WCAGRule>;
export declare function getRulesByLevel(level: ComplianceLevel): WCAGRule[];
export declare function getRuleById(id: string): WCAGRule | undefined;
//# sourceMappingURL=wcag-rules.d.ts.map