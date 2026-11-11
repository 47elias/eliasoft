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
  if (mainNav?.classList.contains('open') && !mainNav.contains(event.target) && !menuButton?.contains(event.target)) {
    closeMenu();
  }
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

let scrollTicking = false;
function updateScrollUI() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
  floatingCta?.classList.toggle('is-visible', window.scrollY > 420 && !contactSection?.classList.contains('is-active'));
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollUI);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollUI();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.service-card, .values-row > div, .process-step, .faq-item, .product-copy, .product-visual, .contact-form').forEach((element, index) => {
    element.classList.add('reveal');
    element.style.transitionDelay = `${(index % 4) * 65}ms`;
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
  document.querySelectorAll('.service-card, .values-row > div, .process-step, .faq-item, .product-copy, .product-visual, .contact-form').forEach((element) => {
    element.classList.add('is-revealed');
  });
}

const inquiryForm = document.querySelector('#inquiry-form');
const formStatus = document.querySelector('#form-status');
inquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;

  const fields = new FormData(inquiryForm);
  const name = String(fields.get('name') || '').trim();
  const email = String(fields.get('email') || '').trim();
  const organization = String(fields.get('organization') || '').trim();
  const project = String(fields.get('project') || '').trim();
  const message = String(fields.get('message') || '').trim();
  const subject = `Project inquiry: ${project}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    organization ? `Company or school: ${organization}` : '',
    `Project type: ${project}`,
    '',
    'Project details:',
    message,
  ].filter(Boolean).join('\n');
  const mailto = `mailto:hello@eliasoft.co.zw?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (formStatus) {
    formStatus.innerHTML = 'Your inquiry is ready in your email app. If it did not open, <a href="mailto:hello@eliasoft.co.zw">email hello@eliasoft.co.zw</a> and include your project details.';
  }
  window.location.href = mailto;
});
