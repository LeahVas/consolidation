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