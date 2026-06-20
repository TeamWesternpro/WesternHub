// app.js - Core functionality for WesternHub

const storageKey = 'WesternHub_data';
let currentFilter = 'All';

function getTrailers() {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
}

function saveTrailer(trailer) {
    const trailers = getTrailers();
    trailers.push(trailer);
    localStorage.setItem(storageKey, JSON.stringify(trailers));
}

// Filter logic
function filterTrailers(tag, element) {
    currentFilter = tag;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    renderTrailers();
}

// Rendering
function renderTrailers() {
    const container = document.getElementById('trailers');
    if (!container) return;

    const trailers = getTrailers();
    container.innerHTML = '';

    const filtered = trailers.filter(t => currentFilter === 'All' || t.tag === currentFilter);

    if (filtered.length === 0) {
        container.innerHTML = `<p style="color: var(--text-gray); grid-column: 1/-1; text-align: center; padding: 3rem;">No ${currentFilter === 'All' ? '' : currentFilter} trailers found.</p>`;
        return;
    }

    filtered.forEach((trailer, index) => {
        const card = document.createElement('div');
        card.className = 'trailer-card';
        card.onclick = () => openModal(trailers.indexOf(trailer)); // Use original index
        
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${trailer.poster || 'https://placehold.co/400x600/141414/ff0000?text=No+Poster'}" alt="${trailer.name}" class="card-img">
                <div class="card-overlay">
                    <div class="card-tag">${trailer.tag}</div>
                    <h3 class="card-title">${trailer.name}</h3>
                    <p class="card-desc">${trailer.description.substring(0, 100)}${trailer.description.length > 100 ? '...' : ''}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Modal logic
function formatDate(dateStr) {
    if (!dateStr) return 'TBA';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    const day = parts[0];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
    const year = parts[2];
    return `${day} ${month} ${year}`;
}

function openModal(index) {
    const trailers = getTrailers();
    const trailer = trailers[index];
    const modal = document.getElementById('trailerModal');

    document.getElementById('modalImg').src = trailer.poster || 'https://placehold.co/400x600/141414/ff0000?text=No+Poster';
    document.getElementById('modalTag').textContent = trailer.tag;
    document.getElementById('modalTitle').textContent = trailer.name;
    document.getElementById('modalDesc').textContent = trailer.description;
    document.getElementById('modalDateTrailer').textContent = formatDate(trailer.releaseDateTrailer);
    document.getElementById('modalDateMovie').textContent = formatDate(trailer.releaseDateMovie);

    const youtubeBtn = document.getElementById('watchBtn');
    if (trailer.youtube) {
        youtubeBtn.href = trailer.youtube;
        youtubeBtn.style.display = 'inline-flex';
    } else {
        youtubeBtn.style.display = 'none';
    }

    const networkCont = document.getElementById('modalNetworkContainer');
    if (trailer.tag === 'TV' && trailer.network) {
        networkCont.classList.remove('hidden');
        document.getElementById('modalNetwork').textContent = trailer.network;
    } else {
        networkCont.classList.add('hidden');
    }

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('trailerModal').classList.remove('active');
}

window.onclick = function(event) {
    const modal = document.getElementById('trailerModal');
    if (event.target == modal) {
        closeModal();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    renderTrailers();
});
