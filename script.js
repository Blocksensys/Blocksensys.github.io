function sendMessage() {
    const input = document.getElementById('chat-input').value;
    const output = document.getElementById('chat-output');
    
    if (input.trim()) {
        output.innerHTML += `<p><strong>You:</strong> ${input}</p>`;
        
        // Simulated AI response
        const symptoms = input.toLowerCase();
        let response = "Processing symptoms...";
        let severity = "Medium";
        
        if (symptoms.includes("cough") || symptoms.includes("fever")) {
            response = `Preliminary Diagnosis: Upper respiratory infection<br>Severity: Medium<br>Instruction: Schedule a visit within 3 days.<br>Disclaimer: This is not a medical diagnosis. Consult a healthcare professional.`;
            severity = "Medium";
        } else if (symptoms.includes("high blood pressure")) {
            response = `Preliminary Diagnosis: Hypertension<br>Severity: High<br>Instruction: Schedule a visit within 24 hours.<br>Disclaimer: This is not a medical diagnosis. Consult a healthcare professional.`;
            severity = "High";
        } else {
            response = `We need more information: Can you describe the duration and intensity of your symptoms?<br>Disclaimer: This is not a medical diagnosis. Consult a healthcare professional.`;
        }
        
        output.innerHTML += `<p><strong>AI Chatbot:</strong> ${response}</p>`;
        output.scrollTop = output.scrollHeight;
        
        // Show survey after first interaction
        if (!document.getElementById('survey-popup').classList.contains('shown')) {
            setTimeout(() => {
                document.getElementById('survey-popup').classList.remove('hidden');
                document.getElementById('survey-popup').classList.add('shown');
            }, 2000);
        }
        
        document.getElementById('chat-input').value = '';
    }
}

function closePopup() {
    document.getElementById('survey-popup').classList.add('hidden');
}

document.getElementById('survey-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your feedback!');
    closePopup();
});

document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    e.target.reset();
});
