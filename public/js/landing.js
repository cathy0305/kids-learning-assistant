import { translations, changeLang } from './i18n.js';


// landing.js
document.addEventListener('DOMContentLoaded', () => {
    let selectedAge = null;
    const startBtn = document.querySelector('.start-btn');
    
    // 언어 선택 처리
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            changeLang(lang);
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
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
        if (selectedAge) {
          window.location.href = `/chat`;  // library.html 대신 chat으로 변경
        }
      });
      
    // 언어 변경 함수
    function changeLang(lang) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            element.textContent = translations[lang][key];
        });
        localStorage.setItem('selectedLang', lang);
    }

    // 초기 언어 설정
    const savedLang = localStorage.getItem('selectedLang') || 'ko';
    changeLang(savedLang);
    document.querySelector(`[data-lang="${savedLang}"]`).classList.add('active');
});