gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  README_URL: 'https://raw.githubusercontent.com/Sid2012-Pro/JoJo-s-Bizarre-Terminal/main/README.md',
};

function initVideoScrub() {
  const video = document.getElementById('scrollVideo');
  if (!video) return;

  video.pause();

  const setupScrollTrigger = () => {
    ScrollTrigger.create({
      trigger: '.split-layout',
      start: 'top top',
      end: '2000px'
      scrub: 0.5,
      onUpdate: (self) => {
        if (video.readyState >= 2) {
          const targetTime = self.progress * video.duration;
          gsap.to(video, {
            currentTime: targetTime,
            duration: 0.06,
            ease: "none",
            overwrite: true
          });
        }
      }
    });
  };

  if (video.readyState >= 1) {
    setupScrollTrigger();
  } else {
    video.addEventListener('loadedmetadata', setupScrollTrigger, { once: true });
  }
  
  video.addEventListener('error', (e) => {
    console.warn('Video failed to load.', e);
  });
}

async function fetchAndRenderMarkdown() {
  const container = document.getElementById('markdown-content');

  try {
    const response = await fetch(CONFIG.README_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch README: ${response.status}`);
    }

    const markdown = await response.text();
    
    marked.setOptions({
      breaks: true,
      gfm: true,
      pedantic: false,
    });
    
    const html = marked.parse(markdown);
    container.innerHTML = html;
    
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
    
    animateMarkdownText();
  } catch (error) {
    container.innerHTML = `
      <div class="error-message">
        <strong>⚠ Failed to load README</strong><br>
        <small>${error.message}</small><br><br>
        <strong>Setup Instructions:</strong><br>
        1. Update CONFIG.README_URL with your GitHub repo<br>
        2. Ensure the repository is public<br>
        3. Use format: https://raw.githubusercontent.com/Sid2012-Pro/JoJo-s-Bizarre-Terminal/main/README.md
      </div>
    `;
  }
}

function animateMarkdownText() {
  const textElements = document.querySelectorAll(
    '#markdown-content p, #markdown-content li'
  );
  
  textElements.forEach((element) => {
    if (element.textContent.length < 20) return;
    
    try {
      const split = new SplitType(element, { types: 'words' });
      gsap.from(split.words, {
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 10,
        stagger: 0.02,
        duration: 0.4,
        ease: 'power1.out',
      });
    } catch (err) {
      console.debug('SplitType animation skipped for element:', element);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initVideoScrub();
  fetchAndRenderMarkdown();
});

window.addEventListener('beforeunload', () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});
