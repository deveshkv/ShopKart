document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const filterBtn = document.getElementById('filter-btn');
    const filterPanel = document.getElementById('filter-panel');
    const applyFilterBtn = document.getElementById('apply-filter-btn');
    const productsList = document.getElementById('products-list');

    let allProducts = []; // Store all fetched products
    let filteredProducts = []; // Store filtered products

    // Function to get cart from localStorage
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Function to save cart to localStorage
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // Function to add product to cart
    function addToCart(product) {
        const cart = getCart();
        const existing = cart.find(item => item.title === product.title || item.name === product.name);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart(cart);
        alert(`Added ${product.title || product.name} to cart.`);
    }

    // Function to update cart count
    function updateCartCount() {
        const cart = getCart();
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        document.getElementById('cart-count').textContent = count;
    }

    // Update cart count on load
    updateCartCount();

    // Function to render products
    function renderProducts(products) {
        // Hide loader
        document.getElementById('loader').classList.add('hidden');
        productsList.innerHTML = '';
        if (products.length === 0) {
            productsList.innerHTML = '<p>No products found.</p>';
            return;
        }
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            const title = document.createElement('h3');
            title.textContent = product.title || product.name || 'Product';

            const img = document.createElement('img');
            img.src = product.image || '';
            img.alt = product.title || product.name || 'Product Image';
            img.style.width = '100%';
            img.style.height = '150px';
            img.style.objectFit = 'contain';

            const price = document.createElement('div');
            price.className = 'price';
            price.textContent = product.price ? `₹${product.price}` : 'Price not available';

            const rating = document.createElement('div');
            rating.className = 'rating';
            rating.textContent = product.rating ? `Rating: ${product.rating}` : 'No rating';

            const source = document.createElement('div');
            source.className = 'source';
            source.textContent = `Source: ${product.source}`;

            const link = document.createElement('a');
            link.href = product.url;
            link.target = '_blank';
            link.textContent = `View on ${product.source}`;
            link.className = 'product-link';

            const addToCartBtn = document.createElement('button');
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
            });

            productCard.appendChild(img);
            productCard.appendChild(title);
            productCard.appendChild(price);
            productCard.appendChild(rating);
            productCard.appendChild(source);
            productCard.appendChild(link);
            productCard.appendChild(addToCartBtn);

            productsList.appendChild(productCard);
        });
    }

    // Function to fetch products from backend API
    async function fetchProducts(query) {
        try {
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    // Show filter button after search
    function showFilterButton() {
        filterBtn.classList.remove('hidden');
    }

    // Hide filter button and panel
    function hideFilter() {
        filterBtn.classList.add('hidden');
        filterPanel.classList.add('hidden');
    }

    // Apply filters on products
    function applyFilters() {
        const priceMin = parseFloat(document.getElementById('filter-price-min').value) || 0;
        const priceMax = parseFloat(document.getElementById('filter-price-max').value) || Number.MAX_VALUE;
        const rating = parseFloat(document.getElementById('filter-rating').value) || 0;
        const brand = document.getElementById('filter-brand').value.trim().toLowerCase();
        const gender = document.getElementById('filter-gender').value;
        const ageRange = document.getElementById('filter-age-range').value;

        filteredProducts = allProducts.filter(product => {
            // Price filter
            const price = parseFloat(product.price) || 0;
            if (price < priceMin || price > priceMax) return false;

            // Rating filter (assuming product.rating exists)
            if (rating > 0 && (!product.rating || product.rating < rating)) return false;

            // Brand filter (assuming product.brand exists)
            if (brand && (!product.brand || !product.brand.toLowerCase().includes(brand))) return false;

            // Gender filter (assuming product.gender exists)
            if (gender && product.gender !== gender) return false;

            // Age range filter (assuming product.ageRange exists)
            if (ageRange && product.ageRange !== ageRange) return false;

            return true;
        });

        renderProducts(filteredProducts);
        filterPanel.classList.add('hidden');
    }

    // Event listeners
    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        // Show loader
        document.getElementById('loader').classList.remove('hidden');
        // Redirect to products page
        window.location.href = `/products?query=${encodeURIComponent(query)}`;
    });

    filterBtn.addEventListener('click', () => {
        filterPanel.classList.toggle('hidden');
    });

    applyFilterBtn.addEventListener('click', () => {
        applyFilters();
    });

    // Initial setup: hide filter button and panel
    hideFilter();
});

// Slideshow functionality
const images = [
    '/static/slideshow/Screenshot 2025-09-07 202012.png',
    '/static/slideshow/Screenshot 2025-09-07 215505.png',
    '/static/slideshow/Screenshot 2025-09-07 215559.png',
    '/static/slideshow/Screenshot 2025-09-07 215623.png',
    '/static/slideshow/Screenshot 2025-09-07 215644.png'
];

let currentIndex = 0;
const slideImage = document.getElementById('slide-image');

function changeImage() {
    currentIndex = (currentIndex + 1) % images.length;
    slideImage.src = images[currentIndex];
}

setInterval(changeImage, 3000);
