// 用户数据
let userData = {
  name: "John Doe",
  email: "john.doe@example.com",
  apiKey: "",
  model: "gpt-4",
  temperature: 0.7,
  darkMode: false,
  autoSave: true
};

// 应用状态
let appState = {
  currentPage: "chatPage",
  currentChat: 0,
  chats: [
    {
      id: 1,
      title: "AI助手介绍",
      messages: [
        {
          role: "assistant",
          content: "你好！👋 我是AI助手，有什么我可以帮助你的吗？\n\n你可以询问我各种问题，我会尽力为你提供有用的信息和建议。无论是工作、学习还是生活中的疑问，都可以向我咨询。",
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }
      ]
    },
    {
      id: 2,
      title: "项目规划讨论",
      messages: []
    },
    {
      id: 3,
      title: "创意头脑风暴",
      messages: []
    }
  ]
};

// DOM 元素
const loginPage = document.getElementById('loginPage');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelectorAll('.nav-link');
const contentPages = document.querySelectorAll('.content');
const pageTitle = document.getElementById('pageTitle');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const modelSelect = document.getElementById('modelSelect');
const modelOptions = document.getElementById('modelOptions');

// 登录功能
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // 默认用户名和密码
  if ((username === 'admin' && password === 'admin123') || 
      (username === 'user' && password === 'user123')) {
    loginPage.style.display = 'none';
    appContainer.style.display = 'grid';
    loadUserData();
    renderUI();
    navigateTo(appState.currentPage);
    userData.name = username;
    document.querySelector('.user-name').textContent = username;
    document.querySelector('.user-avatar').textContent = username.substring(0, 2).toUpperCase();
    
    loginPage.style.opacity = '0';
    loginPage.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      loginPage.style.display = 'none';
      appContainer.style.display = 'grid';
      
      setTimeout(() => {
        sidebar.style.transform = 'translateX(0)';
        document.querySelector('.header').style.opacity = '1';
        document.querySelector('.main').style.opacity = '1';
      }, 100);
    }, 300);
  } else {
    showLoginError();
  }
});

// 显示登录错误
function showLoginError() {
  const errorMessage = document.createElement('div');
  errorMessage.className = 'login-error';
  errorMessage.textContent = '用户名或密码错误';
  errorMessage.style.color = 'var(--danger)';
  errorMessage.style.marginTop = '1rem';
  errorMessage.style.fontSize = '0.875rem';
  
  const existingError = document.querySelector('.login-error');
  if (existingError) {
    loginForm.removeChild(existingError);
  }
  
  loginForm.appendChild(errorMessage);
  
  const loginCard = document.querySelector('.login-card');
  loginCard.style.animation = 'none';
  setTimeout(() => {
    loginCard.style.animation = 'shake 0.5s ease';
  }, 10);
}

// 侧边栏菜单切换
menuToggle.addEventListener('click', function() {
  sidebar.classList.toggle('open');
});

// 导航链接点击
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    navLinks.forEach(item => item.classList.remove('active'));
    this.classList.add('active');
    
    const pageId = this.getAttribute('data-page');
    appState.currentPage = pageId;
    
    pageTitle.textContent = pageId === 'chatPage' ? 'AI对话' : '设置';
    
    contentPages.forEach(page => {
      page.classList.remove('active');
      if (page.id === pageId) {
        page.classList.add('active');
      }
    });
    
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
    }
  });
});

// 聊天功能
chatInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
  sendBtn.disabled = !this.value.trim();
});

chatInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey && !sendBtn.disabled) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  
  addMessage('user', message);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  sendBtn.disabled = true;
  
  showTypingIndicator();
  
  if (!userData.apiKey) {
    removeTypingIndicator();
    addMessage('assistant', '请在设置中配置API密钥后再使用。');
    return;
  }
  
  // 模拟API调用
  setTimeout(() => {
    removeTypingIndicator();
    addMessage('assistant', '这是一个模拟的AI响应。在实际应用中，这里应该调用AI API获取响应。');
  }, 1000);
}

