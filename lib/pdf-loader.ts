/**
 * Utility to load html2pdf.js library safely.
 */

let html2pdfInstance: any = null;

export async function loadHtml2Pdf(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if (html2pdfInstance) return html2pdfInstance;

  try {
    const html2pdfModule = await import('html2pdf.js');
    html2pdfInstance = html2pdfModule.default || html2pdfModule;
    return html2pdfInstance;
  } catch (err) {
    console.warn('Failed to load html2pdf.js locally, falling back to CDN...', err);
    
    return new Promise((resolve, reject) => {
      if ((window as any).html2pdf) {
        html2pdfInstance = (window as any).html2pdf;
        resolve(html2pdfInstance);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.async = true;
      script.onload = () => {
        html2pdfInstance = (window as any).html2pdf;
        resolve(html2pdfInstance);
      };
      script.onerror = (e) => {
        console.error('Failed to load html2pdf.js from CDN', e);
        reject(new Error('PDF library could not be loaded'));
      };
      document.head.appendChild(script);
    });
  }
}
