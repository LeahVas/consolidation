// Получаем элементы
const menuToggle = document.getElementById('menuToggle');
const navContainer = document.getElementById('navContainer');

// Добавляем обработчик клика на кнопку меню
menuToggle.addEventListener('click', function() {
    navContainer.classList.toggle('active');
});

// Закрываем меню при клике на ссылку
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        navContainer.classList.remove('active');
    });
});

// Можно добавить сообщение для проверки
console.log('JavaScript подключен! Меню готово к работе!');

const statusEl = document.querySelector('.status');
const changeStatusBtn = document.getElementById('change-status');

changeStatusBtn.addEventListener('click', () => {
  const newStatus = prompt('Введите новый статус:');
  if (newStatus) {
    statusEl.textContent = `💬 ${newStatus}`;
    localStorage.setItem('userStatus', newStatus); // сохраняем в localStorage
  }
});

// при загрузке страницы восстанавливаем статус
const savedStatus = localStorage.getItem('userStatus');
if (savedStatus) {
  statusEl.textContent = `💬 ${savedStatus}`;
}

const addPostBtn = document.getElementById('add-post-btn');
const postsContainer = document.querySelector('.posts');

addPostBtn.addEventListener('click', () => {
  const postText = prompt('Введите текст поста:');
  if (postText) {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');
    postDiv.innerHTML = `
      <p>${postText}</p>
      <button class="like-btn">♥️ 0</button>
    `;
    postsContainer.appendChild(postDiv);
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('like-btn')) {
    let count = parseInt(e.target.textContent.replace('♥️', '').trim());
    e.target.textContent = `♥️ ${count + 1}`;
  }
});
