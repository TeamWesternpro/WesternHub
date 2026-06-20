// admin.js - Combined Admin Dashboard Logic

// --- Utility Functions ---
function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// --- Constants ---
const TRAILER_KEY = 'WesternHub_data';
const BLOG_KEY = 'WesternHub_blogs';
const DOWNLOAD_KEY = 'WesternHub_downloads';

// --- Tab Switching ---
function switchTab(sectionId, element) {
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'manageTrailerSection') renderManageList(TRAILER_KEY, 'trailerManageList');
    if (sectionId === 'manageBlogSection') renderManageList(BLOG_KEY, 'blogManageList');
    if (sectionId === 'manageDownloadSection') renderManageList(DOWNLOAD_KEY, 'downloadManageList');
    if (sectionId === 'dashboardSection') renderDashboard();
}

// --- Trailer Logic ---
const trailerInputs = {
    name: document.getElementById('trailerName'),
    desc: document.getElementById('trailerDesc'),
    tag: document.getElementById('trailerTag'),
    poster: document.getElementById('trailerPosterUpload'),
    posterUrl: document.getElementById('trailerPosterUrl'),
    youtube: document.getElementById('youtubeLink'),
    network: document.getElementById('networkName'),
    editIndex: document.getElementById('trailerEditIndex')
};

const trailerPreview = {
    title: document.getElementById('prevTrailerTitle'),
    desc: document.getElementById('prevTrailerDesc'),
    tag: document.getElementById('prevTrailerTag'),
    img: document.getElementById('prevTrailerImg')
};

function toggleNetworkField() {
    const field = document.getElementById('networkField');
    if(field) field.classList.toggle('hidden', trailerInputs.tag.value !== 'TV');
    updateTrailerPreview();
}

function updateTrailerPreview() {
    trailerPreview.title.textContent = trailerInputs.name.value || 'Trailer Title';
    trailerPreview.desc.textContent = trailerInputs.desc.value || 'Description...';
    trailerPreview.tag.textContent = trailerInputs.tag.value;
    trailerPreview.img.src = trailerInputs.posterUrl.value || 'https://placehold.co/400x600/141414/ff0000?text=Upload+Poster';
}

[trailerInputs.name, trailerInputs.desc, trailerInputs.tag].forEach(i => i && i.addEventListener('input', updateTrailerPreview));

trailerInputs.poster.addEventListener('change', (e) => handleImageUpload(e, trailerInputs.posterUrl, trailerPreview.img));

function resetTrailerForm() {
    document.getElementById('trailerForm').reset();
    trailerInputs.editIndex.value = "-1";
    trailerInputs.posterUrl.value = "";
    document.getElementById('trailerDateDay').value = '';
    document.getElementById('trailerDateMonth').value = '';
    document.getElementById('trailerDateYear').value = '';
    document.getElementById('movieDateDay').value = '';
    document.getElementById('movieDateMonth').value = '';
    document.getElementById('movieDateYear').value = '';
    document.getElementById('trailerFormHeader').textContent = 'Add New Trailer';
    document.getElementById('trailerSubmitBtn').textContent = 'Publish Trailer';
    document.getElementById('trailerCancelEdit').classList.add('hidden');
    toggleNetworkField();
    updateTrailerPreview();
}

function getDateFromSelects(prefix) {
    const d = document.getElementById(prefix + 'DateDay').value;
    const m = document.getElementById(prefix + 'DateMonth').value;
    const y = document.getElementById(prefix + 'DateYear').value;
    return (d && m && y) ? `${d}/${m}/${y}` : '';
}

function setDateToSelects(prefix, dateStr) {
    if (!dateStr) return;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        document.getElementById(prefix + 'DateDay').value = parts[0];
        document.getElementById(prefix + 'DateMonth').value = parts[1];
        document.getElementById(prefix + 'DateYear').value = parts[2];
    }
}

