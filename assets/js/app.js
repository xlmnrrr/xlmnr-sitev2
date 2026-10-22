// ==========================================
// 1. НАСТРОЙКИ
// ==========================================
// Вставьте сюда ссылку на вашу функцию из Yandex Cloud
const YANDEX_PROXY_URL = 'ВСТАВЬТЕ_ССЫЛКУ_НА_ЯНДЕКС_ФУНКЦИЮ'; 

// ==========================================
// 2. БАЗОВЫЕ УТИЛИТЫ И МЕНЮ
// ==========================================
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
window.scrollTo(0, 0);
setTimeout(() => document.getElementById('mainHeader')?.classList.add('show'), 150);

const navToggle = document.getElementById('navToggle');
const mainHeader = document.getElementById('mainHeader');

function closeMenu() {
  mainHeader?.classList.remove('menu-open');
  if (navToggle) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Открыть меню');
  }
}

navToggle?.addEventListener('click', () => {
  const open = mainHeader.classList.toggle('menu-open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

document.querySelectorAll('#siteNav a').forEach(a => a.addEventListener('click', closeMenu));

// Плавный скролл
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#admin') return;

    if (targetId === '#' || targetId === '#home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerOffset = 60;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  });
});

// ==========================================
// 3. АНИМАЦИИ ПОЯВЛЕНИЯ И ФОН
// ==========================================
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

document.querySelectorAll('.reveal, .code-bg-section').forEach(el => observer.observe(el));

function initCSSBackground() {
  document.querySelectorAll('.css-code-bg').forEach(bg => {
    bg.innerHTML = '';
    const chars = ['<', '>', '/', '=', '{', '}', '(', ')', '[', ']', '0', '1', 'a', 'b', 'c', 'x', 'y', 'z'];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const saveData = navigator.connection && navigator.connection.saveData;
    const cores = navigator.hardwareConcurrency || 8;
    const weak = saveData || cores <= 4;
    const narrow = window.innerWidth < 768;
    if (weak && !bg.closest('.hero')) return;
    
    const colCount = weak ? 8 : (narrow ? 9 : Math.min(20, Math.max(12, Math.round(window.innerWidth / 90))));

    for(let i=0; i<colCount; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-column-wrapper';
      wrapper.style.left = (i * 100 / colCount) + '%';
      wrapper.style.width = (100 / colCount) + '%';
      wrapper.style.animationDelay = (Math.random() * 2) + 's';

      const col = document.createElement('div');
      col.className = 'code-column';
      const content = document.createElement('div');
      content.className = 'code-content';
      
      const lineLength = narrow ? 6 : 8;
      const rows = weak ? 16 : (narrow ? 20 : 26);
      
      for (let j = 0; j < rows; j++) {
        let line = '';
        for (let k = 0; k < lineLength; k++) line += chars[(Math.random() * chars.length) | 0];
        const span = document.createElement('span');
        span.className = 'code-line';
        span.textContent = line;
        span.style.animationDelay = (((j * 0.18) + (i * 0.23)) % 2.6) + 's';
        span.style.animationDuration = (0.85 + (i % 5) * 0.08) + 's';
        content.appendChild(span);
      }
      col.appendChild(content);
      wrapper.appendChild(col);
      bg.appendChild(wrapper);
    }
  });
}
initCSSBackground();

// ==========================================
// 4. COOKIE ЛОГИКА
// ==========================================
const CONSENT_KEY = 'cookie_consent';
const cookieBanner = document.getElementById('cookieBanner');

function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.value || !data.ts) return null;
    if (Date.now() - data.ts > 365 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return data.value;
  } catch (e) { return null; }
}

function setConsent(value) {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ value: value, ts: Date.now() })); } catch (e) {}
  if (cookieBanner) cookieBanner.hidden = true;
  document.body.classList.remove('has-cookie');
}

if (cookieBanner) {
  if (!getConsent()) {
    cookieBanner.hidden = false;
    document.body.classList.add('has-cookie');
  }
  cookieBanner.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-cookie]');
    if (!btn) return;
    setConsent(btn.getAttribute('data-cookie'));
  });
}

document.getElementById('cookieSettings')?.addEventListener('click', function() {
  try { localStorage.removeItem(CONSENT_KEY); } catch(e) {}
  window.location.reload();
});

