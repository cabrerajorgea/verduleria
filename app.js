// --- CONFIGURATION & DATA ---
const WHATSAPP_NUMBER = "5491122334455"; // Placeholder number

const PRODUCTS = [
    { id: 1, name: "Tomate Perita", price: 1200, unit: "kg", category: "Verdulería", image: "assets/tomate.png" },
    { id: 2, name: "Banana Ecuador", price: 1500, unit: "kg", category: "Verdulería", image: "assets/banana.png" },
    { id: 3, name: "Papa Blanca", price: 800, unit: "kg", category: "Verdulería", image: "assets/papa.png" },
    { id: 4, name: "Manzana Roja", price: 1300, unit: "kg", category: "Verdulería", image: "assets/manzana_roja.png" },
    { id: 5, name: "Lechuga Capuchina", price: 1000, unit: "unidad", category: "Verdulería", image: "assets/imagen1.png" },
    { id: 6, name: "Zanahoria", price: 900, unit: "kg", category: "Verdulería", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400" },
    { id: 7, name: "Naranja Jugo", price: 1100, unit: "kg", category: "Verdulería", image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=400" },
    { id: 8, name: "Palta Hass", price: 2500, unit: "unidad", category: "Verdulería", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=400" },
    { id: 9, name: "Cebolla Morada", price: 1100, unit: "kg", category: "Verdulería", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=400" },
    { id: 10, name: "Uva Red Globe", price: 1800, unit: "kg", category: "Verdulería", image: "assets/uvas.png" },
    { id: 11, name: "Coca Cola 2.25L", price: 2500, unit: "unidad", category: "Bebidas", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400" },
    { id: 12, name: "Sprite 2.25L", price: 2500, unit: "unidad", category: "Bebidas", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400" },
    { id: 13, name: "Agua Saborizada Levite Pomelo 1.5L", price: 1500, unit: "unidad", category: "Bebidas", image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=400" },
    { id: 14, name: "Agua Saborizada Levite Manzana 1.5L", price: 1500, unit: "unidad", category: "Bebidas", image: "https://images.unsplash.com/photo-1600742518428-a3597fe21685?auto=format&fit=crop&q=80&w=400" },
];

// --- STATE MANAGEMENT ---
let cart = JSON.parse(localStorage.getItem('don_roberto_cart')) || [];

// --- DOM ELEMENTS ---
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const totalAmount = document.getElementById('totalAmount');
const viewCartBtn = document.getElementById('viewCartBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const cartItemsList = document.getElementById('cartItemsList');
const userNameInput = document.getElementById('userName');
const userAddressInput = document.getElementById('userAddress');
const userReferenceInput = document.getElementById('userReference');
const whatsappBtn = document.getElementById('whatsappBtn');

// --- FUNCTIONS ---

/**
 * Renders products in the grid
 */
function renderProducts(filter = "") {
    const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    
    // Group products by category
    const categories = {};
    filtered.forEach(p => {
        const cat = p.category || 'Otros';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(p);
    });

    let html = '';
    for (const cat in categories) {
        html += `<h2 class="category-title">${cat}</h2>`;
        html += categories[cat].map(product => `
            <div class="product-card fade-in">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <span class="product-name">${product.name}</span>
                    <span class="product-unit">x ${product.unit}</span>
                    <span class="product-price">$${product.price}</span>
                    <button class="add-btn" onclick="addToCart(${product.id})">
                        Agregar (+1)
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    productGrid.innerHTML = html;
}

/**
 * Adds an item to the cart
 */
function addToCart(productId) {
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        const product = PRODUCTS.find(p => p.id === productId);
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

/**
 * Decreases quantity or removes item
 */
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    }
    updateCart();
}

/**
 * Updates UI and LocalStorage
 */
function updateCart() {
    localStorage.setItem('don_roberto_cart', JSON.stringify(cart));
    
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    totalAmount.innerText = `$${subtotal}`;
    
    viewCartBtn.disabled = cart.length === 0;
    renderCartItems();
    
    // Manual Update total wording if needed (e.g. "Ver Pedido (3)")
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    viewCartBtn.innerText = `Ver Pedido (${totalCount})`;
}

/**
 * Renders items inside the modal
 */
function renderCartItems() {
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin:20px 0;">Tu carrito está vacío</p>';
        return;
    }

    cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>$${item.price} x ${item.quantity} = $${item.price * item.quantity}</p>
            </div>
            <div class="item-controls">
                <button class="qty-btn" onclick="removeFromCart(${item.id})">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="addToCart(${item.id})">+</button>
            </div>
        </div>
    `).join('');
}

/**
 * Format and send WhatsApp message
 */
function sendOrder() {
    const name = userNameInput.value.trim();
    const address = userAddressInput.value.trim();
    const reference = userReferenceInput.value.trim();
    
    if (!name) {
        alert("Por favor, ingresa tu nombre para continuar.");
        userNameInput.focus();
        return;
    }

    if (!address) {
        alert("Por favor, ingresa tu dirección para el envío.");
        userAddressInput.focus();
        return;
    }

    let message = `*Hola Don Roberto, quiero hacer un pedido:*\n\n`;
    cart.forEach(item => {
        message += `• ${item.name} x ${item.quantity} ${item.unit} - $${item.price * item.quantity}\n`;
    });
    
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    message += `\n*Total: $${subtotal}*\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Dirección:* ${address}`;
    if (reference) {
        message += `\n*Referencias:* ${reference}`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// --- EVENT LISTENERS ---

searchInput.addEventListener('input', (e) => {
    renderProducts(e.target.value);
});

viewCartBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
    renderCartItems();
});

closeModal.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

whatsappBtn.addEventListener('click', sendOrder);

// Close modal when clicking outside content
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});

// Initialize
renderProducts();
updateCart();
console.log("SPA initialized successfully.");

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registrado exitosamente con scope:', registration.scope);
            })
            .catch(error => {
                console.log('Fallo en registro de SW:', error);
            });
    });
}
