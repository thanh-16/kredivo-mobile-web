/**
 * Kredivo Mobile Web Application Controller
 * Handles screen transitions, bottom sheet modal, category filtering,
 * navigation tabs, and micro-interactions.
 */

// Application State
const AppState = {
  currentScreen: 'home', // 'home' | 'loan'
  isLimitModalOpen: false,
  activeCategory: 'Phổ biến',
  activeNavTab: 'home'
};

// DOM References
const screenHome = document.getElementById('screenHome');
const screenLoan = document.getElementById('screenLoan');
const modalOverlay = document.getElementById('modalOverlay');
const limitBottomSheet = document.getElementById('limitBottomSheet');
const appBottomNav = document.getElementById('appBottomNav');
const toastPopup = document.getElementById('toastPopup');
const floatingSeeMoreBtn = document.getElementById('floatingSeeMoreBtn');
const homeScroll = document.getElementById('homeScroll');

/**
 * Switch between main application screens (Home vs Personal Loan)
 * @param {'home' | 'loan'} screenName
 */
function switchScreen(screenName) {
  AppState.currentScreen = screenName;

  if (screenName === 'home') {
    if (screenLoan) screenLoan.classList.remove('active');
    if (screenHome) screenHome.classList.add('active');
    if (appBottomNav) appBottomNav.style.display = 'flex';

    // Reset scroll to top
    const scrollContent = screenHome ? screenHome.querySelector('.scroll-content') : null;
    if (scrollContent) scrollContent.scrollTop = 0;

    // Check visibility of floating "Xem thêm" button
    setTimeout(updateSeeMoreButton, 60);
  } else if (screenName === 'loan') {
    // Close modal if open
    closeLimitModal();

    if (screenHome) screenHome.classList.remove('active');
    if (screenLoan) screenLoan.classList.add('active');
    if (appBottomNav) appBottomNav.style.display = 'none'; // Hide bottom nav on loan screen matching Image 3

    // Reset scroll to top
    const loanBody = screenLoan ? screenLoan.querySelector('.loan-body-content') : null;
    if (loanBody) loanBody.scrollTop = 0;

    // Hide see more button on loan screen
    if (floatingSeeMoreBtn) floatingSeeMoreBtn.classList.remove('visible');
  }
}

/**
 * Smoothly scroll down the Home screen to reveal the remaining content below
 */
function scrollDownMore() {
  const homeScroll = document.getElementById('homeScroll');
  if (!homeScroll) return;

  const targetSection = document.getElementById('tutorialGuideSection');
  if (targetSection) {
    const targetTop = targetSection.offsetTop - 12;
    homeScroll.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
  } else {
    homeScroll.scrollBy({
      top: 360,
      behavior: 'smooth'
    });
  }
}

/**
 * Check if there is still interface / content below in Home view.
 * If yes, display the floating "Xem thêm" button.
 * If user has scrolled down to the bottom, hide it.
 */
function updateSeeMoreButton() {
  const homeScroll = document.getElementById('homeScroll');
  const btn = document.getElementById('floatingSeeMoreBtn');
  if (!homeScroll || !btn) return;

  if (AppState.currentScreen !== 'home') {
    btn.classList.remove('visible');
    return;
  }

  // Calculate distance from bottom of scrollable container
  const remainingScroll = homeScroll.scrollHeight - homeScroll.scrollTop - homeScroll.clientHeight;

  // Threshold: if there is more than 50px of content left below, show the button
  if (remainingScroll > 50) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}

/**
 * Open the Limit Info Bottom Sheet (Image 2)
 */
function openLimitModal() {
  AppState.isLimitModalOpen = true;

  if (AppState.currentScreen !== 'home') {
    switchScreen('home');
  }

  if (modalOverlay) modalOverlay.classList.add('show');
  if (limitBottomSheet) limitBottomSheet.classList.add('open');
}

/**
 * Close the Limit Info Bottom Sheet
 */
function closeLimitModal() {
  AppState.isLimitModalOpen = false;

  if (modalOverlay) modalOverlay.classList.remove('show');
  if (limitBottomSheet) limitBottomSheet.classList.remove('open');
}

/**
 * Handle category tab switching
 * @param {HTMLElement} btn
 * @param {string} catName
 */
function selectCategory(btn, catName) {
  AppState.activeCategory = catName;

  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  showToast(`Đã lọc danh mục: ${catName}`);
}

/**
 * Handle bottom navigation tab switching
 * @param {HTMLElement} btn
 * @param {string} tabKey
 */
function switchNavTab(btn, tabKey) {
  AppState.activeNavTab = tabKey;

  const tabs = document.querySelectorAll('.bottom-tab');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  if (tabKey === 'home') {
    switchScreen('home');
  } else {
    const tabLabels = {
      history: 'Lịch Sử Giao Dịch',
      brands: 'Thương Hiệu',
      account: 'Tài Khoản'
    };
    showToast(`Đang mở: ${tabLabels[tabKey] || tabKey}`);
  }
}

/**
 * Show temporary toast message
 * @param {string} message
 */
let toastTimer = null;
function showToast(message) {
  if (!toastPopup) return;

  clearTimeout(toastTimer);
  toastPopup.textContent = message;
  toastPopup.classList.add('show');

  toastTimer = setTimeout(() => {
    toastPopup.classList.remove('show');
  }, 2000);
}

/**
 * Touch swipe down to dismiss bottom sheet
 */
let startY = 0;
let currentY = 0;

if (limitBottomSheet) {
  limitBottomSheet.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  limitBottomSheet.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    if (deltaY > 0) {
      limitBottomSheet.style.transform = `translateY(${deltaY}px)`;
    }
  }, { passive: true });

  limitBottomSheet.addEventListener('touchend', () => {
    const deltaY = currentY - startY;
    if (deltaY > 90) {
      closeLimitModal();
    }
    limitBottomSheet.style.transform = '';
    startY = 0;
    currentY = 0;
  });
}

// Keyboard shortcuts for quick accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (AppState.isLimitModalOpen) {
      closeLimitModal();
    } else if (AppState.currentScreen === 'loan') {
      switchScreen('home');
    }
  }
});

// Attach scroll listener to homeScroll to show/hide "Xem thêm" button dynamically
if (homeScroll) {
  homeScroll.addEventListener('scroll', updateSeeMoreButton, { passive: true });
}

// Window events for layout responsiveness
window.addEventListener('resize', updateSeeMoreButton);
window.addEventListener('load', updateSeeMoreButton);

// Re-check after images in homeScroll finish loading
document.querySelectorAll('#homeScroll img').forEach(img => {
  if (img.complete) {
    updateSeeMoreButton();
  } else {
    img.addEventListener('load', updateSeeMoreButton);
  }
});

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  switchScreen('home');
  setTimeout(updateSeeMoreButton, 100);
});
