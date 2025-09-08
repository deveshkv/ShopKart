document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('orders-list');

    async function loadOrders() {
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const orders = await response.json();
            ordersList.innerHTML = '';
            if (orders.length === 0) {
                ordersList.innerHTML = '<p>No orders placed yet.</p>';
                return;
            }
            orders.forEach((order, index) => {
                const div = document.createElement('div');
                div.className = 'order-item';
                const itemsList = order.items.map(i => i.name + ' (₹' + i.price + ')').join(', ');
                div.innerHTML = `
                    <div>
                        <strong>Order #${index + 1}</strong><br/>
                        Items: ${itemsList}<br/>
                        Address: ${order.address.street}, ${order.address.city}, ${order.address.pincode}<br/>
                        Mobile: ${order.address.mobile}<br/>
                        Email: ${order.address.email}<br/>
                        Payment Method: ${order.payment_method}
                    </div>
                `;
                ordersList.appendChild(div);
            });
        } catch (error) {
            console.error(error);
            ordersList.innerHTML = '<p>Failed to load orders.</p>';
        }
    }

    loadOrders();

    const clearBtn = document.getElementById('clear-orders-btn');
    clearBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/clear_orders', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to clear orders');
            const result = await response.json();
            alert(result.message);
            loadOrders();
        } catch (error) {
            console.error(error);
            alert('Failed to clear orders');
        }
    });
});