function addMessage(role, content) {
  const message = document.createElement('div');
  message.className = `message ${role}`;
  message.innerHTML = `
    <div class="message-avatar ${role}">${role === 'user' ? userData.name.substring(0, 2).toUpperCase() : 'AI'}</div>
    <div class="message-content">
      <div class="message-header">
        <div class="message-name">${role === 'user' ? userData.name : 'AiChat 助手'}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </div>
      <div class="message-bubble">
        <p>${content}</p>
      </div>
      ${role === 'assistant' ? `
        <div class="message-actions">
          <button class="message-action">👍 赞</button>
          <button class="message-action">👎 踩</button>
          <button class="message-action">🔄 重新生成</button>
          <button class="message-action">📋 复制</button>
        </div>
      ` : ''}
    </div>
  `;
  
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // 保存到聊天历史
  if (appState.currentChat < appState.chats.length) {
    appState.chats[appState.currentChat].messages.push({
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });
  }
}

function showTypingIndicator() {
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message ai typing';
  typingIndicator.innerHTML = `
    <div class="message-avatar ai">AI</div>
    <div class="message-content">
      <div class="message-bubble">
        <p>正在输入...</p>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicator = document.querySelector('.typing');
  if (typingIndicator) {
    chatMessages.removeChild(typingIndicator);
  }
}

// 模型选择
modelSelect.addEventListener('click', function() {
  modelOptions.style.display = modelOptions.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', function(e) {
  if (!modelSelect.contains(e.target)) {
    modelOptions.style.display = 'none';
  }
});

modelOptions.querySelectorAll('.model-option').forEach(option => {
  option.addEventListener('click', function() {
    const selectedModel = this.textContent;
    document.querySelector('.model-select-text').textContent = selectedModel;
    modelOptions.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('active'));
    this.classList.add('active');
    userData.model = selectedModel.toLowerCase();
    saveUserData();
  });
});

// 数据持久化
function saveUserData() {
  localStorage.setItem('userData', JSON.stringify(userData));
}

function loadUserData() {
  const savedData = localStorage.getItem('userData');
  if (savedData) {
    userData = JSON.parse(savedData);
    renderUI();
  }
}

function saveChats() {
  localStorage.setItem('chats', JSON.stringify(appState.chats));
}

function loadChats() {
  const savedChats = localStorage.getItem('chats');
  if (savedChats) {
    appState.chats = JSON.parse(savedChats);
    renderChats();
  }
}

// UI渲染
function renderUI() {
  document.querySelector('.user-name').textContent = userData.name;
  document.querySelector('.user-avatar').textContent = userData.name.substring(0, 2).toUpperCase();
  document.querySelector('.model-select-text').textContent = userData.model.toUpperCase();
}

function renderChats() {
  const chatList = document.getElementById('chatList');
  chatList.innerHTML = appState.chats.map((chat, index) => `
    <li class="chat-item ${index === appState.currentChat ? 'active' : ''}" data-chat-id="${chat.id}">
      <span class="nav-icon">💬</span>
      <span class="chat-item-title">${chat.title}</span>
    </li>
  `).join('');
}

// 响应式处理
function handleResize() {
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('open');
  }
}

window.addEventListener('resize', handleResize);

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  loadUserData();
  loadChats();
  chatInput.focus();
  sendBtn.disabled = true;
  handleResize();
});

// 深色模式样式
const darkModeStyles = `
  :root.dark-mode {
    --primary: #3b82f6;
    --primary-light: #60a5fa;
    --primary-dark: #2563eb;
    --secondary: #1e293b;
    --light: #0f172a;
    --dark: #f8fafc;
    --gray: #94a3b8;
    --gray-light: #334155;
    --text: #f8fafc;
  }
  
  :root.dark-mode body {
    background-color: var(--light);
    color: var(--text);
  }
  
  :root.dark-mode .sidebar,
  :root.dark-mode .header,
  :root.dark-mode .message-bubble,
  :root.dark-mode .settings-section,
  :root.dark-mode .chat-input,
  :root.dark-mode input,
  :root.dark-mode select {
    background-color: #1e293b;
    color: var(--text);
    border-color: var(--gray-light);
  }
  
  :root.dark-mode .sidebar-header,
  :root.dark-mode .sidebar-footer {
    border-color: var(--gray-light);
  }
  
  :root.dark-mode .message.ai .message-bubble {
    background-color: var(--secondary);
  }
  
  :root.dark-mode .nav-link:hover,
  :root.dark-mode .nav-link.active,
  :root.dark-mode .chat-item:hover,
  :root.dark-mode .chat-item.active {
    background-color: #334155;
  }
  
  :root.dark-mode .message-action:hover {
    background-color: #334155;
  }
`;

// 添加深色模式样式到页面
const styleEl = document.createElement('style');
styleEl.textContent = darkModeStyles;
document.head.appendChild(styleEl);