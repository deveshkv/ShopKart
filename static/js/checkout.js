document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');

    function showPopup(message) {
        let popup = document.createElement('div');
        popup.className = 'popup-message';
        popup.textContent = message;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.remove();
        }, 10000);
    }

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const street = document.getElementById('street').value.trim();
        const city = document.getElementById('city').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const email = document.getElementById('email').value.trim();
        const pincode = document.getElementById('pincode').value.trim();
        const payment_method = document.getElementById('payment-method').value;

        if (!street || !city || !mobile || !email || !pincode) {
            showPopup('Please fill all required fields.');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            showPopup('Your cart is empty.');
            return;
        }

        try {
            for (const item of cart) {
                const order = {
                    items: [item],
                    address: { street, city, mobile, email, pincode },
                    payment_method
                };
                const response = await fetch('/api/place_order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(order)
                });
                if (!response.ok) {
                    throw new Error('Failed to place order');
                }
            }
            showPopup('Order placed successfully!');
            localStorage.removeItem('cart');
            setTimeout(() => {
                window.location.href = '/orders';
            }, 3000);
        } catch (error) {
            console.error(error);
            showPopup('Failed to place order. Please try again.');
        }
    });
});
