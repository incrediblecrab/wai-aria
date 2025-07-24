import { HTMLAnalyzer } from '../analyzers/html-analyzer';
import { ParsedFile } from '../types';

describe('HTMLAnalyzer', () => {
  let analyzer: HTMLAnalyzer;

  beforeEach(() => {
    analyzer = new HTMLAnalyzer();
  });

  test('should parse HTML content', () => {
    const file: ParsedFile = {
      filePath: '/test/index.html',
      content: '<html><body><h1 id="title">Hello World</h1></body></html>',
      type: 'html'
    };

    const parsed = analyzer.parseHTML(file);
    
    expect(parsed.dom).toBeDefined();
    expect(parsed.dom!.querySelector('h1')?.textContent).toBe('Hello World');
  });

  test('should extract elements by selector', () => {
    const file: ParsedFile = {
      filePath: '/test/index.html',
      content: '<html><body><img src="test.jpg"><img src="test2.jpg"></body></html>',
      type: 'html'
    };

    const parsed = analyzer.parseHTML(file);
    const images = analyzer.extractElements(parsed.dom!, 'img');
    
    expect(images).toHaveLength(2);
    expect(images[0].tagName).toBe('IMG');
  });

  test('should get element context', () => {
    const file: ParsedFile = {
      filePath: '/test/index.html',
      content: '<html><body><button id="submit" class="btn btn-primary">Submit Form</button></body></html>',
      type: 'html'
    };

    const parsed = analyzer.parseHTML(file);
    const button = parsed.dom!.querySelector('button')!;
    const context = analyzer.getElementContext(button);
    
    expect(context).toContain('id="submit"');
    expect(context).toContain('class="btn btn-primary"');
  });

  test('should generate element selectors', () => {
    const file: ParsedFile = {
      filePath: '/test/index.html',
      content: '<html><body><div id="main"><p class="text highlight">Text</p></div></body></html>',
      type: 'html'
    };

    const parsed = analyzer.parseHTML(file);
    const div = parsed.dom!.querySelector('#main')!;
    const p = parsed.dom!.querySelector('p')!;
    
    expect(analyzer.getElementSelector(div)).toBe('div#main');
    expect(analyzer.getElementSelector(p)).toBe('p.text.highlight');
  });

  test('should check element attributes', () => {
    const file: ParsedFile = {
      filePath: '/test/index.html',
      content: '<html><body><img src="test.jpg" alt="Test image"></body></html>',
      type: 'html'
    };

    const parsed = analyzer.parseHTML(file);
    const img = parsed.dom!.querySelector('img')!;
    
    expect(analyzer.hasAttribute(img, 'alt')).toBe(true);
    expect(analyzer.hasAttribute(img, 'title')).toBe(false);
    expect(analyzer.getAttribute(img, 'alt')).toBe('Test image');
  });

  test('should check element visibility', () => {
    const file: ParsedFile = {
      filePath: '/test/index.html',
      content: `
        <html><body>
          <div id="visible">Visible</div>
          <div id="hidden" hidden>Hidden</div>
          <div id="aria-hidden" aria-hidden="true">ARIA Hidden</div>
        </body></html>
      `,
      type: 'html'
    };

    const parsed = analyzer.parseHTML(file);
    const visible = parsed.dom!.querySelector('#visible')!;
    const hidden = parsed.dom!.querySelector('#hidden')!;
    const ariaHidden = parsed.dom!.querySelector('#aria-hidden')!;
    
    expect(analyzer.isVisible(visible)).toBe(true);
    expect(analyzer.isVisible(hidden)).toBe(false);
    expect(analyzer.isVisible(ariaHidden)).toBe(false);
  });
});