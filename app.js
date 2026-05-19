// Sanity Configuration
const SANITY_PROJECT_ID = 'ksse299y';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2021-06-07';
const SANITY_WRITE_TOKEN = 'sky3A8Tg8i5MbEfvEdqM5MQ3GDW9iLrXpuWf1b1zFIHPvHsBFMV8G4oZ5xgD8cCrkNEQYcXDCB2IwRXlAygdhalYBkB541di2BB6w7VpJhYjKjPm4nQqLlLhM4xUOcrNuaG1U7Lj4RXfPj5zRkx2uRuU3A3Z9AFIldtqHMQsCCLWe52srfu9'; // Paste your Sanity API token (with WRITE editor access) here to save orders to the dashboard!

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
    cleanupOldUnpaidOrders(); // Run silent background order cleaner on page load!
});

// Silent background old unpaid orders cleaner (deletes unpaid orders older than 40 minutes)
async function cleanupOldUnpaidOrders() {
    if (!SANITY_WRITE_TOKEN) return;
    try {
        const unpaidOrders = await sanityQuery('*[_type == "order" && status == "not_confirmed"]{_id, _createdAt}');
        if (!unpaidOrders || unpaidOrders.length === 0) return;

        const now = new Date();
        const fortyMinutesAgo = 40 * 60 * 1000;
        const idsToDelete = [];

        unpaidOrders.forEach(order => {
            const createdTime = new Date(order._createdAt);
            if (now - createdTime > fortyMinutesAgo) {
                idsToDelete.push(order._id);
            }
        });

        if (idsToDelete.length === 0) return;

        console.log(`Cleaning up ${idsToDelete.length} unpaid orders older than 40 minutes...`);

        const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`;
        const mutations = {
            mutations: idsToDelete.map(id => ({ delete: { id } }))
        };

        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SANITY_WRITE_TOKEN}`
            },
            body: JSON.stringify(mutations)
        });
        console.log('Old unpaid orders cleaned up successfully!');
    } catch (error) {
        console.error('Error cleaning up old unpaid orders:', error);
    }
}

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
window.processCheckout = async function() {
    if (cart.length === 0) return;
    
    // Read and validate customer Name & Phone
    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    
    const customerName = nameInput.value.trim();
    const customerPhone = phoneInput.value.trim();
    
    // Simple visual validation validation
    let isValid = true;
    if (!customerName) {
        nameInput.style.borderColor = '#ef4444';
        isValid = false;
    } else {
        nameInput.style.borderColor = '';
    }
    
    if (!customerPhone) {
        phoneInput.style.borderColor = '#ef4444';
        isValid = false;
    } else {
        phoneInput.style.borderColor = '';
    }
    
    if (!isValid) {
        alert('من فضلك أدخل الاسم ورقم الهاتف لتأكيد طلبك! (Please enter your name and phone number)');
        return;
    }
    
    // Generate unique random 4-digit order number
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    
    // Build ordered items string text for receipt details and Sanity database representation
    let receiptHTML = '<h4 style="margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem;">تفاصيل الطلب:</h4>';
    let itemsText = '';
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
        itemsText += `${item.displayName} × ${item.quantity} (${itemTotal} EGP)\n`;
    });
    
    receiptHTML += `
        <div style="display: flex; justify-content: space-between; font-weight: 800; border-top: 2px dashed var(--border); margin-top: 0.5rem; padding-top: 0.5rem; font-size: 1.05rem;">
            <span>الإجمالي الكلي:</span>
            <span>${grandTotal} EGP</span>
        </div>
    `;
    
    const receiptDetails = document.getElementById('receipt-details');
    receiptDetails.innerHTML = receiptHTML;
    document.getElementById('receipt-order-number').innerText = `#${orderNumber}`;
    
    // Write order data to Sanity dashboard
    if (SANITY_WRITE_TOKEN) {
        const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`;
        const orderDoc = {
            mutations: [
                {
                    create: {
                        _type: 'order',
                        orderNumber: String(orderNumber),
                        customerName: customerName,
                        customerPhone: customerPhone,
                        items: itemsText,
                        totalPrice: grandTotal,
                        status: 'not_confirmed',
                        createdAt: new Date().toISOString()
                    }
                }
            ]
        };
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SANITY_WRITE_TOKEN}`
            },
            body: JSON.stringify(orderDoc)
        })
        .then(res => res.json())
        .then(data => {
            console.log('Order logged in Sanity successfully:', data);
        })
        .catch(err => {
            console.error('Error saving order to Sanity:', err);
        });
    } else {
        console.warn('SANITY_WRITE_TOKEN is missing. Order logged locally only.');
    }
    
    // Toggle screens inside the modal
    document.getElementById('cart-view').style.display = 'none';
    document.getElementById('receipt-view').style.display = 'block';
    
    // Reset/Clear Cart
    cart = [];
    updateCartUI();
};

