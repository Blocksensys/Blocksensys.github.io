document.addEventListener('DOMContentLoaded', () => {
    // Chatbot Logic for both index.html and get-in-touch.html
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotFloat = document.getElementById('chatbot-float');
    const chatForm = document.querySelector('.chatbot-input-form');
    const chatMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const ctaChatbot = document.getElementById('cta-chatbot');
    const surveyModal = document.getElementById('survey-modal');
    const surveyForm = document.getElementById('survey-form');
    const surveyClose = document.getElementById('survey-close');
    const emailField = document.querySelector('.email-field');
    const contactForm = document.getElementById('contact-form');

    if (chatbotContainer && chatbotToggle && chatbotFloat && chatForm && chatMessages && chatbotInput) {
        let conversationState = 0;
        let userResponses = {};
        let hasThanked = false;

        const questions = window.location.pathname.includes('index.html') ? [
            { text: "Hello! I'm here to help you feel better. I'm sorry you're not feeling well today. Can you please share the main symptoms you're experiencing?", key: 'symptoms' },
            { text: "Thank you for sharing that. Can you describe how severe these symptoms are on a scale of 1 to 10, where 1 is mild and 10 is severe?", key: 'severity' },
            { text: "I appreciate you letting me know. How long have you been experiencing these symptoms?", key: 'duration' },
            { text: "That sounds like it’s been tough. Are you experiencing any pain or discomfort? If so, can you tell me where it’s located and what it feels like (e.g., sharp, dull, throbbing)?", key: 'pain' },
            { text: "Got it. Have you noticed any other symptoms, such as fever, chills, fatigue, nausea, or changes in appetite?", key: 'additional_symptoms' },
            { text: "Thank you for providing those details. Are there any specific triggers that make your symptoms worse, like certain activities, foods, or stress?", key: 'triggers' },
            { text: "I’m sorry you’re going through this. Have you experienced any changes in your breathing, such as shortness of breath or wheezing?", key: 'respiratory' },
            { text: "We’re almost done with the symptom questions. Have you noticed any changes in your sleep patterns, like trouble sleeping or excessive sleepiness?", key: 'sleep' },
            { text: "It’s really helpful to have all this information. Are these symptoms affecting your daily activities, work, or quality of life in any way?", key: 'impact' },
            { text: "I understand this can be overwhelming. Have these symptoms been impacting your mood, stress levels, or mental well-being?", key: 'mood' },
            { text: "Thank you for sharing so openly. Have you taken any medications or tried any treatments for these symptoms? If so, what were the results?", key: 'treatments' },
            { text: "To ensure we get you the right care, do you have any known allergies or medical conditions we should be aware of?", key: 'medical_history' },
            { text: "Based on your input, I’ve assessed the triage severity. Please wait a moment while I provide a preliminary diagnosis and next steps.", key: 'diagnosis' },
            { text: "Here are the next available appointment slots. Please select one (e.g., enter the number 1, 2, or 3):\n1. 07-05-2025 9:00 AM\n2. 07-05-2025 2:00 PM\n3. 07-06-2025 10:00 AM", key: 'appointment' },
            { text: "Appointment confirmed! Thank you for scheduling. Can you provide feedback on your experience with me today to help us improve?", key: 'feedback' },
            { text: "Thank you for your feedback! May we follow up with you later via email for further assistance? Please provide your email if yes.", key: 'followup' }
        ] : [
            { text: "Hi! I’m Product AI for Ways2Well. Our revolutionary blood test can unlock your best health yet! Ask about it or book a Zoom consultation to start your journey today!", key: 'welcome' },
            { text: "Our cutting-edge blood test can revolutionize your health by pinpointing exactly what’s holding you back. What are your biggest health goals right now? (e.g., skyrocket energy, shed weight, sleep like a dream)", key: 'health_goals' },
            { text: "Perfect! Those are exactly the areas our blood test shines in! Imagine having the energy to crush your day and hitting your weight goals—our test makes it possible. How would you rate your energy levels? (e.g., low, moderate, high)", key: 'energy_level' },
            { text: "That’s what we’re here to fix! Your diet could be the key to unlocking your potential. How would you describe your diet? (e.g., balanced, high-carb, processed foods) Our test will give you a custom plan!", key: 'diet' },
            { text: "No judgment here! Our blood test can optimize your nutrition to fuel your body right. How would you rate your stress levels? (e.g., low, moderate, high) Let’s tackle that too!", key: 'stress' },
            { text: `Based on your goals to ${userResponses.health_goals || 'improve health'}, ${userResponses.energy_level || 'varied'} energy, ${userResponses.diet || 'current'} diet, and ${userResponses.stress || 'manageable'} stress, Ways2Well’s blood test can uncover hormone, nutrient, or inflammation issues to create a personalized plan that’ll transform your life. This is not medical advice. Don’t wait—book your consultation now to start your health revolution! Just say “yes” to schedule!`, key: 'post_assessment' },
            { text: "You’re making a life-changing choice! Let’s book your consultation to get your blood test plan started. Please provide your name.", key: 'name' },
            { text: "Thanks, {{name}}! You’re so close to unlocking your best health. Please provide your email to receive your Zoom consultation details.", key: 'email' },
            { text: "Almost done! When would you like your Zoom consultation to discuss your blood test? (e.g., tomorrow at 10 AM) Let’s make it happen!", key: 'time' },
            { text: "I agree to share my name and email for scheduling. [Type “Yes” to confirm and finalize your consultation]!", key: 'consent' },
            { text: "Thank you, {{name}}! A Zoom link for your consultation on {{time}} has been sent to {{email}} and Ways2Well’s team. Get ready to revolutionize your health with our blood test!", key: 'confirmation' }
        ];

        const chatbotWebhookUrl = 'https://hook.us2.make.com/z46g1qwkwc6eia4pofcpcioba7g60wjq';
        const questionWebhook = 'https://hook.us2.make.com/ways2well_question';
        const scheduleWebhook = 'https://hook.us2.make.com/ways2well_schedule';

        function toggleChatbot() {
            const isActive = chatbotContainer.classList.contains('active');
            chatbotContainer.classList.toggle('active', !isActive);
            chatbotFloat.style.display = isActive ? 'block' : 'none';
            if (!isActive && conversationState === 0 && window.location.pathname.includes('index.html')) {
                appendMessage('bot', questions[0].text);
                conversationState++;
            }
        }

        chatbotFloat.addEventListener('click', toggleChatbot);
        chatbotToggle.addEventListener('click', toggleChatbot);
        if (ctaChatbot) {
            ctaChatbot.addEventListener('click', (e) => {
                e.preventDefault();
                toggleChatbot();
            });
        }

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = chatbotInput.value.trim();
            if (!message) return;
            appendMessage('user', message);
            chatbotInput.value = '';

            if (window.location.pathname.includes('index.html')) {
                if (conversationState < questions.length && conversationState !== questions.length - 3) {
                    userResponses[questions[conversationState - 1].key] = message;
                    let empathicResponse = '';
                    if (conversationState === 1 && !hasThanked) {
                        empathicResponse = 'Thank you for letting me know. I’m here to help you through this.';
                        hasThanked = true;
                    } else if (conversationState === 3 && (message.toLowerCase().includes('pain') || message.toLowerCase().includes('hurt'))) {
                        empathicResponse = 'That sounds really uncomfortable. Let’s dive deeper to understand more.';
                    } else if (conversationState === 6 && (message.toLowerCase().includes('stress') || message.toLowerCase().includes('anxiety'))) {
                        empathicResponse = 'I’m really sorry to hear this is affecting your mood. We’ll work together to address this.';
                    }
                    setTimeout(() => {
                        if (empathicResponse) appendMessage('bot', empathicResponse);
                        setTimeout(() => {
                            appendMessage('bot', questions[conversationState].text);
                            conversationState++;
                            if (conversationState === questions.length - 3) {
                                setTimeout(() => {
                                    const diagnosis = generateDiagnosis(userResponses);
                                    appendMessage('bot', diagnosis);
                                    setTimeout(() => {
                                        appendMessage('bot', questions[conversationState].text);
                                        conversationState++;
                                    }, 1000);
                                }, 1000);
                            }
                        }, empathicResponse ? 1000 : 0);
                    }, 1000);
                } else if (conversationState === questions.length - 2) {
                    if (['1', '2', '3'].includes(message)) {
                        const slot = { '1': '07-05-2025 9:00 AM', '2': '07-05-2025 2:00 PM', '3': '07-06-2025 10:00 AM' }[message];
                        userResponses['appointment'] = slot;
                        fetch(chatbotWebhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(userResponses)
                        })
                        .then(response => response.ok ? console.log('Chatbot webhook sent') : console.error('Chatbot webhook error'))
                        .catch(error => console.error('Chatbot webhook failed:', error));
                        appendMessage('bot', questions[conversationState].text);
                        conversationState++;
                    } else {
                        appendMessage('bot', 'Please select a valid option (1, 2, or 3).');
                    }
                } else if (conversationState === questions.length - 1) {
                    userResponses['feedback'] = message;
                    appendMessage('bot', questions[conversationState].text);
                    conversationState++;
                } else if (conversationState === questions.length) {
                    userResponses['followup_email'] = message;
                    appendMessage('bot', 'Thank you! We’ll reach out if you’ve provided an email. You can start over by typing anything.');
                    conversationState = 0;
                    if (surveyModal) setTimeout(() => surveyModal.classList.add('active'), 2000);
                }
            } else {
                // Logic for get-in-touch.html (Product AI)
                if (conversationState === 0) {
                    if (message.toLowerCase().includes('schedule') || message.toLowerCase().includes('call') || message.toLowerCase().includes('consultation') || message.toLowerCase().includes('book')) {
                        conversationState = 6;
                        appendMessage('bot', questions[6].text);
                    } else if (message.toLowerCase().includes('blood test') || message.toLowerCase().includes('health') || message.toLowerCase().includes('benefit')) {
                        conversationState = 1;
                        appendMessage('bot', questions[1].text);
                    } else {
                        (async () => {
                            const response = await sendToMake({ intent: 'question', query: message });
                            appendMessage('bot', response.message || questions[1].text);
                            conversationState = 1;
                        })();
                    }
                } else if (conversationState === 1) {
                    userResponses.health_goals = message;
                    conversationState = 2;
                    appendMessage('bot', questions[2].text);
                } else if (conversationState === 2) {
                    userResponses.energy_level = message;
                    conversationState = 3;
                    appendMessage('bot', questions[3].text);
                } else if (conversationState === 3) {
                    userResponses.diet = message;
                    conversationState = 4;
                    appendMessage('bot', questions[4].text);
                } else if (conversationState === 4) {
                    userResponses.stress = message;
                    conversationState = 5;
                    (async () => {
                        const response = await sendToMake({
                            intent: 'blood_test_assessment',
                            health_goals: userResponses.health_goals,
                            energy_level: userResponses.energy_level,
                            diet: userResponses.diet,
                            stress: userResponses.stress
                        });
                        appendMessage('bot', response.message || questions[5].text.replace('{{name}}', userResponses.name || ''));
                    })();
                } else if (conversationState === 5) {
                    if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('book') || message.toLowerCase().includes('schedule')) {
                        conversationState = 6;
                        appendMessage('bot', questions[6].text);
                    } else {
                        conversationState = 0;
                        appendMessage('bot', 'No rush! Explore more about our blood test’s life-changing benefits by saying “blood test” or book a consultation anytime with “schedule”!');
                    }
                } else if (conversationState === 6) {
                    userResponses.name = message;
                    conversationState = 7;
                    appendMessage('bot', questions[7].text.replace('{{name}}', message));
                } else if (conversationState === 7) {
                    userResponses.email = message;
                    conversationState = 8;
                    appendMessage('bot', questions[8].text);
                } else if (conversationState === 8) {
                    userResponses.time = message;
                    conversationState = 9;
                    appendMessage('bot', questions[9].text);
                } else if (conversationState === 9) {
                    if (message.toLowerCase().includes('yes')) {
                        (async () => {
                            const response = await sendToMake({
                                intent: 'schedule_call',
                                name: userResponses.name,
                                email: userResponses.email,
                                time: userResponses.time
                            });
                            appendMessage('bot', response.message || questions[10].text.replace('{{name}}', userResponses.name).replace('{{time}}', userResponses.time).replace('{{email}}', userResponses.email));
                            conversationState = 0;
                            userResponses = {};
                        })();
                    } else {
                        appendMessage('bot', 'Consent is required to proceed. Type “Yes” to confirm or start over to explore more about our blood test!');
                    }
                }
            }
        });

        async function sendToMake(data) {
            const webhook = data.intent === 'schedule_call' ? scheduleWebhook : questionWebhook;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                const response = await fetch(webhook, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!response.ok) throw new Error(`Webhook failed: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error('Webhook error:', error);
                return {
                    message: data.intent === 'question' ?
                        'Our cutting-edge blood test can revolutionize your health by pinpointing exactly what’s holding you back. What are your biggest health goals right now? (e.g., skyrocket energy, shed weight, sleep like a dream)' :
                        data.intent === 'blood_test_assessment' ?
                        `Based on your goals to ${data.health_goals || 'improve health'}, ${data.energy_level || 'varied'} energy, ${data.diet || 'current'} diet, and ${data.stress || 'manageable'} stress, Ways2Well’s blood test can uncover hormone, nutrient, or inflammation issues to create a personalized plan that’ll transform your life. This is not medical advice.` :
                        `Thank you, ${data.name}! A Zoom link for your consultation on ${data.time} has been sent to ${data.email} and Ways2Well’s team. Get ready to revolutionize your health with our blood test!`
                };
            }
        }

        function appendMessage(sender, text) {
            const message = document.createElement('div');
            message.classList.add('message', sender);
            message.innerHTML = text;
            chatMessages.appendChild(message);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function generateDiagnosis(responses) {
            let diagnosis = "Thank you for sharing how you’re feeling. Based on your input, here’s what we’ve gathered:<br>";
            let severity = "Low";
            const symptoms = responses.symptoms ? responses.symptoms.toLowerCase() : '';
            const additional = responses.additional_symptoms ? responses.additional_symptoms.toLowerCase() : '';
            const pain = responses.pain ? responses.pain.toLowerCase() : '';
            const duration = responses.duration ? responses.duration.toLowerCase() : '';
            const impact = responses.impact ? responses.impact.toLowerCase() : '';
            const mood = responses.mood ? responses.mood.toLowerCase() : '';

            if (symptoms.includes('cough') && additional.includes('fever')) {
                diagnosis += "Preliminary Diagnosis: Upper respiratory infection<br>";
                severity = "Moderate";
            } else if (symptoms.includes('high blood pressure') || additional.includes('hypertension')) {
                diagnosis += "Preliminary Diagnosis: Hypertension<br>";
                severity = "High";
            } else if (pain.includes('head') || symptoms.includes('headache') || additional.includes('migraine')) {
                diagnosis += "Preliminary Diagnosis: Tension headache or migraine<br>";
                severity = "Mild";
            } else if (pain.includes('back') || symptoms.includes('back pain')) {
                diagnosis += "Preliminary Diagnosis: Back pain or possible musculoskeletal issue<br>";
                severity = "Moderate";
            } else if (symptoms.includes('sadness') || additional.includes('fatigue') || symptoms.includes('anxiety') || mood.includes('stress') || mood.includes('anxiety')) {
                diagnosis += "Preliminary Diagnosis: Depression or anxiety<br>";
                severity = "Moderate";
            } else if (symptoms.includes('joint pain') || pain.includes('joint')) {
                diagnosis += "Preliminary Diagnosis: Arthritis or osteoarthritis<br>";
                severity = "Moderate";
            } else if (symptoms.includes('rash') || additional.includes('itch')) {
                diagnosis += "Preliminary Diagnosis: Dermatitis<br>";
                severity = "Mild";
            } else if (symptoms.includes('ear pain') || additional.includes('ear')) {
                diagnosis += "Preliminary Diagnosis: Acute otitis media<br>";
                severity = "Moderate";
            } else if (symptoms.includes('thirst') || additional.includes('fatigue') || symptoms.includes('diabetes')) {
                diagnosis += "Preliminary Diagnosis: Possible diabetes<br>";
                severity = "High";
            } else if (symptoms.includes('chest pain') && duration.includes('sudden')) {
                diagnosis += "Preliminary Diagnosis: Possible cardiac condition<br>";
                severity = "Critical";
            } else {
                diagnosis += "Preliminary Diagnosis: General fatigue or minor condition<br>";
                severity = "Low";
            }

            if (impact.includes('difficulty') || impact.includes('affecting') || impact.includes('hard')) {
                diagnosis += "Impact: These symptoms seem to be significantly affecting your daily life.<br>";
            } else if (impact) {
                diagnosis += "Impact: Your symptoms are noted, and they may be influencing your routine.<br>";
            }

            if (mood.includes('stress') || mood.includes('anxiety') || mood.includes('down') || mood.includes('depressed')) {
                diagnosis += "Emotional Well-Being: It sounds like these symptoms are taking a toll on your mood. We’ll ensure this is addressed.<br>";
            } else if (mood) {
                diagnosis += "Emotional Well-Being: Your mood seems to be holding up, but we’ll keep this in mind.<br>";
            }

            diagnosis += `Triage/Severity Level: ${severity}<br>`;
            if (severity === "Critical") {
                diagnosis += "Next Steps: I’m concerned about these symptoms. Please seek immediate medical attention or call 911 to stay safe.<br>";
            } else if (severity === "High") {
                diagnosis += "Next Steps: Let’s prioritize your care. Schedule an appointment within 24 hours.<br>";
            } else if (severity === "Moderate") {
                diagnosis += "Next Steps: We should address this soon. Schedule an appointment within 3 days.<br>";
            } else {
                diagnosis += "Next Steps: Let’s keep an eye on this. Schedule an appointment within 7 days for routine care.<br>";
            }
            diagnosis += "<small>Disclaimer: This is not a medical diagnosis. We care about your health, so please consult a healthcare professional for personalized advice.</small>";
            return diagnosis;
        }

        // Automatic simulation for get-in-touch.html
        if (window.location.pathname.includes('get-in-touch.html')) {
            const simulationSteps = [
                { user: 'Tell me about your blood test.', delay: 2000 },
                { bot: questions[1].text, state: 1, delay: 2000 },
                { user: 'I want to feel energized and lose weight.', delay: 2000 },
                { bot: questions[2].text, state: 2, delay: 2000 },
                { user: 'Low, I’m drained by noon.', delay: 2000 },
                { bot: questions[3].text, state: 3, delay: 2000 },
                { user: 'Lots of fast food, honestly.', delay: 2000 },
                { bot: questions[4].text, state: 4, delay: 2000 },
                { user: 'High, life’s been intense.', delay: 2000 },
                { bot: questions[5].text, state: 5, delay: 2000 },
                { user: 'Yes', delay: 2000 },
                { bot: questions[6].text, state: 6, delay: 2000 },
                { user: 'Jane Doe', delay: 2000 },
                { bot: questions[7].text.replace('{{name}}', 'Jane Doe'), state: 7, delay: 2000 },
                { user: 'jane@example.com', delay: 2000 },
                { bot: questions[8].text, state: 8, delay: 2000 },
                { user: 'Tomorrow at 10 AM', delay: 2000 },
                { bot: questions[9].text, state: 9, delay: 2000 },
                { user: 'Yes', delay: 2000 },
                { bot: questions[10].text.replace('{{name}}', 'Jane Doe').replace('{{time}}', 'Tomorrow at 10 AM').replace('{{email}}', 'jane@example.com'), state: 0, delay: 2000 }
            ];

            let stepIndex = 0;
            function runSimulation() {
                if (stepIndex >= simulationSteps.length) {
                    console.log('Simulation completed');
                    return;
                }
                const step = simulationSteps[stepIndex];
                if (step.user) {
                    appendMessage('user', step.user);
                } else {
                    appendMessage('bot', step.bot);
                    if (step.state !== undefined) conversationState = step.state;
                }
                stepIndex++;
                setTimeout(runSimulation, step.delay);
            }

            appendMessage('bot', questions[0].text);
            setTimeout(runSimulation, 1000);
        }
    }

    if (surveyModal && surveyForm && surveyClose && emailField) {
        document.querySelectorAll('input[name="q3"]').forEach(radio => {
            radio.addEventListener('change', () => {
                emailField.style.display = radio.value === 'yes' ? 'block' : 'none';
                document.getElementById('email').required = radio.value === 'yes';
            });
        });

        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const q1 = document.querySelector('input[name="q1"]:checked')?.value;
            const q2 = document.getElementById('pain-point').value;
            const q3 = document.querySelector('input[name="q3"]:checked')?.value;
            const email = document.getElementById('email').value;

            if (!q1 || !q2 || !q3 || (q3 === 'yes' && !email)) {
                if (chatMessages) appendMessage('bot', 'Please complete all required fields.');
                return;
            }

            if (chatMessages) {
                appendMessage('bot', 'Thank you for your feedback! Your input helps us improve.');
                if (q3 === 'yes') {
                    appendMessage('bot', `We’ll reach out to ${email} to schedule your Zoom call. We’re looking forward to connecting!`);
                }
            }

            surveyModal.classList.remove('active');
            emailField.style.display = 'none';
            surveyForm.reset();
        });

        surveyClose.addEventListener('click', () => {
            surveyModal.classList.remove('active');
            emailField.style.display = 'none';
            surveyForm.reset();
        });
    }

    if (contactForm) {
        const contactWebhookUrl = 'https://hook.us2.make.com/kkzfz34govtdfu8mur6dg8pft9qmhbhw';
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            fetch(contactWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (response.ok) {
                    alert('Thank you for your message! We will get back to you soon.');
                    contactForm.reset();
                } else {
                    alert('Error submitting form. Please try again.');
                }
            })
            .catch(error => {
                console.error('Contact webhook failed:', error);
                alert('Error submitting form. Please try again.');
            });
        });
    }

    // GSAP Animations
    gsap.from('.logo', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.5
    });

    gsap.to('.logo', {
        textShadow: '0 0 10px rgba(45, 212, 191, 0.7), 0 0 20px rgba(45, 212, 191, 0.5)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    gs率先gsap.from('.hero-content', {
        opacity: 0,
        y: 50,
        duration: 1.5,
        ease: 'power3.out'
    });

    // Three.js Animation with Blocks and Stars
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const particles = new THREE.Group();
        const particleCount = 50;
        const positions = [];

        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x2DD4BF });
        const material = new THREE.MeshBasicMaterial({ color: 0x2DD4BF, transparent: true, opacity: 0 });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material);
            const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            wireframe.position.copy(particle.position);
            positions.push(particle.position.clone());
            particles.add(particle);
            particles.add(wireframe);
        }

        const starGroup = new THREE.Group();
        const starCount = 200;
        const starGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        for (let i = 0; i < starCount; i++) {
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            starGroup.add(star);
        }

        scene.add(particles);
        scene.add(starGroup);
        camera.position.z = 5;

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            particles.rotation.y += 0.002;
            particles.children.forEach((child, index) => {
                if (index % 2 === 0) {
                    const t = Date.now() * 0.001 + index;
                    child.position.y += Math.sin(t) * 0.005;
                    child.position.x += Math.cos(t) * 0.005;
                    particles.children[index + 1].position.copy(child.position);
                }
            });

            starGroup.children.forEach((star, index) => {
                const t = Date.now() * 0.0005 + index;
                star.position.z += Math.sin(t) * 0.01;
            });

            renderer.render(scene, camera);
        }

        animateParticles();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
});
