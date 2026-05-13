// ========== Sweet Potato Varieties Data ==========
const SWEET_POTATO_VARIETIES = [
    { id: "beckas-purple", name: "Becka's Purple", flavor: "Sweet & earthy", harvestDays: 110, color: "Purple skin", origin: "Oklahoma", emoji: "🍠", description: "A beautiful purple-skinned variety with sweet, earthy flavor. Perfect for roasting and baking.", nutrition: "High in antioxidants", growing: "Thrives in warm climates" },
    { id: "brinkley-white", name: "Brinkley White", flavor: "Creamy, mild", harvestDays: 100, color: "White skin", origin: "Arkansas", emoji: "🍠", description: "Creamy white flesh with a mild, sweet taste. Excellent for mashing and purees.", nutrition: "Rich in vitamin C", growing: "Drought tolerant" },
    { id: "ginseng-orange", name: "Ginseng Orange", flavor: "Earthy, sweet", harvestDays: 115, color: "Orange flesh", origin: "Asia", emoji: "🍠", description: "Orange-fleshed variety with an earthy sweetness. Great for soups and stews.", nutrition: "High in beta-carotene", growing: "Requires full sun" },
    { id: "grand-asia", name: "Grand Asia", flavor: "Firm, nutty", harvestDays: 105, color: "Tan skin", origin: "Korea", emoji: "🍠", description: "Firm texture with nutty undertones. Perfect for roasting and stir-fries.", nutrition: "Good source of fiber", growing: "Heat resistant" },
    { id: "gunlock", name: "Gunlock", flavor: "Rich, sugary", harvestDays: 120, color: "Copper", origin: "Utah", emoji: "🍠", description: "Exceptionally sweet with a rich, sugary flavor. Ideal for desserts and baking.", nutrition: "Natural sweetness", growing: "Cold hardy" },
    { id: "japanese-white", name: "Japanese White", flavor: "Chestnut-like", harvestDays: 125, color: "Purple-brown", origin: "Japan", emoji: "🍠", description: "Distinct chestnut-like flavor with a dry, fluffy texture. Excellent roasted.", nutrition: "Low glycemic", growing: "Prefers sandy soil" },
    { id: "kuwahi", name: "Kuwahi", flavor: "Sweet, moist", harvestDays: 110, color: "Reddish", origin: "Hawaii", emoji: "🍠", description: "Hawaiian heirloom with moist, sweet flesh. Great for pies and casseroles.", nutrition: "Rich in potassium", growing: "Loves humidity" },
    { id: "molokai", name: "Molokai", flavor: "Dry, sweet", harvestDays: 130, color: "Purple skin", origin: "Hawaii", emoji: "🍠", description: "Dry, sweet flesh that's perfect for roasting and making fries.", nutrition: "High in antioxidants", growing: "Slow growing but worth it" },
    { id: "murasaki", name: "Murasaki", flavor: "Sweet white flesh", harvestDays: 115, color: "Purple skin", origin: "Japan", emoji: "🍠", description: "Purple skin with sweet white flesh. Popular in Japanese cuisine.", nutrition: "Rich in anthocyanins", growing: "Disease resistant" },
    { id: "oklahoma-red", name: "Oklahoma Red", flavor: "Classic sweet", harvestDays: 100, color: "Red skin", origin: "Oklahoma", emoji: "🍠", description: "Classic sweet potato with red skin and orange flesh. All-purpose variety.", nutrition: "Excellent vitamin A source", growing: "Adaptable to many soils" },
    { id: "old-yellow", name: "Old Yellow", flavor: "Traditional", harvestDays: 105, color: "Yellow", origin: "Southern US", emoji: "🍠", description: "Traditional heirloom variety with yellow flesh. Great for everyday cooking.", nutrition: "Balanced nutrients", growing: "Easy to grow" },
    { id: "peruvian-pink", name: "Peruvian Pink", flavor: "Sweet, fruity", harvestDays: 120, color: "Pink skin", origin: "Peru", emoji: "🍠", description: "Pink skin with sweet, fruity flavor. Unique and delicious.", nutrition: "High in vitamin E", growing: "Needs warm soil" },
    { id: "red-wine-velvet", name: "Red Wine Velvet", flavor: "Wine-like", harvestDays: 115, color: "Deep red", origin: "Carolina", emoji: "🍠", description: "Deep red skin with wine-like flavor notes. Sophisticated taste.", nutrition: "Rich in iron", growing: "Thrives in rich soil" },
    { id: "san-francisco", name: "San Francisco", flavor: "Mild, sweet", harvestDays: 110, color: "Golden", origin: "California", emoji: "🍠", description: "Mildly sweet with golden flesh. Versatile for many dishes.", nutrition: "Good source of magnesium", growing: "Coastal adaptable" },
    { id: "trader-joes", name: "Trader Joes", flavor: "Super sweet", harvestDays: 95, color: "Orange", origin: "Commercial", emoji: "🍠", description: "Super sweet variety perfect for baking and desserts.", nutrition: "Natural energy source", growing: "Fast growing" },
    { id: "white-eclipse", name: "White Eclipse", flavor: "Sweet, creamy", harvestDays: 105, color: "White skin", origin: "Louisiana", emoji: "🍠", description: "White skin with creamy, sweet flesh. Excellent for mashing.", nutrition: "Creamy texture", growing: "Humidity loving" }
];

// ========== App State Management ==========
let currentUser = null;
let currentPage = 'home';
let mediaGallery = [];
let qrScanCount = 0;
let searchTerm = '';
let searchType = 'all';
let suggestions = [];
let debounceTimer = null;
let isSearchComplete = false;

// ========== Utility Functions ==========
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait, onComplete) {
    return function executedFunction(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            func(...args);
            if (typeof onComplete === 'function') onComplete();
        }, wait);
    };
}

// ========== LocalStorage Management ==========
async function initData() {
    const savedUser = localStorage.getItem('sweetroots_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    mediaGallery = JSON.parse(localStorage.getItem('sweetroots_media') || '[]');
    qrScanCount = parseInt(localStorage.getItem('sweetroots_qrScanTotal') || '0');
}

function saveData() {
    localStorage.setItem('sweetroots_media', JSON.stringify(mediaGallery));
    localStorage.setItem('sweetroots_qrScanTotal', qrScanCount.toString());
    if (currentUser) {
        localStorage.setItem('sweetroots_current_user', JSON.stringify(currentUser));
    }
}

// ========== Toast Notifications ==========
function showToast(message, type = 'success', duration = 4000) {
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };

    toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(180%) scale(0.92)';
        toast.style.filter = 'blur(6px)';
        setTimeout(() => toast.remove(), 450);
    }, duration);
}

// ========== Authentication ==========
async function login(email, password) {
    const response = await fetch("/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        showToast('Invalid email or password', 'error');
        return false;
    }

    currentUser = await response.json();
    localStorage.setItem('sweetroots_current_user', JSON.stringify(currentUser));
    showToast(`Welcome back, ${currentUser.name.split(' ')[0]}! 🌱`, 'success');
    return true;
}

async function register(userData) {
    const response = await fetch("/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: userData.name,
            username: userData.username,
            zip_code: userData.zipCode || "00000",
            email: userData.email,
            password: userData.password
        })
    });

    if (!response.ok) {
        const error = await response.json();
        showToast(error.detail || 'Registration failed', 'error');
        return false;
    }

    currentUser = await response.json();
    localStorage.setItem('sweetroots_current_user', JSON.stringify(currentUser));
    showToast(`Welcome to SweetRoots, ${currentUser.name.split(' ')[0]}! 🎉`, 'success');
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('sweetroots_current_user');
    showToast('Successfully signed out 👋', 'info');
    renderApp();
}

window.logout = logout;

// ========== Plant Management ==========
async function createPlant(varietyId, parentId = null) {
    const variety = SWEET_POTATO_VARIETIES.find(v => v.id === varietyId);
    if (!variety) return null;

    const response = await fetch("/plants/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: variety.name,
            user_id: currentUser?.id || null,
            parentPlantId: parentId || null,
            location: { lat: 0, lng: 0 }
        })
    });

    if (!response.ok) {
        showToast('Failed to create plant', 'error');
        return null;
    }

    const plant = await response.json();
    showToast(`${variety.name} added to your garden! 🌱`, 'success');
    return plant;
}

async function getChildPlants(plantId) {
    const allPlants = await getUserPlants();
    return allPlants.filter(p => p.parentPlantId === plantId);
}

async function getPlantById(plantId) {
    const response = await fetch(`/plants/${plantId}`);
    if (!response.ok) return null;
    return await response.json();
}

async function getUserPlants() {
    if (!currentUser) return [];
    const response = await fetch(`/users/${currentUser.id}/plants`);
    if (!response.ok) return [];
    return await response.json();
}

