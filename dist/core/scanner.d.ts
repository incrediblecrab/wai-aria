import { ParsedFile, ScanOptions } from '../types';
export declare class FileScanner {
    private options;
    constructor(options?: Partial<ScanOptions>);
    scanDirectory(directory: string): Promise<ParsedFile[]>;
    private findFiles;
    private parseFile;
    private getFileType;
    updateOptions(options: Partial<ScanOptions>): void;
}
//# sourceMappingURL=scanner.d.ts.map