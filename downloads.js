const DOWNLOAD_KEY = 'WesternHub_downloads';
let currentFilter = 'All';

function getDownloads() {
    const data = localStorage.getItem(DOWNLOAD_KEY);
    return data ? JSON.parse(data) : [];
}

function filterDownloads(tag, element) {
    currentFilter = tag;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderDownloads();
}

function renderDownloads() {
    const container = document.getElementById('downloads');
    if (!container) return;

    const downloads = getDownloads();
    container.innerHTML = '';

    const filtered = downloads.filter(d => currentFilter === 'All' || d.tag === currentFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color: var(--text-gray); grid-column: 1/-1; text-align: center; padding: 3rem;">No downloads found.</p>';
        return;
    }

    filtered.forEach((item) => {
        const realIndex = downloads.indexOf(item);
        const card = document.createElement('div');
        card.className = 'trailer-card';

        const isAvailable = item.status === 'Available';

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${item.poster || 'https://placehold.co/400x600/141414/ff0000?text=No+Image'}" alt="${item.name}" class="card-img">
                <div class="card-overlay">
                    <div class="card-tag">${item.tag}</div>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-desc">${(item.description || '').substring(0, 100)}${(item.description || '').length > 100 ? '...' : ''}</p>
                </div>
            </div>
            <div class="download-card-footer">
                <span class="download-status ${item.status === 'Available' ? 'status-available' : 'status-out'}">${item.status}</span>
                <button class="download-btn ${isAvailable ? '' : 'disabled'}" onclick="${isAvailable ? `startDownload(${realIndex}, this)` : ''}" ${!isAvailable ? 'disabled' : ''}>
                    ${isAvailable ? 'Download' : 'Unavailable'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function startDownload(index, btn) {
    const downloads = getDownloads();
    const item = downloads[index];
    if (!item || !item.file) return;

    btn.disabled = true;
    let seconds = 10;
    btn.textContent = `Wait ${seconds}s`;

    const timer = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            btn.textContent = `Wait ${seconds}s`;
        } else {
            clearInterval(timer);
            btn.textContent = 'Downloading...';
            triggerDownload(item);
            setTimeout(() => {
                btn.textContent = 'Download';
                btn.disabled = false;
            }, 1000);
        }
    }, 1000);
}

function triggerDownload(item) {
    const a = document.createElement('a');
    a.href = item.file;
    a.download = item.fileName || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function openDownloadModal(index) {
    const downloads = getDownloads();
    const item = downloads[index];
    if (!item) return;

    const body = document.getElementById('downloadModalBody');
    const isAvailable = item.status === 'Available';

    body.innerHTML = `
        <div class="download-modal-layout">
            <div class="download-modal-img">
                <img src="${item.poster || 'https://placehold.co/400x600/141414/ff0000?text=No+Image'}" alt="${item.name}">
            </div>
            <div class="download-modal-info">
                <div class="card-tag">${item.tag}</div>
                <h2>${item.name}</h2>
                <p class="download-modal-desc">${item.description || 'No description provided.'}</p>
                <div class="download-modal-meta">
                    <div class="meta-item">
                        <span class="meta-label">Status</span>
                        <span class="meta-value ${item.status === 'Available' ? 'status-available' : 'status-out'}">${item.status}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Type</span>
                        <span class="meta-value">${item.tag}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">File</span>
                        <span class="meta-value">${item.fileName || 'N/A'}</span>
                    </div>
                </div>
                ${isAvailable && item.file ? `
                    <button class="download-btn download-btn-large" onclick="startDownloadFromModal(${index})" id="modalDownloadBtn">
                        Download Now
                    </button>
                ` : `
                    <button class="download-btn download-btn-large disabled" disabled>Out of Stock</button>
                `}
            </div>
        </div>
    `;

    document.getElementById('downloadModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function startDownloadFromModal(index) {
    const btn = document.getElementById('modalDownloadBtn');
    startDownload(index, btn);
}

function closeDownloadModal() {
    document.getElementById('downloadModal').classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    syncFromServer().then(renderDownloads);
});
