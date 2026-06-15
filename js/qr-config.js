/* QRTagAll site + category configuration */
(function (global) {
    let siteConfig = null;

    async function loadSiteConfig(url) {
        if (siteConfig) return siteConfig;
        const res = await fetch(url || '/data/site-config.json');
        if (!res.ok) throw new Error('Failed to load site-config.json');
        siteConfig = await res.json();
        global.QRJ_SITE_CONFIG = siteConfig;
        return siteConfig;
    }

    function getConfig() {
        return siteConfig;
    }

    function getCategoryById(id) {
        return siteConfig?.categories?.[id] || null;
    }

    function resolveCategoryId() {
        const bodyId = document.body?.dataset?.categoryId;
        if (bodyId) return bodyId;

        const hostParts = location.hostname.split('.');
        if (hostParts.length >= 3 && hostParts[0] !== 'www' && hostParts[0] !== 'localhost') {
            const sub = hostParts[0];
            for (const [id, cat] of Object.entries(siteConfig?.categories || {})) {
                if (cat.subdomain === sub) return id;
            }
        }

        const pathMatch = location.pathname.match(/categories\/([^/]+)/);
        if (pathMatch) return pathMatch[1];

        return null;
    }

    function categoryPublicUrl(catId) {
        const cat = siteConfig?.categories?.[catId];
        if (!cat || !siteConfig) return '#';

        const isLocal =
            location.hostname === 'localhost' ||
            location.hostname === '127.0.0.1' ||
            location.hostname.endsWith('.local');

        if (isLocal) {
            return `/categories/${catId}/`;
        }
        return `https://${cat.subdomain}.${siteConfig.mainHost}/`;
    }

    function categoryUrlBySeriesId(seriesId) {
        for (const [id, cat] of Object.entries(siteConfig?.categories || {})) {
            if (String(cat.seriesId) === String(seriesId)) {
                return categoryPublicUrl(id);
            }
        }
        return null;
    }

    function getTemplateForUseCase(num) {
        return siteConfig?.useCaseTemplates?.[num] || null;
    }

    function mainSiteUrl() {
        const isLocal =
            location.hostname === 'localhost' ||
            location.hostname === '127.0.0.1';
        if (isLocal) return '/';
        return `https://${siteConfig?.mainHost || 'qrtagall.com'}/`;
    }

    global.QRJConfig = {
        loadSiteConfig,
        getConfig,
        getCategoryById,
        resolveCategoryId,
        categoryPublicUrl,
        categoryUrlBySeriesId,
        getTemplateForUseCase,
        mainSiteUrl,
    };
})(typeof window !== 'undefined' ? window : this);
