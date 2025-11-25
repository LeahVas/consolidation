// chat.js - функциональность мессенджера
document.addEventListener('DOMContentLoaded', function() {
    // 1. НАХОДИМ ВСЕ НУЖНЫЕ ЭЛЕМЕНТЫ НА СТРАНИЦЕ
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const messagesContainer = document.getElementById('messagesContainer');
    const chatItems = document.querySelectorAll('.chat-item');
    const newChatBtn = document.querySelector('.new-chat-btn');

    // 2. ФУНКЦИЯ ДЛЯ СОХРАНЕНИЯ СООБЩЕНИЙ В LOCALSTORAGE
    function saveMessage(chatId, message, isSent = true) {
        // Получаем текущие сообщения для этого чата
        const existingMessages = JSON.parse(localStorage.getItem(`chat_${chatId}`)) || [];
        
        // Добавляем новое сообщение
        existingMessages.push({
            text: message,
            isSent: isSent,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        
        // Сохраняем обратно в localStorage
        localStorage.setItem(`chat_${chatId}`, JSON.stringify(existingMessages));
    }

    // 3. ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ СООБЩЕНИЙ ИЗ LOCALSTORAGE
    function loadMessages(chatId) {
        const messages = localStorage.getItem(`chat_${chatId}`);
        return messages ? JSON.parse(messages) : [];
    }

    // 4. ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ СООБЩЕНИЙ НА СТРАНИЦЕ
    function displayMessages(chatId) {
        const messages = loadMessages(chatId);
        messagesContainer.innerHTML = ''; // Очищаем контейнер
        
        // Для каждого сообщения создаем HTML-элемент
        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${msg.isSent ? 'sent' : 'received'}`;
            
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${msg.text}</p>
                    <span class="message-time">${msg.time}</span>
                </div>
            `;
            
            messagesContainer.appendChild(messageElement);
        });
        
        // Прокручиваем вниз к последнему сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 5. ФУНКЦИЯ ОТПРАВКИ СООБЩЕНИЯ
    function sendMessage() {
        const messageText = messageInput.value.trim();
        
        // Проверяем, что сообщение не пустое
        if (messageText === '') {
            return; // Выходим из функции если сообщение пустое
        }
        
        // Находим активный чат
        const activeChat = document.querySelector('.chat-item.active');
        if (!activeChat) return;
        
        const chatId = activeChat.dataset.chat;
        
        // Сохраняем отправленное сообщение
        saveMessage(chatId, messageText, true);
        
        // Показываем сообщение в чате
        displayMessages(chatId);
        
        // Очищаем поле ввода
        messageInput.value = '';
        
        // Имитируем ответ (можно убрать в будущем)
        simulateResponse(chatId);
    }

    // 6. ФУНКЦИЯ ДЛЯ ИМИТАЦИИ ОТВЕТА ОТ СОБЕСЕДНИКА
    function simulateResponse(chatId) {
        setTimeout(() => {
            const responses = [
                "Привет! Как твои дела?",
                "Интересно! Расскажи подробнее",
                "Я понимаю тебя",
                "Это здорово! 🎉",
                "Спасибо, что поделился этим",
                "Что ты об этом думаешь?",
                "У меня тоже так было!",
                "Продолжай в том же духе! 💪"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            saveMessage(chatId, randomResponse, false);
            displayMessages(chatId);
            
        }, 1000 + Math.random() * 2000); // Случайная задержка 1-3 секунды
    }

    // 7. ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ МЕЖДУ ЧАТАМИ
    function switchChat(chatElement) {
        // Убираем активный класс у всех чатов
        chatItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Добавляем активный класс выбранному чату
        chatElement.classList.add('active');
        
        // Загружаем сообщения для этого чата
        const chatId = chatElement.dataset.chat;
        displayMessages(chatId);
    }

    // 8. ФУНКЦИЯ ДЛЯ СОЗДАНИЯ НОВОГО ЧАТА
    function createNewChat() {
        // Создаем уникальный ID для нового чата
        const newChatId = 'user' + (Date.now());
        const newChatName = 'Новый контакт';
        
        // Создаем HTML для нового чата
        const newChatHTML = `
            <div class="chat-item" data-chat="${newChatId}">
                <div class="chat-avatar">👤</div>
                <div class="chat-info">
                    <h3>${newChatName}</h3>
                    <p>Начните общение</p>
                    <span class="chat-time">Сейчас</span>
                </div>
            </div>
        `;
        
        // Добавляем новый чат в список
        document.querySelector('.chats-list').insertAdjacentHTML('afterbegin', newChatHTML);
        
        // Переключаемся на новый чат
        const newChatElement = document.querySelector(`[data-chat="${newChatId}"]`);
        switchChat(newChatElement);
        
        // Добавляем обработчик клика для нового чата
        newChatElement.addEventListener('click', function() {
            switchChat(this);
        });
        
        // Показываем приветственное сообщение
        setTimeout(() => {
            saveMessage(newChatId, "Привет! Рад познакомиться! 👋", false);
            displayMessages(newChatId);
        }, 500);
    }

    // 9. НАСТРАИВАЕМ ОБРАБОТЧИКИ СОБЫТИЙ

    // Отправка сообщения по клику на кнопку
    sendMessageBtn.addEventListener('click', sendMessage);

    // Отправка сообщения по нажатию Enter
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Переключение между существующими чатами
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            switchChat(this);
        });
    });

    // Создание нового чата
    newChatBtn.addEventListener('click', createNewChat);

    // 10. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
    
    // Загружаем сообщения для активного чата
    const activeChat = document.querySelector('.chat-item.active');
    if (activeChat) {
        displayMessages(activeChat.dataset.chat);
    }
    
    // Фокусируемся на поле ввода сообщения
    messageInput.focus();
    
    console.log('Мессенджер загружен! 💬');
});