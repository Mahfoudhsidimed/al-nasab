// ========================================
// وظائف رسالة الترحيب (Welcome Modal Functions)
// ========================================

/**
 * دالة إغلاق رسالة الترحيب
 */
function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    modal.classList.add('hidden');
    // حفظ الحالة في localStorage بحيث لا تظهر مرة أخرى
    localStorage.setItem('welcomeModalClosed', 'true');
}

/**
 * دالة عرض رسالة الترحيب عند الدخول
 */
function showWelcomeModal() {
    // التحقق مما إذا كانت الرسالة مغلقة بالفعل
    const isModalClosed = localStorage.getItem('welcomeModalClosed');
    
    if (!isModalClosed) {
        const modal = document.getElementById('welcomeModal');
        modal.classList.remove('hidden');
        
        // إغلاق الرسالة بالضغط على الخلفية
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeWelcomeModal();
            }
        });
    }
}

// ========================================
// وظائف تحميل البيانات (Data Loading Functions)
// ========================================

let genealogyData = {};

/**
 * تحميل بيانات الأنساب من ملف JSON
 */
async function loadGenealogyData() {
    try {
        const response = await fetch('/data/genealogy_db_v2.json');
        if (!response.ok) {
            throw new Error('فشل تحميل البيانات');
        }
        genealogyData = await response.json();
        console.log('✓ تم تحميل بيانات الأنساب بنجاح');
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        showNotification('خطأ في تحميل بيانات الأنساب', 'error');
    }
}

// ========================================
// وظائف البحث (Search Functions)
// ========================================

/**
 * البحث عن شخص في شجرة الأنساب
 */
function searchInTree(tree, searchTerm) {
    const results = [];
    
    function traverse(node, path = '') {
        if (typeof node !== 'object' || node === null) return;
        
        for (const [key, value] of Object.entries(node)) {
            const currentPath = path ? `${path} > ${key}` : key;
            
            // التحقق من تطابق الاسم
            if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({
                    name: key,
                    path: currentPath,
                    data: value
                });
            }
            
            // البحث المتكرر
            if (typeof value === 'object' && value !== null) {
                traverse(value, currentPath);
            }
        }
    }
    
    traverse(tree);
    return results;
}

/**
 * دالة البحث عن الأهل
 */
function searchFamily() {
    const input = event.target.previousElementSibling;
    const searchTerm = input.value.trim();
    
    if (!searchTerm) {
        showNotification('يرجى إدخال اسم أو نسب للبحث', 'warning');
        return;
    }
    
    const results = searchInTree(genealogyData, searchTerm);
    
    if (results.length === 0) {
        showNotification(`لم يتم العثور على نتائج للبحث عن: ${searchTerm}`, 'warning');
    } else {
        let message = `تم العثور على ${results.length} نتيجة:\n\n`;
        results.slice(0, 5).forEach((result, index) => {
            message += `${index + 1}. ${result.name}\n`;
        });
        if (results.length > 5) {
            message += `\n... و ${results.length - 5} نتائج أخرى`;
        }
        showNotification(message, 'success');
    }
}

/**
 * دالة البحث عن القرابة
 */
function searchRelationship() {
    const input = event.target.previousElementSibling;
    const searchTerm = input.value.trim();
    
    if (!searchTerm) {
        showNotification('يرجى إدخال أسماء الأشخاص للبحث', 'warning');
        return;
    }
    
    const results = searchInTree(genealogyData, searchTerm);
    
    if (results.length === 0) {
        showNotification(`لم يتم العثور على نتائج للبحث عن: ${searchTerm}`, 'warning');
    } else {
        let message = `تم العثور على ${results.length} نتيجة:\n\n`;
        results.slice(0, 5).forEach((result, index) => {
            message += `${index + 1}. ${result.name}\n`;
        });
        if (results.length > 5) {
            message += `\n... و ${results.length - 5} نتائج أخرى`;
        }
        showNotification(message, 'success');
    }
}

/**
 * دالة عرض التنبيهات
 * @param {string} message - نص الرسالة
 * @param {string} type - نوع التنبيه (info, warning, success, error)
 */
function showNotification(message, type = 'info') {
    // إنشاء عنصر التنبيه
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // إضافة التنبيه إلى الصفحة
    document.body.appendChild(notification);
    
    // إظهار التنبيه مع رسم متحرك
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // إزالة التنبيه بعد 4 ثوان
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ========================================
// وظائف التنقل (Navigation Functions)
// ========================================

/**
 * تحديث حالة الروابط النشطة عند التمرير
 */
document.addEventListener('DOMContentLoaded', function() {
    // تحميل بيانات الأنساب
    loadGenealogyData();
    
    // عرض رسالة الترحيب عند الدخول
    showWelcomeModal();
    
    // تحديث الروابط النشطة عند التمرير
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
    
    // إضافة مستمع الأحداث للروابط
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // إضافة مستمع الأحداث لحقول الإدخال
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const btn = this.nextElementSibling;
                btn.click();
            }
        });
    });
});

// ========================================
// أنماط التنبيهات (Notification Styles)
// ========================================

// إضافة أنماط التنبيهات ديناميكياً
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        font-family: 'Cairo', sans-serif;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
        white-space: pre-wrap;
        line-height: 1.5;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .notification-info {
        background-color: #E3F2FD;
        color: #1976D2;
        border-right: 4px solid #1976D2;
    }
    
    .notification-warning {
        background-color: #FFF3E0;
        color: #F57C00;
        border-right: 4px solid #F57C00;
    }
    
    .notification-success {
        background-color: #E8F5E9;
        color: #388E3C;
        border-right: 4px solid #388E3C;
    }
    
    .notification-error {
        background-color: #FFEBEE;
        color: #D32F2F;
        border-right: 4px solid #D32F2F;
    }
    
    @media (max-width: 480px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            transform: translateX(0) translateY(-100px);
        }
        
        .notification.show {
            transform: translateX(0) translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// تأثيرات الحركة (Animation Effects)
// ========================================

/**
 * مراقب التقاطع (Intersection Observer) لتفعيل الرسوم المتحركة
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// مراقبة جميع البطاقات
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.search-card, .about-content');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
});

// ========================================
// وظائف إضافية
// ========================================

/**
 * دالة للتحقق من الأجهزة المحمولة
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * دالة لتحسين الأداء على الأجهزة المحمولة
 */
if (isMobileDevice()) {
    document.body.classList.add('mobile-device');
}

// ========================================
// وظائف البوت mhf.ahmed (LLM Bot Functions)
// ========================================

/**
 * تبديل حالة نافذة الدردشة (فتح/إغلاق)
 */
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'flex';
        document.getElementById('chatInput').focus();
    } else {
        chatWindow.style.display = 'none';
    }
}

/**
 * التعامل مع ضغط مفتاح Enter في حقل الدردشة
 */
function handleChatKey(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

/**
 * إرسال رسالة إلى البوت
 */
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // إضافة رسالة المستخدم للواجهة
    addMessageToUI(message, 'user');
    input.value = '';
    
    // إظهار مؤشر الكتابة
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'block';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error('فشل الاتصال بالخادم');
        }
        
        const data = await response.json();
        
        // إضافة رد البوت للواجهة
        addMessageToUI(data.reply, 'bot');
    } catch (error) {
        console.error('Chat Error:', error);
        addMessageToUI('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'bot');
    } finally {
        // إخفاء مؤشر الكتابة
        typingIndicator.style.display = 'none';
    }
}

/**
 * إضافة رسالة إلى واجهة الدردشة
 */
function addMessageToUI(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    
    chatMessages.appendChild(messageDiv);
    
    // التمرير لأسفل
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
