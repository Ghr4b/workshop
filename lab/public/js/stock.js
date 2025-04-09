function checkStock() {
    const productId = document.getElementById('stockId').value;
    fetch(`/api/stock/${encodeURIComponent(productId)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('stockResult').innerHTML = 
                data.in_stock ? "Item is in stock" : "Item not found or out of stock";
        })
        .catch(error => {
            console.error('Stock check error:', error);
            document.getElementById('stockResult').innerHTML = 'Error checking stock';
        });
}

function logout() {
    fetch('/logout').then(() => window.location.href = '/login');
}