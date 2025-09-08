from flask import Flask, render_template, request, jsonify, session
import requests
from bs4 import BeautifulSoup
import re

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Needed for session management

# Helper function to extract brand from text
def extract_brand(text):
    words = text.split()
    if words:
        return words[0]
    return ''

# Helper function to extract color from text
def extract_color(text):
    colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey', 'silver', 'gold']
    text_lower = text.lower()
    for color in colors:
        if color in text_lower:
            return color.capitalize()
    return ''

# Helper function to scrape Flipkart
def scrape_flipkart(query, rating_filter=None, price_min=None, price_max=None):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    search_url = f"https://www.flipkart.com/search?q={query}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off"
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    products = []

    # Flipkart product containers
    product_cards = soup.find_all('div', {'data-id': True})
    for card in product_cards:
        name_tag = card.find('div', {'class': '_4rR01T'})
        if not name_tag:
            name_tag = card.find('a', {'class': 's1Q9rs'})
        if not name_tag:
            continue
        name = name_tag.text.strip()

        desc = ''
        # Flipkart does not have separate description, so use name as desc
        desc = name

        brand = extract_brand(name)
        color = extract_color(name + ' ' + desc)

        price_tag = card.find('div', {'class': '_30jeq3 _1_WHN1'})
        if not price_tag:
            price_tag = card.find('div', {'class': '_30jeq3'})
        if not price_tag:
            continue
        price_text = price_tag.text.strip()
        price = int(re.sub(r'[^\d]', '', price_text))

        rating_tag = card.find('div', {'class': '_3LWZlK'})
        rating = float(rating_tag.text.strip()) if rating_tag else 0.0

        # Get product URL
        link_tag = card.find('a', href=True)
        product_url = ''
        if link_tag:
            product_url = 'https://www.flipkart.com' + link_tag['href']

        # Get product image URL
        img_tag = card.find('img', {'class': '_396cs4 _3exPp9'})
        if not img_tag:
            img_tag = card.find('img', {'class': '_2r_T1I'})
        img_url = img_tag['src'] if img_tag else ''

        # Apply filters
        if rating_filter and rating < rating_filter:
            continue
        if price_min and price < price_min:
            continue
        if price_max and price > price_max:
            continue

        product = {
            'name': name,
            'description': desc,
            'price': price,
            'rating': rating,
            'source': 'Flipkart',
            'url': product_url,
            'image': img_url,
            'brand': brand,
            'color': color
        }
        products.append(product)
    return products

# Helper function to scrape Amazon
def scrape_amazon(query, rating_filter=None, price_min=None, price_max=None):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    search_url = f"https://www.amazon.in/s?k={query}"
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    products = []

    product_cards = soup.find_all('div', {'data-component-type': 's-search-result'})
    for card in product_cards:
        name_tag = card.h2
        if not name_tag:
            continue
        name = name_tag.text.strip()

        desc = name  # No separate description

        brand = extract_brand(name)
        color = extract_color(name + ' ' + desc)

        price_whole = card.find('span', {'class': 'a-price-whole'})
        price_fraction = card.find('span', {'class': 'a-price-fraction'})
        if price_whole:
            price_text = price_whole.text.strip()
            if price_fraction:
                price_text += price_fraction.text.strip()
            price = int(re.sub(r'[^\d]', '', price_text))
        else:
            continue

        rating_tag = card.find('span', {'class': 'a-icon-alt'})
        rating = 0.0
        if rating_tag:
            rating_match = re.search(r'(\d+(\.\d+)?) out of 5 stars', rating_tag.text)
            if rating_match:
                rating = float(rating_match.group(1))

        # Get product URL
        link_tag = card.find('a', {'class': 'a-link-normal'}, href=True)
        product_url = ''
        if link_tag:
            product_url = 'https://www.amazon.in' + link_tag['href']

        # Get product image URL
        img_tag = card.find('img', {'class': 's-image'})
        img_url = img_tag['src'] if img_tag else ''

        # Apply filters
        if rating_filter and rating < rating_filter:
            continue
        if price_min and price < price_min:
            continue
        if price_max and price > price_max:
            continue

        product = {
            'name': name,
            'description': desc,
            'price': price,
            'rating': rating,
            'source': 'Amazon',
            'url': product_url,
            'image': img_url,
            'brand': brand,
            'color': color
        }
        products.append(product)
    return products

