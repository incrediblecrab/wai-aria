import { ImgAltRule } from '../rules/img-alt-rule';
import { FormLabelRule } from '../rules/form-label-rule';
import { LinkNameRule } from '../rules/link-name-rule';
import { HeadingOrderRule } from '../rules/heading-order-rule';
import { HTMLAnalyzer } from '../analyzers/html-analyzer';
import { ParsedFile } from '../types';

describe('WCAG Rules', () => {
  let analyzer: HTMLAnalyzer;

  beforeEach(() => {
    analyzer = new HTMLAnalyzer();
  });

  describe('ImgAltRule', () => {
    const rule = new ImgAltRule();

    test('should detect missing alt attribute', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><img src="test.jpg"></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe('img-alt');
      expect(violations[0].message).toContain('alt attribute');
    });

    test('should pass with proper alt text', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><img src="test.jpg" alt="Test image"></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(0);
    });

    test('should pass with decorative image', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><img src="test.jpg" alt="" role="presentation"></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(0);
    });
  });

  describe('FormLabelRule', () => {
    const rule = new FormLabelRule();

    test('should detect input without label', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><input type="text"></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe('form-label');
      expect(violations[0].message).toContain('associated label');
    });

    test('should pass with proper label', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><label for="name">Name:</label><input type="text" id="name"></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(0);
    });

    test('should pass with aria-label', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><input type="text" aria-label="Enter your name"></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(0);
    });
  });

  describe('LinkNameRule', () => {
    const rule = new LinkNameRule();

    test('should detect link without text', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><a href="/test"></a></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe('link-name');
      expect(violations[0].message).toContain('accessible text');
    });

    test('should pass with link text', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><a href="/test">Go to test page</a></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(0);
    });

    test('should warn about generic link text', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><a href="/test">click here</a></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(1);
      expect(violations[0].severity).toBe('warning');
      expect(violations[0].message).toContain('not descriptive');
    });
  });

  describe('HeadingOrderRule', () => {
    const rule = new HeadingOrderRule();

    test('should detect skipped heading level', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><h1>Title</h1><h3>Subtitle</h3></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(1);
      expect(violations[0].ruleId).toBe('heading-order');
      expect(violations[0].message).toContain('skipping level');
    });

    test('should pass with correct heading order', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><h1>Title</h1><h2>Subtitle</h2><h3>Sub-subtitle</h3></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(0);
    });

    test('should detect empty heading', () => {
      const file: ParsedFile = {
        filePath: '/test/index.html',
        content: '<html><body><h1></h1></body></html>',
        type: 'html'
      };

      const parsed = analyzer.parseHTML(file);
      const violations = rule.analyze(parsed, analyzer);

      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain('empty');
    });
  });
});