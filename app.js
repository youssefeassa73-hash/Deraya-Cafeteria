// Sanity Configuration
const SANITY_PROJECT_ID = 'ksse299y';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2021-06-07';

function sanityQuery(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;
    return fetch(url).then(res => res.json()).then(data => data.result);
}

// ---- CART SYSTEM STATE & CONTROLS ----
let cart = JSON.parse(localStorage.getItem('cafeteria_cart')) || [];

// Initialize or update the cart on page load
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    updateCartUI();
});

// Update the Cart count, totals, and dropdown list in the modal
function updateCartUI() {
    localStorage.setItem('cafeteria_cart', JSON.stringify(cart));
    
    // Update float button count
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalQty;
    
    // Update items inside modal list
    const cartItemsList = document.getElementById('cart-items-list');
    const totalPriceSpan = document.getElementById('cart-total-price');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p style="text-align: center; color: var(--text-light); margin: 2rem 0;">السلة فارغة حالياً</p>';
        totalPriceSpan.innerText = '0 EGP';
        return;
    }
    
    let listHTML = '';
    let grandTotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;
        
        listHTML += `
            <div class="cart-item-row" dir="rtl">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.displayName}</div>
                    <div class="cart-item-price">${item.price} EGP</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    <span style="font-weight: 700; min-width: 20px; text-align: center;">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                </div>
            </div>
        `;
    });
    
    cartItemsList.innerHTML = listHTML;
    totalPriceSpan.innerText = `${grandTotal} EGP`;
}

// Add item to cart with selected bread options (if applicable)
window.addToCart = function(itemId, name, price, btnElement) {
    // Find optional bread selection inside the card
    const card = btnElement.closest('.card');
    const select = card.querySelector('.bread-select');
    let optionText = '';
    if (select) {
        optionText = select.value;
    }
    
    const displayName = optionText ? `${name} (${optionText})` : name;
    
    // Check if matching item exists in cart
    const existingIndex = cart.findIndex(item => item.displayName === displayName);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            itemId: itemId,
            displayName: displayName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartUI();
    
    // Micro-interaction button feedback
    const originalText = btnElement.innerText;
    btnElement.innerText = 'تم الإضافة ✓';
    btnElement.style.backgroundColor = '#10b981'; // Green feedback
    btnElement.style.color = '#ffffff';
    btnElement.disabled = true;
    
    setTimeout(() => {
        btnElement.innerText = originalText;
        btnElement.style.backgroundColor = ''; // Reset CSS
        btnElement.style.color = '';
        btnElement.disabled = false;
    }, 900);
};

// Increment or decrement quantity
window.changeQty = function(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
};

// Modal toggles
window.openCart = function() {
    document.getElementById('cart-modal').style.display = 'flex';
};

window.closeCart = function() {
    document.getElementById('cart-modal').style.display = 'none';
};

// Process Checkout & Generate Order Receipt
window.processCheckout = function() {
    if (cart.length === 0) return;
    
    // Generate unique random 4-digit order number
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    
    // Render receipt details
    const receiptDetails = document.getElementById('receipt-details');
    let receiptHTML = '<h4 style="margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem;">تفاصيل الطلب:</h4>';
    let grandTotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;
        receiptHTML += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.9rem;">
                <span>${item.displayName} × ${item.quantity}</span>
                <span>${itemTotal} EGP</span>
            </div>
        `;
    });
    
    receiptHTML += `
        <div style="display: flex; justify-content: space-between; font-weight: 800; border-top: 2px dashed var(--border); margin-top: 0.5rem; padding-top: 0.5rem; font-size: 1.05rem;">
            <span>الإجمالي الكلي:</span>
            <span>${grandTotal} EGP</span>
        </div>
    `;
    
    receiptDetails.innerHTML = receiptHTML;
    document.getElementById('receipt-order-number').innerText = `#${orderNumber}`;
    
    // Toggle screens inside the modal
    document.getElementById('cart-view').style.display = 'none';
    document.getElementById('receipt-view').style.display = 'block';
    
    // Reset/Clear Cart
    cart = [];
    updateCartUI();
};

// Reset screen for a new order
window.resetNewOrder = function() {
    document.getElementById('receipt-view').style.display = 'none';
    document.getElementById('cart-view').style.display = 'block';
    closeCart();
};

// Close modal if user clicks outside of modal content
window.onclick = function(event) {
    const modal = document.getElementById('cart-modal');
    if (event.target === modal) {
        closeCart();
    }
};

// ---- END CART SYSTEM ----


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
                        // Static badges showing what bread options are available
                        let breadHTML = '';
                        if (item.breadOptions && item.breadOptions.length > 0) {
                            breadHTML = `
                                <div class="bread-badges">
                                    ${item.breadOptions.map(opt => `<span class="bread-badge">${opt}</span>`).join('')}
                                </div>
                            `;
                        }

                        // Dynamic selection dropdown inside card for checkout adding
                        let breadSelectHTML = '';
                        if (item.breadOptions && item.breadOptions.length > 0) {
                            breadSelectHTML = `
                                <select class="bread-select">
                                    ${item.breadOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                                </select>
                            `;
                        }

                        sectionHTML += `
                            <div class="card square-card">
                                <div class="card-info">
                                    <h3 class="item-name">${item.name}</h3>
                                    <p class="item-desc">${item.description || ''}</p>
                                    ${breadHTML}
                                </div>
                                <div class="card-action">
                                    ${breadSelectHTML}
                                    <button class="add-to-cart-btn" onclick="addToCart('${item._id}', '${item.name}', ${item.price}, this)">إضافة +</button>
                                </div>
                                <div class="item-price" style="margin-top: 0.5rem;">${item.price} EGP</div>
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

// Collapsible helper for mobile
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