async function updatePlant(plantId, updates) {
    const response = await fetch(`/plants/${plantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        showToast('Failed to update plant', 'error');
        return false;
    }

    showToast('Plant updated successfully! ✨', 'success');
    return true;
}

async function updatePlantStatus(plantId, newStatus) {
    return await updatePlant(plantId, { status: newStatus });
}

async function deletePlant(plantId) {
    const response = await fetch(`/plants/${plantId}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        showToast('Failed to delete plant', 'error');
        return false;
    }

    showToast('Plant removed 🗑️', 'success');
    await renderApp();
    return true;
}

async function deleteChildOnly(plantId) {
    return await deletePlant(plantId);
}

function deleteMedia(mediaId) {
    const media = mediaGallery.find(m => m.id === mediaId);
    if (!media) {
        showToast('Media not found', 'error');
        return false;
    }

    if (currentUser && media.userId !== currentUser.id) {
        showToast('You can only delete your own posts', 'error');
        return false;
    }

    mediaGallery = mediaGallery.filter(m => m.id !== mediaId);
    saveData();
    showToast('Post deleted successfully', 'success');
    renderApp();
    return true;
}

async function updateUserProfile(updates) {
    if (!currentUser) return false;

    const response = await fetch(`/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: updates.name,
            username: updates.username,
            zip_code: updates.zipCode,
            bio: updates.bio,
            profile_picture: updates.profile_picture
        })
    });

    if (!response.ok) {
        showToast('Failed to update profile', 'error');
        return false;
    }

    currentUser = await response.json();
    localStorage.setItem('sweetroots_current_user', JSON.stringify(currentUser));
    showToast('Profile updated successfully! ✨', 'success');
    await renderApp();
    return true;
}

function addProgressUpdate(plantId, note, mediaFile = null) {
    if (!currentUser) {
        showToast('Please sign in to add updates', 'error');
        return false;
    }

    const newNote = {
        id: 'note_' + Date.now(),
        text: note,
        date: new Date().toISOString(),
        media: mediaFile ? URL.createObjectURL(mediaFile) : null,
        mediaType: mediaFile?.type?.startsWith('image/') ? 'image' :
            mediaFile?.type?.startsWith('video/') ? 'video' : null
    };

    if (mediaFile && currentUser) {
        mediaGallery.push({
            id: 'media_' + Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            plantId: plantId,
            plantName: note,
            type: newNote.mediaType,
            url: newNote.media,
            caption: note,
            date: new Date().toISOString()
        });
    }

    saveData();
    showToast('Progress updated! 📸✨', 'success');
    return true;
}

// ========== Statistics ==========
async function getStats() {
    const userPlants = await getUserPlants();
    const parentPlants = userPlants.filter(p => !p.parentPlantId);
    const childPlants = userPlants.filter(p => p.parentPlantId);

    return {
        totalPlants: userPlants.length,
        totalParents: parentPlants.length,
        totalChildren: childPlants.length,
        totalUpdates: 0,
        totalPhotos: 0,
        avgGeneration: userPlants.length > 0
            ? (userPlants.reduce((sum, p) => sum + (p.generation || 0), 0) / userPlants.length).toFixed(1)
            : 0
    };
}

function trackQRScan() {
    qrScanCount++;
    saveData();
    showToast(`QR scanned! Total: ${qrScanCount} 📱✨`, 'info');
    renderApp();
}

// ========== Search ==========
let searchDebounceTimer = null;

function debouncedSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
        const input = document.getElementById('searchInput');
        const value = input?.value;
        const cursorPos = input?.selectionStart;

        await renderApp();

        const newInput = document.getElementById('searchInput');
        if (newInput) {
            newInput.value = value;
            newInput.focus();
            newInput.setSelectionRange(cursorPos, cursorPos);
        }
        isSearchComplete = true;
    }, 800);
}

async function generateSuggestions() {
    if (searchTerm.length < 2) {
        suggestions = [];
        return;
    }

    const userPlants = await getUserPlants();
    suggestions = userPlants
        .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            id: p.id,
            creator: p.user_id
        }));
}

// ========== Navigation ==========
function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(page) ||
            (page === 'home' && link.textContent === 'Home')) {
            link.classList.add('active');
        }
    });
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeModal() {
    const modal = document.querySelector('.modal.active');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) modal.remove();
        }, 350);
    }
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
}

function openModal(content) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.width = '100%';

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = content;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    setTimeout(() => {
        const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    }, 120);
}

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (navLinks) {
        navLinks.classList.toggle('mobile-open');
        const isExpanded = navLinks.classList.contains('mobile-open');
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', isExpanded);
            menuBtn.classList.toggle('active', isExpanded);
        }
    }
}

function closeMobileMenuOnLinkClick() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.classList.remove('active');
        }
    }
}

// ========== Render Functions ==========
function renderNavbar() {
    return `
        <nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">
            <div class="nav-container">
                <a class="logo" onclick="navigateTo('home'); closeMobileMenuOnLinkClick();" role="link" aria-label="SweetRoots Home">
                    <span aria-hidden="true">🍠</span>
                    <span>SweetRoots</span>
                </a>
                <div class="nav-links" id="navLinks">
                    <a onclick="navigateTo('home'); closeMobileMenuOnLinkClick();" class="${currentPage === 'home' ? 'active' : ''}" role="link" aria-current="${currentPage === 'home' ? 'page' : 'false'}">Home</a>
                    <a onclick="navigateTo('dashboard'); closeMobileMenuOnLinkClick();" class="${currentPage === 'dashboard' ? 'active' : ''}" role="link" aria-current="${currentPage === 'dashboard' ? 'page' : 'false'}">Dashboard</a>
                    <a onclick="navigateTo('gallery'); closeMobileMenuOnLinkClick();" class="${currentPage === 'gallery' ? 'active' : ''}" role="link" aria-current="${currentPage === 'gallery' ? 'page' : 'false'}">Gallery</a>
                    ${currentUser ? `
                        <div class="user-info">
                            ${currentUser.profile_picture ?
                `<img src="${currentUser.profile_picture}" class="user-avatar" alt="${currentUser.name}'s profile" onerror="this.parentElement.innerHTML='<div class=\\'user-avatar\\'>${currentUser.name[0].toUpperCase()}</div>'">` :
                `<div class="user-avatar" aria-label="${currentUser.name}'s avatar" tabindex="0">${currentUser.name[0].toUpperCase()}</div>`
            }
                            <span class="font-semibold">${currentUser.name.split(' ')[0]}</span>
                            <button class="btn-logout" onclick="logout()" aria-label="Sign out of your account">Sign Out</button>
                        </div>
                    ` : `
                        <div class="user-info">
                            <button class="btn-signin" onclick="showLoginModal()" aria-label="Sign in to your SweetRoots account">
                                <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                                Sign In
                            </button>
                            <button class="btn-register" onclick="showRegisterModal()" aria-label="Create a new SweetRoots account">
                                <i class="fas fa-user-plus" aria-hidden="true"></i>
                                Sign Up
                            </button>
                        </div>
                    `}
                </div>
                <button class="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="navLinks">
                    <i class="fas fa-bars" aria-hidden="true"></i>
                    <span class="sr-only">Menu</span>
                </button>
            </div>
        </nav>
    `;
}

async function renderHome() {
    const stats = await getStats();

    return `
        <section class="hero" aria-labelledby="hero-title">
            <div class="hero-content">
                <h1 id="hero-title">
                    <span class="gradient-text">Grow Sweet Potatoes,</span><br>
                    <span style="color: var(--color-primary-darker);">Together.</span>
                </h1>
                <p>Join thousands of growers tracking their plants, sharing progress, and harvesting joy. Start your sweet potato journey today with our community-powered platform.</p>
                <div class="hero-buttons">
                    <button class="btn-register" onclick="openAddPlantModal()" aria-label="Get your first sweet potato clipping and start growing">
                        <i class="fas fa-seedling" aria-hidden="true"></i>
                        Get a Clipping
                    </button>
                    <button class="btn-signin" onclick="navigateTo('dashboard')" aria-label="View your personal garden dashboard">
                        <i class="fas fa-chart-line" aria-hidden="true"></i>
                        View Dashboard
                    </button>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat">
                        <span class="hero-stat-value">${qrScanCount.toLocaleString()}</span>
                        <span class="hero-stat-label">QR Scans</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat-value">${stats.totalPlants.toLocaleString()}</span>
                        <span class="hero-stat-label">Plants Tracked</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat-value">${stats.avgGeneration}</span>
                        <span class="hero-stat-label">Avg Generation</span>
                    </div>
                </div>
            </div>
        </section>

        <div class="stats-grid">
            <div class="stat-card" tabindex="0" role="button" aria-label="View your QR scan history and plant origins" onclick="showToast('QR scans help track plant origins and share with the community!')">
                <div class="stat-icon" aria-hidden="true">🔍</div>
                <span class="stat-value">${qrScanCount.toLocaleString()}</span>
                <span class="stat-label">QR Scans</span>
            </div>
            <div class="stat-card" tabindex="0" role="button" aria-label="View all your plants in the dashboard" onclick="navigateTo('dashboard')">
                <div class="stat-icon" aria-hidden="true">🌱</div>
                <span class="stat-value">${stats.totalPlants.toLocaleString()}</span>
                <span class="stat-label">Your Plants</span>
            </div>
            <div class="stat-card" tabindex="0" role="button" aria-label="View parent plants in your garden" onclick="navigateTo('dashboard')">
                <div class="stat-icon" aria-hidden="true">👨‍👦</div>
                <span class="stat-value">${stats.totalParents.toLocaleString()}</span>
                <span class="stat-label">Parent Plants</span>
            </div>
            <div class="stat-card" tabindex="0" role="button" aria-label="View child plants in your garden" onclick="navigateTo('dashboard')">
                <div class="stat-icon" aria-hidden="true">👶</div>
                <span class="stat-value">${stats.totalChildren.toLocaleString()}</span>
                <span class="stat-label">Child Plants</span>
            </div>
        </div>

        <section class="carousel-section" aria-labelledby="varieties-title">
            <div class="carousel-container">
                <div style="text-align: center; margin-bottom: var(--space-2xl);" data-aos="fade-up">
                    <h2 id="varieties-title" style="margin-bottom: var(--space-sm);">Sweet Potato Varieties</h2>
                    <p style="color: var(--text-muted); max-width: 650px; margin: 0 auto;">Discover our collection of 16 unique varieties - click any to learn more or get a clipping!</p>
                </div>
                <div class="carousel-container">
                    <button class="carousel-btn carousel-btn-left" onclick="scrollCarousel(-340)" aria-label="Scroll varieties left">
                        <i class="fas fa-chevron-left" aria-hidden="true"></i>
                    </button>
                    <div class="carousel-track" id="carouselTrack" role="list" aria-label="Sweet potato varieties">
                        <div class="carousel-grid" id="carouselGrid">
                            ${SWEET_POTATO_VARIETIES.map((variety, index) => `
                                <div class="variety-card"
                                     onclick="showVarietyDetail('${variety.id}')"
                                     role="listitem"
                                     tabindex="0"
                                     onkeypress="if(event.key==='Enter')showVarietyDetail('${variety.id}')"
                                     data-aos="fade-up"
                                     data-aos-delay="${index * 50}"
                                     aria-label="${variety.name}: ${variety.flavor} - ${variety.harvestDays} days to harvest">
                                    <div class="variety-emoji" aria-hidden="true">${variety.emoji}</div>
                                    <div class="variety-name">${variety.name}</div>
                                    <div class="variety-flavor">${variety.flavor}</div>
                                    <div class="variety-flavor" style="font-size: 0.9rem; opacity: 0.95;">${variety.color}</div>
                                    <div class="variety-days">⏱️ ${variety.harvestDays} days to harvest</div>
                                    <button class="btn-outline"
                                            style="margin-top: var(--space-md); width: 100%;"
                                            onclick="event.stopPropagation(); openAddPlantModalWithVariety('${variety.id}')"
                                            aria-label="Get ${variety.name} clipping and add to your garden">
                                        Get Clipping →
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button class="carousel-btn carousel-btn-right" onclick="scrollCarousel(340)" aria-label="Scroll varieties right">
                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="carousel-dots" id="carouselDots" role="tablist" aria-label="Variety navigation"></div>
            </div>
        </section>

        <div class="container">
            <div style="background: linear-gradient(135deg, var(--color-primary-light), #fde68a); border-radius: var(--radius-2xl); padding: var(--space-2xl); margin: var(--space-3xl) 0; display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2xl);" data-aos="fade-up">
                <div data-aos="fade-right">
                    <h3 style="margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);">
                        <span aria-hidden="true">📚</span>
                        Classroom Learning
                    </h3>
                    <div class="video-container">
                        <iframe src="https://drive.google.com/file/d/19W_jVw7V5lFeFTbGNCBTILhAHHuDgr0W/preview"
                                title="Sweet Potato Growing Guide Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                loading="lazy"
                                referrerpolicy="strict-origin-when-cross-origin"></iframe>
                    </div>
                    <a href="https://drive.google.com/uc?export=download&id=1zXxfJhyduRPyFMh4z9k4Za4q6PYKvmbq"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="btn-primary"
                       style="margin-top: var(--space-md); display: inline-flex; align-items: center; gap: var(--space-xs); width: 100%; justify-content: center;"
                       aria-label="Download Sweet Potato Growing Guide PDF">
                        <i class="fas fa-download" aria-hidden="true"></i>
                        Download Zine Guide
                    </a>
                </div>
                <div data-aos="fade-left">
                    <h3 style="margin-bottom: var(--space-md); display: flex; align-items: center; gap: var(--space-sm);">
                        <span aria-hidden="true">📍</span>
                        Propagation Station
                    </h3>
                    <div class="video-container">
                        <iframe src="https://drive.google.com/file/d/1Gy3k1Hp8Bwzgy-VBuuJgvpud66xbKZ3y/preview"
                                title="Tulsa Farmers Market Station Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                loading="lazy"
                                referrerpolicy="strict-origin-when-cross-origin"></iframe>
                    </div>
                    <div style="background: var(--bg-card); padding: var(--space-md); border-radius: var(--radius-md); margin-top: var(--space-md); border-left: 4.5px solid var(--color-primary);">
                        <strong style="display: block; margin-bottom: var(--space-xs); font-size: 1.05rem;">📍 Tulsa Farmers Market Station</strong>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.975rem;">Visit us every Saturday 8AM-12PM to get your free clipping and meet fellow growers!</p>
                    </div>
                </div>
            </div>
        </div>

        ${renderFooter()}
    `;
}

async function renderDashboard() {
    const userPlants = await getUserPlants();
    const stats = await getStats();

    const filteredPlants = userPlants.filter(plant => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return plant.name?.toLowerCase().includes(term) ||
            plant.user_id?.toLowerCase().includes(term) ||
            plant.parentPlantId?.toLowerCase().includes(term) ||
            plant.status?.toLowerCase().includes(term);
    });

    // get children for each plant
    const plantChildrenMap = {};
    for (const plant of userPlants) {
        plantChildrenMap[plant.id] = userPlants.filter(p => p.parentPlantId === plant.id);
    }

    return `
        <main id="main-content" class="container dashboard-section" style="padding-top: 6rem;" role="main">
            ${currentUser ? `
                <section class="profile-card" data-aos="fade-down" style="background: var(--bg-card); border-radius: var(--radius-2xl); padding: var(--space-lg) var(--space-xl); margin-bottom: var(--space-xl); box-shadow: var(--shadow-lg); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); border: 1.5px solid rgba(245, 158, 11, 0.18);">
                        <div class="profile-info" style="display: flex; align-items: center; gap: var(--space-lg);">
                                                ${currentUser.profile_picture ?
                                    `<img src="${currentUser.profile_picture}" alt="${currentUser.name}'s profile" style="width: 78px; height: 78px; border-radius: 50%; object-fit: cover; border: 4.5px solid var(--color-primary); box-shadow: var(--shadow-md);">` :
                                    `<div class="user-avatar" style="width: 78px; height: 78px; font-size: 2.1rem; box-shadow: var(--shadow-md);">${currentUser.name[0].toUpperCase()}</div>`
                                }
                            <div>
                                <h3 style="margin: 0; font-size: 1.55rem;">${currentUser.name}</h3>
                                <p style="margin: var(--space-xs) 0; color: var(--text-muted); font-size: 1.075rem;">@${currentUser.username || ''} • 📍 ${currentUser.zip_code || 'Not set'}</p>
                                ${currentUser.bio ? `<p style="margin: 0; color: var(--text-secondary); font-size: 1rem; max-width: 420px;">${currentUser.bio}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="showEditProfileModal()" aria-label="Edit your profile information">Edit Profile</button>
                </section>
            ` : ''}

            <header style="margin-bottom: var(--space-2xl);" data-aos="fade-up">
                <h1 style="margin-bottom: var(--space-sm);">
                    ${currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}! 🌱` : 'Welcome to Your Garden! 🌱'}
                </h1>
                <p style="color: var(--text-muted); margin: 0; font-size: 1.125rem;">Track your sweet potato plants and their family tree</p>
            </header>

            <section class="stats-dashboard" data-aos="fade-up" data-aos-delay="100" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
                <div class="stat-dashboard-card" style="background: var(--bg-card); padding: var(--space-md) var(--space-lg); border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-md); border: 1.5px solid rgba(245, 158, 11, 0.18);">
                    <div style="font-size: 1.85rem; margin-bottom: var(--space-xs);">🌱</div>
                    <div style="font-size: 1.85rem; font-weight: 850; color: var(--color-primary-dark);">${stats.totalPlants}</div>
                    <div style="font-size: 0.925rem; color: var(--text-muted); font-weight: 550;">Total Plants</div>
                </div>
                <div class="stat-dashboard-card" style="background: var(--bg-card); padding: var(--space-md) var(--space-lg); border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-md); border: 1.5px solid rgba(245, 158, 11, 0.18);">
                    <div style="font-size: 1.85rem; margin-bottom: var(--space-xs);">👨‍👦</div>
                    <div style="font-size: 1.85rem; font-weight: 850; color: var(--color-primary-dark);">${stats.totalParents}</div>
                    <div style="font-size: 0.925rem; color: var(--text-muted); font-weight: 550;">Parent Plants</div>
                </div>
                <div class="stat-dashboard-card" style="background: var(--bg-card); padding: var(--space-md) var(--space-lg); border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-md); border: 1.5px solid rgba(245, 158, 11, 0.18);">
                    <div style="font-size: 1.85rem; margin-bottom: var(--space-xs);">👶</div>
                    <div style="font-size: 1.85rem; font-weight: 850; color: var(--color-primary-dark);">${stats.totalChildren}</div>
                    <div style="font-size: 0.925rem; color: var(--text-muted); font-weight: 550;">Child Plants</div>
                </div>
                <div class="stat-dashboard-card" style="background: var(--bg-card); padding: var(--space-md) var(--space-lg); border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-md); border: 1.5px solid rgba(245, 158, 11, 0.18);">
                    <div style="font-size: 1.85rem; margin-bottom: var(--space-xs);">📝</div>
                    <div style="font-size: 1.85rem; font-weight: 850; color: var(--color-primary-dark);">${stats.totalUpdates}</div>
                    <div style="font-size: 0.925rem; color: var(--text-muted); font-weight: 550;">Total Updates</div>
                </div>
            </section>

            <section class="search-container" data-aos="fade-up" data-aos-delay="200" role="search" aria-label="Search your plants">
                <div class="search-input-group">
                    <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon" aria-hidden="true"></i>
                        <input type="search"
                               class="search-input"
                               id="searchInput"
                               placeholder="Search plants by name, status, or parent ID..."
                               value="${searchTerm}"
                               oninput="handleSearchInput()"
                               onkeydown="if(event.key==='Enter'){debouncedSearch.flush?.(); renderApp();}"
                               autocomplete="off"
                               aria-label="Search your plants"
                               aria-describedby="searchHint">
                        <small id="searchHint" class="form-hint" style="margin-top: 4px; display: block;">
                            <i class="fas fa-info-circle" aria-hidden="true"></i> Search waits until you finish typing
                        </small>
                    </div>
                    <button class="btn-primary" onclick="openAddPlantModal()" aria-label="Add new plant clipping to your garden">
                        <i class="fas fa-plus" aria-hidden="true"></i>
                        New Clipping
                    </button>
                </div>
                <div class="suggestions-dropdown" id="suggestionsDropdown" role="listbox" aria-label="Search suggestions"></div>
            </section>

            <h2 style="margin-bottom: var(--space-md);" data-aos="fade-up" data-aos-delay="300">
                My Garden
                ${filteredPlants.length !== userPlants.length ?
            `<span style="font-size: 1.075rem; font-weight: normal; color: var(--text-muted);">(${filteredPlants.length} of ${userPlants.length} shown)</span>`
            : ''}
            </h2>

            ${userPlants.length === 0 ? `
                <div class="empty-state" data-aos="fade-up" role="status" aria-live="polite">
                    <div class="empty-state-icon" aria-hidden="true">🌱</div>
                    <h3>No plants yet</h3>
                    <p style="color: var(--text-muted); margin: var(--space-sm) 0 var(--space-md); font-size: 1.075rem;">Get your first sweet potato clipping to start your garden journey!</p>
                    <button class="btn-primary" onclick="openAddPlantModal()" style="margin-top: var(--space-md);">Get Your First Clipping</button>
                </div>
            ` : filteredPlants.length === 0 ? `
                <div class="empty-state" data-aos="fade-up" role="status" aria-live="polite">
                    <div class="empty-state-icon" aria-hidden="true">🔍</div>
                    <h3>No matching plants</h3>
                    <p style="color: var(--text-muted); font-size: 1.075rem;">Try adjusting your search terms</p>
                    <button class="btn-secondary" onclick="searchTerm=''; renderApp();" style="margin-top: var(--space-md);">Clear Search</button>
                </div>
            ` : `
                <div class="plants-grid">
                    ${filteredPlants.map(plant => {
                const children = plantChildrenMap[plant.id] || [];
                const displayedChildren = children.slice(0, 3);
                const hasMoreChildren = children.length > 3;
                const isMotherPlant = !plant.parentPlantId;

                return `
                            <article class="plant-card" data-aos="fade-up" role="article" aria-labelledby="plant-${plant.id}-title">
                                <div class="plant-header">
                                    <div>
                                        <h3 class="plant-name" id="plant-${plant.id}-title">${plant.name}</h3>
                                        <div class="plant-creator">
                                            <i class="fas fa-user" aria-hidden="true"></i>
                                            Owner ID: <strong>${plant.user_id || 'Anonymous'}</strong>
                                        </div>
                                        <div class="plant-id">ID: ${plant.id}</div>
                                        <div class="plant-status" data-status="${plant.status || '🌱 Propagating'}">${plant.status || '🌱 Propagating'}</div>
                                    </div>
                                    ${(!currentUser || plant.user_id === currentUser.id) ? `
                                        <button class="btn-danger" onclick="confirmDeletePlant('${plant.id}')" aria-label="Delete ${plant.name}" title="Delete plant">✕</button>
                                    ` : ''}
                                </div>

                                ${isMotherPlant ? `
                                    <div class="parent-info">
                                        🌱 Mother Plant (Original) • ${children.length} child${children.length !== 1 ? 'ren' : ''}
                                    </div>
                                ` : `
                                    <div class="child-inheritance">
                                        👶 Child Plant<br>
                                        <small>Parent ID: ${plant.parentPlantId || 'Unknown'}</small>
                                    </div>
                                `}

                                <div class="plant-stats">
                                    <div class="plant-stat">
                                        <div class="plant-stat-value">${plant.generation || 0}</div>
                                        <div class="plant-stat-label">Generation</div>
                                    </div>
                                    <div class="plant-stat">
                                        <div class="plant-stat-value">${children.length}</div>
                                        <div class="plant-stat-label">Children</div>
                                    </div>
                                </div>

                                ${children.length > 0 ? `
                                    <div class="child-plants">
                                        <div style="font-size: 0.925rem; color: var(--text-secondary); margin-bottom: var(--space-xs); font-weight: 550;">👶 Children (${children.length}):</div>
                                        ${displayedChildren.map(child => `
                                            <span class="child-tag" onclick="showPlantDetails('${child.id}')" role="button" tabindex="0" aria-label="View ${child.name}" onkeypress="if(event.key==='Enter')showPlantDetails('${child.id}')">
                                                ${child.name}
                                            </span>
                                        `).join('')}
                                        ${hasMoreChildren ? `
                                            <button class="show-more-btn" onclick="showAllChildren('${plant.id}')" aria-label="Show all ${children.length} children of ${plant.name}">
                                                <i class="fas fa-plus-circle" aria-hidden="true"></i>
                                                + ${children.length - 3} more
                                            </button>
                                        ` : ''}
                                    </div>
                                ` : ''}

                                <div class="action-buttons">
                                    <button class="btn-outline btn-sm" onclick="showPlantDetails('${plant.id}')" aria-label="View full details for ${plant.name}">Details</button>
                                    <button class="btn-outline btn-sm" onclick="openAddPlantModalWithParent('${plant.id}', '${plant.name}')" aria-label="Take a clipping from ${plant.name}">Take Clipping</button>
                                    <button class="btn-outline btn-sm" onclick="updatePlantStatusModal('${plant.id}', '${plant.status || ''}')" aria-label="Update growth status for ${plant.name}">Update</button>
                                </div>
                            </article>
                        `;
            }).join('')}
                </div>
            `}

            <section class="tips-card" data-aos="fade-up">
                <h3><span aria-hidden="true">💡</span> Quick Growing Tips</h3>
                <ul>
                    <li>Keep soil consistently moist but never waterlogged for optimal growth</li>
                    <li>Provide 6-8 hours of direct sunlight daily for best results</li>
                    <li>Harvest when leaves start yellowing (typically 90-120 days after planting)</li>
                    <li>Take clippings from healthy, disease-free parent plants only</li>
                    <li>Store harvested sweet potatoes in a cool, dark, well-ventilated area</li>
                    <li>Child plants inherit traits from mothers - track changes to see evolution!</li>
                </ul>
            </section>
        </main>
        ${renderFooter()}
    `;
}

function renderGallery() {
    const galleryItems = [...mediaGallery].reverse();

    return `
        <main id="main-content" class="container" style="padding-top: 6rem;" role="main">
            <header style="text-align: center; margin-bottom: var(--space-2xl);" data-aos="fade-up">
                <h1 style="margin-bottom: var(--space-sm);">Community Gallery</h1>
                <p style="color: var(--text-muted); max-width: 650px; margin: 0 auto var(--space-md); font-size: 1.125rem;">Explore photos and videos shared by our growing community.</p>
                ${currentUser ? `
                    <button class="btn-primary" onclick="openUploadModal()" aria-label="Share your plant progress with the community">
                        <i class="fas fa-camera" aria-hidden="true"></i>
                        Share Your Story
                    </button>
                ` : `
                    <button class="btn-signin" onclick="showLoginModal()" aria-label="Sign in to share your sweet potato journey">
                        <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                        Sign in to share your journey
                    </button>
                `}
            </header>

            ${galleryItems.length === 0 ? `
                <div class="empty-state" data-aos="fade-up" role="status" aria-live="polite">
                    <div class="empty-state-icon" aria-hidden="true">📸</div>
                    <h3>No posts yet</h3>
                    <p style="color: var(--text-muted); font-size: 1.075rem;">Be the first to share your sweet potato journey!</p>
                    ${currentUser ? `<button class="btn-primary" style="margin-top: var(--space-md);" onclick="openUploadModal()">Share Your First Post</button>` : ''}
                </div>
            ` : `
                <div class="gallery-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: var(--space-xl);">
                    ${galleryItems.map(item => `
                        <article class="gallery-item"
                                 style="background: var(--bg-card); border-radius: var(--radius-2xl); overflow: hidden; box-shadow: var(--shadow-lg); transition: all var(--transition-normal); cursor: pointer; border: 1.5px solid rgba(245, 158, 11, 0.18);"
                                 onclick="viewMedia('${item.id}')"
                                 data-aos="fade-up"
                                 role="article"
                                 tabindex="0"
                                 onkeypress="if(event.key==='Enter')viewMedia('${item.id}')"
                                 aria-label="Post by ${item.userName || 'Anonymous'}: ${item.caption}">
                            <div style="position: relative; padding-top: 75%; background: linear-gradient(135deg, var(--color-primary-light), var(--bg-card));">
                                ${item.type === 'image' ?
            `<img src="${item.url}"
                                           alt="${item.caption}"
                                           style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                                           loading="lazy"
                                           onerror="this.parentElement.innerHTML='<div style=\\'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:3.5rem;\\'>🍠</div>'">` :
            `<video src="${item.url}"
                                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;"
                                            controls
                                            preload="metadata"
                                            aria-label="Video: ${item.caption}"></video>`
        }
                            </div>
                            <div style="padding: var(--space-md) var(--space-lg);">
                                <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-sm);">
                                    ${item.userName ? `
                                        <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--color-primary-gradient); display: flex; align-items: center; justify-content: center; color: white; font-weight: 750; font-size: 1.05rem; flex-shrink: 0;" aria-hidden="true">
                                            ${item.userName[0].toUpperCase()}
                                        </div>
                                    ` : ''}
                                    <div>
                                        <div style="font-weight: 700; font-size: 1.075rem; color: var(--text-primary);">${item.userName || 'Anonymous Grower'}</div>
                                        <div style="font-size: 0.875rem; color: var(--text-muted);">${formatDate(item.date)}</div>
                                    </div>
                                </div>
                                <p style="font-size: 1.025rem; margin: var(--space-sm) 0; color: var(--text-secondary);">${item.caption}</p>
                                ${currentUser && item.userId === currentUser.id ? `
                                    <button class="btn-danger"
                                            style="margin-top: var(--space-md); width: 100%;"
                                            onclick="event.stopPropagation(); confirmDeleteMedia('${item.id}')"
                                            aria-label="Delete this post">
                                        <i class="fas fa-trash-alt" aria-hidden="true"></i>
                                        Delete Post
                                    </button>
                                ` : ''}
                            </div>
                        </article>
                    `).join('')}
                </div>
            `}
        </main>
        ${renderFooter()}
    `;
}

function renderFooter() {
    return `
        <footer class="footer" role="contentinfo">
            <div class="footer-content">
                <div class="footer-section">
                    <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
                        <span style="font-size: 1.85rem;" aria-hidden="true">🍠</span>
                        <span style="font-size: 1.45rem; font-weight: 800; color: var(--color-primary);">SweetRoots</span>
                    </div>
                    <p style="color: var(--text-light); font-size: 1.075rem; line-height: 1.7;">Growing communities, one sweet potato at a time.</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <a onclick="navigateTo('home'); closeMobileMenuOnLinkClick();" role="link">Home</a>
                    <a onclick="navigateTo('dashboard'); closeMobileMenuOnLinkClick();" role="link">Dashboard</a>
                    <a onclick="navigateTo('gallery'); closeMobileMenuOnLinkClick();" role="link">Gallery</a>
                    <a href="#" onclick="exportData(); return false;">Export My Data</a>
                </div>
                <div class="footer-section">
                    <h4>Resources</h4>
                    <a href="https://drive.google.com/uc?export=download&id=1zXxfJhyduRPyFMh4z9k4Za4q6PYKvmbq"
                       target="_blank"
                       rel="noopener noreferrer">Growing Guide PDF</a>
                    <a href="https://photos.app.goo.gl/kZAMqbTZEkxhfQpb9"
                       target="_blank"
                       rel="noopener noreferrer">Community Gallery</a>
                    <a href="#" onclick="showToast('Coming soon: Plant care calendar!'); return false;">Care Calendar</a>
                </div>
                <div class="footer-section">
                    <h4>Connect</h4>
                    <div class="social-links">
                        <a href="https://www.instagram.com/potatoplantingpirate/"
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-label="Follow SweetRoots on Instagram">
                            <i class="fab fa-instagram" aria-hidden="true"></i>
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61561744016523"
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-label="Like SweetRoots on Facebook">
                            <i class="fab fa-facebook-f" aria-hidden="true"></i>
                        </a>
                        <a href="https://www.linkedin.com/in/matthew-woodson-201086358"
                           target="_blank"
                           rel="noopener noreferrer"
                           aria-label="Connect with SweetRoots on LinkedIn">
                            <i class="fab fa-linkedin-in" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} SweetRoots. All rights reserved. Made with ❤️ for growers everywhere.</p>
            </div>
        </footer>
    `;
}

// ========== Modal Functions ==========
function showLoginModal() {
    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close sign in modal">&times;</button>
            <h3 style="margin-bottom: var(--space-lg); text-align: center; font-size: 1.8rem;">Sign In to SweetRoots</h3>
            <p style="text-align: center; color: var(--text-muted); margin-bottom: var(--space-xl); font-size: 1.075rem;">Access your garden and share your journey</p>
            <form onsubmit="handleLogin(event); return false;" aria-label="Login form">
                <div class="form-group">
                    <label for="loginEmail">Email Address</label>
                    <input type="email" id="loginEmail" required autocomplete="email" placeholder="you@example.com" style="font-size: 1.075rem;">
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" required autocomplete="current-password" placeholder="••••••••" style="font-size: 1.075rem;">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; font-size: 1.125rem; padding: var(--space-md);">
                    <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                    Sign In
                </button>
            </form>
            <p style="text-align: center; margin-top: var(--space-xl); color: var(--text-muted); font-size: 1.025rem;">
                Don't have an account?
                <a href="#" onclick="closeModal(); showRegisterModal(); return false;" style="color: var(--color-primary); font-weight: 650; text-decoration: none;">Create one</a>
            </p>
        </div>
    `);
}

function showRegisterModal() {
    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close registration modal">&times;</button>
            <h3 style="margin-bottom: var(--space-lg); text-align: center; font-size: 1.8rem;">Create Your Account</h3>
            <p style="text-align: center; color: var(--text-muted); margin-bottom: var(--space-xl); font-size: 1.075rem;">Join our growing community of sweet potato enthusiasts</p>
            <form onsubmit="handleRegister(event); return false;" aria-label="Registration form">
                <div class="form-group">
                    <label for="regName">Full Name</label>
                    <input type="text" id="regName" required autocomplete="name" placeholder="Jane Doe" style="font-size: 1.075rem;">
                </div>
                <div class="form-group">
                    <label for="regUsername">Username</label>
                    <input type="text" id="regUsername" required pattern="[a-zA-Z0-9_]{3,20}" placeholder="jane_grower" style="font-size: 1.075rem;">
                    <small class="form-hint">This will be displayed on your plants</small>
                </div>
                <div class="form-group">
                    <label for="regEmail">Email Address</label>
                    <input type="email" id="regEmail" required autocomplete="email" placeholder="you@example.com" style="font-size: 1.075rem;">
                </div>
                <div class="form-group">
                    <label for="regZipCode">Zip Code (Optional)</label>
                    <input type="text" id="regZipCode" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="74101" title="Enter 5-digit zip code" style="font-size: 1.075rem;">
                </div>
                <div class="form-group">
                    <label for="regPassword">Password</label>
                    <input type="password" id="regPassword" required minlength="6" autocomplete="new-password" placeholder="••••••••" style="font-size: 1.075rem;">
                    <small class="form-hint">Must be at least 6 characters</small>
                </div>
                <button type="submit" class="btn-register" style="width: 100%; font-size: 1.125rem; padding: var(--space-md);">
                    <i class="fas fa-user-plus" aria-hidden="true"></i>
                    Create Account
                </button>
            </form>
        </div>
    `);
}

