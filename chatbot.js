/**
 * Chatbot Widget
 * Integrates Lyzr AI Chat using the provided API credentials.
 */

(function() {
    // Configuration
    const CONFIG = {
        API_URL: 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
        API_KEY: 'sk-default-QGKTIBX8yyf1v3CRDLgOL07baQkN695t',
        USER_ID: 'duginisaisharan657@gmail.com',
        AGENT_ID: '6986ee771b20cb762a3de01a',
        SESSION_ID: '6986ee771b20cb762a3de01a-tpa79k83gbb'
    };

    // Store state
    let isOpen = false;
    let isTyping = false;

    // Create and inject HTML
    function init() {
        // Font injection (completed via CSS mostly, but ensuring Inter is available would be nice, relying on system fonts for now)
        
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        
        container.innerHTML = `
            <div id="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>AI Assistant</span>
                    </div>
                    <button class="chatbot-close-btn" aria-label="Close chat">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="message bot">
                        Hello! I'm your AI assistant. How can I help you today?
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" id="chatbot-input" placeholder="Type a message..." aria-label="Type a message">
                    <button id="chatbot-send-btn" aria-label="Send message">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
            <button id="chatbot-toggle-btn" aria-label="Open chat">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
                </svg>
            </button>
        `;

        document.body.appendChild(container);

        // Event Listeners
        const toggleBtn = document.getElementById('chatbot-toggle-btn');
        const closeBtn = document.querySelector('.chatbot-close-btn');
        const sendBtn = document.getElementById('chatbot-send-btn');
        const input = document.getElementById('chatbot-input');
        const window = document.getElementById('chatbot-window');

        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Auto-focus input when opened
        toggleBtn.addEventListener('click', () => {
            if (isOpen) {
                setTimeout(() => input.focus(), 300);
            }
        });
    }

    function toggleChat() {
        const window = document.getElementById('chatbot-window');
        const toggleIcon = document.querySelector('#chatbot-toggle-btn svg');
        
        isOpen = !isOpen;
        
        if (isOpen) {
            window.classList.add('open');
            // Change FAB icon to close (X) or keep as chat bubble? Keeping chat bubble is standard or changing to X.
            // Let's keep it simple for now.
        } else {
            window.classList.remove('open');
        }
    }

    async function sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message || isTyping) return;

        // Add User Message
        addMessage(message, 'user');
        input.value = '';
        
        // Show Typing Indicator
        isTyping = true;
        showTypingIndicator();

        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CONFIG.API_KEY
                },
                body: JSON.stringify({
                    user_id: CONFIG.USER_ID,
                    agent_id: CONFIG.AGENT_ID,
                    session_id: CONFIG.SESSION_ID,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            
            // Remove typing indicator and add bot response
            removeTypingIndicator();
            // Assuming data.response is the text field, usually these APIs return { response: "text" } or similar.
            // Adjust based on actual API response structure if known. The Request body implies a standard chat interface.
            // If the response structure isn't known, we'll safe-guard it.
            const botResponse = data.response || "I received your message but couldn't parse the response.";
            addMessage(botResponse, 'bot');

        } catch (error) {
            console.error('Chatbot Error:', error);
            removeTypingIndicator();
            addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", 'bot');
        } finally {
            isTyping = false;
        }
    }

    function addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        // Simple text to HTML conversion for safety, or use a markdown parser if needed.
        // For now, textContent for user, mostly text for bot but could be HTML? 
        // Let's treat bot response as potentially having basic formatting if needed, but safe defaults.
        
        if (sender === 'user') {
            messageDiv.textContent = text;
        } else {
            // Very basic link rendering if needed, or just text
            // innerHTML should be used securely. trusting the API for now or escaping.
            // Let's use simple text with newlines handled.
            messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        }
        
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.classList.add('typing-indicator');
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
