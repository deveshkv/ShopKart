document.addEventListener('DOMContentLoaded', () => {
    const cartItemsDiv = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = count;
        }
    }

    function loadCart() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsDiv.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
            checkoutBtn.disabled = true;
            return;
        }
        checkoutBtn.disabled = false;

        // Group items by name to show each as separate row with quantity
        const groupedItems = {};
        cart.forEach(item => {
            const key = item.name;
            if (!groupedItems[key]) {
                groupedItems[key] = { ...item, quantity: 0 };
            }
            groupedItems[key].quantity += item.quantity || 1;
        });

        Object.values(groupedItems).forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            total += itemTotal;
            div.innerHTML = `
                <input type="checkbox" class="item-select" data-index="${index}" checked />
                <img src="${item.image}" alt="${item.name}" width="50" />
                <strong>${item.name}</strong> - ₹${item.price} x
                <input type="number" class="quantity" data-index="${index}" value="${quantity}" min="1" />
                = ₹${itemTotal}
                <button class="remove-btn" data-index="${index}">Remove</button>
                <br/>
            `;
            cartItemsDiv.appendChild(div);
        });
        const totalDiv = document.createElement('div');
        totalDiv.innerHTML = `<strong>Total: ₹${total}</strong>`;
        cartItemsDiv.appendChild(totalDiv);

        // Add event listeners
        document.querySelectorAll('.item-select').forEach(checkbox => {
            checkbox.addEventListener('change', updateTotal);
        });
        document.querySelectorAll('.quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = e.target.dataset.index;
                cart[index].quantity = parseInt(e.target.value) || 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                loadCart();
            });
        });
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                loadCart();
            });
        });
    }

    function updateTotal() {
        let total = 0;
        document.querySelectorAll('.cart-item').forEach((div, index) => {
            const checkbox = div.querySelector('.item-select');
            if (checkbox && checkbox.checked) {
                const quantity = parseInt(div.querySelector('.quantity').value) || 1;
                total += cart[index].price * quantity;
            }
        });
        const totalDiv = cartItemsDiv.querySelector('div:last-child');
        if (totalDiv) {
            totalDiv.innerHTML = `<strong>Total: ₹${total}</strong>`;
        }
    }

    checkoutBtn.addEventListener('click', () => {
        // Filter selected items
        const selectedCart = [];
        document.querySelectorAll('.cart-item').forEach((div, index) => {
            const checkbox = div.querySelector('.item-select');
            if (checkbox && checkbox.checked) {
                selectedCart.push(cart[index]);
            }
        });
        localStorage.setItem('cart', JSON.stringify(selectedCart));
        window.location.href = '/checkout';
    });

    loadCart();
    updateCartCount();
});