function showEditProfileModal() {
    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close edit profile modal">&times;</button>
            <h3 style="margin-bottom: var(--space-lg); font-size: 1.8rem;">Edit Profile</h3>
            <form onsubmit="saveProfile(); return false;" aria-label="Edit profile form">
                <div class="form-group">
                    <label for="editName">Full Name</label>
                    <input type="text" id="editName" value="${currentUser?.name || ''}" required style="font-size: 1.075rem;">
                </div>
                <div class="form-group">
                    <label for="editUsername">Username</label>
                    <input type="text" id="editUsername" value="${currentUser?.username || ''}" required pattern="[a-zA-Z0-9_]{3,20}" style="font-size: 1.075rem;">
                </div>
                <div class="form-group">
                    <label for="editBio">Bio</label>
                    <textarea id="editBio" rows="3" placeholder="Tell us about your gardening journey..." style="font-size: 1.075rem;">${currentUser?.bio || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="editProfilePicture">Profile Picture</label>
                    ${currentUser?.profile_picture ?
                                `<img src="${currentUser.profile_picture}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: var(--space-sm); display: block; border: 3px solid var(--color-primary);">`
                                : ''
                    }
                    <input type="file" id="editProfilePicture" accept="image/*" style="font-size: 1.075rem;">
                    <small class="form-hint">Max 5MB • JPG, PNG supported</small>
                </div>
                <div class="form-group">
                    <label for="editZipCode">Zip Code</label>
                    <input type="text" id="editZipCode" value="${currentUser?.zip_code || ''}" pattern="[0-9]{5}(-[0-9]{4})?" style="font-size: 1.075rem;">
                </div>
                <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
                    <button type="submit" class="btn-primary" style="flex: 1; font-size: 1.075rem;">Save Changes</button>
                    <button type="button" class="btn-secondary" onclick="closeModal()" style="flex: 1; font-size: 1.075rem;">Cancel</button>
                </div>
            </form>
        </div>
    `);
}

function showVarietyDetail(varietyId) {
    const variety = SWEET_POTATO_VARIETIES.find(v => v.id === varietyId);
    if (!variety) return;

    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close variety details modal">&times;</button>
            <div class="detail-card">
                <div style="text-align: center; margin-bottom: var(--space-lg);">
                    <div style="font-size: 6.5rem; margin-bottom: var(--space-md); line-height: 1;" aria-hidden="true">${variety.emoji}</div>
                    <h2 style="color: var(--color-primary-darker); margin-bottom: var(--space-xs); font-size: 2.1rem;">${variety.name}</h2>
                    <p style="color: var(--text-muted); font-size: 1.175rem; font-weight: 550;">${variety.flavor} • ${variety.color}</p>
                </div>
                <div style="margin-top: var(--space-md); line-height: 1.7; font-size: 1.025rem;">
                    <p><strong>📝 Description:</strong> ${variety.description}</p>
                    <p><strong>⏰ Harvest Time:</strong> ${variety.harvestDays} days from planting</p>
                    <p><strong>📍 Origin:</strong> ${variety.origin}</p>
                    <p><strong>🥗 Nutrition:</strong> ${variety.nutrition}</p>
                    <p><strong>🌱 Growing Tips:</strong> ${variety.growing}</p>
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: var(--space-lg); font-size: 1.125rem; padding: var(--space-md);" onclick="openAddPlantModalWithVariety('${variety.id}'); closeModal();">
                    <i class="fas fa-seedling" aria-hidden="true"></i>
                    Get This Clipping →
                </button>
            </div>
        </div>
    `);
}

