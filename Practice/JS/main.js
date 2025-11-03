// main.js — исправленная надёжная версия
document.addEventListener('DOMContentLoaded', () => {
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
     1) Меню мобильное
  ------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const navContainer = document.getElementById('navContainer');
  if (menuToggle && navContainer) {
    menuToggle.addEventListener('click', () => navContainer.classList.toggle('active'));
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navContainer.classList.remove('active'));
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
     4) Посты + фото (локально)
  ------------------------- */
  const POSTS_KEY = 'myProfilePostsV1';
  const postsSection = document.querySelector('.posts');

  if (postsSection) {
    // создаём контейнер списка постов, если его нет
    let postsList = postsSection.querySelector('.posts-list');
    if (!postsList) {
      postsList = document.createElement('div');
      postsList.className = 'posts-list';
      const header = postsSection.querySelector('.posts-header');
      if (header && header.nextSibling) header.parentNode.insertBefore(postsList, header.nextSibling);
      else postsSection.appendChild(postsList);
    }

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

    function renderPosts() {
      const posts = loadPosts();
      postsList.innerHTML = '';
      if (posts.length === 0) {
        postsList.innerHTML = '<p style="color:#666">Пока нет постов — добавь первый!</p>';
        return;
      }
      // newest first
      for (let i = posts.length - 1; i >= 0; i--) {
        const p = posts[i];
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.dataset.index = i;
        const imgHtml = p.image ? `<div class="post-img-wrap"><img src="${p.image}" alt="photo" style="max-width:100%; border-radius:8px; margin-top:10px;"></div>` : '';
        postEl.innerHTML = `<p>${escapeHtml(p.text)}</p>${imgHtml}<button class="like-btn">♥️ ${p.likes}</button>`;
        postsList.appendChild(postEl);
      }
    }

    const addPostBtn = document.getElementById('add-post-btn');
    if (addPostBtn) {
      addPostBtn.addEventListener('click', () => {
        const text = prompt('Введите текст поста:');
        if (text === null) return;
        const wantPhoto = confirm('Добавить фото к посту? (OK — да, Отмена — нет)');
        if (wantPhoto) {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.onchange = () => {
            const file = fileInput.files[0];
            if (!file) { createAndSavePost(text, null); return; }
            const reader = new FileReader();
            reader.onload = function(e) { createAndSavePost(text, e.target.result); };
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
      posts.push({ text: text.trim(), image: base64image, likes: 0, created: Date.now() });
      savePosts(posts);
      renderPosts();
    }

    postsList.addEventListener('click', (e) => {
      if (!e.target.classList.contains('like-btn')) return;
      const postEl = e.target.closest('.post');
      const index = parseInt(postEl.dataset.index, 10);
      const posts = loadPosts();
      posts[index].likes += 1;
      savePosts(posts);
      renderPosts();
    });

    renderPosts();
  }

}); // end DOMContentLoaded
