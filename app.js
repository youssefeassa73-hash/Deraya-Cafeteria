// Sanity Configuration
const SANITY_PROJECT_ID = 'ksse299y';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2021-06-07';

function sanityQuery(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;
    return fetch(url).then(res => res.json()).then(data => data.result);
}

// Global function to toggle collapsible menu sections
window.toggleSection = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle('collapsed');
        const chevron = el.querySelector('.chevron');
        if (chevron) {
            chevron.innerText = el.classList.contains('collapsed') ? '▼' : '▲';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadContent();
});

async function loadContent() {
    try {
        // Fetch all data from Sanity
        const [menuItems, offers, settingsArr] = await Promise.all([
            sanityQuery('*[_type == "menuItem"] | order(category asc, _createdAt asc)'),
            sanityQuery('*[_type == "offer"] | order(_createdAt desc)'),
            sanityQuery('*[_type == "siteSettings"][0..0]')
        ]);

        const settings = settingsArr && settingsArr.length > 0 ? settingsArr[0] : null;

        // ---- MENU ----
        const menuSection = document.getElementById('menu');
        const menuContainer = document.getElementById('menu-container');
        menuContainer.innerHTML = '';

        if (!menuItems || menuItems.length === 0) {
            menuSection.style.display = 'none';
        } else {
            menuSection.style.display = 'block';
            const categoryOrder = ['الفطار', 'السندوتشات', 'الكرييب', 'الوجبات', 'البيتزا'];
            const categories = [...new Set(menuItems.map(item => item.category))].sort((a, b) => {
                let indexA = categoryOrder.indexOf(a);
                let indexB = categoryOrder.indexOf(b);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });

            const isMobile = window.innerWidth <= 768;

            categories.forEach((category, idx) => {
                // Skip rendering if category is hidden by admin in settings
                if (settings && settings.hiddenCategories && settings.hiddenCategories.includes(category)) {
                    return;
                }
                const itemsInCategory = menuItems.filter(item => item.category === category);
                if (itemsInCategory.length > 0) {
                    // Collapsible only on mobile; fully open on desktop
                    let sectionHTML = `
                        <div class="category-section ${isMobile ? 'collapsed' : ''}" dir="rtl" id="category-sec-${idx}">
                            <h3 class="category-header" ${isMobile ? `onclick="toggleSection('category-sec-${idx}')"` : ''}>
                                <span class="category-title-text">${category}</span>
                                <span class="chevron">${isMobile ? '▼' : ''}</span>
                            </h3>
                            <div class="category-content">
                                <div class="menu-grid">
                    `;

                    itemsInCategory.forEach(item => {
                        let breadHTML = '';
                        if (item.breadOptions && item.breadOptions.length > 0) {
                            breadHTML = `
                                <div class="bread-badges">
                                    ${item.breadOptions.map(opt => `<span class="bread-badge">${opt}</span>`).join('')}
                                </div>
                            `;
                        }

                        sectionHTML += `
                            <div class="card square-card">
                                <div class="card-info">
                                    <h3 class="item-name">${item.name}</h3>
                                    <p class="item-desc">${item.description || ''}</p>
                                    ${breadHTML}
                                </div>
                                <div class="item-price">${item.price} EGP</div>
                            </div>
                        `;
                    });

                    sectionHTML += `
                                </div>
                            </div>
                        </div>
                    `;
                    menuContainer.innerHTML += sectionHTML;
                }
            });
        }

        // ---- OFFERS ----
        const offersSection = document.getElementById('offers');
        const offersContainer = document.getElementById('offers-container');
        offersContainer.innerHTML = '';

        if (!offers || offers.length === 0) {
            offersSection.style.display = 'none';
        } else {
            offersSection.style.display = 'block';
            offers.forEach(offer => {
                const priceHTML = offer.price ? `<div style="font-size: 1.5rem; font-weight: 800; margin-top: 1rem;">${offer.price} EGP</div>` : '';
                offersContainer.innerHTML += `
                    <div class="card offer-card square-card" dir="rtl" style="text-align: right; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white;">
                        <div>
                            <h3 style="color: white; font-size: 1.3rem;">${offer.title}</h3>
                            <p style="color: #f3f4f6; font-size: 0.9rem; margin-top: 0.5rem;">${offer.description || ''}</p>
                        </div>
                        ${priceHTML}
                    </div>
                `;
            });
        }

        // ---- PHONE ----
        const phone = settings && settings.phone ? settings.phone : '01012345678';
        document.getElementById('phone-display').innerText = phone;

    } catch (error) {
        console.error('Error loading content from Sanity:', error);
        document.getElementById('menu-container').innerHTML = '<p style="text-align:center; color: gray;">Loading menu...</p>';
    }
}