function populateDateSelects() {
    const dayOpts = (sel) => {
        for (let i = 1; i <= 31; i++) {
            const o = document.createElement('option');
            o.value = String(i).padStart(2, '0');
            o.textContent = i;
            sel.appendChild(o);
        }
    };
    const yearOpts = (sel) => {
        for (let i = 2020; i <= 2035; i++) {
            const o = document.createElement('option');
            o.value = i;
            o.textContent = i;
            sel.appendChild(o);
        }
    };
    dayOpts(document.getElementById('trailerDateDay'));
    dayOpts(document.getElementById('movieDateDay'));
    dayOpts(document.getElementById('blogDateDay'));
    yearOpts(document.getElementById('trailerDateYear'));
    yearOpts(document.getElementById('movieDateYear'));
    yearOpts(document.getElementById('blogDateYear'));
}

document.getElementById('trailerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: trailerInputs.name.value,
        description: trailerInputs.desc.value,
        poster: trailerInputs.posterUrl.value,
        tag: trailerInputs.tag.value,
        releaseDateTrailer: getDateFromSelects('trailer'),
        releaseDateMovie: getDateFromSelects('movie'),
        youtube: trailerInputs.youtube.value,
        network: trailerInputs.tag.value === 'TV' ? trailerInputs.network.value : null
    };
    handleFormSubmit(TRAILER_KEY, data, trailerInputs.editIndex.value, resetTrailerForm);
});

// --- Blog Logic ---
const blogInputs = {
    name: document.getElementById('blogName'),
    desc: document.getElementById('blogDesc'),
    fullDesc: document.getElementById('blogFullDesc'),
    category: document.getElementById('blogCategory'),
    poster: document.getElementById('blogPosterUpload'),
    posterUrl: document.getElementById('blogPosterUrl'),
    editIndex: document.getElementById('blogEditIndex')
};

const blogPreview = {
    title: document.getElementById('prevBlogTitle'),
    desc: document.getElementById('prevBlogDesc'),
    tag: document.getElementById('prevBlogTag'),
    img: document.getElementById('prevBlogImg')
};

function addContentBlock(type, content = '', styles = {}) {
    const container = document.getElementById('blogContentBuilder');
    const msg = document.getElementById('emptyContentMsg');
    if (msg) msg.style.display = 'none';

    const blockId = Date.now() + Math.random();
    const blockDiv = document.createElement('div');
    blockDiv.className = 'content-block';
    blockDiv.style = "background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px; position: relative; border: 1px solid var(--glass-border);";
    blockDiv.dataset.id = blockId;
    blockDiv.dataset.type = type;

    let innerHTML = `<button type="button" style="position: absolute; right: 10px; top: 10px; background: none; border: none; color: var(--primary-red); cursor: pointer; font-size: 1.2rem;" onclick="this.parentElement.remove()">×</button>`;
    
    if (type === 'text') {
        innerHTML += `
            <div class="block-controls">
                <div class="block-control-item">
                    <label>Font</label>
                    <select class="font-select">
                        <option value="'Outfit', sans-serif" ${styles.font === "'Outfit', sans-serif" ? 'selected' : ''}>Outfit (Default)</option>
                        <option value="'Inter', sans-serif" ${styles.font === "'Inter', sans-serif" ? 'selected' : ''}>Inter</option>
                        <option value="'Playfair Display', serif" ${styles.font === "'Playfair Display', serif" ? 'selected' : ''}>Playfair (Elegant)</option>
                        <option value="'Roboto Mono', monospace" ${styles.font === "'Roboto Mono', monospace" ? 'selected' : ''}>Mono (Code)</option>
                    </select>
                </div>
                <div class="block-control-item">
                    <label>Color</label>
                    <input type="color" class="color-select" value="${styles.color || '#a0a0a0'}">
                </div>
                <div class="block-control-item">
                    <label>Align</label>
                    <select class="align-select">
                        <option value="left" ${styles.align === 'left' ? 'selected' : ''}>Left</option>
                        <option value="center" ${styles.align === 'center' ? 'selected' : ''}>Center</option>
                        <option value="right" ${styles.align === 'right' ? 'selected' : ''}>Right</option>
                    </select>
                </div>
            </div>
            <textarea placeholder="Enter text..." style="width: 100%; min-height: 100px; margin-top: 5px; font-family: ${styles.font || 'inherit'}; color: ${styles.color || 'inherit'}; text-align: ${styles.align || 'left'};">${content}</textarea>
        `;
    } else {
        innerHTML += `
            <div style="margin-top: 15px;">
                <input type="file" accept="image/*" onchange="handleBlockImage(this, '${blockId}')">
                <img src="${content || 'https://placehold.co/400x200/141414/ff0000?text=Select+Image'}" style="width: 100%; height: 150px; object-fit: cover; margin-top: 10px; border-radius: 5px; border: 1px solid var(--glass-border);" id="img-${blockId}">
                <input type="hidden" id="url-${blockId}" value="${content}">
            </div>
        `;
    }

    blockDiv.innerHTML = innerHTML;
    
    // Live preview update within block
    if (type === 'text') {
        const area = blockDiv.querySelector('textarea');
        const fSelect = blockDiv.querySelector('.font-select');
        const cSelect = blockDiv.querySelector('.color-select');
        const aSelect = blockDiv.querySelector('.align-select');

        [fSelect, cSelect, aSelect].forEach(s => s.addEventListener('change', () => {
            area.style.fontFamily = fSelect.value;
            area.style.color = cSelect.value;
            area.style.textAlign = aSelect.value;
        }));
    }

    container.appendChild(blockDiv);
}

