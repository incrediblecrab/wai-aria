import { FileScanner } from '../core/scanner';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('FileScanner', () => {
  const testDir = join(__dirname, 'test-files');
  
  beforeEach(() => {
    // Create test directory structure
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, 'subdir'), { recursive: true });
    
    // Create test files
    writeFileSync(join(testDir, 'index.html'), '<html><body><h1>Test</h1></body></html>');
    writeFileSync(join(testDir, 'about.html'), '<html><body><h2>About</h2></body></html>');
    writeFileSync(join(testDir, 'styles.css'), 'body { color: red; }');
    writeFileSync(join(testDir, 'script.js'), 'console.log("test");');
    writeFileSync(join(testDir, 'subdir', 'nested.html'), '<html><body><p>Nested</p></body></html>');
    writeFileSync(join(testDir, 'readme.txt'), 'This is a readme file');
  });

  afterEach(() => {
    // Clean up test files
    rmSync(testDir, { recursive: true, force: true });
  });

  test('should find HTML files by default', async () => {
    const scanner = new FileScanner();
    const files = await scanner.scanDirectory(testDir);
    
    expect(files).toHaveLength(3);
    expect(files.map(f => f.type)).toEqual(['html', 'html', 'html']);
  });

  test('should respect include patterns', async () => {
    const scanner = new FileScanner({
      include: ['**/*.css', '**/*.js']
    });
    const files = await scanner.scanDirectory(testDir);
    
    expect(files).toHaveLength(2);
    expect(files.map(f => f.type).sort()).toEqual(['css', 'js']);
  });

  test('should respect exclude patterns', async () => {
    const scanner = new FileScanner({
      include: ['**/*.html'],
      exclude: ['**/subdir/**']
    });
    const files = await scanner.scanDirectory(testDir);
    
    expect(files).toHaveLength(2);
    expect(files.every(f => !f.filePath.includes('subdir'))).toBe(true);
  });

  test('should parse file content correctly', async () => {
    const scanner = new FileScanner();
    const files = await scanner.scanDirectory(testDir);
    
    const indexFile = files.find(f => f.filePath.includes('index.html'));
    expect(indexFile).toBeDefined();
    expect(indexFile!.content).toContain('<h1>Test</h1>');
  });

  test('should identify file types correctly', async () => {
    const scanner = new FileScanner({
      include: ['**/*']
    });
    const files = await scanner.scanDirectory(testDir);
    
    const htmlFiles = files.filter(f => f.type === 'html');
    const cssFiles = files.filter(f => f.type === 'css');
    const jsFiles = files.filter(f => f.type === 'js');
    
    expect(htmlFiles).toHaveLength(3);
    expect(cssFiles).toHaveLength(1);
    expect(jsFiles).toHaveLength(1);
  });
});