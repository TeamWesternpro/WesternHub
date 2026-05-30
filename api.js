// Determine API base URL. If the page is opened via file://, default to local server.
window.API_BASE = (function() {
    try {
        if (location.protocol === 'file:') return 'http://127.0.0.1:8080';
        return window.location.origin || 'http://127.0.0.1:8080';
    } catch (e) {
        return 'http://127.0.0.1:8080';
    }
})();

const API_URL = window.API_BASE + '/api/data';

async function apiGet() {
    try {
        const res = await fetch(API_URL);
        return await res.json();
    } catch (e) {
        console.error('apiGet error', e);
        return {};
    }
}

async function apiSet(key, data) {
    const all = await apiGet();
    all[key] = data;
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(all)
    });
}

async function syncFromServer() {
    try {
        const all = await apiGet();
        for (const key of Object.keys(all)) {
            localStorage.setItem(key, JSON.stringify(all[key]));
        }
        return true;
    } catch {
        return false;
    }
}

async function pushToServer(key) {
    const data = localStorage.getItem(key);
    if (data) {
        await apiSet(key, JSON.parse(data));
    }
}
