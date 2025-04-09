async function searchItem() {
    const itemId = document.getElementById('searchId').value.trim();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!itemId) {
        resultsDiv.innerHTML = '<p class="error">Please enter a product ID</p>';
        return;
    }

    try {
        const response = await fetch(`/api/item/${encodeURIComponent(itemId)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.displayed) {
            resultsDiv.innerHTML = `
                <div class="item-card">
                    <h3>${data.displayed.name}</h3>
                    <p>${data.displayed.description}</p>
                    <p class="price">$${data.displayed.price.toFixed(2)}</p>
                    <p>ID: ${data.displayed.id}</p>
                </div>
                ${data.allResults.length > 1 ? 
                    `<div class="debug-info">
                        <p>Other matches found: ${data.allResults.length - 1}</p>
                    </div>` : ''
                }
            `;
        } else {
            resultsDiv.innerHTML = '<p class="notice">No matching product found</p>';
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsDiv.innerHTML = `
            <p class="error">Error searching for item</p>
            <p class="debug">${error.message}</p>
        `;
    }
}

function logout() {
    fetch('/logout').then(() => window.location.href = '/login');
}