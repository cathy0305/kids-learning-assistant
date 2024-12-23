import { translations, getCurrentLang } from './i18n.js';

// 도서 데이터 수정
const bookData = {
   "harry-potter": {
       id: "harry-potter",
       title: {
           ko: "해리 포터와 마법사의 돌",
           en: "Harry Potter and the Philosopher's Stone"
       },
       description: {
           ko: "마법 세계의 모험",
           en: "Adventure in the magical world"
       },
       ageRatings: ["6-8", "9-12"],
       status: "active",
       coverImage: "../assets/books/harrypotter_bookcover.png"
   },
   "narnia": {
       id: "narnia",
       title: {
           ko: "나니아 연대기",
           en: "The Chronicles of Narnia"
       },
       description: {
           ko: "판타지 세계로의 여행",
           en: "Journey to a fantasy world"
       },
       status: "coming-soon",
       coverImage: "../assets/books/narnia.jpg"
   }
};

const DEFAULT_BOOK_COVER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg==';

// 번역 추가
const ageWarningMessages = {
    ko: "이 책은 현재 연령대에 적합하지 않습니다.",
    en: "This book is not suitable for your current age group."
};

class LibraryManager {
   constructor() {
       this.currentAge = localStorage.getItem('selectedAge') || '9-12';
       this.currentLang = getCurrentLang();
       this.searchTerm = '';
       this.initializeUI();
   }

   initializeUI() {
       const searchInput = document.querySelector('.search-bar input');
       if (searchInput) {
           searchInput.addEventListener('input', (e) => {
               this.searchTerm = e.target.value.toLowerCase().trim();
               this.updateBookDisplay();
           });
       }

       const backBtn = document.querySelector('.back-btn');
       if (backBtn) {
           backBtn.addEventListener('click', () => {
               window.location.href = 'index.html';
           });
       }

       this.updateBookDisplay();

       // 책 카드 클릭 이벤트 처리
       document.querySelectorAll('.book-card').forEach(card => {
           card.addEventListener('click', (e) => {
               const bookId = card.dataset.book;
               if (bookId && !card.classList.contains('disabled')) {
                   localStorage.setItem('selectedBook', bookId);
                   window.location.href = '/chat.html';
               }
           });
       });
   }

   updateBookDisplay() {
       const activeBooks = document.querySelector('.active-books .book-grid');
       const comingSoonBooks = document.querySelector('.coming-soon .book-grid');
       
       if (!activeBooks || !comingSoonBooks) return;

       activeBooks.innerHTML = '';
       comingSoonBooks.innerHTML = '';

       Object.values(bookData).forEach(book => {
           if (!this.matchesSearch(book)) return;

           const bookElement = this.createBookElement(book);
           if (book.status === 'active') {
               activeBooks.appendChild(bookElement);
           } else {
               comingSoonBooks.appendChild(bookElement);
           }
       });
   }

   matchesSearch(book) {
       if (!this.searchTerm) return true;
       return book.title[this.currentLang].toLowerCase().includes(this.searchTerm);
   }

   createBookElement(book) {
       const div = document.createElement('div');
       div.className = `book-card ${book.status === 'coming-soon' ? 'disabled' : 'active'}`;
       div.dataset.book = book.id;

       const isAgeAppropriate = book.ageRatings?.includes(this.currentAge);
       
       if (book.status === 'active') {
           div.addEventListener('click', () => {
               console.log('Current Age:', this.currentAge);
               console.log('Book Age Ratings:', book.ageRatings);
               console.log('Is Age Appropriate:', isAgeAppropriate);
               
               if (!isAgeAppropriate) {
                   alert(ageWarningMessages[this.currentLang]);
                   return;
               }
               this.selectBook(book.id);
           });
       }
       
       console.log('Attempting to load image:', book.coverImage);
       
       div.innerHTML = `
           <div class="book-image">
               <img src="${book.coverImage}" alt="${book.title[this.currentLang]}" 
                   onerror="console.error('Failed to load image:', this.src); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg=='">
               ${book.status === 'coming-soon' ? 
                   `<div class="coming-soon-overlay">${translations[this.currentLang].comingSoon}</div>` 
                   : ''}
           </div>
           <div class="book-info">
               <h3>${book.title[this.currentLang]}</h3>
               <p class="book-description">${book.description?.[this.currentLang] || ''}</p>
           </div>
       `;

       return div;
   }

   selectBook(bookId) {
       localStorage.setItem('selectedBook', bookId);
       const selectedAge = localStorage.getItem('selectedAge');
       window.location.href = `/chat.html?age=${selectedAge}`;
   }
}

window.library = new LibraryManager();

document.addEventListener('languageChanged', (e) => {
   if (e && e.detail && e.detail.language) {
       window.library.currentLang = e.detail.language;
       window.library.updateBookDisplay();
   }
});

export default LibraryManager;