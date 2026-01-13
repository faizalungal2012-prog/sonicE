// show cart toggle
(function () {
    // robust cart toggle: try id first, then class; add a console log for debugging
    const cartInfo = document.getElementById('cart-info') || document.querySelector('.cart-info');
    const cart = document.getElementById('cart');
    if (!cartInfo) {
        console.warn('cart-info element not found');
        return;
    }

    cartInfo.addEventListener('click', function (e) {
        e.preventDefault();
        // force open the cart (don't toggle) so a click always opens the cart panel
        cart.classList.add('show-cart');
        // debugging aid: log current visibility state
        console.log('Cart opened via cart-info click. Now visible=', cart.classList.contains('show-cart'));
    });

    // also support keyboard toggle (Enter/Space)
    cartInfo.setAttribute('tabindex', '0');
    cartInfo.addEventListener('keyup', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            // force open on keyboard activation as well
            cart.classList.add('show-cart');
            console.log('Cart opened via keyboard. Now visible=', cart.classList.contains('show-cart'));
        }
    });
})();

// direct icon listener to guarantee toggle when icon is clicked
(function () {
    const icon = document.querySelector('.cart-info__icon');
    const cart = document.getElementById('cart');
    if (!icon || !cart) return;

    // click on the icon span (or the inner <i>) should toggle the cart
    icon.addEventListener('click', function (e) {
        e.preventDefault();
        // force open the cart when the icon is clicked
        cart.classList.add('show-cart');
        console.log('Cart icon clicked. Now visible=', cart.classList.contains('show-cart'));
    });
    // also attach to inner <i> if present
    const inner = icon.querySelector('i');
    if (inner) {
        inner.addEventListener('click', function (e) {
            e.preventDefault();
            cart.classList.add('show-cart');
            console.log('Cart icon (i) clicked. Now visible=', cart.classList.contains('show-cart'));
        });
    }
})();

// Helper: localStorage cart
function getStoredCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function setStoredCart(arr) {
    localStorage.setItem('cart', JSON.stringify(arr));
}

// detect currency symbol used in the store (fallback to ﷼)
const CURRENCY_SYMBOL = (function () {
    try {
        const el = document.querySelector('.store-item-value');
        if (!el) return '﷼';
        // remove digits, dots, commas and whitespace to leave the symbol(s)
        const sym = el.textContent.replace(/[\d.,\s]/g, '').trim();
        return sym || '﷼';
    } catch (e) {
        return '﷼';
    }
})();

// Build cart UI from storage on load
(function buildCartFromStorage() {
    const cartArray = getStoredCart();
    if (cartArray.length === 0) {
        showTotals();
        return;
    }
    const cart = document.getElementById('cart');
    const totalContainer = document.querySelector('.cart-total-container');
    cartArray.forEach(function (item) {
        const cartItem = createCartItemElement(item);
        cart.insertBefore(cartItem, totalContainer);
    });
    showTotals();
})();

// Create cart item element
function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item', 'd-flex', 'justify-content-between', 'text-capitalize', 'my-3');
    cartItem.innerHTML = `
        <img src="${item.img}" class="img-fluid rounded-circle" id="item-img" alt="">
        <div class="item-text">
            <p class="cart-item-title font-weight-bold mb-0">${item.name}</p>
            <span>${CURRENCY_SYMBOL}</span>
            <span class="cart-item-price mb-0">${item.price}</span>
        </div>
        <a href="#" class="cart-item-remove">
            <i class="fas fa-trash"></i>
        </a>
    `;
    return cartItem;
}

// show Totals - reads from DOM cart-items
function showTotals() {
    const totals = [];
    const items = document.querySelectorAll('.cart-item-price');
    items.forEach(function (item) {
        const parsed = parseFloat(item.textContent);
        totals.push(isNaN(parsed) ? 0 : parsed);
    });
    const totalMoney = totals.reduce((sum, n) => sum + n, 0);
    const finalMoney = totalMoney.toFixed(2);
    document.getElementById('cart-total').textContent = finalMoney;
    document.querySelector('.item-total').textContent = finalMoney;
    document.getElementById('item-count').textContent = totals.length;
}