function handleBlockImage(input, blockId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById(`img-${blockId}`).src = e.target.result;
            document.getElementById(`url-${blockId}`).value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function updateBlogPreview() {
    blogPreview.title.textContent = blogInputs.name.value || 'Blog Title';
    blogPreview.desc.textContent = blogInputs.desc.value || 'Summary...';
    blogPreview.tag.textContent = blogInputs.category.value;
    blogPreview.img.src = blogInputs.posterUrl.value || 'https://placehold.co/400x600/141414/ff0000?text=Upload+Image';
}

[blogInputs.name, blogInputs.desc, blogInputs.category].forEach(i => i && i.addEventListener('input', updateBlogPreview));

blogInputs.poster.addEventListener('change', (e) => handleImageUpload(e, blogInputs.posterUrl, blogPreview.img));

function resetBlogForm() {
    document.getElementById('blogForm').reset();
    document.getElementById('blogContentBuilder').innerHTML = '<p id="emptyContentMsg" style="color: var(--text-gray); font-size: 0.8rem; text-align: center;">No content blocks added yet.</p>';
    blogInputs.editIndex.value = "-1";
    blogInputs.posterUrl.value = "";
    document.getElementById('blogDateDay').value = '';
    document.getElementById('blogDateMonth').value = '';
    document.getElementById('blogDateYear').value = '';
    document.getElementById('blogFormHeader').textContent = 'Add New Blog';
    document.getElementById('blogSubmitBtn').textContent = 'Publish Blog';
    document.getElementById('blogCancelEdit').classList.add('hidden');
    updateBlogPreview();
}

document.getElementById('blogForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Collect content blocks
    const blocks = [];
    document.querySelectorAll('.content-block').forEach(block => {
        const type = block.dataset.type;
        let data;
        if (type === 'text') {
            data = {
                type: 'text',
                content: block.querySelector('textarea').value,
                font: block.querySelector('.font-select').value,
                color: block.querySelector('.color-select').value,
                align: block.querySelector('.align-select').value
            };
        } else {
            data = {
                type: 'image',
                content: block.querySelector('input[type="hidden"]').value
            };
        }
        blocks.push(data);
    });

    const data = {
        name: blogInputs.name.value,
        description: blogInputs.desc.value,
        fullDescription: blogInputs.fullDesc.value,
        contentBlocks: blocks,
        poster: blogInputs.posterUrl.value,
        tag: blogInputs.category.value,
        date: getDateFromSelects('blog') || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
    handleFormSubmit(BLOG_KEY, data, blogInputs.editIndex.value, resetBlogForm);
});

// --- Download Logic ---
const downloadInputs = {
    name: document.getElementById('downloadName'),
    desc: document.getElementById('downloadDesc'),
    tag: document.getElementById('downloadTag'),
    status: document.getElementById('downloadStatus'),
    poster: document.getElementById('downloadPosterUpload'),
    posterUrl: document.getElementById('downloadPosterUrl'),
    file: document.getElementById('downloadFileUpload'),
    fileUrl: document.getElementById('downloadFileUrl'),
    editIndex: document.getElementById('downloadEditIndex')
};

const downloadPreview = {
    title: document.getElementById('prevDownloadTitle'),
    desc: document.getElementById('prevDownloadDesc'),
    tag: document.getElementById('prevDownloadTag'),
    img: document.getElementById('prevDownloadImg')
};

function updateDownloadPreview() {
    downloadPreview.title.textContent = downloadInputs.name.value || 'Download Title';
    downloadPreview.desc.textContent = downloadInputs.desc.value || 'Description...';
    downloadPreview.tag.textContent = downloadInputs.tag.value;
    downloadPreview.img.src = downloadInputs.posterUrl.value || 'https://placehold.co/400x600/141414/ff0000?text=Upload+Poster';
}

[downloadInputs.name, downloadInputs.desc, downloadInputs.tag].forEach(i => i && i.addEventListener('input', updateDownloadPreview));

downloadInputs.poster.addEventListener('change', (e) => handleImageUpload(e, downloadInputs.posterUrl, downloadPreview.img));

downloadInputs.file.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            downloadInputs.fileUrl.value = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function resetDownloadForm() {
    document.getElementById('downloadForm').reset();
    downloadInputs.editIndex.value = "-1";
    downloadInputs.posterUrl.value = "";
    downloadInputs.fileUrl.value = "";
    document.getElementById('downloadFormHeader').textContent = 'Add New Download';
    document.getElementById('downloadSubmitBtn').textContent = 'Publish Download';
    document.getElementById('downloadCancelEdit').classList.add('hidden');
    updateDownloadPreview();
}

document.getElementById('downloadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: downloadInputs.name.value,
        description: downloadInputs.desc.value,
        tag: downloadInputs.tag.value,
        status: downloadInputs.status.value,
        poster: downloadInputs.posterUrl.value,
        file: downloadInputs.fileUrl.value,
        fileName: downloadInputs.file.files[0] ? downloadInputs.file.files[0].name : '',
        updatedAt: parseInt(downloadInputs.editIndex.value) !== -1 ? Date.now() : null
    };
    handleFormSubmit(DOWNLOAD_KEY, data, downloadInputs.editIndex.value, resetDownloadForm);
});