async function showPlantDetails(plantId) {
    const plant = await getPlantById(plantId);
    if (!plant) return;

    const variety = SWEET_POTATO_VARIETIES.find(v => v.name === plant.name);
    const children = await getChildPlants(plantId);

    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close plant details modal">&times;</button>
            <div class="detail-card">
                <div style="text-align: center; margin-bottom: var(--space-lg);">
                    <div style="font-size: 4.8rem; margin-bottom: var(--space-md);" aria-hidden="true">${variety?.emoji || '🍠'}</div>
                    <h2 style="color: var(--color-primary-darker); font-size: 1.85rem;">${plant.name}</h2>
                    <p class="plant-id" style="font-size: 1.025rem; margin: 0; background: var(--color-primary-light); display: inline-block; padding: var(--space-xs) var(--space-md); border-radius: var(--radius-full);">ID: ${plant.id}</p>
                </div>
                <div style="margin-top: var(--space-md); line-height: 1.7; font-size: 1.075rem;">
                    <p><strong>📅 Created:</strong> ${formatDate(plant.created_at)}</p>
                    <p><strong>🔄 Last Update:</strong> ${formatDate(plant.updated_at)}</p>
                    <p><strong>🌿 Status:</strong> ${plant.status || '🌱 Propagating'}</p>
                    <p><strong>👨‍👦 Parent ID:</strong> ${plant.parentPlantId || 'Mother Plant (Original)'}</p>
                    <p><strong>📊 Generation:</strong> ${plant.generation || 0}</p>
                    <p><strong>👶 Children:</strong> ${children.length}</p>
                    <p><strong>📍 Location:</strong> ${plant.location?.lat || 0}, ${plant.location?.lng || 0}</p>
                </div>
                <div class="action-buttons" style="margin-top: var(--space-lg); gap: var(--space-md);">
                    <button class="btn-primary" onclick="openAddPlantModalWithParent('${plant.id}', '${plant.name}'); closeModal();" style="flex: 1; font-size: 1.075rem;">
                        <i class="fas fa-cut" aria-hidden="true"></i>
                        Take Clipping
                    </button>
                    <button class="btn-secondary" onclick="closeModal()" style="flex: 1; font-size: 1.075rem;">Close</button>
                </div>
            </div>
        </div>
    `);
}

async function showAllChildren(parentId) {
    const parent = await getPlantById(parentId);
    if (!parent) return;

    const children = await getChildPlants(parentId);

    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close children list modal">&times;</button>
            <h3 style="margin-bottom: var(--space-lg); font-size: 1.8rem;">Children of ${parent.name}</h3>
            <p style="color: var(--text-muted); margin-bottom: var(--space-md); font-size: 1.075rem;">ID: ${parent.id} • ${children.length} total child${children.length !== 1 ? 'ren' : ''}</p>
            <div style="max-height: 470px; overflow-y: auto; padding-right: var(--space-sm);">
                ${children.map(child => `
                    <div style="padding: var(--space-md) var(--space-lg); border-bottom: 1px solid rgba(0,0,0,0.09); cursor: pointer; transition: all var(--transition-fast); border-radius: var(--radius-md); margin-bottom: var(--space-xs);"
                         onclick="showPlantDetails('${child.id}'); closeModal();"
                         onmouseover="this.style.background='var(--color-primary-light)'"
                         onmouseout="this.style.background=''"
                         role="button"
                         tabindex="0"
                         onkeypress="if(event.key==='Enter'){showPlantDetails('${child.id}'); closeModal();}"
                         aria-label="View ${child.name}">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
                            <div>
                                <strong style="display: block; margin-bottom: var(--space-xs); font-size: 1.125rem;">${child.name}</strong>
                                <small style="color: var(--text-muted); font-size: 0.975rem;">
                                    ID: ${child.id} • Gen: ${child.generation || 0} • ${child.status || '🌱 Propagating'}
                                </small>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn-secondary" style="margin-top: var(--space-lg); width: 100%; font-size: 1.075rem;" onclick="closeModal()">Close</button>
        </div>
    `);
}

function openAddPlantModal() {
    const varieties = SWEET_POTATO_VARIETIES.map(v =>
        `<option value="${v.id}">${v.name} - ${v.flavor} (${v.harvestDays} days)</option>`
    ).join('');

    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close add plant modal">&times;</button>
            <h3 style="margin-bottom: var(--space-md); font-size: 1.8rem;">Get a Sweet Potato Clipping</h3>
            <p style="color: var(--text-muted); margin-bottom: var(--space-lg); font-size: 1.075rem;">Choose a variety to add to your garden. This will be your mother plant:</p>
            <div class="form-group">
                <label for="varietySelect">Sweet Potato Variety</label>
                <select id="varietySelect" style="width: 100%; padding: var(--space-md); border: 2.5px solid var(--color-primary-light); border-radius: var(--radius-input); font-size: 1.075rem; font-weight: 550;">
                    <option value="">Select a variety...</option>
                    ${varieties}
                </select>
                <small class="form-hint">Mother plants can have child plants cloned from them</small>
            </div>
            <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
                <button class="btn-primary" onclick="addSelectedPlant()" style="flex: 1; font-size: 1.075rem;">Add to Garden</button>
                <button class="btn-secondary" onclick="closeModal()" style="flex: 1; font-size: 1.075rem;">Cancel</button>
            </div>
        </div>
    `);
}

