(function () {
    'use strict';

    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let preference = null;
    try {
        const saved = localStorage.getItem('portfolio-theme');
        if (saved === 'dark' || saved === 'light') preference = saved;
    } catch (_) { /* Browser storage may be unavailable. */ }

    function applyTheme() {
        const theme = preference || (systemTheme.matches ? 'dark' : 'light');
        root.dataset.theme = theme;
        const button = document.getElementById('theme-toggle');
        if (button) {
            const nextTheme = theme === 'dark' ? 'light' : 'dark';
            button.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
            button.title = `Switch to ${nextTheme} theme`;
            button.querySelector('.theme-name').textContent = nextTheme === 'dark' ? 'Dark' : 'Light';
        }
        const metadata = document.querySelector('meta[name="theme-color"]');
        if (metadata) metadata.content = theme === 'dark' ? '#111111' : '#f7f7f5';
    }

    applyTheme();
    systemTheme.addEventListener('change', () => { if (!preference) applyTheme(); });
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme();
        document.getElementById('theme-toggle').addEventListener('click', () => {
            preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('portfolio-theme', preference); } catch (_) { /* Keep the choice for this visit. */ }
            applyTheme();
        });
    });
})();
