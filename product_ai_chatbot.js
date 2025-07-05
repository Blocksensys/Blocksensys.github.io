document.addEventListener('DOMContentLoaded', () => {
    // Element References
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotToggleButton = document.getElementById('chatbot-toggle-button');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');

    // Error Handling for Missing Elements
    if (!chatbotContainer || !chatbotClose || !chatbotToggleButton || !chatbotForm || !chatbotMessages || !chatbotInput) {
        console.error('One or more chatbot elements are missing from the DOM.');
        return;
    }

    // Toggle Chatbot Visibility
    function toggleChatbot() {
        chatbotContainer.classList.toggle('active');
        chatbotToggleButton.style.display = chatbotContainer.classList.contains('active') ? 'none' : 'block';
    }

    // Initially Show Chatbot
    chatbotContainer.classList.add('active');
    chatbotToggleButton.style.display = 'none';

    // Event Listeners
    chatbotClose.addEventListener('click', toggleChatbot);
    chatbotToggleButton.addEventListener('click', toggleChatbot);

    // Handle User Input
    chatbotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = chatbotInput.value.trim();
        if (!userMessage) return;

        appendMessage('user', userMessage);
        chatbotInput.value = '';

        // Simple Response Logic
        setTimeout(() => {
            if (userMessage.toLowerCase().includes('schedule')) {
                appendMessage('bot', 'Great! Please provide your name to schedule a consultation.');
            } else if (userMessage.toLowerCase().includes('blood test')) {
                appendMessage('bot', 'Our blood test analyzes key health markers to optimize your wellness. Want to know more?');
            } else {
                appendMessage('bot', 'I’m here to assist! Ask about our blood test or say “schedule” to book a call.');
            }
        }, 1000);
    });

    // Append Message to Chat
    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Automatic Conversation Simulation
    const simulation = [
        { sender: 'bot', text: 'Hi there! Interested in transforming your health with our blood test?', delay: 2000 },
        { sender: 'user', text: 'Yes, tell me more!', delay: 2000 },
        { sender: 'bot', text: 'Our test provides personalized insights to boost energy and wellness. Want to schedule a consultation?', delay: 2000 },
        { sender: 'user', text: 'Sure, how do I do that?', delay: 2000 },
        { sender: 'bot', text: 'Just provide your name, and we’ll get started!', delay: 2000 },
    ];

    let simulationIndex = 0;
    function runSimulation() {
        if (simulationIndex >= simulation.length) return;
        const step = simulation[simulationIndex];
        appendMessage(step.sender, step.text);
        simulationIndex++;
        setTimeout(runSimulation, step.delay);
    }

    // Start Simulation After Page Load
    setTimeout(runSimulation, 1000);
});
