// Sanity Configuration
const SANITY_PROJECT_ID = 'ksse299y';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2021-06-07';

function sanityQuery(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;
    return fetch(url).then(res => res.json()).then(data => data.result);
}

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
            const categories = [...new Set(menuItems.map(item => item.category))];

            categories.forEach(category => {
                const itemsInCategory = menuItems.filter(item => item.category === category);
                if (itemsInCategory.length > 0) {
                    let sectionHTML = `
                        <div class="category-section" dir="rtl">
                            <h3 class="category-title">${category}</h3>
                            <div class="menu-grid">
                    `;

                    itemsInCategory.forEach(item => {
                        sectionHTML += `
                            <div class="card square-card">
                                <div>
                                    <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--secondary);">${item.name}</h3>
                                    <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 1rem;">${item.description || ''}</p>
                                </div>
                                <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${item.price} EGP</div>
                            </div>
                        `;
                    });

                    sectionHTML += `
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
                    <div class="card offer-card square-card" dir="rtl" style="text-align: right; background: linear-gradient(135deg, var(--primary), #ff6b81); color: white;">
                        <div>
                            <h3 style="color: white;">${offer.title}</h3>
                            <p style="color: #f1f2f6;">${offer.description || ''}</p>
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
        // Fallback: show a message
        document.getElementById('menu-container').innerHTML = '<p style="text-align:center; color: gray;">Loading menu...</p>';
    }
}
