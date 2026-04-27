(function() {
    function init() {
    var header = document.querySelector('.header');
    var navPrefix = document.body && document.body.getAttribute('data-nav-prefix') || './';
    var isEnglish = document.documentElement && document.documentElement.lang === 'en';

    function withPrefix(file) {
        return navPrefix + file;
    }

    var labels = isEnglish ? {
        more: 'More menu',
        openMenu: 'Open menu',
        home: 'Home',
        about: 'About',
        subscription: 'Subscription',
        support: 'Support',
        privacy: 'Privacy Policy',
        copyright: 'BrainCheck'
    } : {
        more: '상세 메뉴',
        openMenu: '메뉴 열기',
        home: '홈',
        about: '회사소개',
        subscription: '구독',
        support: '고객센터',
        privacy: '개인정보처리방침',
        copyright: '뇌체크'
    };

    var techLinks = isEnglish ? [
        { href: 'mlsystem.html', text: 'ML-Based Recommendation System' },
        { href: 'tts.html', text: 'High-Quality Text-to-Speech (TTS)' },
        { href: 'stt.html', text: 'Speech Recognition (STT) & Evaluation' },
        { href: 'ai-content.html', text: 'AI-Powered Content Generation' },
        { href: 'multiplatform.html', text: 'Multi-Platform Support' }
    ] : [
        { href: 'mlsystem.html', text: '머신러닝 기반 추천 시스템' },
        { href: 'tts.html', text: '고품질 음성 생성(TTS)' },
        { href: 'stt.html', text: '음성 인식(STT) 및 발화 평가' },
        { href: 'ai-content.html', text: 'AI 기반 콘텐츠 생성' },
        { href: 'multiplatform.html', text: '멀티플랫폼 지원' }
    ];

    var detailLinks = isEnglish ? [
        { href: 'paddle/pricing.html', text: 'Pricing' },
        { href: 'paddle/terms-of-service.html', text: 'Terms of Service' },
        { href: 'paddle/refund-policy.html', text: 'Refund Policy' }
    ] : [
        { href: 'paddle/pricing.html', text: '요금제' },
        { href: 'paddle/terms-of-service.html', text: '이용약관' },
        { href: 'paddle/refund-policy.html', text: '환불 정책' }
    ];
    var moreDropdown = null;
    var subscriptionMenu = null;
    var appBannerStorageKey = 'bc-site-app-banner-dismissed';
    var appDownloadConfig = {
        iosStoreUrl: document.body.getAttribute('data-ios-store-url') || 'https://apps.apple.com/app/id6754181689',
        androidStoreUrl: document.body.getAttribute('data-android-store-url') || 'https://play.google.com/store/apps/details?id=kr.co.braincheck.bc',
        oneLinkUrl: document.body.getAttribute('data-one-link-url') || 'https://braincheck.onelink.me/fc86/glgprgei'
    };

    function detectDownloadPlatform() {
        var userAgent = navigator.userAgent || navigator.vendor || '';
        var isTouchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

        if (/iPad|iPhone|iPod/.test(userAgent) || isTouchMac) {
            return 'ios';
        }

        if (/android/i.test(userAgent)) {
            return 'android';
        }

        return 'desktop';
    }

    function getAndroidStoreUrl() {
        var url = new URL(appDownloadConfig.androidStoreUrl);
        url.searchParams.set('referrer', window.location.href);
        return url.toString();
    }

    function showDownloadModal() {
        var modal = document.querySelector('[data-download-modal]');
        var qrImage = modal && modal.querySelector('[data-download-qr]');
        var fallbackLink = modal && modal.querySelector('[data-download-fallback-link]');

        if (!modal || !qrImage || !fallbackLink) {
            window.open(appDownloadConfig.oneLinkUrl, '_blank');
            return;
        }

        fallbackLink.href = appDownloadConfig.oneLinkUrl;
        qrImage.src = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=' +
            encodeURIComponent(appDownloadConfig.oneLinkUrl);
        modal.hidden = false;
    }

    function initAppDownloadButtons() {
        document.querySelectorAll('[data-app-download]').forEach(function(button) {
            button.addEventListener('click', function() {
                var platform = detectDownloadPlatform();

                if (platform === 'ios') {
                    window.open(appDownloadConfig.iosStoreUrl, '_blank');
                    return;
                }

                if (platform === 'android') {
                    window.open(getAndroidStoreUrl(), '_blank');
                    return;
                }

                showDownloadModal();
            });
        });
    }

    function initDownloadModals() {
        document.querySelectorAll('[data-download-modal]').forEach(function(modal) {
            var closeButton = modal.querySelector('[data-download-modal-close]');

            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    modal.hidden = true;
                });
            }

            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.hidden = true;
                }
            });
        });

        document.addEventListener('keydown', function(event) {
            if (event.key !== 'Escape') {
                return;
            }

            document.querySelectorAll('[data-download-modal]').forEach(function(modal) {
                modal.hidden = true;
            });
        });
    }

    function getSessionValue(key) {
        try {
            return window.sessionStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function setSessionValue(key, value) {
        try {
            window.sessionStorage.setItem(key, value);
        } catch (e) {
            // Ignore storage failures; the close button should still hide this banner.
        }
    }

    function setAppBannerActive(active) {
        if (document.body) {
            document.body.classList.toggle('has-app-banner', active);
        }
    }

    function initAppBanners() {
        var banners = document.querySelectorAll('[data-app-banner]');
        if (!banners.length) {
            setAppBannerActive(false);
            return;
        }

        var dismissed = getSessionValue(appBannerStorageKey) === '1';
        setAppBannerActive(!dismissed);

        banners.forEach(function(banner) {
            var closeButton = banner.querySelector('[data-app-banner-close]');

            if (dismissed) {
                banner.hidden = true;
            }

            if (closeButton) {
                closeButton.addEventListener('click', function() {
                    setSessionValue(appBannerStorageKey, '1');
                    banner.hidden = true;
                    setAppBannerActive(false);
                });
            }
        });
    }

    function closeDesktopMenus(except) {
        if (moreDropdown && except !== 'more') {
            moreDropdown.classList.remove('active');
        }
        if (subscriptionMenu && except !== 'subscription') {
            subscriptionMenu.removeAttribute('open');
        }
    }

    var navLinks = header && header.querySelector('.nav-links');
    if (navLinks && !navLinks.querySelector('.nav-subscription-menu')) {
        subscriptionMenu = document.createElement('details');
        subscriptionMenu.className = 'nav-subscription-menu';

        var subscriptionSummary = document.createElement('summary');
        subscriptionSummary.textContent = labels.subscription;
        subscriptionMenu.appendChild(subscriptionSummary);

        var subscriptionPanel = document.createElement('div');
        subscriptionPanel.className = 'nav-subscription-panel';
        detailLinks.forEach(function(item) {
            var a = document.createElement('a');
            a.href = withPrefix(item.href);
            a.textContent = item.text;
            subscriptionPanel.appendChild(a);
        });
        subscriptionMenu.appendChild(subscriptionPanel);

        subscriptionMenu.addEventListener('toggle', function() {
            if (subscriptionMenu.open) {
                closeDesktopMenus('subscription');
            }
        });

        subscriptionMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        var aboutLink = navLinks.querySelector('a[href$="about.html"]');
        if (aboutLink && aboutLink.nextSibling) {
            navLinks.insertBefore(subscriptionMenu, aboutLink.nextSibling);
        } else if (aboutLink) {
            navLinks.appendChild(subscriptionMenu);
        } else {
            navLinks.insertBefore(subscriptionMenu, navLinks.firstChild);
        }
    }

    if (navLinks && !navLinks.querySelector('.more-menu-wrapper')) {
        var wrapper = document.createElement('div');
        wrapper.className = 'more-menu-wrapper';

        var btn = document.createElement('button');
        btn.className = 'more-menu-btn';
        btn.setAttribute('aria-label', labels.more);
        btn.innerHTML = '<span></span><span></span><span></span>';

        moreDropdown = document.createElement('div');
        moreDropdown.className = 'more-dropdown';
        techLinks.forEach(function(item) {
            var a = document.createElement('a');
            a.href = withPrefix(item.href);
            a.textContent = item.text;
            moreDropdown.appendChild(a);
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(moreDropdown);
        navLinks.appendChild(wrapper);

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeDesktopMenus('more');
            moreDropdown.classList.toggle('active');
        });

        moreDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        document.addEventListener('click', function() {
            closeDesktopMenus();
        });
    }

    if (header && !header.querySelector('.menu-toggle')) {
        var menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.setAttribute('aria-label', labels.openMenu);
        menuToggle.innerHTML = '<span></span><span></span><span></span>';
        var menuToggleHost = header.querySelector('.header-mobile-actions');
        (menuToggleHost || header).appendChild(menuToggle);
    }

    if (!document.querySelector('.mobile-menu-overlay')) {
        var overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        header.after(overlay);
    }

    if (!document.querySelector('.mobile-menu')) {
        var mobileMenu = document.createElement('nav');
        mobileMenu.className = 'mobile-menu';

        var html = '<a href="' + withPrefix('about.html') + '">' + labels.about + '</a>' +
            '<details class="mobile-submodule">' +
            '<summary>' + labels.subscription + '</summary>';
        detailLinks.forEach(function(item) {
            html += '<a href="' + withPrefix(item.href) + '">' + item.text + '</a>';
        });
        html += '</details>' +
            '<a href="' + withPrefix('support.html') + '">' + labels.support + '</a>' +
            '<a href="' + withPrefix('information.html') + '">' + labels.privacy + '</a>' +
            '';

        techLinks.forEach(function(item) {
            html += '<a href="' + withPrefix(item.href) + '">' + item.text + '</a>';
        });

        mobileMenu.innerHTML = html;
        document.querySelector('.mobile-menu-overlay').after(mobileMenu);
    }

    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-menu');
    var ov = document.querySelector('.mobile-menu-overlay');

    function toggleMenu() {
        toggle.classList.toggle('active');
        mobile.classList.toggle('active');
        ov.classList.toggle('active');
        document.body.style.overflow = mobile.classList.contains('active') ? 'hidden' : '';
    }

    if (toggle) toggle.addEventListener('click', toggleMenu);
    if (ov) ov.addEventListener('click', toggleMenu);
    if (mobile) {
        mobile.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (mobile.classList.contains('active')) toggleMenu();
            });
        });
    }

    if (!document.querySelector('.footer')) {
        var footer = document.createElement('footer');
        footer.className = 'footer';
        footer.innerHTML = '<div class="footer-links">' +
            '<a href="' + withPrefix('index.html') + '">' + labels.home + '</a>' +
            '<a href="' + withPrefix('about.html') + '">' + labels.about + '</a>' +
            '<a href="' + withPrefix('support.html') + '">' + labels.support + '</a>' +
            '<a href="' + withPrefix('information.html') + '">' + labels.privacy + '</a>' +
            '</div>' +
            '<p><a href="' + withPrefix('review.html') + '" class="footer-logo">&copy; ' + labels.copyright + '</a></p>';
        document.body.appendChild(footer);
    }

    initAppBanners();
    initAppDownloadButtons();
    initDownloadModals();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