# Helper function to scrape Myntra
def scrape_myntra(query, rating_filter=None, price_min=None, price_max=None):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    search_url = f"https://www.myntra.com/search?q={query}"
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    products = []

    # Myntra product containers (assuming similar structure)
    product_cards = soup.find_all('div', {'class': 'product-productMetaInfo'})
    for card in product_cards:
        name_tag = card.find('h3', {'class': 'product-brand'})
        if not name_tag:
            continue
        name = name_tag.text.strip()

        desc_tag = card.find('h4', {'class': 'product-product'})
        desc = desc_tag.text.strip() if desc_tag else name

        brand = name  # For Myntra, name is brand
        color = extract_color(desc + ' ' + name)

        price_tag = card.find('span', {'class': 'product-discountedPrice'})
        if not price_tag:
            price_tag = card.find('span', {'class': 'product-price'})
        if not price_tag:
            continue
        price_text = price_tag.text.strip()
        price = int(re.sub(r'[^\d]', '', price_text))

        rating = 0.0  # Myntra may not have ratings easily

        # Get product URL
        link_tag = card.find_parent('a', href=True)
        product_url = ''
        if link_tag:
            product_url = 'https://www.myntra.com' + link_tag['href']

        # Get product image URL
        img_tag = card.find_parent().find('img', {'class': 'img-responsive'})
        img_url = img_tag['src'] if img_tag else ''

        # Apply filters
        if rating_filter and rating < rating_filter:
            continue
        if price_min and price < price_min:
            continue
        if price_max and price > price_max:
            continue

        product = {
            'name': name,
            'description': desc,
            'price': price,
            'rating': rating,
            'source': 'Myntra',
            'url': product_url,
            'image': img_url,
            'brand': brand,
            'color': color
        }
        products.append(product)
    return products

# Helper function to scrape Google Shopping
def scrape_google_shopping(query, rating_filter=None, price_min=None, price_max=None):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    search_url = f"https://www.google.com/search?tbm=shop&q={query}"
    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    products = []

    product_cards = soup.find_all('div', {'class': 'sh-dgr__grid-result'})
    for card in product_cards:
        name_tag = card.find('h4', {'class': 'A2sOrd'})
        if not name_tag:
            continue
        name = name_tag.text.strip()

        desc = name  # No separate description

        brand = extract_brand(name)
        color = extract_color(name + ' ' + desc)

        price_tag = card.find('span', {'class': 'a8Pemb OFFNJ'})
        if not price_tag:
            price_tag = card.find('span', {'class': 'a8Pemb'})
        if not price_tag:
            continue
        price_text = price_tag.text.strip()
        price = int(re.sub(r'[^\d]', '', price_text))

        rating = 0.0  # Google Shopping may not have ratings easily

        link_tag = card.find('a', href=True)
        product_url = ''
        if link_tag:
            product_url = link_tag['href']

        img_tag = card.find('img')
        img_url = img_tag['src'] if img_tag else ''

        # Apply filters
        if rating_filter and rating < rating_filter:
            continue
        if price_min and price < price_min:
            continue
        if price_max and price > price_max:
            continue

        product = {
            'name': name,
            'description': desc,
            'price': price,
            'rating': rating,
            'source': 'Google Shopping',
            'url': product_url,
            'image': img_url,
            'brand': brand,
            'color': color
        }
        products.append(product)
    return products

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/orders')
def orders():
    return render_template('orders.html')

@app.route('/checkout')
def checkout():
    return render_template('checkout.html')

@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/api/search')
def search():
    query = request.args.get('query', '')
    rating = request.args.get('rating', type=float)
    price_min = request.args.get('price_min', type=int)
    price_max = request.args.get('price_max', type=int)

    flipkart_products = scrape_flipkart(query, rating, price_min, price_max)
    amazon_products = scrape_amazon(query, rating, price_min, price_max)
    myntra_products = scrape_myntra(query, rating, price_min, price_max)
    google_products = scrape_google_shopping(query, rating, price_min, price_max)
    # Combine amazon, myntra and google shopping products
    combined = amazon_products + myntra_products + google_products
    # Sort by price ascending
    combined.sort(key=lambda x: x['price'])
    return jsonify(combined)

@app.route('/api/place_order', methods=['POST'])
def place_order():
    order = request.json
    if 'orders' not in session:
        session['orders'] = []
    session['orders'].append(order)
    session.modified = True
    return jsonify({'message': 'Order placed successfully'})

@app.route('/api/orders')
def get_orders():
    orders = session.get('orders', [])
    return jsonify(orders)

@app.route('/api/clear_orders', methods=['POST'])
def clear_orders():
    session['orders'] = []
    return jsonify({'message': 'Orders cleared successfully'})

if __name__ == '__main__':
    app.run(debug=True)
