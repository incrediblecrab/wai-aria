"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileScanner = void 0;
const glob_1 = require("glob");
const fs_1 = require("fs");
const path_1 = require("path");
class FileScanner {
    constructor(options = {}) {
        this.options = {
            include: ['**/*.html', '**/*.htm'],
            exclude: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
            ...options
        };
    }
    async scanDirectory(directory) {
        const resolvedDir = (0, path_1.resolve)(directory);
        const files = await this.findFiles(resolvedDir);
        const parsedFiles = [];
        for (const filePath of files) {
            try {
                const parsed = await this.parseFile(filePath);
                if (parsed) {
                    parsedFiles.push(parsed);
                }
            }
            catch (error) {
                console.warn(`Failed to parse file ${filePath}:`, error);
            }
        }
        return parsedFiles;
    }
    async findFiles(directory) {
        const includePatterns = this.options.include || ['**/*.html'];
        const excludePatterns = this.options.exclude || [];
        const allFiles = [];
        for (const pattern of includePatterns) {
            const files = await (0, glob_1.glob)(pattern, {
                cwd: directory,
                ignore: excludePatterns,
                absolute: true,
                nodir: true
            });
            allFiles.push(...files);
        }
        // Remove duplicates
        return [...new Set(allFiles)];
    }
    async parseFile(filePath) {
        try {
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            const fileType = this.getFileType(filePath);
            if (!fileType) {
                return null;
            }
            return {
                filePath,
                content,
                type: fileType
            };
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error}`);
        }
    }
    getFileType(filePath) {
        const ext = (0, path_1.extname)(filePath).toLowerCase();
        switch (ext) {
            case '.html':
            case '.htm':
                return 'html';
            case '.css':
                return 'css';
            case '.js':
                return 'js';
            case '.jsx':
                return 'jsx';
            case '.ts':
                return 'ts';
            case '.tsx':
                return 'tsx';
            default:
                return null;
        }
    }
    updateOptions(options) {
        this.options = { ...this.options, ...options };
    }
}
exports.FileScanner = FileScanner;
//# sourceMappingURL=scanner.js.map