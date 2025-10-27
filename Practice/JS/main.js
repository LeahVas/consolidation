// main.js — надёжная версия (работает и на index.html, и на settings.html)
document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------
     0) Установить тему на любой странице
     ------------------------- */
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);

  /* -------------------------
     1) Переключатель темы (на settings.html)
     ------------------------- */
  const themeSelect = document.getElementById('theme');
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', () => {
      const selected = themeSelect.value;
      document.body.setAttribute('data-theme', selected);
      localStorage.setItem('theme', selected);
    });
  }

  /* -------------------------
     2) Меню мобильное (если есть элементы в DOM)
     ------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const navContainer = document.getElementById('navContainer');
  if (menuToggle && navContainer) {
    menuToggle.addEventListener('click', () => {
      navContainer.classList.toggle('active');
    });

    // Закрыть меню при клике на ссылку (если есть nav-links)
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navContainer.classList.remove('active');
      });
    });
  }

  /* -------------------------
     3) Profile info: сохранить и подставить имя и "About me"
     Работает на settings.html (с input) и на index.html (показывает сохранённые)
     ------------------------- */
  const inputUsername = document.getElementById('username');
  const inputAbout = document.getElementById('about');
  const saveBtn = document.getElementById('saveProfile');

  // Если поля ввода есть (settings.html) — подставим сохранённые значения
  if (inputUsername) inputUsername.value = localStorage.getItem('username') || '';
  if (inputAbout) inputAbout.value = localStorage.getItem('about') || '';

  // Сохранение при нажатии Save
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (inputUsername) localStorage.setItem('username', inputUsername.value);
      if (inputAbout) localStorage.setItem('about', inputAbout.value);
      alert('Profile info saved!');
      // Обновим отображение на странице, если есть элементы показа
      updateDisplayedProfile();
    });
  }

  // Функция для обновления имени и "About me" на странице (index.html)
  function updateDisplayedProfile() {
    const displayName = document.getElementById('displayName'); // <h2 id="displayName">
    const displayAbout = document.getElementById('displayAbout'); // <p id="displayAbout">
    const savedName = localStorage.getItem('username');
    const savedAbout = localStorage.getItem('about');

    if (displayName) displayName.textContent = savedName ? savedName : 'Leah';
    if (displayAbout) displayAbout.textContent = savedAbout ? savedAbout : "I'm learning front-end development. I love plants and beautiful aesthetics. 🌿";
  }

  // Обновим отображение при загрузке (если на странице есть места для показа)
  updateDisplayedProfile();

  /* -------------------------
     4) Статус (Change status) — сохраняем в localStorage
     ------------------------- */
  const statusEl = document.querySelector('.status');
  const changeStatusBtn = document.getElementById('change-status');
  const savedStatus = localStorage.getItem('userStatus');
  if (statusEl && savedStatus) {
    statusEl.textContent = `💬 ${savedStatus}`;
  }

  if (changeStatusBtn && statusEl) {
    changeStatusBtn.addEventListener('click', () => {
      const newStatus = prompt('Enter a new status:');
      if (newStatus !== null) {
        statusEl.textContent = `💬 ${newStatus}`;
        localStorage.setItem('userStatus', newStatus);
      }
    });
  }

  /* -------------------------
     5) Посты + фото (локально)
     - сохраняем массив постов в localStorage (postsKey)
     - отрисовываем на странице (index.html)
     - поддерживаем лайки (сохранение количества лайков)
     ------------------------- */
  const POSTS_KEY = 'myProfilePostsV1';
  const postsSection = document.querySelector('.posts'); // контейнер секции постов
  if (postsSection) {

    // Создаём контейнер для списка постов, если его нет
    let postsList = postsSection.querySelector('.posts-list');
    if (!postsList) {
      postsList = document.createElement('div');
      postsList.className = 'posts-list';
      // вставим после заголовка posts-header
      const header = postsSection.querySelector('.posts-header');
      if (header && header.nextSibling) header.parentNode.insertBefore(postsList, header.nextSibling);
      else postsSection.appendChild(postsList);
    }

    // Загрузить посты из localStorage
    function loadPosts() {
      const raw = localStorage.getItem(POSTS_KEY);
      return raw ? JSON.parse(raw) : [];
    }

    function savePosts(posts) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }

    // Рендерим весь список (новые сверху)
    function renderPosts() {
      const posts = loadPosts();
      postsList.innerHTML = '';
      if (posts.length === 0) {
        postsList.innerHTML = '<p style="color:#666">There are no posts yet - be the first!</p>';
        return;
      }
      // отрисовываем по порядку — newest first
      for (let i = posts.length - 1; i >= 0; i--) {
        const p = posts[i];
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.dataset.index = i; // индекс в массиве
        // если есть изображение (данные в base64) — показываем
        const imgHtml = p.image ? `<div class="post-img-wrap"><img src="${p.image}" alt="photo" style="max-width:100%; border-radius:8px; margin-top:10px;"></div>` : '';
        postEl.innerHTML = `
          <p>${escapeHtml(p.text)}</p>
          ${imgHtml}
          <button class="like-btn">♥️ ${p.likes}</button>
        `;
        postsList.appendChild(postEl);
      }
    }

    // Вспомогательная простая функция для экранирования HTML
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // Кнопка добавления поста (может существовать)
    const addPostBtn = document.getElementById('add-post-btn');
    if (addPostBtn) {
      addPostBtn.addEventListener('click', () => {
        // простая форма: сначала текст, затем выбор файла (опционально)
        const text = prompt('Введите текст поста:');
        if (text === null) return;
        // спросим, хотим ли прикрепить фото
        const wantPhoto = confirm('Add a photo to the post? (OK - yes, Cancel - no)');
        if (wantPhoto) {
          // создаём input file динамически
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.onchange = () => {
            const file = fileInput.files[0];
            if (!file) {
              createAndSavePost(text, null);
              return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
              const base64 = e.target.result;
              createAndSavePost(text, base64);
            };
            reader.readAsDataURL(file);
          };
          // программно откроем диалог выбора файла
          fileInput.click();
        } else {
          createAndSavePost(text, null);
        }
      });
    }

    function createAndSavePost(text, base64image) {
      const posts = loadPosts();
      posts.push({ text: text.trim(), image: base64image, likes: 0, created: Date.now() });
      savePosts(posts);
      renderPosts();
    }

    // Делегирование клика: лайки
    postsList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('like-btn')) return;
      const postEl = e.target.closest('.post');
      const index = parseInt(postEl.dataset.index, 10);
      const posts = loadPosts();
      // индекс в массиве соответствует i (мы рендерим newest first),
      // поэтому реальный индекс — index
      posts[index].likes += 1;
      savePosts(posts);
      renderPosts();
    });

    // Рендерим при загрузке
    renderPosts();
  }

});
