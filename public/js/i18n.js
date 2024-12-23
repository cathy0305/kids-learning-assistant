// i18n.js
export const translations = {
    ko: {
        title: "AI 학습 친구와 대화하세요",
        subtitle: "새로운 방식으로 배워보아요",
        ageSelect: "연령을 선택하세요",
        ageDesc1: "유아",
        ageDesc2: "저학년",
        ageDesc3: "고학년",
        startBtn: "시작하기",
        startDesc: "연령을 선택하면 시작할 수 있어요",
        copyright: "© 2024 AI Learning Assistant. All rights reserved.",
        // 라이브러리 페이지 관련
        libraryTitle: "도서 목록",
        availableTitle: "학습 중인 책",
        comingSoonTitle: "준비중인 책들",
        searchPlaceholder: "책 검색",
        selectBtn: "선택하기",
        comingSoon: "준비중",
        backBtn: "이전으로",
        age3to5: "3-5세",
        age6to8: "6-8세",
        age9to12: "9-12세",
        startButton: "시작하기",
        selectRequired: "나이와 언어를 선택해주세요",
    },
    en: {
        title: "Chat with AI Learning Friend",
        subtitle: "Learn in a New Way",
        ageSelect: "Select Your Age",
        ageDesc1: "Preschool",
        ageDesc2: "Lower Grade",
        ageDesc3: "Upper Grade",
        startBtn: "Start",
        startDesc: "Select your age to start",
        copyright: "© 2024 AI Learning Assistant. All rights reserved.",
        // Library page related
        libraryTitle: "Book List",
        availableTitle: "Books in Learning",
        comingSoonTitle: "Coming Soon",
        searchPlaceholder: "Search books",
        selectBtn: "Select",
        comingSoon: "Coming Soon",
        backBtn: "Back",
        age3to5: "Ages 3-5",
        age6to8: "Ages 6-8",
        age9to12: "Ages 9-12",
        startButton: "Start",
        selectRequired: "Please select age and language",
    }
};

let currentLang = localStorage.getItem('selectedLang') || 'ko';

export function getCurrentLang() {
    return currentLang;
}

export function changeLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        element.textContent = translations[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        element.placeholder = translations[lang][key];
    });

    document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang } 
    }));
}