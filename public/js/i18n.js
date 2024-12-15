// i18n.js
export const translations = {
    'ko': {
        'title': '책 속 캐릭터와 대화하세요',
        'subtitle': '마법같은 대화를 시작해보세요',
        'ageSelect': '연령을 선택하세요',
        'ageDesc1': '유아',
        'ageDesc2': '저학년',
        'ageDesc3': '고학년',
        'startBtn': '시작하기',
        'startDesc': '연령을 선택하면 시작할 수 있어요',
        'copyright': '© 2024 Story Chat. All rights reserved.'
    },
    'en': {
        'title': 'Chat with Book Characters',
        'subtitle': 'Start a Magical Conversation',
        'ageSelect': 'Select Your Age',
        'ageDesc1': 'Preschool',
        'ageDesc2': 'Lower Grades',
        'ageDesc3': 'Upper Grades',
        'startBtn': 'Start',
        'startDesc': 'Select your age to begin',
        'copyright': '© 2024 Story Chat. All rights reserved.'
    }
};
export function changeLang(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        element.textContent = translations[lang][key];
    });
}