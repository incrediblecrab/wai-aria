import { glob } from 'glob';
import { readFileSync, statSync } from 'fs';
import { join, extname, resolve } from 'path';
import { ParsedFile, ScanOptions } from '../types';

export class FileScanner {
  private options: Partial<ScanOptions>;

  constructor(options: Partial<ScanOptions> = {}) {
    this.options = {
      include: ['**/*.html', '**/*.htm'],
      exclude: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
      ...options
    };
  }

  async scanDirectory(directory: string): Promise<ParsedFile[]> {
    const resolvedDir = resolve(directory);
    const files = await this.findFiles(resolvedDir);
    
    const parsedFiles: ParsedFile[] = [];
    
    for (const filePath of files) {
      try {
        const parsed = await this.parseFile(filePath);
        if (parsed) {
          parsedFiles.push(parsed);
        }
      } catch (error) {
        console.warn(`Failed to parse file ${filePath}:`, error);
      }
    }
    
    return parsedFiles;
  }

  private async findFiles(directory: string): Promise<string[]> {
    const includePatterns = this.options.include || ['**/*.html'];
    const excludePatterns = this.options.exclude || [];
    
    const allFiles: string[] = [];
    
    for (const pattern of includePatterns) {
      const files = await glob(pattern, {
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

  private async parseFile(filePath: string): Promise<ParsedFile | null> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileType = this.getFileType(filePath);
      
      if (!fileType) {
        return null;
      }
      
      return {
        filePath,
        content,
        type: fileType
      };
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  private getFileType(filePath: string): ParsedFile['type'] | null {
    const ext = extname(filePath).toLowerCase();
    
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

  updateOptions(options: Partial<ScanOptions>): void {
    this.options = { ...this.options, ...options };
  }
}