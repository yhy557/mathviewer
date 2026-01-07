// Sayfa yüklendiğinde ayarları yükle
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// Ayarları yükle
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['enabled', 'theme']);
    
    // Enable/disable durumu
    const enabled = result.enabled !== undefined ? result.enabled : true;
    document.getElementById('enableExtension').checked = enabled;
    
    // Tema seçimi
    const theme = result.theme || 'silver';
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
      if (card.dataset.theme === theme) {
        card.classList.add('active');
      }
    });
    
    updateStatus('Ayarlar yüklendi', 'success');
  } catch (error) {
    console.error('Ayarlar yüklenemedi:', error);
    updateStatus('Hata oluştu', 'error');
  }
}

// Event listener'ları kur
function setupEventListeners() {
  // Enable/Disable toggle
  const toggle = document.getElementById('enableExtension');
  toggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.sync.set({ enabled });
    
    // Content script'e mesaj gönder
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('instagram.com')) {
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'toggleExtension', 
          enabled 
        });
      }
    } catch (error) {
      console.log('Instagram tab bulunamadı:', error);
    }
    
    updateStatus(enabled ? 'Eklenti aktif' : 'Eklenti kapalı', 'success');
  });

  // Tema seçimi
  const themeCards = document.querySelectorAll('.theme-card');
  themeCards.forEach(card => {
    card.addEventListener('click', async () => {
      const theme = card.dataset.theme;
      
      // Tüm kartlardan active class'ını kaldır
      themeCards.forEach(c => c.classList.remove('active'));
      
      // Seçili karta active ekle
      card.classList.add('active');
      
      // Ayarı kaydet
      await chrome.storage.sync.set({ theme });
      
      // Content script'e mesaj gönder
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes('instagram.com')) {
          await chrome.tabs.sendMessage(tab.id, { 
            action: 'changeTheme', 
            theme 
          });
        }
      } catch (error) {
        console.log('Instagram tab bulunamadı:', error);
      }
      
      updateStatus(`${getThemeName(theme)} teması seçildi`, 'success');
    });
  });
}

// Tema adını al
function getThemeName(theme) {
  const names = {
    silver: 'Gümüş',
    ocean: 'Okyanus',
    forest: 'Orman',
    sky: 'Gökyüzü',
    night: 'Gece'
  };
  return names[theme] || theme;
}

// Status mesajını güncelle
function updateStatus(message, type = 'success') {
  const statusText = document.getElementById('statusText');
  const indicator = document.querySelector('.status-indicator');
  
  statusText.textContent = message;
  
  if (type === 'success') {
    indicator.style.background = '#4CAF50';
  } else if (type === 'error') {
    indicator.style.background = '#f44336';
  }
  
  // Animasyon efekti
  statusText.style.animation = 'none';
  setTimeout(() => {
    statusText.style.animation = 'fadeIn 0.3s ease-out';
  }, 10);
}