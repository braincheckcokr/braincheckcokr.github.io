// 공통 헤더/모바일 메뉴 컴포넌트
document.addEventListener('DOMContentLoaded', function() {
    // 헤더에 모바일 메뉴 버튼 추가
    const header = document.querySelector('.header');
    if (header && !header.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.setAttribute('aria-label', '메뉴 열기');
        menuToggle.innerHTML = '<span></span><span></span><span></span>';
        header.appendChild(menuToggle);
    }

    // 모바일 메뉴 오버레이 추가
    if (!document.querySelector('.mobile-menu-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        header.after(overlay);
    }

    // 모바일 메뉴 추가
    if (!document.querySelector('.mobile-menu')) {
        const mobileMenu = document.createElement('nav');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = `
            <a href="./review.html"><img src="./assets/images/app_icon58.png" alt="앱 리뷰" class="logo-icon">앱 리뷰</a>
            <a href="./about.html">회사소개</a>
            <a href="./support.html">고객센터</a>
            <a href="./information.html">개인정보처리방침</a>
        `;
        document.querySelector('.mobile-menu-overlay').after(mobileMenu);
    }

    // 이벤트 리스너 설정
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    function toggleMenu() {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
    }
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    // 푸터 추가
    if (!document.querySelector('.footer')) {
        const footer = document.createElement('footer');
        footer.className = 'footer';
        footer.innerHTML = `
            <div class="footer-links">
                <a href="./">홈</a>
                <a href="./about.html">회사소개</a>
                <a href="./support.html">고객센터</a>
                <a href="./information.html">개인정보처리방침</a>
            </div>
            <p><a href="./review.html" class="footer-logo">&copy; 뇌체크</a></p>
        `;
        document.body.appendChild(footer);
    }
});
