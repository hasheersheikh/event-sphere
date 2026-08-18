/**
 * Font Optimization Utilities
 * Efficient font loading with performance best practices
 */

/**
 * Check if browser supports font-face synthesis (reduces need for italic font files)
 */
export function supportsFontFaceSynthesis(): boolean {
  return CSS.supports('font-synthesis-style', 'italic') && CSS.supports('font-synthesis-weight', 'weight');
}

/**
 * Initialize font loading observer to detect when fonts are loaded
 * and remove the "fonts-loading" class from document
 */
export function initFontLoadingObserver(): void {
  if (typeof document === 'undefined') return;

  // Use the native FontFace API if available
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('fonts-loaded');
    });
  } else {
    // Fallback: assume fonts are loaded quickly
    setTimeout(() => {
      document.documentElement.classList.remove('fonts-loading');
      document.documentElement.classList.add('fonts-loaded');
    }, 1000);
  }
}

/**
 * Create a preloaded font link element
 */
export function preloadFont(
  family: string,
  weight: string = '400',
  style: string = 'normal'
): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';

  // Construct Google Fonts URL
  const encodedFamily = encodeURIComponent(family.replace(' ', '+'));
  link.href = `https://fonts.gstatic.com/s/${family.toLowerCase()}/v1/...`; // Would need actual font URL

  return link;
}

/**
 * Add font face synthesis optimization to document
 */
export function optimizeFontRendering(): void {
  if (typeof document === 'undefined') return;

  // Add font-synthesis CSS to leverage browser synthesis
  const style = document.createElement('style');
  style.textContent = `
    @supports (font-synthesis: weight style) {
      body {
        font-synthesis: weight style;
        font-optical-sizing: auto;
      }
    }
  `;

  document.head.appendChild(style);
}