// --- Shared Logic ---
function handleImageUpload(e, urlInput, imgPreview) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            urlInput.value = event.target.result;
            imgPreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function handleFormSubmit(storageKey, data, editIndex, resetFn) {
    let items = getFromStorage(storageKey);
    const index = parseInt(editIndex);
    if (index === -1) {
        items.push(data);
        alert('Item published!');
    } else {
        items[index] = data;
        alert('Item updated!');
    }
    saveToStorage(storageKey, items);
    resetFn();
}

function renderManageList(storageKey, listId) {
    const list = document.getElementById(listId);
    const items = getFromStorage(storageKey);
    list.innerHTML = items.length === 0 ? '<p style="color: var(--text-gray);">No items saved yet.</p>' : '';

    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'manage-item';
        div.innerHTML = `
            <img src="${item.poster || 'https://placehold.co/400x600/141414/ff0000?text=No+Img'}" alt="Poster">
            <div class="manage-item-info">
                <h4>${item.name}</h4>
                <p>${item.tag}</p>
            </div>
            <div class="manage-actions">
                <button class="action-btn edit-btn" onclick="editItem('${storageKey}', ${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteItem('${storageKey}', ${index})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function editItem(key, index) {
    const item = getFromStorage(key)[index];
    if (key === TRAILER_KEY) {
        trailerInputs.name.value = item.name;
        trailerInputs.desc.value = item.description;
        trailerInputs.tag.value = item.tag;
        trailerInputs.posterUrl.value = item.poster;
        setDateToSelects('trailer', item.releaseDateTrailer);
        setDateToSelects('movie', item.releaseDateMovie);
        trailerInputs.youtube.value = item.youtube;
        trailerInputs.network.value = item.network || '';
        trailerInputs.editIndex.value = index;
        document.getElementById('trailerFormHeader').textContent = 'Edit Trailer';
        document.getElementById('trailerSubmitBtn').textContent = 'Update Trailer';
        document.getElementById('trailerCancelEdit').classList.remove('hidden');
        toggleNetworkField();
        updateTrailerPreview();
        switchTab('addTrailerSection', document.querySelector('.sidebar-link'));
    } else if (key === BLOG_KEY) {
        blogInputs.name.value = item.name;
        blogInputs.desc.value = item.description;
        blogInputs.fullDesc.value = item.fullDescription || '';
        blogInputs.category.value = item.tag;
        blogInputs.posterUrl.value = item.poster;
        blogInputs.editIndex.value = index;
        setDateToSelects('blog', item.date);
        
        const container = document.getElementById('blogContentBuilder');
        container.innerHTML = '';
        if (item.contentBlocks) {
            item.contentBlocks.forEach(block => {
                if (block.type === 'text') {
                    addContentBlock('text', block.content, { font: block.font, color: block.color, align: block.align });
                } else {
                    addContentBlock('image', block.content);
                }
            });
        }

        document.getElementById('blogFormHeader').textContent = 'Edit Blog';
        document.getElementById('blogSubmitBtn').textContent = 'Update Blog';
        document.getElementById('blogCancelEdit').classList.remove('hidden');
        updateBlogPreview();
        switchTab('addBlogSection', document.querySelectorAll('.sidebar-link')[2]);
    } else if (key === DOWNLOAD_KEY) {
        downloadInputs.name.value = item.name;
        downloadInputs.desc.value = item.description;
        downloadInputs.tag.value = item.tag;
        downloadInputs.status.value = item.status;
        downloadInputs.posterUrl.value = item.poster;
        downloadInputs.fileUrl.value = item.file || '';
        downloadInputs.editIndex.value = index;
        document.getElementById('downloadFormHeader').textContent = 'Edit Download';
        document.getElementById('downloadSubmitBtn').textContent = 'Update Download';
        document.getElementById('downloadCancelEdit').classList.remove('hidden');
        updateDownloadPreview();
        switchTab('addDownloadSection', document.querySelectorAll('.sidebar-link')[5]);
    }
}

function deleteItem(key, index) {
    if (confirm('Delete this item?')) {
        let items = getFromStorage(key);
        items.splice(index, 1);
        saveToStorage(key, items);
        const listMap = {
            [TRAILER_KEY]: 'trailerManageList',
            [BLOG_KEY]: 'blogManageList',
            [DOWNLOAD_KEY]: 'downloadManageList'
        };
        renderManageList(key, listMap[key] || 'trailerManageList');
    }
}

// --- Dashboard ---
function formatDate(dateStr) {
    if (!dateStr) return 'TBA';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${parts[0]} ${monthNames[parseInt(parts[1], 10) - 1]} ${parts[2]}`;
}

