/* QRTagAll category branch page bootstrap */
(function (global) {
    const ASSET_V = '20260615';

    function assetUrl(path) {
        return `${path}?v=${ASSET_V}`;
    }

    function el(id) {
        return document.getElementById(id);
    }

    function setText(id, text) {
        const node = el(id);
        if (node && text) node.textContent = text;
    }

    function setHtml(id, html) {
        const node = el(id);
        if (node) node.innerHTML = html;
    }

    function buildFeaturesHtml(features) {
        if (!features || !features.length) return '';
        const icons = [
            '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><polyline points="9 11 12 14 15 11"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
            '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
        ];
        return features.map((f, i) => `
            <div class="feat-card fade-up">
                <div class="feat-icon">${icons[i % icons.length]}</div>
                <h3>${f.title}</h3>
                <p>${f.desc}</p>
            </div>`).join('');
    }

    function buildStepsHtml(steps) {
        if (!steps) return '';
        return steps.map((step, i) => `
            <div class="step">
                <div class="step-num">${i + 1}</div>
                <h3>${step.title}</h3>
                <p>${step.desc}</p>
            </div>`).join('');
    }

    function buildStatsHtml(stats) {
        if (!stats) return '';
        return stats.map((s) => `
            <div class="stat-card">
                <div class="stat-val">${s.val}</div>
                <div class="stat-lbl">${s.lbl}</div>
            </div>`).join('');
    }

    function buildTrustHtml(items) {
        if (!items) return '';
        const check = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        return items.map((t) => `<span class="trust-item">${check}${t}</span>`).join('');
    }

    function buildTemplateSelect(useCases, templates) {
        const select = el('qrTemplateSelect');
        if (!select) return;
        select.innerHTML = '<option value="">— Select use-case template —</option>';
        useCases.forEach((uc) => {
            const tpl = templates[uc.num];
            const sheet = tpl?.masterTemplateSheet ? ` (${tpl.masterTemplateSheet})` : '';
            const opt = document.createElement('option');
            opt.value = uc.num;
            opt.textContent = `${uc.num} — ${uc.title}${sheet}`;
            select.appendChild(opt);
        });
        if (useCases.length === 1) {
            select.value = useCases[0].num;
            const tpl = templates[useCases[0].num];
            global.QRJGenerate.setSelectedTemplate({
                num: useCases[0].num,
                title: useCases[0].title,
                ...tpl,
            });
        }
    }

    async function loadOverrides(categoryId) {
        try {
            const res = await fetch(`/categories/${categoryId}/overrides.json`);
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }

    async function initCategoryPage() {
        const categoryId = document.body.dataset.categoryId;
        if (!categoryId) {
            console.error('Missing data-category-id on body');
            return;
        }

        const config = await global.QRJConfig.loadSiteConfig(assetUrl('/data/site-config.json'));
        const category = global.QRJConfig.getCategoryById(categoryId);
        if (!category) {
            console.error('Unknown category', categoryId);
            return;
        }

        const content = category.content || {};
        const seriesId = String(category.seriesId);
        document.body.classList.add('qrj-category', `cat-series-${seriesId}`);

        document.title = content.pageTitle || `QRTagAll — ${category.code}`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && content.metaDescription) metaDesc.content = content.metaDescription;

        const mainUrl = global.QRJConfig.mainSiteUrl();
        ['navMainLink', 'navMainLinkMob', 'contactMainLink'].forEach((id) => {
            const a = el(id);
            if (a) a.href = mainUrl;
        });
        const mainLink = el('navMainLink');
        if (mainLink) mainLink.href = mainUrl;

        setText('navLogoSub', content.heroBadge || category.code);
        setHtml('heroBadge', `<span class="dot"></span>${content.heroBadge || category.code}`);
        setHtml('heroHeadline', `${content.heroHeadline || ''}<br><span class="hl">${content.heroHeadlineHighlight || ''}</span>`);
        setText('heroSub', content.heroSub || '');
        setHtml('heroTrust', buildTrustHtml(content.trustItems));

        setText('featuresTag', content.featuresTag || 'Features');
        setText('featuresTitle', content.featuresTitle || '');
        setText('featuresSub', content.featuresSub || '');
        setHtml('featuresGrid', buildFeaturesHtml(content.features));

        setText('useCasesTag', content.useCasesTag || 'Use Cases');
        setText('useCasesTitle', content.useCasesTitle || '');
        setText('useCasesSub', content.useCasesSub || '');

        setText('howItWorksTag', content.howItWorksTag || 'How It Works');
        setText('howItWorksTitle', content.howItWorksTitle || '');
        setText('howItWorksSub', content.howItWorksSub || '');
        setHtml('stepsGrid', buildStepsHtml(content.steps));

        setText('aboutTag', content.aboutTag || 'About');
        setText('aboutTitle', content.aboutTitle || '');
        const aboutParas = el('aboutParagraphs');
        if (aboutParas && content.aboutParagraphs) {
            aboutParas.innerHTML = content.aboutParagraphs.map((p) => `<p>${p}</p>`).join('');
        }
        setHtml('aboutStats', buildStatsHtml(content.stats));

        setText('ctaTitle', content.ctaTitle || '');
        setText('ctaSub', content.ctaSub || '');

        const email = category.contactEmail || config.main.contactEmail;
        const contactEmail = el('contactEmail');
        const contactMailLink = el('contactMailLink');
        if (contactEmail) contactEmail.textContent = email;
        if (contactMailLink) contactMailLink.href = `mailto:${email}`;

        global.QRJSite.initSiteChrome({ heroDemoQr: null });

        const overrides = await loadOverrides(categoryId);
        const ucRes = await fetch(assetUrl('/data/usecases.json'));
        const payload = global.QRJUseCases.parseUseCasesPayload(await ucRes.json());
        const series = (payload.series || []).find((s) => String(s.id) === seriesId);
        let useCases = series ? [...(series.useCases || [])] : [];
        useCases = global.QRJUseCases.applyUseCaseOverrides(useCases, overrides);

        buildTemplateSelect(useCases, config.useCaseTemplates || {});

        const tourQr = (() => {
            for (const uc of useCases) {
                const q = (uc.qr || '').trim();
                if (q) return q;
            }
            return config.main.heroDemoQr;
        })();
        global.QRJSite.initHeroDemoQr(tourQr, ['heroQRDemo'], ['heroQrLink']);
        global.QRJSite.initHeroDemoQr(tourQr, ['heroQRDemoMobile'], ['heroQrLinkMobile']);

        const track = el('ucTrack');
        if (track && series) {
            track.innerHTML = global.QRJUseCases.ucCategoryTrackHtml(series, useCases, seriesId);
            global.QRJUseCases.drawUseCaseQrs(track);
        }

        global.QRJUseCases.initUcVideoModal();
        global.QRJUseCases.initUcTrackDrag('ucTrack');

        global.QRJGenerate.applyConfig({
            proxyOrigin: config.proxyOrigin,
            qrIdPrefix: category.qrPrefix,
            routingFallbackPrefix: config.routingFallbackPrefix,
        });

        const genOpts = {
            qrIdPrefix: category.qrPrefix,
            processUrl: config.processUrl,
            defaultCaption: `${category.code} QR`,
            readyHeading: `🎉 Your ${content.heroBadge || category.code} QR is ready!`,
        };

        global.QRJGenerate.wireModal(genOpts);

        document.querySelectorAll('#popupButtons button').forEach((btn) => {
            if ((btn.textContent || '').includes('Next')) {
                btn.onclick = () => global.QRJGenerate.goNext(config.processUrl);
            }
        });
    }

    global.QRJCategoryPage = { initCategoryPage, assetUrl };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initCategoryPage());
    } else {
        initCategoryPage();
    }
})(typeof window !== 'undefined' ? window : this);
