/* QRTagAll shared use-case rendering */
(function (global) {
    const UC_YT_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="#FF0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8z"/><path fill="#fff" d="M9.75 15.02l6.26-3.02-6.26-3.02v6.04z"/></svg>';
    const UC_WA_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" aria-hidden="true"><path fill="#25D366" d="M16 .5C7.439.5.5 7.439.5 16c0 2.832.744 5.488 2.041 7.813L.5 31.5l7.884-2.028A15.36 15.36 0 0 0 16 31.5C24.561 31.5 31.5 24.561 31.5 16S24.561.5 16 .5z"/><path fill="#FFF" d="M24.124 22.002c-.329.924-1.882 1.729-2.597 1.843-.67.106-1.534.152-2.48-.152-.57-.183-1.31-.427-2.259-.838-3.966-1.708-6.554-5.633-6.756-5.895-.201-.261-1.613-2.149-1.613-4.097 0-1.948 1.021-2.91 1.385-3.308.364-.397.796-.497 1.06-.497.264 0 .53.003.764.013.246.01.577-.093.905.692.329.792 1.114 2.739 1.215 2.937.101.198.167.43.031.691-.133.261-.198.43-.396.661-.198.231-.419.516-.599.693-.198.198-.405.412-.173.81.231.397 1.031 1.698 2.211 2.748 1.522 1.354 2.806 1.773 3.203 1.971.397.198.627.165.86-.099.231-.264.993-1.157 1.26-1.554.264-.397.529-.33.893-.198.364.132 2.306 1.088 2.706 1.284.397.198.661.297.757.462.099.165.099.961-.23 1.885z"/></svg>';

    function hasUseCaseVideo(url) {
        return typeof url === 'string' && url.trim() !== '';
    }

    function shouldShowBuyBtn(uc) {
        return !!(uc && uc.EnableBuy === true);
    }

    function escapeHtmlAttr(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function getVideoUrl(uc) {
        return (uc && (uc.videoUrl || uc.video || '')).trim();
    }

    function parseUseCasesPayload(raw) {
        if (Array.isArray(raw)) return { version: 1, intro: raw.find((x) => !x.num) || null, series: [] };
        return raw;
    }

    function buildUseCaseShareMessage(uc) {
        const title = (uc && uc.title) ? String(uc.title).trim() : 'Use case';
        const parts = [`QRTagAll-${title}`, ''];
        const desc = (uc && (uc.desc || uc.subtitle) ? String(uc.desc || uc.subtitle).trim() : '');
        if (desc) parts.push(desc);
        const buy = (uc && uc.BuyLink ? String(uc.BuyLink).trim() : '');
        if (buy) parts.push('', `Buy: ${buy}`);
        const video = getVideoUrl(uc);
        if (video) parts.push('', `Demo video: ${video}`);
        const qr = (uc && uc.qr ? String(uc.qr).trim() : '');
        if (qr) parts.push('', `Live QR: ${qr}`);
        return parts.join('\n');
    }

    function shareUseCaseWhatsApp(btn) {
        if (!btn || !btn.dataset) return;
        const uc = {
            title: btn.dataset.ucTitle || '',
            desc: btn.dataset.ucDesc || '',
            BuyLink: btn.dataset.ucBuy || '',
            videoUrl: btn.dataset.ucVideo || '',
            qr: btn.dataset.ucQr || '',
        };
        const text = buildUseCaseShareMessage(uc);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    }

    function renderUseCaseWhatsAppBtn(uc) {
        const safeTitle = escapeHtmlAttr(uc.title || 'use case');
        return `<button type="button" class="uc-share-wa" onclick="QRJUseCases.shareUseCaseWhatsApp(this)"
        aria-label="Share ${safeTitle} on WhatsApp" title="Share on WhatsApp"
        data-uc-title="${safeTitle}"
        data-uc-desc="${escapeHtmlAttr(uc.desc || uc.subtitle)}"
        data-uc-buy="${escapeHtmlAttr(uc.BuyLink)}"
        data-uc-video="${escapeHtmlAttr(getVideoUrl(uc))}"
        data-uc-qr="${escapeHtmlAttr(uc.qr)}">${UC_WA_ICON_SVG}</button>`;
    }

    function normaliseYouTubeEmbed(url) {
        if (!hasUseCaseVideo(url)) return null;
        url = url.trim();
        if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        if (url.includes('watch?v=')) {
            const id = url.split('watch?v=')[1].split('&')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        if (url.includes('shorts/')) {
            const id = url.split('shorts/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        return url;
    }

    function renderUseCaseDemoBtn(uc, openFn) {
        const embedUrl = normaliseYouTubeEmbed(getVideoUrl(uc));
        const safeTitle = escapeHtmlAttr(uc.title || 'use case');
        if (embedUrl) {
            return `<button type="button" class="uc-demo uc-demo-icon" onclick="${openFn}('${embedUrl}')" aria-label="Watch demo video for ${safeTitle}" title="Watch demo">${UC_YT_ICON_SVG}</button>`;
        }
        return '';
    }

    function renderUseCaseQrBlock(uc) {
        const qrUrl = (uc.qr || '').trim();
        if (!qrUrl) return '';
        const safeTitle = escapeHtmlAttr(uc.title || 'use case');
        return `<a class="uc-qr-link" href="${qrUrl}" target="_blank" rel="noopener" aria-label="Open live demo for ${safeTitle}">
               <span class="uc-qr-stack">
                   <canvas class="uc-qr-canvas" data-qr-url="${qrUrl}" width="56" height="56"></canvas>
                   <span class="uc-qr-label">Live QR</span>
               </span>
           </a>`;
    }

    function isUseCaseItem(uc) {
        const num = uc && uc.num != null ? String(uc.num) : '';
        return num.includes('-');
    }

    function isBuyLinkValid(uc) {
        const link = (uc.BuyLink || '').trim();
        return link.length > 0 && /^https?:\/\//i.test(link);
    }

    function renderUseCaseBuyBtn(uc) {
        if (!shouldShowBuyBtn(uc)) return '';
        const safeTitle = String(uc.title || 'item').replace(/"/g, '&quot;');
        if (isBuyLinkValid(uc)) {
            const link = uc.BuyLink.trim();
            return `<a class="uc-buy" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="Buy QRTags for ${safeTitle}">Buy</a>`;
        }
        return `<button type="button" class="uc-buy" disabled aria-label="Buy QRTags — link not set yet">Buy</button>`;
    }

    function renderUseCaseActionsHtml(uc, openFn, opts = {}) {
        const withBuy = opts.withBuy === true;
        const extraClass = opts.actionClass ? ` ${opts.actionClass}` : '';
        const qrBlock = renderUseCaseQrBlock(uc);
        const demoBtn = renderUseCaseDemoBtn(uc, openFn);
        const waBtn = renderUseCaseWhatsAppBtn(uc);
        const buyBtn = withBuy ? renderUseCaseBuyBtn(uc) : '';
        if (withBuy && buyBtn) {
            return `<div class="uc-actions uc-actions-with-buy${extraClass}"><div class="uc-actions-main">${qrBlock}${demoBtn}${waBtn}</div><div class="uc-actions-buy">${buyBtn}</div></div>`;
        }
        return `<div class="uc-actions${extraClass}">${qrBlock}${demoBtn}${waBtn}</div>`;
    }

    function drawUseCaseQrs(root) {
        if (!global.QRCode) return;
        (root || document).querySelectorAll('.uc-qr-canvas').forEach((canvas) => {
            const url = canvas.dataset.qrUrl;
            if (!url) return;
            QRCode.toCanvas(canvas, url, {
                width: 56,
                margin: 1,
                color: { dark: '#0D1B2A', light: '#ffffff' },
            }, (err) => { if (err) console.error(err); });
        });
    }

    function ucSeriesBase(num) {
        if (!num) return '';
        const m = String(num).match(/^(\d+)/);
        return m ? m[1] : '';
    }

    function ucSeriesClass(uc) {
        if (!uc.series) return ' uc-series-intro';
        return ` uc-series-${uc.series}`;
    }

    function ucNumLabel(uc) {
        if (!uc.num) return '<span class="uc-num-intro">Intro</span>';
        const base = ucSeriesBase(uc.num);
        const sub = /^\d+-[b-z]$/.test(uc.num) ? ' uc-num-sub' : '';
        return `<span class="uc-num-badge uc-series-num-${base}${sub}">${uc.num}</span>`;
    }

    function ucCardHtml(uc) {
        const safeTitle = String(uc.title || '').replace(/"/g, '&quot;');
        const actionsHtml = renderUseCaseActionsHtml(uc, 'QRJUseCases.openUCVideo', { withBuy: isUseCaseItem(uc) });
        return `
    <div class="uc-card${ucSeriesClass(uc)}">
        <div class="uc-head">
            <div class="uc-emoji">${uc.emoji || '🏷️'}</div>
            <div>
                <div class="uc-num">${ucNumLabel(uc)}</div>
                <div class="uc-title">${safeTitle}</div>
            </div>
        </div>
        <div class="uc-body">
            <div class="uc-body-mid">
                <p class="uc-desc">${uc.desc || ''}</p>
            </div>
            ${actionsHtml}
        </div>
    </div>`;
    }

    function seriesDividerHtml(s, opts = {}) {
        const item = { ...s, desc: s.subtitle || '' };
        const tagPills = (s.tags || []).map((t) => `<span class="uc-series-tag">${t}</span>`).join('');
        const safeTitle = escapeHtmlAttr(s.title);
        const safeSub = escapeHtmlAttr(s.subtitle);
        const actionsHtml = renderUseCaseActionsHtml(item, 'QRJUseCases.openUCVideo', { actionClass: 'uc-series-actions' });
        const exploreUrl = opts.exploreUrlForSeries ? opts.exploreUrlForSeries(s.id) : null;
        const external = opts.exploreExternalForSeries ? opts.exploreExternalForSeries(s.id) : false;
        const exploreTarget = external ? ' target="_blank" rel="noopener"' : '';
        const titleHtml = exploreUrl
            ? `<a class="uc-title uc-series-title-link" href="${escapeHtmlAttr(exploreUrl)}"${exploreTarget} aria-label="Open ${safeTitle} category page">${safeTitle}</a>`
            : `<div class="uc-title">${safeTitle}</div>`;
        return `
            <div class="uc-series-divider uc-series-divider-${s.id}">
                <div class="uc-series-head">
                    <div class="uc-series-id" aria-hidden="true">${s.id}</div>
                    <div class="uc-series-head-text">
                        ${titleHtml}
                    </div>
                </div>
                <div class="uc-series-body">
                    <div class="uc-body-mid">
                        ${safeSub ? `<p class="uc-desc">${safeSub}</p>` : ''}
                        ${tagPills ? `<div class="uc-series-tags">${tagPills}</div>` : ''}
                    </div>
                </div>
                ${actionsHtml}
            </div>`;
    }

    function ucTrackHtml(payload, opts = {}) {
        let html = '';
        if (payload.intro) {
            html += ucCardHtml({ ...payload.intro, num: '' });
        }
        for (const s of payload.series || []) {
            html += seriesDividerHtml(s, opts);
            for (const uc of s.useCases || []) {
                html += ucCardHtml({ ...uc, series: s.id });
            }
        }
        return html;
    }

    function ucTourCardHtml(series, seriesId) {
        const tour = {
            emoji: '🎬',
            num: 'Tour',
            title: series.title || 'Category tour',
            desc: series.subtitle || '',
            series: seriesId,
            videoUrl: series.videoUrl || '',
            qr: '',
            tags: series.tags || [],
        };
        return `<div class="qrj-tour-card">${ucCardHtml(tour)}</div>`;
    }

    function ucCategoryTrackHtml(series, useCases, seriesId) {
        let html = ucTourCardHtml(series, seriesId);
        for (const uc of useCases) {
            html += ucCardHtml({ ...uc, series: seriesId });
        }
        return html;
    }

    function applyUseCaseOverrides(useCases, overrides) {
        if (!overrides) return useCases;
        return useCases
            .map((uc) => {
                const o = overrides[uc.num];
                if (!o) return uc;
                return { ...uc, ...o };
            })
            .filter((uc) => !(overrides[uc.num] && overrides[uc.num].hidden));
    }

    async function loadUseCasesIntoTrack(opts = {}) {
        const track = opts.track || document.getElementById('ucTrack');
        if (!track) return;
        const dataUrl = opts.dataUrl || '/data/usecases.json';
        try {
            const res = await fetch(dataUrl);
            const payload = parseUseCasesPayload(await res.json());
            track.innerHTML = opts.htmlBuilder ? opts.htmlBuilder(payload) : ucTrackHtml(payload, opts);
            drawUseCaseQrs(track);
        } catch (e) {
            track.innerHTML = '<div style="padding:32px;color:var(--text-3);font-size:.9rem;">Could not load use cases.</div>';
            console.error('Failed to load usecases.json', e);
        }
    }

    function shiftUC(dir, trackId) {
        const track = document.getElementById(trackId || 'ucTrack');
        if (!track) return;
        const card = track.querySelector('.uc-card, .qrj-tour-card');
        const step = card ? card.offsetWidth + 20 : 320;
        track.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
    }

    function openUCVideo(url) {
        const frame = document.getElementById('ucVideoFrame');
        const modal = document.getElementById('ucVideoModal');
        if (!frame || !modal) return;
        frame.src = url + '?autoplay=1';
        modal.style.display = 'flex';
    }

    function closeUCVideo() {
        const frame = document.getElementById('ucVideoFrame');
        const modal = document.getElementById('ucVideoModal');
        if (frame) frame.src = '';
        if (modal) modal.style.display = 'none';
    }

    function initUcVideoModal() {
        const modal = document.getElementById('ucVideoModal');
        if (!modal) return;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeUCVideo();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeUCVideo();
        });
    }

    function initUcTrackDrag(trackId) {
        const el = document.getElementById(trackId || 'ucTrack');
        if (!el) return;
        let isDown = false;
        let startX;
        let scrollLeft;
        el.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        });
        el.addEventListener('mouseleave', () => { isDown = false; });
        el.addEventListener('mouseup', () => { isDown = false; });
        el.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX);
        });
    }

    global.QRJUseCases = {
        UC_YT_ICON_SVG,
        UC_WA_ICON_SVG,
        hasUseCaseVideo,
        shouldShowBuyBtn,
        escapeHtmlAttr,
        getVideoUrl,
        parseUseCasesPayload,
        buildUseCaseShareMessage,
        shareUseCaseWhatsApp,
        renderUseCaseWhatsAppBtn,
        renderUseCaseDemoBtn,
        renderUseCaseQrBlock,
        isUseCaseItem,
        renderUseCaseActionsHtml,
        isBuyLinkValid,
        renderUseCaseBuyBtn,
        normaliseYouTubeEmbed,
        drawUseCaseQrs,
        seriesDividerHtml,
        ucSeriesBase,
        ucSeriesClass,
        ucNumLabel,
        ucCardHtml,
        ucTrackHtml,
        ucTourCardHtml,
        ucCategoryTrackHtml,
        applyUseCaseOverrides,
        loadUseCasesIntoTrack,
        shiftUC,
        openUCVideo,
        closeUCVideo,
        initUcVideoModal,
        initUcTrackDrag,
    };
})(typeof window !== 'undefined' ? window : this);
