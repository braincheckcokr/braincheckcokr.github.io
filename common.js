(function() {
    function init() {
    var header = document.querySelector('.header');

    var techLinks = [
        { href: './mlsystem.html', text: '머신러닝 기반 추천 시스템' },
        { href: './tts.html', text: '고품질 음성 생성(TTS)' },
        { href: './stt.html', text: '음성 인식(STT) 및 발화 평가' },
        { href: './ai-content.html', text: 'AI 기반 콘텐츠 생성' },
        { href: './multiplatform.html', text: '멀티플랫폼 지원' }
    ];

    var navLinks = header && header.querySelector('.nav-links');
    if (navLinks && !navLinks.querySelector('.more-menu-wrapper')) {
        var wrapper = document.createElement('div');
        wrapper.className = 'more-menu-wrapper';

        var btn = document.createElement('button');
        btn.className = 'more-menu-btn';
        btn.setAttribute('aria-label', '기술 소개 더보기');
        btn.innerHTML = '<span></span><span></span><span></span>';

        var dropdown = document.createElement('div');
        dropdown.className = 'more-dropdown';
        techLinks.forEach(function(item) {
            var a = document.createElement('a');
            a.href = item.href;
            a.textContent = item.text;
            dropdown.appendChild(a);
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(dropdown);
        navLinks.appendChild(wrapper);

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', function() {
            dropdown.classList.remove('active');
        });
    }

    if (header && !header.querySelector('.menu-toggle')) {
        var menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.setAttribute('aria-label', '메뉴 열기');
        menuToggle.innerHTML = '<span></span><span></span><span></span>';
        header.appendChild(menuToggle);
    }

    if (!document.querySelector('.mobile-menu-overlay')) {
        var overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        header.after(overlay);
    }

    if (!document.querySelector('.mobile-menu')) {
        var mobileMenu = document.createElement('nav');
        mobileMenu.className = 'mobile-menu';

        var html = '<a href="./about.html">회사소개</a>' +
            '<a href="./support.html">고객센터</a>' +
            '<a href="./information.html">개인정보처리방침</a>' +
            '';

        techLinks.forEach(function(item) {
            html += '<a href="' + item.href + '">' + item.text + '</a>';
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
            '<a href="./index.html">홈</a>' +
            '<a href="./about.html">회사소개</a>' +
            '<a href="./support.html">고객센터</a>' +
            '<a href="./information.html">개인정보처리방침</a>' +
            '</div>' +
            '<p><a href="./review.html" class="footer-logo">&copy; 뇌체크</a></p>';
        document.body.appendChild(footer);
    }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
