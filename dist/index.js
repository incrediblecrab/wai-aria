"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceLevel = exports.WCAGChecker = void 0;
const scanner_1 = require("./core/scanner");
const compliance_engine_1 = require("./core/compliance-engine");
const img_alt_rule_1 = require("./rules/img-alt-rule");
const form_label_rule_1 = require("./rules/form-label-rule");
const link_name_rule_1 = require("./rules/link-name-rule");
const heading_order_rule_1 = require("./rules/heading-order-rule");
const color_contrast_rule_1 = require("./rules/color-contrast-rule");
const aria_valid_rule_1 = require("./rules/aria-valid-rule");
class WCAGChecker {
    constructor(options = {}) {
        this.scanner = new scanner_1.FileScanner(options);
        this.engine = new compliance_engine_1.ComplianceEngine(options);
        // Register default rules
        this.engine.registerRule(new img_alt_rule_1.ImgAltRule());
        this.engine.registerRule(new form_label_rule_1.FormLabelRule());
        this.engine.registerRule(new link_name_rule_1.LinkNameRule());
        this.engine.registerRule(new heading_order_rule_1.HeadingOrderRule());
        this.engine.registerRule(new color_contrast_rule_1.ColorContrastRule());
        this.engine.registerRule(new aria_valid_rule_1.AriaValidRule());
    }
    async scan(directory) {
        // Discover and parse files
        const files = await this.scanner.scanDirectory(directory);
        if (files.length === 0) {
            throw new Error(`No files found to scan in ${directory}`);
        }
        // Analyze files for WCAG compliance
        const result = await this.engine.analyzeFiles(files);
        return result;
    }
    updateOptions(options) {
        this.scanner.updateOptions(options);
        this.engine.updateOptions(options);
    }
    registerRule(rule) {
        this.engine.registerRule(rule);
    }
}
exports.WCAGChecker = WCAGChecker;
// Export types and enums for consumers
__exportStar(require("./types"), exports);
var types_1 = require("./types");
Object.defineProperty(exports, "ComplianceLevel", { enumerable: true, get: function () { return types_1.ComplianceLevel; } });
// Export main class as default
exports.default = WCAGChecker;
//# sourceMappingURL=index.js.map