// Download Printable PDF Receipt Helper
window.downloadReceiptPDF = function() {
    const orderNum = document.getElementById('receipt-order-number').innerText;
    const name = document.getElementById('cust-name').value || 'عميل';
    const phone = document.getElementById('cust-phone').value || '';
    const detailsHTML = document.getElementById('receipt-details').innerHTML;
    
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>Deraya Cafeteria - Receipt ${orderNum}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 20px;
                    direction: rtl;
                    text-align: center;
                    color: #111;
                    max-width: 320px;
                    margin: 0 auto;
                }
                .header {
                    border-bottom: 2px dashed #ccc;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                .logo {
                    font-size: 1.6rem;
                    font-weight: 800;
                    margin-bottom: 5px;
                }
                .order-num {
                    font-size: 2.2rem;
                    font-weight: 800;
                    margin: 10px 0;
                    background-color: #f3f4f6;
                    padding: 8px;
                    border-radius: 4px;
                }
                .cust-info {
                    text-align: right;
                    font-size: 0.85rem;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                    line-height: 1.5;
                }
                .details {
                    text-align: right;
                    font-size: 0.9rem;
                    line-height: 1.6;
                }
                .notice {
                    background-color: #fef2f2;
                    border: 1px solid #fee2e2;
                    border-radius: 6px;
                    color: #b91c1c;
                    padding: 8px;
                    margin-top: 15px;
                    font-size: 0.85rem;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 0.85rem;
                    color: #666;
                    border-top: 2px dashed #ccc;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Deraya Cafeteria</div>
                <div style="font-size: 0.85rem; color: #666;">فاتورة طلب رقم:</div>
                <div class="order-num">${orderNum}</div>
                <div style="font-size: 0.75rem; color: #666;">التاريخ: ${new Date().toLocaleString('ar-EG')}</div>
            </div>
            <div class="cust-info">
                <strong>العميل الكريم:</strong> ${name}<br>
                <strong>رقم الجوال:</strong> ${phone}
            </div>
            <div class="details">
                ${detailsHTML}
            </div>
            <div class="notice">
                ⚠️ تنبيه هام: يجب التوجه إلى الكاشير ودفع الحساب <strong>في خلال 30 دقيقة</strong> لتأكيد الطلب وبدء تحضيره، وإلا سيتم إلغاء الطلب وحذفه تلقائياً!
            </div>
            <div class="footer">
                شكرًا لزيارتكم! بالهناء والشفاء ☕🍔
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                }
            </scrip` + `t>
        </body>
        </html>
    `);
    printWindow.document.close();
};

// Reset screen for a new order
window.resetNewOrder = function() {
    // Reset Name and Phone inputs
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    
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
                const priceHTML = offer.price ? `<div style="font-size: 1.3rem; font-weight: 800; margin-top: 0.5rem; color: white;">${offer.price} EGP</div>` : '';
                const buttonHTML = offer.price ? `
                    <div class="card-action" style="margin-top: 0.75rem;">
                        <button class="add-to-cart-btn" style="background-color: white; color: var(--primary); font-weight: 800; width: 100%; border: none;" onclick="addToCart('${offer._id}', '${offer.title}', ${offer.price}, this)">إضافة للعرض +</button>
                    </div>
                ` : '';
                
                offersContainer.innerHTML += `
                    <div class="card offer-card square-card" dir="rtl" style="text-align: right; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; flex-direction: column; justify-content: space-between; min-height: 180px;">
                        <div>
                            <h3 style="color: white; font-size: 1.3rem; margin-bottom: 0.25rem;">${offer.title}</h3>
                            <p style="color: #f3f4f6; font-size: 0.85rem; margin-bottom: 0.5rem;">${offer.description || ''}</p>
                        </div>
                        <div>
                            ${priceHTML}
                            ${buttonHTML}
                        </div>
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
