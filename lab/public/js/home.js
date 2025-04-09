document.addEventListener('DOMContentLoaded', () => {
    loadAllItems();
});

function loadAllItems() {
    fetch('/api/items')
        .then(response => response.json())
        .then(items => {
            const container = document.getElementById('items');
            container.innerHTML = items.map(item => `
                <div class="item-card">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p class="price">$${item.price.toFixed(2)}</p>
                    <p>ID: ${item.id}</p>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error loading items:', error));
}

function logout() {
    fetch('/logout').then(() => window.location.href = '/login');
}