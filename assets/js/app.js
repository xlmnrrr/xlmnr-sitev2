// ============================================
// XLMNR — Логика сайта (Анимации + Форма)
// ============================================

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// 1. Шапка и меню
setTimeout(() => $('#mainHeader')?.classList.add('show'), 150);
const navToggle = $('#navToggle');
const mainHeader = $('#mainHeader');
function closeMenu() {
  mainHeader?.classList.remove('menu-open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
}
navToggle?.addEventListener('click', () => {
  const open = mainHeader.classList.toggle('menu-open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
$$('#siteNav a').forEach(a => a.addEventListener('click', closeMenu));

// 2. Анимации появления (Reveal)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      if (entry.target.classList.contains('code-bg-section')) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  });
}, { threshold: 0.1 });
$$('.reveal, .code-bg-section').forEach(el => observer.observe(el));

// 3. Фон с кодом (CSS-анимация)
function initCSSBackground() {
  $$('.css-code-bg').forEach(bg => {
    bg.innerHTML = '';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const chars = ['<', '>', '/', '=', '{', '}', '(', ')', '[', ']', '0', '1', 'a', 'b', 'c', 'x', 'y', 'z'];
    const narrow = window.innerWidth < 768;
    const colCount = narrow ? 9 : Math.min(20, Math.max(12, Math.round(window.innerWidth / 90)));
    for (let i = 0; i < colCount; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-column-wrapper';
      wrapper.style.left = (i * 100 / colCount) + '%';
      wrapper.style.width = (100 / colCount) + '%';
      wrapper.style.animationDelay = (Math.random() * 2) + 's';
      const col = document.createElement('div');
      col.className = 'code-column';
      const content = document.createElement('div');
      content.className = 'code-content';
      const rows = narrow ? 20 : 26;
      const lineLength = narrow ? 6 : 8;
      for (let j = 0; j < rows; j++) {
        let line = '';
        for (let k = 0; k < lineLength; k++) line += chars[(Math.random() * chars.length) | 0];
        const span = document.createElement('span');
        span.className = 'code-line';
        span.textContent = line;
        span.style.animationDelay = (((j * 0.18) + (i * 0.23)) % 2.6) + 's';
        content.appendChild(span);
      }
      col.appendChild(content);
      wrapper.appendChild(col);
      bg.appendChild(wrapper);
    }
  });
}
initCSSBackground();

// 4. Пасхалка (Терминал)
const btnRun = $('#btnRunCode');
const term = $('#terminalBody');
let isRunning = false;
btnRun?.addEventListener('click', async () => {
  if (isRunning) return; isRunning = true;
  btnRun.textContent = 'Выполняется...'; term.innerHTML = '';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const type = async (txt, cls='') => {
    const s = document.createElement('span'); s.className = cls; term.appendChild(s);
    for(let i=0; i<txt.length; i++){ s.textContent += txt[i]; term.scrollTop = term.scrollHeight; await sleep(20); }
  };
  await type('user@xlmr:~$ ', 't-accent'); await type('init_site.js\n', 't-white');
  await sleep(500);
  for(let i=0; i<5; i++){ await type('> Optimizing assets...\n', 't-dim'); await sleep(300); }
  await type('> // Компиляция завершена успешно.\n', 't-accent');
  await type('> // Держи промокод на скидку 10%: XLMNR10\n', 't-white');
  btnRun.textContent = '▶ Запустить код'; isRunning = false;
});

// 5. Модалка браузера (Портфолио)
const browserModal = $('#browserModal');
const browserIframe = $('#browserIframe');
const browserUrl = $('#browserUrl');
window.openBrowser = function (url, urlText) {
  browserUrl.textContent = urlText || 'demo-site';
  browserModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (browserIframe.getAttribute('src') !== url) browserIframe.src = url;
};
window.closeBrowser = function () {
  browserModal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { browserIframe.src = 'about:blank'; }, 300);
};

// 6. ИИ-чат (Заглушка)
const aiModal = $('#aiModal');
$('#aiFab')?.addEventListener('click', () => {
  aiModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.querySelector('.ai-close')?.addEventListener('click', () => {
  aiModal.classList.remove('open');
  document.body.style.overflow = '';
});
window.sendAiMessage = async function () {
  const input = $('#aiInput'); const chat = $('#aiChat'); const text = input.value.trim();
  if (!text) return;
  const userMsg = document.createElement('div'); userMsg.className = 'msg user'; userMsg.textContent = text;
  chat.appendChild(userMsg); input.value = ''; chat.scrollTop = chat.scrollHeight;
  const loadingId = 'loading-' + Date.now();
  chat.insertAdjacentHTML('beforeend', `<div class="msg bot" id="${loadingId}">...</div>`);
  setTimeout(() => {
    $('#' + loadingId).textContent = 'Я пока учусь, но вы можете оставить заявку в форме ниже!';
    chat.scrollTop = chat.scrollHeight;
  }, 1000);
};

// 7. ОТПРАВКА ФОРМЫ (через Cloudflare Worker)
const VK_WORKER_URL = 'ВСТАВЬТЕ_СЮДА_ССЫЛКУ_НА_ВАШ_WORKER'; // Например: https://vk-proxy.ваш-ник.workers.dev

$('#contactForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = $('#submitBtn');
  const status = $('#formStatus');
  
  const name = $('#clientName').value.trim();
  const phone = $('#clientPhone').value.trim();
  const message = $('#clientMessage').value.trim();
  const website = $('#website').value; // Honeypot
  const consentPd = $('#consentPd').checked;

  if (website) return; 
  if (!consentPd) {
    status.textContent = 'Необходимо согласие на обработку ПДн.';
    status.style.color = '#ef4444';
    return;
  }
  if (!name || !phone) {
    status.textContent = 'Заполните имя и телефон.';
    status.style.color = '#ef4444';
    return;
  }

  btn.textContent = 'Отправляется...';
  btn.disabled = true;
  status.textContent = '';

  const text = `📩 Новая заявка с сайта XLMNR\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n💬 Сообщение: ${message || '—'}`;

  try {
    const response = await fetch(VK_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });

    if (!response.ok) throw new Error('Ошибка сервера');

    status.textContent = 'Заявка отправлена! Я свяжусь с вами.';
    status.style.color = '#10b981';
    this.reset();
  } catch (error) {
    status.textContent = 'Ошибка отправки. Попробуйте позже.';
    status.style.color = '#ef4444';
  } finally {
    setTimeout(() => {
      btn.textContent = 'Отправить заявку';
      btn.disabled = false;
    }, 3000);
  }
});
