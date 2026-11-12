const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const contactSection = document.querySelector('#contact');
const floatingCta = document.querySelector('.floating-cta');
const progressBar = document.querySelector('.scroll-progress span');

function closeMenu() {
  if (!menuButton || !mainNav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  mainNav.classList.remove('open');
}

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  mainNav?.classList.toggle('open', !isOpen);
});

mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', (event) => {
  if (mainNav?.classList.contains('open') && !mainNav.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

let scrollTicking = false;
function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
  floatingCta?.classList.toggle('is-visible', window.scrollY > 450 && !contactSection?.classList.contains('is-active'));
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollUI);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollUI();

const revealTargets = '.featured-system, .solution-card, .service-card, .impact-points article, .about-media, .about-copy, .approach-steps article, .industry-card, .capability-list article, .faq-list details, .contact-form';
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -18px 0px' });
  document.querySelectorAll(revealTargets).forEach((element, index) => {
    element.classList.add('reveal');
    element.style.transitionDelay = `${(index % 4) * 60}ms`;
    revealObserver.observe(element);
  });

  if (contactSection && floatingCta) {
    const contactObserver = new IntersectionObserver(([entry]) => {
      contactSection.classList.toggle('is-active', entry.isIntersecting);
      updateScrollUI();
    }, { threshold: 0.12 });
    contactObserver.observe(contactSection);
  }
} else {
  document.querySelectorAll(revealTargets).forEach((element) => element.classList.add('is-revealed'));
}

const filterButtons = document.querySelectorAll('.filter-chip');
const solutionItems = document.querySelectorAll('.solution-item');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter;
    filterButtons.forEach((chip) => {
      const isActive = chip === button;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', String(isActive));
    });
    solutionItems.forEach((item) => {
      item.classList.toggle('is-filtered-out', selectedFilter !== 'all' && item.dataset.category !== selectedFilter);
    });
  });
});

const inquiryForm = document.querySelector('#inquiry-form');
const formStatus = document.querySelector('#form-status');
inquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;
  const submitButton = inquiryForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent.trim() || 'Send project inquiry';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending inquiry…';
  }
  if (formStatus) {
    formStatus.classList.remove('is-error');
    formStatus.textContent = 'Sending your message to Eliasoft…';
  }

  fetch(inquiryForm.action, {
    method: 'POST',
    body: new FormData(inquiryForm),
    headers: { Accept: 'application/json' },
  })
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Your message could not be sent.');
      if (formStatus) formStatus.textContent = result.message;
      inquiryForm.reset();
    })
    .catch((error) => {
      if (formStatus) {
        formStatus.classList.add('is-error');
        formStatus.textContent = error.message || 'We could not send your message. Please email musamukahlera@gmail.com.';
      }
    })
    .finally(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
});