function openAddPlantModalWithVariety(varietyId) {
    const variety = SWEET_POTATO_VARIETIES.find(v => v.id === varietyId);
    if (!variety) return;

    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close add plant modal">&times;</button>
            <h3 style="margin-bottom: var(--space-md); font-size: 1.8rem;">Get a ${variety.name} Clipping</h3>
            <div class="detail-card" style="margin-bottom: var(--space-lg);">
                <p style="font-size: 1.125rem; margin-bottom: var(--space-xs);"><strong>${variety.name}</strong> - ${variety.flavor}</p>
                <p style="margin-bottom: var(--space-xs);">⏱️ Harvest: ${variety.harvestDays} days</p>
                <p style="margin-bottom: var(--space-xs);">📍 Origin: ${variety.origin}</p>
                <p style="margin-top: var(--space-sm); line-height: 1.65;">${variety.description}</p>
            </div>
            <div style="display: flex; gap: var(--space-md);">
                <button class="btn-primary" onclick="addPlantWithVariety('${varietyId}')" style="flex: 1; font-size: 1.075rem;">Add to Garden</button>
                <button class="btn-secondary" onclick="closeModal()" style="flex: 1; font-size: 1.075rem;">Cancel</button>
            </div>
        </div>
    `);
}

function openAddPlantModalWithParent(parentId, parentName) {
    const varieties = SWEET_POTATO_VARIETIES.map(v =>
        `<option value="${v.id}">${v.name} - ${v.flavor} (${v.harvestDays} days)</option>`
    ).join('');

    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close add child plant modal">&times;</button>
            <h3 style="margin-bottom: var(--space-md); font-size: 1.8rem;">Take a Clipping from ${parentName}</h3>
            <p style="color: var(--text-muted); margin-bottom: var(--space-lg); font-size: 1.075rem;">Choose a variety for the new child plant:</p>
            <div class="form-group">
                <label for="varietySelect">Sweet Potato Variety</label>
                <select id="varietySelect" style="width: 100%; padding: var(--space-md); border: 2.5px solid var(--color-primary-light); border-radius: var(--radius-input); font-size: 1.075rem; font-weight: 550;">
                    <option value="">Select a variety...</option>
                    ${varieties}
                </select>
                <small class="form-hint">Child plants show their mother plant on their card</small>
            </div>
            <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
                <button class="btn-primary" onclick="addPlantWithParent('${parentId}')" style="flex: 1; font-size: 1.075rem;">Take Clipping</button>
                <button class="btn-secondary" onclick="closeModal()" style="flex: 1; font-size: 1.075rem;">Cancel</button>
            </div>
        </div>
    `);
}

