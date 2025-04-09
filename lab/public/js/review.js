let currentRating = 0;

document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.stars i');
    const ratingText = document.getElementById('selected-rating');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.getAttribute('data-value'));
            updateStars();
            ratingText.textContent = currentRating;
        });

        star.addEventListener('mouseover', function() {
            highlightStars(parseInt(this.getAttribute('data-value')));
        });

        star.addEventListener('mouseout', function() {
            highlightStars(currentRating);
        });
    });

    document.getElementById('submitReviewBtn').addEventListener('click', submitReview);
});

function highlightStars(count) {
    document.querySelectorAll('.stars i').forEach(star => {
        const value = parseInt(star.getAttribute('data-value'));
        star.className = value <= count ? 'bi bi-star-fill' : 'bi bi-star';
    });
}

function updateStars() {
    highlightStars(currentRating);
}

function submitReview(event) {
    event.preventDefault();
    
    const productId = document.getElementById('reviewId').value.trim();
    
    if (!productId) {
        showError('Please enter a Product ID');
        return;
    }
    
    if (currentRating === 0) {
        showError('Please select a rating');
        return;
    }
    
    fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating: currentRating })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(data.message);
            resetForm();
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        console.error('Review error:', error);
        showError('Error submitting rating. Please try again.');
    });
}

function showError(message) {
    const element = document.getElementById('reviewResult');
    element.innerHTML = message;
    element.style.color = 'red';
}

function showSuccess(message) {
    const element = document.getElementById('reviewResult');
    element.innerHTML = message;
    element.style.color = 'green';
}

function resetForm() {
    document.getElementById('reviewId').value = '';
    currentRating = 0;
    updateStars();
    document.getElementById('selected-rating').textContent = '0';
}

function logout() {
    fetch('/logout').then(() => window.location.href = '/login');
}