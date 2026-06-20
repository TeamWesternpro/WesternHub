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
        card.onclick = (e) => {
            if (!e.target.closest('.download-btn') && !e.target.closest('.download-action-area')) {
                openDownloadModal(realIndex);
            }
        };

        const isAvailable = item.status === 'Available';
        const isUpdated = item.updatedAt && (Date.now() - item.updatedAt < 7 * 24 * 60 * 60 * 1000);

        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${item.poster || 'https://placehold.co/400x600/141414/ff0000?text=No+Image'}" alt="${item.name}" class="card-img">
                ${isUpdated ? '<span class="download-updated-badge">Updated</span>' : ''}
                <div class="card-overlay">
                    <div class="card-tag">${item.tag}</div>
                    <h3 class="card-title">${item.name}</h3>
                    <p class="card-desc">${(item.description || '').substring(0, 100)}${(item.description || '').length > 100 ? '...' : ''}</p>
                </div>
            </div>
            <div class="download-card-footer">
                <span class="download-status ${item.status === 'Available' ? 'status-available' : 'status-out'}">${item.status}</span>
                <div class="download-action-area">
                    ${isAvailable && item.file ? `
                        <div class="download-countdown hidden" id="countdown-${realIndex}">
                            <svg class="countdown-ring" viewBox="0 0 36 36">
                                <circle class="countdown-ring-bg" cx="18" cy="18" r="15.9"></circle>
                                <circle class="countdown-ring-progress" cx="18" cy="18" r="15.9" id="ring-${realIndex}"></circle>
                            </svg>
                            <span class="countdown-text" id="timer-${realIndex}">10s</span>
                        </div>
                        <button class="download-btn ${isAvailable ? '' : 'disabled'}" onclick="startDownload(${realIndex}, this)" id="dlbtn-${realIndex}">
                            ${isUpdated ? 'Download New Version' : 'Download'}
                        </button>
                    ` : `
                        <button class="download-btn disabled" disabled>Unavailable</button>
                    `}
                </div>
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
    btn.style.display = 'none';

    const countdownEl = document.getElementById(`countdown-${index}`);
    const timerEl = document.getElementById(`timer-${index}`);
    const ringEl = document.getElementById(`ring-${index}`);

    if (countdownEl) {
        countdownEl.classList.remove('hidden');
    }

    let seconds = 10;
    const circumference = 2 * Math.PI * 15.9;

    if (ringEl) {
        ringEl.style.strokeDasharray = `${circumference} ${circumference}`;
        ringEl.style.strokeDashoffset = circumference;
    }

    const timer = setInterval(() => {
        seconds--;
        if (timerEl) timerEl.textContent = `${seconds}s`;

        if (ringEl) {
            const progress = (10 - seconds) / 10;
            const offset = circumference - (progress * circumference);
            ringEl.style.strokeDashoffset = offset;
        }

        if (seconds <= 0) {
            clearInterval(timer);
            if (timerEl) timerEl.textContent = '✓';
            if (ringEl) ringEl.style.strokeDashoffset = 0;

            triggerDownload(item);

            setTimeout(() => {
                if (countdownEl) countdownEl.classList.add('hidden');
                btn.style.display = '';
                btn.textContent = 'Download';
                btn.disabled = false;
                if (ringEl) {
                    ringEl.style.strokeDashoffset = circumference;
                }
            }, 1200);
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
    const isUpdated = item.updatedAt && (Date.now() - item.updatedAt < 7 * 24 * 60 * 60 * 1000);

    body.innerHTML = `
        <div class="download-modal-layout">
            <div class="download-modal-img">
                <img src="${item.poster || 'https://placehold.co/400x600/141414/ff0000?text=No+Image'}" alt="${item.name}">
            </div>
            <div class="download-modal-info">
                <div class="download-modal-tags">
                    <div class="card-tag">${item.tag}</div>
                    ${isUpdated ? '<span class="download-updated-badge-inline">New Version Available</span>' : ''}
                </div>
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
                    <div class="modal-download-area">
                        <div class="download-countdown hidden" id="modal-countdown">
                            <svg class="countdown-ring countdown-ring-lg" viewBox="0 0 36 36">
                                <circle class="countdown-ring-bg" cx="18" cy="18" r="15.9"></circle>
                                <circle class="countdown-ring-progress" cx="18" cy="18" r="15.9" id="modal-ring"></circle>
                            </svg>
                            <span class="countdown-text countdown-text-lg" id="modal-timer">10s</span>
                        </div>
                        <button class="download-btn download-btn-large" onclick="startDownloadFromModal(${index})" id="modalDownloadBtn">
                            ${isUpdated ? 'Download New Version' : 'Download Now'}
                        </button>
                    </div>
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
    const downloads = getDownloads();
    const item = downloads[index];
    if (!item || !item.file) return;

    btn.disabled = true;
    btn.style.display = 'none';

    const countdownEl = document.getElementById('modal-countdown');
    const timerEl = document.getElementById('modal-timer');
    const ringEl = document.getElementById('modal-ring');

    if (countdownEl) countdownEl.classList.remove('hidden');

    let seconds = 10;
    const circumference = 2 * Math.PI * 15.9;

    if (ringEl) {
        ringEl.style.strokeDasharray = `${circumference} ${circumference}`;
        ringEl.style.strokeDashoffset = circumference;
    }

    const timer = setInterval(() => {
        seconds--;
        if (timerEl) timerEl.textContent = `${seconds}s`;

        if (ringEl) {
            const progress = (10 - seconds) / 10;
            const offset = circumference - (progress * circumference);
            ringEl.style.strokeDashoffset = offset;
        }

        if (seconds <= 0) {
            clearInterval(timer);
            if (timerEl) timerEl.textContent = '✓';
            if (ringEl) ringEl.style.strokeDashoffset = 0;

            triggerDownload(item);

            setTimeout(() => {
                if (countdownEl) countdownEl.classList.add('hidden');
                btn.style.display = '';
                btn.textContent = 'Download Now';
                btn.disabled = false;
                if (ringEl) ringEl.style.strokeDashoffset = circumference;
            }, 1200);
        }
    }, 1000);
}

function closeDownloadModal() {
    document.getElementById('downloadModal').classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    renderDownloads();

    document.getElementById('downloadModal').addEventListener('click', function(e) {
        if (e.target === this) closeDownloadModal();
    });
});