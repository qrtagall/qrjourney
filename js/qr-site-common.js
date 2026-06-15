/* QRTagAll shared site chrome (nav, reveal, hero demo QR) */
(function (global) {
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        const onScroll = () => {
            if (window.scrollY > 64) {
                navbar.classList.remove('transparent');
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
                navbar.classList.add('transparent');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function initMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        if (!navToggle || !mobileMenu) return;
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
        mobileMenu.querySelectorAll('a, button').forEach((link) => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }

    function initScrollReveal() {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('in'), idx * 75);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.fade-up').forEach((el) => revealObserver.observe(el));
    }

    function initHeroDemoQr(url, canvasIds, linkIds) {
        const demoUrl = url || 'https://process.qrtagall.com/?id=QRTAG_20260609040731552_C67042F8';
        const canvases = canvasIds || ['heroQRDemo', 'heroQRDemoMobile'];
        const links = linkIds || ['heroQrLink', 'heroQrLinkMobile'];

        links.forEach((linkId, i) => {
            const link = document.getElementById(linkId);
            if (link) link.href = demoUrl;
            const canvas = document.getElementById(canvases[i]);
            if (!canvas || !global.QRCode) return;
            QRCode.toCanvas(canvas, demoUrl, {
                width: 180,
                margin: 1,
                color: { dark: '#0D1B2A', light: '#ffffff' },
            }, (err) => { if (err) console.error(err); });
        });
    }

    function initSiteChrome(opts = {}) {
        initNavbarScroll();
        initMobileMenu();
        initScrollReveal();
        if (opts.heroDemoQr) {
            initHeroDemoQr(opts.heroDemoQr);
        }
    }

    global.QRJSite = {
        initNavbarScroll,
        initMobileMenu,
        initScrollReveal,
        initHeroDemoQr,
        initSiteChrome,
    };
})(typeof window !== 'undefined' ? window : this);