function renderDashboard() {
    const trailers = getFromStorage(TRAILER_KEY);
    const blogs = getFromStorage(BLOG_KEY);
    const downloads = getFromStorage(DOWNLOAD_KEY);
    const statsContainer = document.getElementById('dashboardStats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(108,92,231,0.15);">🎬</div>
            <div class="stat-info">
                <span class="stat-number">${trailers.length}</span>
                <span class="stat-label">Total Trailers</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(108,92,231,0.15);">📰</div>
            <div class="stat-info">
                <span class="stat-number">${blogs.length}</span>
                <span class="stat-label">Total Blogs</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(108,92,231,0.15);">⬇️</div>
            <div class="stat-info">
                <span class="stat-number">${downloads.length}</span>
                <span class="stat-label">Total Downloads</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(108,92,231,0.15);">📺</div>
            <div class="stat-info">
                <span class="stat-number">${trailers.filter(t => t.tag === 'TV').length}</span>
                <span class="stat-label">TV Shows</span>
            </div>
        </div>
    `;

    const recentTrailers = document.getElementById('dashboardRecentTrailers');
    const recentBlogs = document.getElementById('dashboardRecentBlogs');
    const recentDownloads = document.getElementById('dashboardRecentDownloads');

    if (trailers.length === 0) {
        recentTrailers.innerHTML = '<p style="color: var(--text-gray); font-size: 0.9rem;">No trailers published yet. <a href="#" onclick="switchTab(\'addTrailerSection\', document.querySelectorAll(\'.sidebar-link\')[1]); return false;" style="color: var(--primary-red);">Add one</a></p>';
    } else {
        recentTrailers.innerHTML = trailers.slice(-3).reverse().map(t => `
            <div class="recent-item">
                <img src="${t.poster || 'https://placehold.co/60x80/141414/ff0000?text=N/A'}" alt="${t.name}">
                <div class="recent-item-info">
                    <strong>${t.name}</strong>
                    <span>${t.tag} &middot; ${formatDate(t.releaseDateMovie)}</span>
                </div>
            </div>
        `).join('');
    }

    if (blogs.length === 0) {
        recentBlogs.innerHTML = '<p style="color: var(--text-gray); font-size: 0.9rem;">No blogs published yet. <a href="#" onclick="switchTab(\'addBlogSection\', document.querySelectorAll(\'.sidebar-link\')[3]); return false;" style="color: var(--primary-red);">Add one</a></p>';
    } else {
        recentBlogs.innerHTML = blogs.slice(-3).reverse().map(b => `
            <div class="recent-item">
                <img src="${b.poster || 'https://placehold.co/60x80/141414/ff0000?text=N/A'}" alt="${b.name}">
                <div class="recent-item-info">
                    <strong>${b.name}</strong>
                    <span>${b.tag} &middot; ${formatDate(b.date)}</span>
                </div>
            </div>
        `).join('');
    }

    if (downloads.length === 0) {
        recentDownloads.innerHTML = '<p style="color: var(--text-gray); font-size: 0.9rem;">No downloads published yet. <a href="#" onclick="switchTab(\'addDownloadSection\', document.querySelectorAll(\'.sidebar-link\')[5]); return false;" style="color: var(--primary-red);">Add one</a></p>';
    } else {
        recentDownloads.innerHTML = downloads.slice(-3).reverse().map(d => `
            <div class="recent-item">
                <img src="${d.poster || 'https://placehold.co/60x80/141414/ff0000?text=N/A'}" alt="${d.name}">
                <div class="recent-item-info">
                    <strong>${d.name}</strong>
                    <span>${d.tag} &middot; ${d.status}</span>
                </div>
            </div>
        `).join('');
    }
}

// Init
populateDateSelects();
if (document.getElementById('trailerForm')) toggleNetworkField();
if (document.getElementById('blogForm')) updateBlogPreview();
renderDashboard();