// ==========================================
// 5. ФОРМА ЗАЯВКИ (В ВК)
// ==========================================
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const consentPd = document.getElementById('consentPd').checked;
  if (!consentPd) {
    alert('Пожалуйста, поставьте галочку согласия на обработку персональных данных.');
    return;
  }

  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  const name = document.getElementById('clientName').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const message = document.getElementById('clientMessage').value.trim();
  const website = document.getElementById('website').value;

  if (website) return; // Защита от спама
  if (!name || !phone) {
    status.textContent = 'Заполните имя и телефон.';
    status.style.color = '#ef4444';
    return;
  }

  btn.textContent = 'Отправляется...'; btn.disabled = true;
  status.textContent = '';

  const text = `📩 Новая заявка с сайта XLMNR\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n💬 Сообщение: ${message || '—'}`;

  try {
    const res = await fetch(YANDEX_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'lead', text: text })
    });

    if (!res.ok) throw new Error('Ошибка сервера');

    btn.textContent = 'Заявка отправлена!';
    status.textContent = 'Спасибо! Я свяжусь с вами в ближайшее время.';
    status.style.color = '#10b981';
    this.reset();
  } catch (err) {
    btn.textContent = 'Ошибка';
    status.textContent = 'Ошибка отправки. Попробуйте позже.';
    status.style.color = '#ef4444';
  } finally {
    setTimeout(() => { btn.textContent = 'Отправить заявку'; btn.disabled = false; }, 3000);
  }
});

// ==========================================
// 6. ТЕРМИНАЛ И МОДАЛКА БРАУЗЕРА
// ==========================================
const btnRun = document.getElementById('btnRunCode');
const term = document.getElementById('terminalBody');
let isRunning = false;

btnRun?.addEventListener('click', async () => {
  if (isRunning) return; isRunning = true; btnRun.textContent = 'Выполняется...'; term.innerHTML = '';
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

const browserModal = document.getElementById('browserModal');
const browserIframe = document.getElementById('browserIframe');
const browserUrl = document.getElementById('browserUrl');
let browserCloseTimer = 0;

window.openBrowser = function (url, urlText) {
  clearTimeout(browserCloseTimer);
  browserUrl.textContent = urlText || 'demo-site';
  browserModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (browserIframe.getAttribute('src') !== url) browserIframe.src = url;
};

window.closeBrowser = function () {
  if (!browserModal.classList.contains('open')) return;
  browserModal.classList.remove('open');
  if (!document.getElementById('aiModal').classList.contains('open')) document.body.style.overflow = '';
  clearTimeout(browserCloseTimer);
  browserCloseTimer = setTimeout(() => {
    if (!browserModal.classList.contains('open')) browserIframe.src = 'about:blank';
  }, 280);
};

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeBrowser();
  closeMenu();
  document.getElementById('aiModal').classList.remove('open');
  document.body.style.overflow = '';
});
browserModal?.addEventListener('click', (e) => { if (e.target === browserModal) closeBrowser(); });

// ==========================================
// 7. ИИ-ЧАТ (YandexGPT)
// ==========================================
const aiModal = document.getElementById('aiModal');

document.getElementById('aiFab')?.addEventListener('click', () => {
  aiModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

document.querySelector('.ai-close')?.addEventListener('click', () => {
  aiModal.classList.remove('open');
  if (!browserModal.classList.contains('open')) document.body.style.overflow = '';
});

aiModal?.addEventListener('click', (e) => {
  if (e.target === aiModal) {
    aiModal.classList.remove('open');
    if (!browserModal.classList.contains('open')) document.body.style.overflow = '';
  }
});

async function sendAiMessage() {
  const input = document.getElementById('aiInput');
  const chat = document.getElementById('aiChat');
  const text = input.value.trim();
  if (!text) return;

  // Добавляем сообщение пользователя
  const userMsg = document.createElement('div');
  userMsg.className = 'msg user';
  userMsg.textContent = text;
  chat.appendChild(userMsg);
  input.value = ''; chat.scrollTop = chat.scrollHeight;

  // Добавляем индикатор
  const loadingId = 'loading-' + Date.now();
  chat.insertAdjacentHTML('beforeend', `<div class="msg bot" id="${loadingId}">Печатает...</div>`);
  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch(YANDEX_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'ai', 
        message: text 
      })
    });

    const data = await res.json();
    document.getElementById(loadingId).textContent = data.text || 'Извините, я не могу ответить сейчас.';
  } catch (error) {
    document.getElementById(loadingId).textContent = 'ИИ временно недоступен. Оставьте заявку в форме!';
  }
  chat.scrollTop = chat.scrollHeight;
}
