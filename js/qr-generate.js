/* QRTagAll QR ID generation (proxy) */
(function (global) {
    const DEFAULT_CONFIG = {
        enforceProxyOrigin: true,
        proxyOrigin: 'https://proxy.qrtagall.com',
        qrIdPrefix: 'TMP1_',
        routingFallbackPrefix: 'IN',
    };

    let genConfig = { ...DEFAULT_CONFIG };
    let selectedTemplate = null;
    let modalGenOpts = {};

    function applyConfig(cfg) {
        if (!cfg) return;
        genConfig = {
            ...genConfig,
            enforceProxyOrigin: cfg.enforceProxyOrigin ?? genConfig.enforceProxyOrigin,
            proxyOrigin: cfg.proxyOrigin || genConfig.proxyOrigin,
            qrIdPrefix: cfg.qrIdPrefix || genConfig.qrIdPrefix,
            routingFallbackPrefix: cfg.routingFallbackPrefix || genConfig.routingFallbackPrefix,
        };
    }

    if (new URLSearchParams(location.search).has('noProxyOrigin')) {
        genConfig.enforceProxyOrigin = false;
        console.warn('[QRTagAll] Proxy origin check DISABLED (?noProxyOrigin=1)');
    }

    function isAllowedProxyMessage(event) {
        if (!genConfig.enforceProxyOrigin) return true;
        return event.origin === genConfig.proxyOrigin;
    }

    function getProxyPostMessageTarget() {
        return genConfig.enforceProxyOrigin ? genConfig.proxyOrigin : '*';
    }

    function getReadableTimestamp() {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const padMs = (n) => n.toString().padStart(3, '0');
        return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${padMs(now.getMilliseconds())}`;
    }

    async function generateId(timestamp) {
        const staticKey = 'chandanmaity';
        const proxyFrame = document.getElementById('proxyFrame');
        return new Promise((resolve, reject) => {
            const handler = (event) => {
                if (!isAllowedProxyMessage(event)) return;
                if (!event.data || (event.data.type !== 'qr_generated' && event.data.type !== 'qr_error')) return;
                window.removeEventListener('message', handler);
                if (event.data.type === 'qr_generated') resolve(event.data.id);
                else reject(new Error(event.data.error));
            };
            window.addEventListener('message', handler);
            if (!proxyFrame?.contentWindow) {
                window.removeEventListener('message', handler);
                reject(new Error('Proxy iframe not ready'));
                return;
            }
            proxyFrame.contentWindow.postMessage(
                { type: 'generate', timestamp, ccpubkey: staticKey },
                getProxyPostMessageTarget()
            );
        });
    }

    function setSelectedTemplate(meta) {
        selectedTemplate = meta || null;
    }

    function getSelectedTemplate() {
        return selectedTemplate;
    }

    function getEffectiveQrPrefix(opts = {}) {
        if (selectedTemplate?.qrPrefix) return selectedTemplate.qrPrefix;
        return opts.qrIdPrefix || genConfig.qrIdPrefix;
    }

    function buildQrCaption(defaultLabel) {
        if (!selectedTemplate) return defaultLabel || 'QRTagAll QR';
        const sheet = selectedTemplate.masterTemplateSheet || '';
        const title = selectedTemplate.title || selectedTemplate.num || '';
        const prefix = (selectedTemplate.qrPrefix || '').replace(/_$/, '');
        const parts = [title];
        if (prefix) parts.push(`ID prefix: ${prefix}`);
        if (sheet) parts.push(`Template: ${sheet}`);
        return parts.join('\n');
    }

    function needsRoutingFallback(id) {
        return id && !id.startsWith('TMP1_');
    }

    function buildProcessUrl(id, processUrl) {
        const base = (processUrl || 'https://process.qrtagall.com').replace(/\/$/, '');

        let url = `${base}?id=${encodeURIComponent(id)}`;
        if (needsRoutingFallback(id) && genConfig.routingFallbackPrefix) {
            url += `&fallback=${encodeURIComponent(genConfig.routingFallbackPrefix)}`;
        }
        if (selectedTemplate?.num) {
            url += `&template=${encodeURIComponent(selectedTemplate.num)}`;
        }
        if (selectedTemplate?.masterTemplateSheet) {
            url += `&tplSheet=${encodeURIComponent(selectedTemplate.masterTemplateSheet)}`;
        }
        if (selectedTemplate?.qrPrefix) {
            url += `&qrPrefix=${encodeURIComponent(selectedTemplate.qrPrefix.replace(/_$/, ''))}`;
        }
        return url;
    }

    function showTemplatePickState(opts = {}) {
        const spinner = document.getElementById('qrSpinner');
        const popupQR = document.getElementById('popupQR');
        const qrUrl = document.getElementById('qrUrl');
        const popupButtons = document.getElementById('popupButtons');
        const qrPopupHeading = document.getElementById('qrPopupHeading');
        const qrIdLabel = document.getElementById('qrIdLabel');
        const qrCaption = document.getElementById('qrCaption');
        const tplSelect = document.getElementById('qrTemplateSelect');

        if (qrPopupHeading) {
            qrPopupHeading.innerText = opts.pickTemplateHeading || 'Choose a use case below';
            qrPopupHeading.style.display = 'block';
        }
        if (qrIdLabel) qrIdLabel.style.display = 'none';
        if (spinner) spinner.style.display = 'none';
        if (popupQR) popupQR.style.display = 'none';
        if (qrUrl) qrUrl.style.display = 'none';
        if (popupButtons) popupButtons.style.display = 'none';
        if (qrCaption) {
            qrCaption.innerText = opts.pickTemplateHint || 'Select a template — ID prefix is set per use case (e.g. SERA, SERB).';
        }
        if (tplSelect) tplSelect.focus();
    }

    async function generateSecureQR(opts = {}) {
        const prefix = getEffectiveQrPrefix(opts);
        if (!prefix) {
            showTemplatePickState(opts);
            return;
        }

        const timestamp = prefix + getReadableTimestamp();
        const processUrl = opts.processUrl || 'https://process.qrtagall.com';
        const defaultCaption = opts.defaultCaption || 'General QR';
        const readyHeading = opts.readyHeading || '🎉 Your QR is ready!';

        const spinner = document.getElementById('qrSpinner');
        const popupQR = document.getElementById('popupQR');
        const qrUrl = document.getElementById('qrUrl');
        const popupButtons = document.getElementById('popupButtons');
        const qrPopupHeading = document.getElementById('qrPopupHeading');
        const qrIdLabel = document.getElementById('qrIdLabel');
        const qrCaption = document.getElementById('qrCaption');

        if (spinner) spinner.style.display = 'block';
        if (popupQR) popupQR.style.display = 'none';
        if (qrUrl) qrUrl.style.display = 'none';
        if (popupButtons) popupButtons.style.display = 'none';
        if (qrPopupHeading) qrPopupHeading.style.display = 'none';
        if (qrIdLabel) qrIdLabel.style.display = 'none';
        if (qrCaption) qrCaption.innerText = defaultCaption;

        try {
            const id = await generateId(timestamp);
            const url = buildProcessUrl(id, processUrl);

            if (qrIdLabel) {
                qrIdLabel.innerText = id;
                qrIdLabel.style.display = 'block';
            }

            const canvas = document.getElementById('popupQRCanvas');
            if (canvas && global.QRCode) {
                QRCode.toCanvas(canvas, url, {
                    width: 200,
                    errorCorrectionLevel: 'L',
                    margin: 0,
                }, (err) => { if (err) console.error(err); });
            }

            const linkElem = document.getElementById('qrLink');
            if (linkElem) {
                linkElem.href = url;
                linkElem.textContent = url;
            }

            if (qrCaption) qrCaption.innerText = buildQrCaption(defaultCaption);
        } catch (err) {
            console.error('Error generating QR ID:', err);
            alert('⚠️ QR generation error. Please try again.');
            closeModal();
        } finally {
            if (qrPopupHeading) {
                qrPopupHeading.innerText = readyHeading;
                qrPopupHeading.style.display = 'block';
            }
            if (spinner) spinner.style.display = 'none';
            if (popupQR) popupQR.style.display = 'inline-block';
            const canvas = document.getElementById('popupQRCanvas');
            if (canvas) canvas.style.display = 'block';
            if (qrUrl) qrUrl.style.display = 'block';
            if (popupButtons) popupButtons.style.display = 'flex';
        }
    }

    function openQRModal(opts = {}) {
        modalGenOpts = { ...opts };
        document.getElementById('popupModal').style.display = 'flex';
        if (opts.requireTemplate && !getSelectedTemplate()) {
            showTemplatePickState(opts);
            return;
        }
        generateSecureQR(opts);
    }

    function closeModal() {
        const modal = document.getElementById('popupModal');
        if (modal) modal.style.display = 'none';
    }

    function goNext(processUrl) {
        const id = document.getElementById('qrIdLabel')?.innerText?.trim();
        if (!id) {
            alert('QR ID not found. Please select a use case and generate first.');
            return;
        }
        window.location.href = buildProcessUrl(id, processUrl);
    }

    function printQR() {
        const qrCanvas = document.getElementById('popupQRCanvas');
        const qrCaption = document.getElementById('qrCaption');
        if (!qrCanvas) return;
        const imageDataUrl = qrCanvas.toDataURL();
        const captionText = qrCaption?.innerText || '';
        const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const win = window.open('', 'Print QR', 'width=400,height=400');
        if (!win) {
            alert('Popup blocked! Please allow popups for this site.');
            return;
        }

        let html = '<html><head><title>Print QR</title></head><body style="margin:0;padding:20px;text-align:center;">';
        html += '<div style="margin:20px auto;padding:10px;border:1px solid #ccc;border-radius:8px;display:inline-block;background:#fff;">';
        html += `<img id="qi" src="${imageDataUrl}" style="display:block;margin:0 auto;"/>`;
        html += `<pre style="margin-top:4px;color:#0044aa;font-size:14px;font-family:Arial,sans-serif;font-weight:600;white-space:pre-wrap;word-break:break-word;text-align:center;">${esc(captionText)}</pre>`;
        html += '</div>';
        html += '<scr' + 'ipt>window.onload=function(){var i=document.getElementById("qi");if(i.complete){window.print();window.close();}else{i.onload=function(){window.print();window.close();};}}</scr' + 'ipt>';
        html += '</body></html>';
        win.document.write(html);
        win.document.close();
    }

    function downloadQR() {
        const canvas = document.getElementById('popupQRCanvas');
        const caption = document.getElementById('qrCaption');
        if (!canvas) return;
        const win = window.open('', '_blank');
        const combined = document.createElement('canvas');
        const ctx = combined.getContext('2d');
        const qrSize = canvas.width;
        const lines = (caption?.innerText || '').split('\n');
        const lineH = 20;
        const pad = 10;

        combined.width = qrSize + pad * 2;
        combined.height = qrSize + lines.length * lineH + pad * 3;

        ctx.fillStyle = '#fffefc';
        ctx.fillRect(0, 0, combined.width, combined.height);
        ctx.drawImage(canvas, pad, pad);

        ctx.fillStyle = '#0044aa';
        ctx.font = '600 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        lines.forEach((line, i) => ctx.fillText(line.trim(), combined.width / 2, qrSize + pad * 2 + i * lineH));

        const safe = lines[0].replace(/[^a-z0-9]/gi, '_').substring(0, 20);
        const now = new Date();
        const tag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const fname = `${safe || 'qrtagall'}_${tag}.png`;

        combined.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            if (win) {
                win.document.write(`<html><head><title>${fname}</title></head><body style="margin:0;text-align:center;"><p style="font-family:Arial;font-size:14px;color:#0044aa;margin:10px;">Long press to save image</p><img src="${url}" style="width:100%;max-width:300px;"/></body></html>`);
                win.document.close();
            }
        }, 'image/png');
    }

    function wireModal(opts = {}) {
        modalGenOpts = { ...opts };

        ['startBtn', 'startBtnHero', 'startBtnMob', 'startBtnCta'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => openQRModal(opts));
        });

        const modal = document.getElementById('popupModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        const tplSelect = document.getElementById('qrTemplateSelect');
        if (tplSelect) {
            tplSelect.addEventListener('change', () => {
                const num = tplSelect.value;
                if (!num) {
                    setSelectedTemplate(null);
                    if (modal?.style.display === 'flex') showTemplatePickState(modalGenOpts);
                    return;
                }
                const tpl = global.QRJConfig?.getTemplateForUseCase(num, modalGenOpts.categoryCode);
                const opt = tplSelect.options[tplSelect.selectedIndex];
                const title = opt?.dataset?.ucTitle || opt?.text || num;
                setSelectedTemplate({ num, title, ...tpl });
                if (modal?.style.display === 'flex') {
                    generateSecureQR(modalGenOpts);
                }
            });
        }
    }

    global.QRJGenerate = {
        applyConfig,
        setSelectedTemplate,
        getSelectedTemplate,
        getEffectiveQrPrefix,
        generateSecureQR,
        openQRModal,
        closeModal,
        goNext,
        printQR,
        downloadQR,
        wireModal,
        buildProcessUrl,
        getConfig: () => genConfig,
    };
})(typeof window !== 'undefined' ? window : this);
