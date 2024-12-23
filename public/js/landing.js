import { translations, changeLang, getCurrentLang } from './i18n.js';

let currentLang = 'ko';

document.addEventListener('DOMContentLoaded', () => {
    let selectedAge = null;
    const startBtn = document.querySelector('.start-btn');
    
    // 언어 선택 처리
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            changeLang(lang);
            currentLang = lang;
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('selectedLanguage', lang);
            updatePageText(lang);
        });
    });

    // 연령 선택 처리
    const ageBtns = document.querySelectorAll('.age-btn');
    ageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedAge = btn.dataset.age;
            ageBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            startBtn.removeAttribute('disabled');
            localStorage.setItem('selectedAge', selectedAge);
        });
    });

    // start 버튼 처리
    startBtn.addEventListener('click', () => {
        const selectedAge = localStorage.getItem('selectedAge');
        const selectedLanguage = localStorage.getItem('selectedLanguage');
        
        if (selectedAge && selectedLanguage) {
            window.location.href = '/library.html';
        } else {
            alert(translations[currentLang].selectRequired);
        }
    });

    // 페이지 로드 시 저장된 언어 확인 및 적용
    const savedLang = localStorage.getItem('selectedLanguage') || 'ko';
    const savedAge = localStorage.getItem('selectedAge');
    
    // 저장된 언어 적용
    changeLang(savedLang);
    currentLang = savedLang;
    document.querySelector(`[data-lang="${savedLang}"]`)?.classList.add('active');
    
    // 저장된 연령 적용
    if (savedAge) {
        document.querySelector(`[data-age="${savedAge}"]`)?.classList.add('selected');
        startBtn.removeAttribute('disabled');
    }
});

// 페이지 텍스트 업데이트 함수
function updatePageText(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        element.textContent = translations[lang][key];
    });
}
