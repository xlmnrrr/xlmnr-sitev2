// ============================================
// Логика отправки заявки напрямую в VK API
// ============================================

const VK_TOKEN = 'vk1.a.YAOmHhU_SzCiIjZfPxBLExEIyTGd4PZuzlZin91Vugq3X3Pi5XP_-k_3PDWYmVR6ORMxugkul6VGgNrAYUbNqc37R0ey9HipELXdtH-u93EL_N-6VOfla4KKsIF5iUbFHy9YChv_jp3_Ti9r9ThpBPFb337lmsDlsAQAssq6QUCAVRnX3Ow3OR52fqRtPSzjev7dvim4p8klPRvlW0NiKw';
const VK_PEER_ID = '532790997'; // Ваш личный ID ВКонтакте

document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  
  const name = document.getElementById('clientName').value.trim();
  const phone = document.getElementById('clientPhone').value.trim();
  const message = document.getElementById('clientMessage').value.trim();
  const website = document.getElementById('website').value; // Honeypot
  const consentPd = document.getElementById('consentPd').checked;

  // Проверки
  if (website) return; // Если бот заполнил скрытое поле - игнорируем
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

  // Формируем текст сообщения
  const text = `📩 Новая заявка с сайта XLMNR\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n💬 Сообщение: ${message || '—'}`;

  try {
    // Отправляем запрос в VK API
    const response = await fetch('https://api.vk.com/method/messages.send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        access_token: VK_TOKEN,
        v: '5.199',
        peer_id: VK_PEER_ID, // Отправляем напрямую вам в личку
        message: text,
        random_id: Math.floor(Math.random() * 1000000) // Защита от дублей
      })
    });

    const data = await response.json();

    // Если ВК вернул ошибку
    if (data.error) {
      console.error('VK Error:', data.error);
      throw new Error(data.error.error_msg);
    }

    // Успех
    status.textContent = 'Заявка отправлена! Я свяжусь с вами.';
    status.style.color = '#10b981';
    this.reset();
  } catch (error) {
    console.error(error);
    status.textContent = 'Ошибка отправки. Попробуйте позже.';
    status.style.color = '#ef4444';
  } finally {
    setTimeout(() => {
      btn.textContent = 'Отправить заявку';
      btn.disabled = false;
    }, 3000);
  }
});