// add items to the cart (handles clicks on store icons)
(function () {
    const cartBtn = document.querySelectorAll('.store-item-icon');

    cartBtn.forEach(function (btn) {
        btn.addEventListener('click', function (event) {
            // guard against duplicate handler runs (debounce per item)
            window._lastAdd = window._lastAdd || {};
            // find the correct container
            const icon = event.target.closest('.store-item-icon');
            if (!icon) return;

            // image path
            let imgEl = icon.previousElementSibling;
            const fullPath = imgEl ? imgEl.src : '';
            let pos = fullPath.indexOf('img');
            let partPath = pos >= 0 ? fullPath.slice(pos + 3) : fullPath;

            const item = {};
            item.img = `img-cart${partPath}`;

            // name and price traversal (based on current HTML structure)
            const cardBody = icon.parentElement.nextElementSibling;
            const name = (cardBody.querySelector('h5') && cardBody.querySelector('h5').textContent.trim()) || 'item';
            const priceText = (cardBody.querySelector('.store-item-value') && cardBody.querySelector('.store-item-value').textContent) || '';
            // strip anything that's not a digit, dot or minus sign to get a clean number
            const numeric = priceText.replace(/[^\d.\-]/g, '');
            let parsed = parseFloat(numeric);
            if (isNaN(parsed)) parsed = 0;

            item.name = name;
            item.price = parsed.toFixed(2);

            // debounce by item identity: ignore if same item was added in the last 700ms
            const key = `${item.name}|${item.price}`;
            const now = Date.now();
            if (window._lastAdd[key] && now - window._lastAdd[key] < 700) {
                console.log('Ignored duplicate add for', key);
                return;
            }
            window._lastAdd[key] = now;

            // insert into DOM
            const cart = document.getElementById('cart');
            const total = document.querySelector('.cart-total-container');
            const cartItemEl = createCartItemElement(item);
            cart.insertBefore(cartItemEl, total);

            // update storage
            const cartArray = getStoredCart();
            // push, but guard if the last stored item is identical (extra safety)
            if (cartArray.length === 0 || !(cartArray[cartArray.length - 1].name === item.name && parseFloat(cartArray[cartArray.length - 1].price).toFixed(2) === item.price)) {
                cartArray.push(item);
                setStoredCart(cartArray);
            } else {
                console.log('Skipped storing duplicate consecutive item', item.name);
            }

            // small visual feedback
            // (avoiding alert for smoother UX)

            showTotals();
        });
    });
})();

// Remove item and Clear Cart handlers (using event delegation)
(function () {
    const cart = document.getElementById('cart');

    // remove single item
    cart.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.cart-item-remove');
        if (!removeBtn) return;
        const cartItemEl = removeBtn.closest('.cart-item');
        if (!cartItemEl) return;

        // identify by name + price
        const name = cartItemEl.querySelector('.cart-item-title').textContent.trim();
        const price = cartItemEl.querySelector('.cart-item-price').textContent.trim();

        // remove from DOM
        cartItemEl.remove();

        // remove from storage (first matching)
        let cartArray = getStoredCart();
        const idx = cartArray.findIndex(i => i.name === name && parseFloat(i.price).toFixed(2) === parseFloat(price).toFixed(2));
        if (idx > -1) {
            cartArray.splice(idx, 1);
            setStoredCart(cartArray);
        }

        showTotals();
    });

    // clear cart button
    const clearBtn = document.getElementById('clear-cart');
    clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // remove all cart-item elements
        const items = document.querySelectorAll('.cart .cart-item');
        items.forEach(i => i.remove());
        // clear storage
        setStoredCart([]);
        showTotals();
    });
})();
