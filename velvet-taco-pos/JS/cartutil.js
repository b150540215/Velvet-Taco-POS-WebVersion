// cart-utils.js
function addToCart(item) {
    let cart = getCart();
    cart.push(item);
    updateLocalStorage(cart);
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateLocalStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCart() {
    updateLocalStorage([]);
}
