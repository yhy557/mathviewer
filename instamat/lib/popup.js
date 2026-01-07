// Load settings when the page is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// Load settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['enabled', 'theme']);
    
    // Enable/disable status
    const enabled = result.enabled !== undefined ? result.enabled : true;
    document.getElementById('enableExtension').checked = enabled;
    
    // Theme selection
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

// Setup event listeners
function setupEventListeners() {
  // Enable/Disable toggle
  const toggle = document.getElementById('enableExtension');
  toggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    await chrome.storage.sync.set({ enabled });
    
    // Send message to content script
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

  // Theme selection
  const themeCards = document.querySelectorAll('.theme-card');
  themeCards.forEach(card => {
    card.addEventListener('click', async () => {
      const theme = card.dataset.theme;
      
      // Remove active class from all cards
      themeCards.forEach(c => c.classList.remove('active'));
      
      // Add active to selected card
      card.classList.add('active');
      
      // Save setting
      await chrome.storage.sync.set({ theme });
      
      // Save message to content script
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

// Get theme name
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

// Update status message
function updateStatus(message, type = 'success') {
  const statusText = document.getElementById('statusText');
  const indicator = document.querySelector('.status-indicator');
  
  statusText.textContent = message;
  
  if (type === 'success') {
    indicator.style.background = '#4CAF50';
  } else if (type === 'error') {
    indicator.style.background = '#f44336';
  }
  
  // Animation effect
  statusText.style.animation = 'none';
  setTimeout(() => {
    statusText.style.animation = 'fadeIn 0.3s ease-out';
  }, 10);

}
