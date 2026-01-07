// Load KaTeX
const loadKaTeX = () => {
  return new Promise((resolve) => {
    // KaTeX CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
    document.head.appendChild(link);

    // KaTeX JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

// Render LaTeX expressions
const renderLatex = (text) => {
  if (!window.katex) return text;
  
  let rendered = text;
  
  // $$ ... $$ (display mode)
  rendered = rendered.replace(/$$([^$]+)$$/g, (match, latex) => {
    try {
      return '<span class="math-preview-block">' + 
             window.katex.renderToString(latex, { displayMode: true, throwOnError: false }) + 
             '</span>';
    } catch (e) {
      return match;
    }
  });
  
  // $ ... $ (inline mode)
  rendered = rendered.replace(/$([^$]+)$/g, (match, latex) => {
    try {
      return '<span class="math-preview-inline">' + 
             window.katex.renderToString(latex, { displayMode: false, throwOnError: false }) + 
             '</span>';
    } catch (e) {
      return match;
    }
  });
  
  return rendered;
};

// Create preview box
const createPreviewBox = () => {
  const preview = document.createElement('div');
  preview.id = 'latex-math-preview';
  preview.className = 'latex-math-preview-container';
  preview.innerHTML = `
    <div class="latex-math-preview-header">
      <span>📐 Matematik Önizleme</span>
      <button class="latex-preview-close">✕</button>
    </div>
    <div class="latex-math-preview-content"></div>
    <div class="latex-math-preview-hint">
      💡 İpucu: $x^2 + y^2 = r^2$ veya $$\\int_0^\\infty e^{-x} dx$$ kullan
    </div>
  `;
  return preview;
};

// Main function
const initMathPreview = async () => {
  await loadKaTeX();
  
  let previewBox = null;
  let currentTextarea = null;
  
  // find and watch the message box
  const observeTextarea = () => {
    const checkTextarea = setInterval(() => {
      // Instagram message input (textarea or contenteditable div)
      const textarea = document.querySelector('[contenteditable="true"][role="textbox"]') ||
                      document.querySelector('textarea[placeholder*="Mesaj"]') ||
                      document.querySelector('textarea[placeholder*="Message"]');
      
      if (textarea && textarea !== currentTextarea) {
        currentTextarea = textarea;
        clearInterval(checkTextarea);
        
        // Create preview box
        if (!previewBox) {
          previewBox = createPreviewBox();
          textarea.parentElement.insertBefore(previewBox, textarea);
          
          // Close button
          previewBox.querySelector('.latex-preview-close').addEventListener('click', () => {
            previewBox.style.display = 'none';
          });
        }
        
        // Input event listener
        const updatePreview = () => {
          const text = textarea.innerText || textarea.value || '';
          const content = previewBox.querySelector('.latex-math-preview-content');
          
          // Check if LaTeX expression exists
          if (text.includes('$')) {
            const rendered = renderLatex(text);
            content.innerHTML = rendered || '<em style="color: #999;">Matematik ifadesi algılanmadı</em>';
            previewBox.style.display = 'block';
          } else {
            previewBox.style.display = 'none';
          }
        };
        
        textarea.addEventListener('input', updatePreview);
        textarea.addEventListener('keyup', updatePreview);
        textarea.addEventListener('paste', () => setTimeout(updatePreview, 100));
        
        console.log('✅ Instagram LaTeX Math Preview aktif!');
      }
    }, 1000);
    
    // stop searching after 30 seconds
    setTimeout(() => clearInterval(checkTextarea), 30000);
  };
  
  // Start when page is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeTextarea);
  } else {
    observeTextarea();
  }
  
  // Monitor page changes (Instagram SPA)
  const observer = new MutationObserver(() => {
    if (!currentTextarea || !document.contains(currentTextarea)) {
      currentTextarea = null;
      previewBox = null;
      observeTextarea();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Initialize

initMathPreview();
