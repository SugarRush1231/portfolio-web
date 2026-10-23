(() => {
    'use strict';
    const download = document.querySelector('[data-mmt-download]');
    if (!download) return;
    const repository = 'https://github.com/SugarRush1231/Multi_Media_Toolkit/releases';
    const preview = document.querySelector('#project-mmt iframe');
    let version = document.querySelector('[data-mmt-version]').textContent;
    let checkedAt = 0;
    let checking = false;

    function syncPreview() {
        preview?.contentWindow?.postMessage({type:'mmt-release', version}, location.protocol === 'file:' ? '*' : location.origin);
    }
    async function checkRelease() {
        if (checking || Date.now() - checkedAt < 10 * 60 * 1000) return;
        checking = true;
        checkedAt = Date.now();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
            const response = await fetch('https://api.github.com/repos/SugarRush1231/Multi_Media_Toolkit/releases/latest', {
                headers:{Accept:'application/vnd.github+json'}, signal:controller.signal, cache:'no-cache', credentials:'omit'
            });
            if (!response.ok) return;
            const release = await response.json();
            if (release.draft || release.prerelease || !/^v\d+\.\d+\.\d+$/.test(release.tag_name) || !Array.isArray(release.assets)) return;
            const filename = `MMT_Setup_${release.tag_name}.exe`;
            const url = `${repository}/download/${release.tag_name}/${filename}`;
            if (!release.assets.some(asset => asset?.name === filename && asset.browser_download_url === url)) return;
            version = release.tag_name;
            download.href = url;
            document.querySelectorAll('[data-mmt-version]').forEach(label => {label.textContent = version;});
            syncPreview();
        } catch {
            // Keep the known installer usable when GitHub is unavailable or rate limited.
        } finally {
            clearTimeout(timeout);
            checking = false;
        }
    }
    preview?.addEventListener('load', syncPreview);
    window.addEventListener('focus', checkRelease);
    window.addEventListener('pageshow', checkRelease);
    syncPreview();
    checkRelease();
})();
