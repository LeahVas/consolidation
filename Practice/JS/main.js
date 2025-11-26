// main.js — полная исправленная версия с мобильным меню
document.addEventListener('DOMContentLoaded', () => {

  // Инициализация начальных постов, если их нет
  if (!localStorage.getItem('myProfilePostsV1')) {
    const initialPosts = [
      { text: "Today I started a new project!", image: null, likes: 0, created: Date.now() },
      { text: "Working on my new programming project!", image: null, likes: 3, created: Date.now() - 100000 }
    ];
    localStorage.setItem('myProfilePostsV1', JSON.stringify(initialPosts));
  }

  /* -------------------------
     0) Тема
  ------------------------- */
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);

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
     1) МОБИЛЬНОЕ МЕНЮ - ИСПРАВЛЕННАЯ ВЕРСИЯ
  ------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const navContainer = document.getElementById('navContainer');
  const body = document.body;

  if (menuToggle && navContainer) {
    // Функция для открытия/закрытия меню
    function toggleMobileMenu() {
      const isActive = navContainer.classList.toggle('active');
      menuToggle.textContent = isActive ? '✕' : '☰';
      
      // Блокируем прокрутку body когда меню открыто
      if (isActive) {
        body.style.overflow = 'hidden';
      } else {
        body.style.overflow = '';
      }
    }

    // Функция для закрытия меню
    function closeMobileMenu() {
      navContainer.classList.remove('active');
      menuToggle.textContent = '☰';
      body.style.overflow = '';
    }

    // Обработчик клика на кнопку меню
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Закрытие меню при клике вне его области
    document.addEventListener('click', (e) => {
      if (navContainer.classList.contains('active') && 
          !navContainer.contains(e.target) && 
          e.target !== menuToggle) {
        closeMobileMenu();
      }
    });

    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navContainer.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Закрытие меню при изменении размера окна (на случай поворота устройства)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navContainer.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }

  /* -------------------------
     2) Profile info (settings <-> index)
     - подставляет значения в поля (если они есть)
     - сохраняет при клике на кнопку
     - обновляет отображение на index.html
  ------------------------- */
  const inputUsername = document.getElementById('username'); // поле на settings
  const inputAbout = document.getElementById('about');       // поле на settings
  const saveBtn = document.getElementById('saveProfile') || document.getElementById('saveSettings'); // кнопка Save (поддерживаем оба id)

  // Подставляем сохранённые значения в поля (если мы на settings.html)
  if (inputUsername) inputUsername.value = localStorage.getItem('username') || '';
  if (inputAbout) inputAbout.value = localStorage.getItem('about') || '';

  // Функция обновления видимого профиля на любой странице (index.html)
  function updateDisplayedProfile() {
    const displayName = document.getElementById('displayName');
    const displayAbout = document.getElementById('displayAbout');
    const savedName = localStorage.getItem('username');
    const savedAbout = localStorage.getItem('about');

    if (displayName) displayName.textContent = savedName ? savedName : 'Leah';
    if (displayAbout) displayAbout.textContent = savedAbout ? savedAbout : "I'm learning front-end development. I love plants and beautiful aesthetics. 🌿";
  }

  // Вешаем обработчик сохранения (если есть кнопка)
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (inputUsername) localStorage.setItem('username', inputUsername.value);
      if (inputAbout) localStorage.setItem('about', inputAbout.value);
      updateDisplayedProfile();
      const original = saveBtn.textContent;
      saveBtn.textContent = '✅ Saved';
      setTimeout(() => { saveBtn.textContent = original; }, 900);
    });
  }

  // Подставляем сразу (если мы на index.html)
  updateDisplayedProfile();

  /* -------------------------
     3) Статус (Change status)
  ------------------------- */
  const statusEl = document.querySelector('.status');
  const changeStatusBtn = document.getElementById('change-status');
  const savedStatus = localStorage.getItem('userStatus');
  if (statusEl && savedStatus) statusEl.textContent = `💬 ${savedStatus}`;

  if (changeStatusBtn && statusEl) {
    changeStatusBtn.addEventListener('click', () => {
      const newStatus = prompt('Введите новый статус:');
      if (newStatus !== null) {
        statusEl.textContent = `💬 ${newStatus}`;
        localStorage.setItem('userStatus', newStatus);
      }
    });
  }

  /* -------------------------
     4) Посты + фото (локально) с удалением - ИСПРАВЛЕННАЯ ВЕРСИЯ
  ------------------------- */
  const POSTS_KEY = 'myProfilePostsV1';
  const postsSection = document.querySelector('.posts');

  if (postsSection) {
    let postsList = postsSection.querySelector('.posts-list');

    function loadPosts() {
      const raw = localStorage.getItem(POSTS_KEY);
      return raw ? JSON.parse(raw) : [];
    }

    function savePosts(posts) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Функция для преобразования статических постов в данные
    function getStaticPosts() {
      const staticPosts = [];
      const staticPostElements = postsList.querySelectorAll('.post');

      staticPostElements.forEach((postEl, index) => {
        const text = postEl.querySelector('p').textContent;
        const likesText = postEl.querySelector('.like-btn').textContent;
        const likes = parseInt(likesText.match(/\d+/)) || 0;

        staticPosts.push({
          text: text,
          image: null,
          likes: likes,
          created: Date.now() - (staticPostElements.length - index) * 100000,
        });
      });

      return staticPosts;
    }

    // Инициализация постов при первом запуске
    function initializePosts() {
      const existingPosts = loadPosts();
      if (existingPosts.length === 0) {
        const staticPosts = getStaticPosts();
        savePosts(staticPosts);
      }
    }

    function renderPosts() {
      const posts = loadPosts();
      postsList.innerHTML = '';

      if (posts.length === 0) {
        postsList.innerHTML = '<p style="color:#666; padding: 20px; text-align: center;">Пока нет постов — добавь первый!</p>';
        return;
      }

      // Отображаем посты от новых к старым
      const sortedPosts = [...posts].sort((a, b) => b.created - a.created);

      sortedPosts.forEach((p, displayIndex) => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        // Сохраняем ОРИГИНАЛЬНЫЙ индекс из массива posts
        const originalIndex = posts.indexOf(p);
        postEl.dataset.originalIndex = originalIndex;

        const imgHtml = p.image ?
          `<div class="post-img-wrap"><img src="${p.image}" alt="photo" style="max-width:100%; border-radius:8px; margin-top:10px;"></div>` : '';

        postEl.innerHTML = `
                <button class="delete-post-btn" data-original-index="${originalIndex}">🗑️</button>
                <p>${escapeHtml(p.text)}</p>
                ${imgHtml}
                <button class="like-btn">❤️ ${p.likes}</button>
            `;
        postsList.appendChild(postEl);
      });
    }

    // Функция удаления поста
    function deletePost(originalIndex) {
      const posts = loadPosts();

      if (confirm('Вы уверены, что хотите удалить этот пост?')) {
        posts.splice(originalIndex, 1);
        savePosts(posts);
        renderPosts();
      }
    }

    const addPostBtn = document.getElementById('add-post-btn');
    if (addPostBtn) {
      addPostBtn.addEventListener('click', () => {
        const text = prompt('Введите текст поста:');
        if (text === null || text.trim() === '') return;

        const wantPhoto = confirm('Добавить фото к посту? (OK — да, Отмена — нет)');
        if (wantPhoto) {
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
              createAndSavePost(text, e.target.result);
            };
            reader.readAsDataURL(file);
          };
          fileInput.click();
        } else {
          createAndSavePost(text, null);
        }
      });
    }

    function createAndSavePost(text, base64image) {
      const posts = loadPosts();
      posts.push({
        text: text.trim(),
        image: base64image,
        likes: 0,
        created: Date.now()
      });
      savePosts(posts);
      renderPosts();
    }

    // Обработчики для лайков и удаления - ИСПРАВЛЕННЫЕ
    postsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('like-btn')) {
        const postEl = e.target.closest('.post');
        const originalIndex = parseInt(postEl.dataset.originalIndex, 10);
        const posts = loadPosts();

        // Используем ОРИГИНАЛЬНЫЙ индекс для точного нахождения поста
        if (posts[originalIndex]) {
          posts[originalIndex].likes += 1;
          savePosts(posts);
          renderPosts();
        }
      }

      if (e.target.classList.contains('delete-post-btn')) {
        const originalIndex = parseInt(e.target.dataset.originalIndex, 10);
        deletePost(originalIndex);
      }
    });

    // Инициализируем и рендерим посты
    initializePosts();
    renderPosts();
  }

  /* -------------------------
     5) Дополнительные улучшения для мобильных устройств
  ------------------------- */
  
  // Предотвращение масштабирования при двойном тапе (для iOS)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Улучшение обработки касаний для кнопок
  document.querySelectorAll('button, a').forEach(element => {
    element.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.98)';
    });
    
    element.addEventListener('touchend', function() {
      this.style.transform = '';
    });
  });

  // Оптимизация для мобильных устройств
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
  }

  console.log('My Profile app loaded successfully! 🚀');
});