async function openUploadModal() {
    const userPlants = await getUserPlants();
    if (userPlants.length === 0) {
        showToast('Please add a plant first before sharing progress!', 'warning');
        return;
    }

    const plantOptions = userPlants.map(p =>
        `<option value="${p.id}">${p.name} (ID: ${p.id})</option>`
    ).join('');

    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close upload modal">&times;</button>
            <h3 style="margin-bottom: var(--space-md); font-size: 1.8rem;">Share Your Progress</h3>
            <form onsubmit="uploadMedia(); return false;" aria-label="Upload progress form">
                <div class="form-group">
                    <label for="uploadCaption">Caption</label>
                    <textarea id="uploadCaption" rows="3" placeholder="Share your sweet potato journey..." required style="font-size: 1.075rem; line-height: 1.65;"></textarea>
                </div>
                <div class="form-group">
                    <label for="uploadFile">Photo or Video</label>
                    <input type="file" id="uploadFile" accept="image/*,video/*" style="font-size: 1.075rem;">
                    <small class="form-hint">Max 10MB • JPG, PNG, MP4 supported</small>
                </div>
                <div class="form-group">
                    <label for="uploadPlantId">Which plant?</label>
                    <select id="uploadPlantId" required style="font-size: 1.075rem; font-weight: 550;">
                        <option value="">Select a plant...</option>
                        ${plantOptions}
                    </select>
                </div>
                <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
                    <button type="submit" class="btn-primary" style="flex: 1; font-size: 1.075rem;">
                        <i class="fas fa-paper-plane" aria-hidden="true"></i>
                        Share to Gallery
                    </button>
                    <button type="button" class="btn-secondary" onclick="closeModal()" style="flex: 1; font-size: 1.075rem;">Cancel</button>
                </div>
            </form>
        </div>
    `);
}

function updatePlantStatusModal(plantId, currentStatus) {
    const statuses = [
        { value: '🌱 Propagating', label: '🌱 Propagating' },
        { value: '🌿 Growing Strong', label: '🌿 Growing Strong' },
        { value: '🌸 Flowering', label: '🌸 Flowering' },
        { value: '🍠 Ready to Harvest', label: '🍠 Ready to Harvest' },
        { value: '🎉 Harvested', label: '🎉 Harvested' }
    ];

    openModal(`
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()" aria-label="Close status update modal">&times;</button>
            <h3 style="margin-bottom: var(--space-md); font-size: 1.8rem;">Update Plant Status</h3>
            <p style="color: var(--text-muted); margin-bottom: var(--space-lg); font-size: 1.075rem;">Select the current growth stage of your plant:</p>
            <div class="form-group">
                <label for="statusSelect">Current Status</label>
                <select id="statusSelect" style="width: 100%; padding: var(--space-md); border: 2.5px solid var(--color-primary-light); border-radius: var(--radius-input); font-size: 1.075rem; font-weight: 550;">
                    ${statuses.map(s =>
        `<option value="${s.value}" ${currentStatus === s.value ? 'selected' : ''}>${s.label}</option>`
    ).join('')}
                </select>
            </div>
            <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
                <button class="btn-primary" onclick="updateStatus('${plantId}')" style="flex: 1; font-size: 1.075rem;">Update Status</button>
                <button class="btn-secondary" onclick="closeModal()" style="flex: 1; font-size: 1.075rem;">Cancel</button>
            </div>
        </div>
    `);
}

// ========== Event Handlers ==========
window.handleLogin = async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
    }

    try {
        const success = await login(email, password);
        if (success) {
            closeModal();
            await renderApp();
        }
    } finally {
        if (submitBtn) {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }
};

window.handleRegister = async (event) => {
    event.preventDefault();
    const userData = {
        name: document.getElementById('regName')?.value?.trim(),
        username: document.getElementById('regUsername')?.value?.trim(),
        email: document.getElementById('regEmail')?.value?.trim(),
        zipCode: document.getElementById('regZipCode')?.value?.trim(),
        password: document.getElementById('regPassword')?.value
    };

    if (!userData.name || !userData.email || !userData.password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
    }

    try {
        const success = await register(userData);
        if (success) {
            closeModal();
            await renderApp();
        }
    } finally {
        if (submitBtn) {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }
};

window.saveProfile = async () => {
    const file = document.getElementById('editProfilePicture')?.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(`/users/${currentUser.id}/profile-picture`, {
            method: "POST",
            body: formData
        });

        if (!uploadResponse.ok) {
            showToast('Failed to upload photo', 'error');
            return;
        }

        const uploadResult = await uploadResponse.json();
        currentUser = uploadResult.user;
        localStorage.setItem('sweetroots_current_user', JSON.stringify(currentUser));
    }

    const updates = {
        name: document.getElementById('editName')?.value?.trim(),
        username: document.getElementById('editUsername')?.value?.trim(),
        zipCode: document.getElementById('editZipCode')?.value?.trim(),
        bio: document.getElementById('editBio')?.value?.trim()
    };

    await updateUserProfile(updates);
    closeModal();
};

window.addSelectedPlant = async () => {
    const select = document.getElementById('varietySelect');
    if (select?.value) {
        await createPlant(select.value);
        closeModal();
        await renderApp();
    } else {
        showToast('Please select a variety', 'warning');
    }
};

window.addPlantWithVariety = async (varietyId) => {
    await createPlant(varietyId);
    closeModal();
    await renderApp();
};

window.addPlantWithParent = async (parentId) => {
    const select = document.getElementById('varietySelect');
    if (select?.value) {
        await createPlant(select.value, parentId);
        closeModal();
        await renderApp();
    } else {
        showToast('Please select a variety', 'warning');
    }
};

window.updateStatus = async (plantId) => {
    const select = document.getElementById('statusSelect');
    if (select?.value) {
        await updatePlantStatus(plantId, select.value);
        closeModal();
        await renderApp();
    }
};

window.uploadMedia = () => {
    const caption = document.getElementById('uploadCaption')?.value?.trim();
    const file = document.getElementById('uploadFile')?.files[0];
    const plantId = document.getElementById('uploadPlantId')?.value;

    if (!caption || !plantId) {
        showToast('Please fill all required fields', 'warning');
        return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
        showToast('File too large. Max 10MB allowed', 'error');
        return;
    }

    addProgressUpdate(plantId, caption, file);
    closeModal();
    renderApp();
};

window.viewPlant = async (plantId) => {
    await showPlantDetails(plantId);
};

window.viewMedia = (mediaId) => {
    const media = mediaGallery.find(m => m.id === mediaId);
    if (media) {
        alert(`📸 ${media.userName || 'Anonymous Grower'}\n\n` +
            `${media.caption}\n\n` +
            `📅 ${formatDate(media.date)}`);
    }
};

window.confirmDeletePlant = async (plantId) => {
    const plant = await getPlantById(plantId);
    if (!plant) return;

    const children = await getChildPlants(plantId);
    const childrenCount = children.length;

    let message = `Are you sure you want to delete "${plant.name}"?`;
    if (childrenCount > 0) {
        message += `\n\nThis plant has ${childrenCount} child plant${childrenCount !== 1 ? 's' : ''}.\n\nThis action cannot be undone.`;
    } else {
        message += `\n\nThis action cannot be undone.`;
    }

    if (confirm(message)) {
        await deletePlant(plantId);
    }
};

window.confirmDeleteMedia = (mediaId) => {
    if (confirm('Delete this post from the community gallery? This cannot be undone.')) {
        deleteMedia(mediaId);
    }
};

window.deletePlant = async (plantId) => {
    await confirmDeletePlant(plantId);
};

window.deleteMedia = (mediaId) => {
    confirmDeleteMedia(mediaId);
};

window.showAllChildren = async (parentId) => {
    await showAllChildren(parentId);
};

window.showPlantDetails = async (plantId) => {
    await showPlantDetails(plantId);
};

window.handleSearchInput = () => {
    searchTerm = document.getElementById('searchInput')?.value || '';
    isSearchComplete = false;
    debouncedSearch();
};

debouncedSearch.flush = async function() {
    clearTimeout(searchDebounceTimer);
    await renderApp();
    isSearchComplete = true;
};

window.updateSearch = () => {
    searchTerm = document.getElementById('searchInput')?.value || '';
    searchType = document.getElementById('searchType')?.value || 'all';
    debouncedSearch.flush?.();
};

window.updateSuggestionsDropdown = () => {
    const dropdown = document.getElementById('suggestionsDropdown');
    if (!dropdown) return;

    if (suggestions.length > 0 && searchTerm.length > 0 && !isSearchComplete) {
        dropdown.innerHTML = suggestions.map(s => `
            <div class="suggestion-item"
                 onclick="selectSuggestion('${s.name}')"
                 role="option"
                 tabindex="0"
                 onkeypress="if(event.key==='Enter')selectSuggestion('${s.name}')"
                 aria-label="Select ${s.name}">
                <i class="fas fa-seedling" aria-hidden="true"></i>
                ${s.name}
            </div>
        `).join('');
        dropdown.classList.add('active');
    } else {
        dropdown.classList.remove('active');
    }
};

window.selectSuggestion = (value) => {
    searchTerm = value;
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = value;
        input.focus();
    }
    const dropdown = document.getElementById('suggestionsDropdown');
    if (dropdown) dropdown.classList.remove('active');
    debouncedSearch.flush?.();
};

window.scrollCarousel = (amount) => {
    const track = document.getElementById('carouselTrack');
    if (track) {
        track.scrollBy({ left: amount, behavior: 'smooth' });
    }
};

window.scrollToVariety = (index) => {
    const track = document.getElementById('carouselTrack');
    if (track) {
        const cardWidth = 310 + 24;
        track.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    }
};

window.exportData = async () => {
    if (!currentUser) {
        showToast('Please sign in to export your data', 'warning');
        return;
    }

    const plants = await getUserPlants();
    const exportData = {
        user: currentUser,
        plants: plants,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sweetroots-backup-${currentUser.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully! 📥✨', 'success');
};

function updateCarouselDots() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    if (!track || !dotsContainer) return;

    const scrollWidth = track.scrollWidth - track.clientWidth;
    const scrollLeft = track.scrollLeft;
    const index = scrollWidth > 0 ? Math.round((scrollLeft / scrollWidth) * (SWEET_POTATO_VARIETIES.length - 1)) : 0;

    dotsContainer.innerHTML = SWEET_POTATO_VARIETIES.map((_, i) =>
        `<div class="dot ${i === index ? 'active' : ''}"
              onclick="scrollToVariety(${i})"
              role="tab"
              aria-selected="${i === index}"
              aria-label="Go to variety ${i + 1}: ${SWEET_POTATO_VARIETIES[i].name}"
              tabindex="${i === index ? 0 : -1}"
              onkeypress="if(event.key==='Enter')scrollToVariety(${i})"></div>`
    ).join('');
}

async function renderApp() {
    let content = '';

    switch (currentPage) {
        case 'home':
            content = await renderHome();
            break;
        case 'dashboard':
            content = await renderDashboard();
            break;
        case 'gallery':
            content = renderGallery();
            break;
        default:
            content = await renderHome();
    }

    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = renderNavbar() + `<div class="page-transition">${content}</div>`;
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 750,
            once: true,
            offset: 85,
            easing: 'ease-out-cubic',
            disable: 'mobile'
        });
    }

    setTimeout(() => {
        const track = document.getElementById('carouselTrack');
        if (track) {
            track.removeEventListener('scroll', updateCarouselDots);
            track.addEventListener('scroll', updateCarouselDots, { passive: true });
            updateCarouselDots();
        }

        const navbar = document.getElementById('navbar');
        if (navbar) {
            const handleScroll = () => {
                if (window.scrollY > 65) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            };
            window.removeEventListener('scroll', handleScroll);
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
        }

        document.addEventListener('click', (e) => {
            const navLinks = document.getElementById('navLinks');
            const menuBtn = document.querySelector('.mobile-menu-btn');
            if (navLinks?.classList.contains('mobile-open') &&
                !navLinks.contains(e.target) &&
                !menuBtn?.contains(e.target) &&
                window.innerWidth <= 768) {
                navLinks.classList.remove('mobile-open');
                if (menuBtn) {
                    menuBtn.setAttribute('aria-expanded', 'false');
                    menuBtn.classList.remove('active');
                }
            }
        }, { passive: true });
    }, 180);
}

document.addEventListener('DOMContentLoaded', async () => {
    await initData();
    await renderApp();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth <= 768) {
                const navLinks = document.getElementById('navLinks');
                if (navLinks) navLinks.classList.remove('mobile-open');
            }
            renderApp();
        }, 280);
    }, { passive: true });

    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.35s ease-out';
    }, 120);
});

Object.assign(window, {
    navigateTo, logout, closeModal, toggleMobileMenu, closeMobileMenuOnLinkClick,
    handleLogin, handleRegister, saveProfile,
    addSelectedPlant, addPlantWithVariety, addPlantWithParent,
    updateStatus, uploadMedia, viewPlant, viewMedia,
    confirmDeletePlant, confirmDeleteMedia, showAllChildren,
    showPlantDetails, handleSearchInput, updateSearch,
    updateSuggestionsDropdown, selectSuggestion, scrollCarousel,
    scrollToVariety, exportData, showLoginModal, showRegisterModal,
    showEditProfileModal, showVarietyDetail, openAddPlantModal,
    openAddPlantModalWithVariety, openAddPlantModalWithParent,
    openUploadModal, updatePlantStatusModal,
    _debouncedSearch: debouncedSearch
});

document.body.style.opacity = '0';