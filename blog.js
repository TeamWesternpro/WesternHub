// blog.js - Logic for blog.html

const BLOG_KEY = 'WesternHub_blogs';
let blogFilter = 'All';

function formatDate(dateStr) {
    if (!dateStr) return 'Latest';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${parts[0]} ${monthNames[parseInt(parts[1], 10) - 1]} ${parts[2]}`;
}

function getBlogs() {
    const data = localStorage.getItem(BLOG_KEY);
    return data ? JSON.parse(data) : [];
}

function filterBlogs(category, element) {
    blogFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderBlogs();
}

function renderBlogs() {
    const container = document.getElementById('blogs');
    if (!container) return;

    const blogs = getBlogs();
    container.innerHTML = '';

    const filtered = blogs.filter(b => blogFilter === 'All' || b.tag === blogFilter);

    if (filtered.length === 0) {
        container.innerHTML = `<p style="color: var(--text-gray); grid-column: 1/-1; text-align: center; padding: 3rem;">No news items found in this category.</p>`;
        return;
    }

    filtered.forEach((blog, index) => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        card.onclick = () => openBlogModal(blogs.indexOf(blog));
        
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${blog.poster || 'https://placehold.co/400x240/141414/ff0000?text=No+Thumbnail'}" alt="${blog.name}" class="card-img">
                <div class="card-date">${formatDate(blog.date)}</div>
            </div>
            <div class="blog-card-body">
                <div class="card-tag">${blog.tag}</div>
                <h3 class="card-title">${blog.name}</h3>
                <p class="card-desc">${blog.description}</p>
                <div class="read-news">Read Article <span>&#8594;</span></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function openBlogModal(index) {
    const blogs = getBlogs();
    const blog = blogs[index];
    const modal = document.getElementById('blogModal');

    document.getElementById('modalBlogImg').src = blog.poster || 'https://placehold.co/800x400/141414/ff0000?text=No+Image';
    document.getElementById('modalBlogTag').textContent = blog.tag;
    document.getElementById('modalBlogTitle').textContent = blog.name;
    document.getElementById('modalBlogDate').textContent = formatDate(blog.date);
    
    // Render dynamic blocks
    const contentArea = document.getElementById('modalBlogFullDesc');
    contentArea.innerHTML = '';

    // Render main description if it exists
    if (blog.fullDescription) {
        const p = document.createElement('p');
        p.textContent = blog.fullDescription;
        p.style = "margin-bottom: 2rem; line-height: 1.8; color: var(--text-white); font-size: 1.25rem; white-space: pre-line; font-weight: 500;";
        contentArea.appendChild(p);
    }

    if (blog.contentBlocks && blog.contentBlocks.length > 0) {
        blog.contentBlocks.forEach(block => {
            if (block.type === 'text') {
                const p = document.createElement('p');
                p.textContent = block.content;
                // Apply custom styles from admin
                p.style.fontFamily = block.font || 'inherit';
                p.style.color = block.color || 'var(--text-gray)';
                p.style.textAlign = block.align || 'left';
                p.style.marginBottom = "1.5rem";
                p.style.lineHeight = "1.8";
                p.style.fontSize = "1.1rem";
                p.style.whiteSpace = "pre-line";
                contentArea.appendChild(p);
            } else if (block.type === 'image') {
                const img = document.createElement('img');
                img.src = block.content;
                img.style = "width: 100%; border-radius: 15px; margin-bottom: 2rem; border: 1px solid var(--glass-border); box-shadow: 0 10px 30px rgba(0,0,0,0.5);";
                contentArea.appendChild(img);
            }
        });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    document.getElementById('blogModal').classList.remove('active');
    document.body.style.overflow = '';
}

window.onclick = function(event) {
    const modal = document.getElementById('blogModal');
    if (event.target == modal) {
        closeBlogModal();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    renderBlogs();
});