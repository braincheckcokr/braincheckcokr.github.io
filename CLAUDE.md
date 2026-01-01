# CLAUDE.md - BrainCheck 웹사이트 가이드

이 문서는 braincheck.co.kr 웹사이트의 구조와 스타일을 정의합니다.

## 디렉토리 구조

```
braincheckcokr.github.io/
├── index.html              # 메인 페이지
├── about.html              # 회사소개
├── support.html            # 고객센터
├── information.html        # 개인정보처리방침
├── styles.css              # 공통 CSS
├── assets/
│   └── images/
│       └── app_icon58.png  # 로고 아이콘
└── CLAUDE.md               # 이 문서
```

## HTML 템플릿 구조

### 기본 페이지 템플릿 (서브 페이지용)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{페이지 제목} - BrainCheck</title>
    <meta name="description" content="{페이지 설명}">
    <link rel="canonical" href="https://braincheck.co.kr/{페이지}">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <a href="./index.html" class="logo">뇌<span>체크</span><img src="./assets/images/app_icon58.png" alt="뇌체크" class="logo-icon"></a>
        <nav class="nav-links">
            <a href="./about.html">회사소개</a>
            <a href="./support.html">고객센터</a>
            <a href="./information.html">개인정보처리방침</a>
        </nav>
    </header>

    <!-- Page Content -->
    <main class="page-content">
        <!-- 여기에 콘텐츠 -->
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-links">
            <a href="./index.html">홈</a>
            <a href="./about.html">회사소개</a>
            <a href="./support.html">고객센터</a>
            <a href="./information.html">개인정보처리방침</a>
        </div>
        <p>&copy; 뇌체크</p>
    </footer>
</body>
</html>
```

## Markdown → HTML 변환 규칙

### 제목 (Headings)

| Markdown | HTML | CSS 클래스 |
|----------|------|-----------|
| `# 제목` | `<h1>제목</h1>` | `.page-content h1` (32px, 700) |
| `## 제목` | `<h2>제목</h2>` | `.page-content h2` (22px, 600) |
| `### 제목` | `<h3>제목</h3>` | `.page-content h3` (18px, 600) |

### 텍스트

| Markdown | HTML |
|----------|------|
| `일반 텍스트` | `<p>일반 텍스트</p>` |
| `**굵게**` | `<strong>굵게</strong>` |
| `[링크](url)` | `<a href="url">링크</a>` |

### 목록

**Markdown:**
```markdown
- 항목 1
- 항목 2
```

**HTML:**
```html
<ul>
    <li>항목 1</li>
    <li>항목 2</li>
</ul>
```

### 순서 있는 목록

**Markdown:**
```markdown
1. 항목 1
2. 항목 2
```

**HTML:**
```html
<ol>
    <li>항목 1</li>
    <li>항목 2</li>
</ol>
```

### 인용문 (Blockquote)

**Markdown:**
```markdown
> 인용문 내용
```

**HTML:**
```html
<blockquote>인용문 내용</blockquote>
```

스타일: 왼쪽에 4px 녹색(#4CB050) 바

### 구분선

**Markdown:**
```markdown
---
```

**HTML:**
```html
<hr>
```

### 테이블

**Markdown:**
```markdown
| 헤더1 | 헤더2 |
|-------|-------|
| 값1   | 값2   |
```

**HTML:**
```html
<table>
    <thead>
        <tr>
            <th>헤더1</th>
            <th>헤더2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>값1</td>
            <td>값2</td>
        </tr>
    </tbody>
</table>
```

### 정보 박스 (커스텀)

연한 녹색 배경의 정보 박스:

```html
<div class="info-box">
    <p>내용</p>
</div>
```

## CSS 클래스 가이드

### 색상 팔레트

| 용도 | 색상 코드 |
|------|----------|
| 메인 녹색 | `#4CB050` |
| 진한 녹색 | `#2E7D32` |
| 텍스트 (기본) | `#1a1a1a` |
| 텍스트 (보조) | `#444` |
| 텍스트 (연한) | `#666` |
| 배경 (연한 녹색) | `#f5faf5` |
| 푸터 배경 | `#1a1a1a` |

### 주요 CSS 클래스

| 클래스 | 용도 |
|--------|------|
| `.header` | 상단 고정 헤더 |
| `.logo` | 로고 텍스트 |
| `.logo-icon` | 로고 옆 아이콘 |
| `.nav-links` | 네비게이션 링크 |
| `.page-content` | 서브 페이지 본문 컨테이너 |
| `.section` | 메인 페이지 섹션 |
| `.features` | 기능 소개 섹션 (녹색 배경) |
| `.features-content` | 기능 섹션 내부 컨테이너 |
| `.feature-grid` | 기능 카드 그리드 |
| `.feature-card` | 개별 기능 카드 |
| `.mission` | 미션 섹션 (그라데이션 배경) |
| `.info-box` | 정보 박스 (연한 녹색 배경) |
| `.goal` | 강조 텍스트 (녹색) |
| `.footer` | 푸터 |

### 그라데이션

**텍스트 그라데이션 (Hero 섹션):**
```css
background: linear-gradient(135deg, #4CB050 0%, #2E7D32 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

**배경 그라데이션 (Mission 섹션):**
```css
background: linear-gradient(135deg, #4CB050 0%, #2E7D32 100%);
```

## 새 페이지 추가 방법

1. 기존 템플릿 복사 (about.html 권장)
2. `<title>`, `<meta description>`, `<link rel="canonical">` 수정
3. `<main class="page-content">` 내부에 콘텐츠 작성
4. 필요시 헤더/푸터 네비게이션에 링크 추가

## MD 파일 변환 예시

### 입력 (example.md)
```markdown
---
title: 예시 페이지
description: 예시 설명
---

# 예시 페이지

이것은 예시 문단입니다.

## 섹션 1

- 항목 1
- 항목 2

> 인용문입니다.
```

### 출력 (example.html)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>예시 페이지 - BrainCheck</title>
    <meta name="description" content="예시 설명">
    <link rel="canonical" href="https://braincheck.co.kr/example">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./styles.css">
</head>
<body>
    <header class="header">
        <a href="./index.html" class="logo">뇌<span>체크</span><img src="./assets/images/app_icon58.png" alt="뇌체크" class="logo-icon"></a>
        <nav class="nav-links">
            <a href="./about.html">회사소개</a>
            <a href="./support.html">고객센터</a>
            <a href="./information.html">개인정보처리방침</a>
        </nav>
    </header>

    <main class="page-content">
        <h1>예시 페이지</h1>
        <p>이것은 예시 문단입니다.</p>

        <h2>섹션 1</h2>
        <ul>
            <li>항목 1</li>
            <li>항목 2</li>
        </ul>

        <blockquote>인용문입니다.</blockquote>
    </main>

    <footer class="footer">
        <div class="footer-links">
            <a href="./index.html">홈</a>
            <a href="./about.html">회사소개</a>
            <a href="./support.html">고객센터</a>
            <a href="./information.html">개인정보처리방침</a>
        </div>
        <p>&copy; 뇌체크</p>
    </footer>
</body>
</html>
```

## 반응형 브레이크포인트

- 모바일: `max-width: 768px`
  - 네비게이션 숨김
  - 패딩 축소
  - 테이블 폰트 크기 축소
