document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('welcomeOverlay');
  const enterBtn = document.getElementById('enterVaultBtn');

  if (enterBtn) {
    enterBtn.onclick = () => {
      // إخفاء الكارت بنعومة
      const card = document.querySelector('.welcome-card');
      if (card) card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      card.style.transition = 'all 0.4s ease';

      // فتح الأبواب السينمائية
      overlay.classList.add('opened');

      // الانتقال للموقع الأساسي (index.html) بعد انتهاء أنيميشن فتح الأبواب
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1100); // 1.1 ثانية لحد ما الأبواب تفتح للاخر
    };
  }
});
