// Bruchsal Quest - 8-bit Trivia Game
class BruchsalQuest {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameState = 'login';
        this.currentQuestion = null;
        this.userLocation = null;
        this.targetLocation = null;
        this.watchId = null;
        this.musicPlaying = false;
        this.soundEnabled = false;
        this.deviceHeading = 0;
        this.orientationHandler = null;
        
        // User authentication system
        this.currentUser = null;
        this.isGuest = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadQuestions();
        this.createSoundEffects();
        this.checkAutoLogin();
    }

    initializeElements() {
        console.log('Initializing elements...');
        
        // Screens
        this.loginScreen = document.getElementById('login-screen');
        this.startScreen = document.getElementById('start-screen');
        this.questionScreen = document.getElementById('question-screen');
        this.gpsScreen = document.getElementById('gps-screen');
        this.verificationScreen = document.getElementById('verification-screen');
        this.discountScreen = document.getElementById('discount-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.leaderboardScreen = document.getElementById('leaderboard-screen');
        this.questJournalScreen = document.getElementById('quest-journal-screen');
        
        console.log('Screens initialized:', {
            login: !!this.loginScreen,
            start: !!this.startScreen,
            question: !!this.questionScreen,
            gps: !!this.gpsScreen,
            verification: !!this.verificationScreen,
            discount: !!this.discountScreen,
            gameOver: !!this.gameOverScreen,
            victory: !!this.victoryScreen,
            leaderboard: !!this.leaderboardScreen,
            questJournal: !!this.questJournalScreen
        });

        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.skipGpsBtn = document.getElementById('skip-gps');
        this.continueBtn = document.getElementById('continue-btn');
        this.stayBtn = document.getElementById('stay-btn');
        this.claimDiscountBtn = document.getElementById('claim-discount-btn');
        this.continueGameBtn = document.getElementById('continue-game-btn');
        this.retryBtn = document.getElementById('retry-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.soundToggle = document.getElementById('sound-toggle');
        
        // Authentication buttons
        this.loginBtn = document.getElementById('login-btn');
        this.registerBtn = document.getElementById('register-btn');
        this.showRegisterBtn = document.getElementById('show-register-btn');
        this.showLoginBtn = document.getElementById('show-login-btn');
        this.guestBtn = document.getElementById('guest-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.leaderboardBtn = document.getElementById('leaderboard-btn');
        this.backToMenuBtn = document.getElementById('back-to-menu-btn');
        this.viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
        this.questJournalBtn = document.getElementById('quest-journal-btn');
        this.journalBackBtn = document.getElementById('journal-back-btn');
        this.debugBtn = document.getElementById('debug-btn');

        // Game elements
        this.scoreElement = document.getElementById('score');
        this.currentQuestionElement = document.getElementById('current-question');
        this.questionText = document.getElementById('question-text');
        this.answerButtons = [
            document.getElementById('answer-A'),
            document.getElementById('answer-B'),
            document.getElementById('answer-C'),
            document.getElementById('answer-D')
        ];

        // GPS elements
        this.distanceText = document.getElementById('distance-text');
        this.locationHint = document.getElementById('location-hint');
        this.distanceBarFill = document.getElementById('distance-bar-fill');
        this.distanceBarText = document.getElementById('distance-bar-text');
        this.distanceMeters = document.getElementById('distance-meters');
        this.gpsStatusText = document.getElementById('gps-status-text');
        this.compassArrow = document.getElementById('compass-arrow');
        
        // Verification elements
        this.verifiedLocation = document.getElementById('verified-location');
        
        // Discount elements
        this.businessName = document.getElementById('business-name');
        this.discountText = document.getElementById('discount-text');
        this.discountCode = document.getElementById('discount-code');

        // Game over elements
        this.gameOverTitle = document.getElementById('game-over-title');
        this.gameOverCharacter = document.getElementById('game-over-character');
        this.gameOverMessage = document.getElementById('game-over-message');
        this.finalScore = document.getElementById('final-score');

        // Audio elements
        this.correctSound = document.getElementById('correct-sound');
        this.wrongSound = document.getElementById('wrong-sound');
        this.arrivalSound = document.getElementById('arrival-sound');
        this.backgroundMusic = document.getElementById('background-music');
        
        // Authentication elements
        this.loginForm = document.querySelector('.login-form');
        this.registerForm = document.querySelector('.register-form');
        this.loginUsername = document.getElementById('login-username');
        this.loginPassword = document.getElementById('login-password');
        this.registerUsername = document.getElementById('register-username');
        this.registerPassword = document.getElementById('register-password');
        this.registerConfirm = document.getElementById('register-confirm');
        
        // User info elements
        this.currentUserElement = document.getElementById('current-user');
        this.userBestScore = document.getElementById('user-best-score');
        
        // Leaderboard elements
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.userRank = document.getElementById('user-rank');
        this.totalPlayers = document.getElementById('total-players');
        this.newRecord = document.getElementById('new-record');
        
        // Quest Journal elements
        this.locationGrid = document.getElementById('location-grid');
        this.taggedCount = document.getElementById('tagged-count');
        this.remainingCount = document.getElementById('remaining-count');
        
        // Log all button elements to check they exist
        console.log('Button elements:', {
            loginBtn: !!this.loginBtn,
            registerBtn: !!this.registerBtn,
            guestBtn: !!this.guestBtn,
            startBtn: !!this.startBtn,
            leaderboardBtn: !!this.leaderboardBtn,
            questJournalBtn: !!this.questJournalBtn,
            logoutBtn: !!this.logoutBtn
        });
        
        // Check for missing critical elements
        const missingElements = [];
        if (!this.loginScreen) missingElements.push('login-screen');
        if (!this.startScreen) missingElements.push('start-screen');
        if (!this.guestBtn) missingElements.push('guest-btn');
        
        if (missingElements.length > 0) {
            console.error('Missing critical elements:', missingElements);
        }
    }

    bindEvents() {
        console.log('Binding events...');
        
        try {
            // Game control events
            if (this.startBtn) this.startBtn.addEventListener('click', () => this.startGame());
            if (this.skipGpsBtn) this.skipGpsBtn.addEventListener('click', () => this.skipGPS());
            if (this.continueBtn) this.continueBtn.addEventListener('click', () => this.continueToNextQuestion());
            if (this.stayBtn) this.stayBtn.addEventListener('click', () => this.stayAtLocation());
            if (this.claimDiscountBtn) this.claimDiscountBtn.addEventListener('click', () => this.claimDiscount());
            if (this.continueGameBtn) this.continueGameBtn.addEventListener('click', () => this.continueFromDiscount());
            if (this.retryBtn) this.retryBtn.addEventListener('click', () => this.retryQuestion());
            if (this.restartBtn) this.restartBtn.addEventListener('click', () => this.restartGame());
            if (this.playAgainBtn) this.playAgainBtn.addEventListener('click', () => this.restartGame());

            this.answerButtons.forEach((btn, index) => {
                if (btn) btn.addEventListener('click', () => this.selectAnswer(String.fromCharCode(65 + index)));
            });

            if (this.soundToggle) this.soundToggle.addEventListener('click', () => this.toggleSound());
            
            // Authentication events
            if (this.loginBtn) this.loginBtn.addEventListener('click', () => this.handleLogin());
            if (this.registerBtn) this.registerBtn.addEventListener('click', () => this.handleRegister());
            if (this.showRegisterBtn) this.showRegisterBtn.addEventListener('click', () => this.showRegisterForm());
            if (this.showLoginBtn) this.showLoginBtn.addEventListener('click', () => this.showLoginForm());
            if (this.guestBtn) this.guestBtn.addEventListener('click', () => this.loginAsGuest());
            if (this.logoutBtn) this.logoutBtn.addEventListener('click', () => this.logout());
            if (this.debugBtn) this.debugBtn.addEventListener('click', () => this.debugSkipToMenu());
            
            // Navigation events
            if (this.leaderboardBtn) this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
            if (this.backToMenuBtn) this.backToMenuBtn.addEventListener('click', () => this.showMainMenu());
            if (this.viewLeaderboardBtn) this.viewLeaderboardBtn.addEventListener('click', () => this.showLeaderboard());
            if (this.questJournalBtn) this.questJournalBtn.addEventListener('click', () => this.showQuestJournal());
            if (this.journalBackBtn) this.journalBackBtn.addEventListener('click', () => this.showMainMenu());
            
            // Enter key handling for login forms
            if (this.loginPassword) {
                this.loginPassword.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleLogin();
                });
            }
            if (this.registerConfirm) {
                this.registerConfirm.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleRegister();
                });
            }
            
            console.log('Events bound successfully');
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }

    async loadQuestions() {
        try {
            console.log('Loading CSV file...');
            const response = await fetch('bruchsal_trivia_questions.csv');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('CSV loaded, length:', csvText.length);
            console.log('First 200 characters:', csvText.substring(0, 200));
            
            this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading questions:', error);
            // Fallback: use embedded questions if CSV fails to load
            this.loadEmbeddedQuestions();
        }
    }

    loadEmbeddedQuestions() {
        console.log('Loading embedded questions as fallback...');
        const csvData = `Question,Choice A,Choice B,Choice C,Choice D,Correct Answer,Latitude,Longitude
Which historic church in Frankfurt was the seat of Germany's first National Assembly in 1848?,Alte Oper,Goethe House,Paulskirche (St. Paul's Church),Kaiserdom St. Bartholomäus,Paulskirche (St. Paul's Church),50.1106,8.6821
What is the name of the large public square that features the Römer Frankfurt's city hall since the 15th century?,Opernplatz,Hauptwache,Konstablerwache,Römerberg,Römerberg,50.1105,8.6827
What is the tallest building in Frankfurt and also the EU's second tallest?,Main Tower,Messeturm,Westend Gate,Commerzbank Tower,Commerzbank Tower,50.1109,8.6783
What is the name of Frankfurt's botanical garden home to tropical greenhouses?,Botanischer Garten,Palmengarten,Grüneburgpark,Wallanlagen,Palmengarten,50.118,8.6512
Which museum is located along the Museumsufer and focuses on fine arts?,Museum für Moderne Kunst,Senckenberg Museum,Historisches Museum,Städel Museum,Städel Museum,50.103,8.6742`;
        
        this.parseCSV(csvData);
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length === 0) continue;
            
            const values = this.parseCSVLine(line);
            if (values.length >= 9 && values[0].length > 0) {
                const questionType = values[8] || 'multiple_choice';
                const extraData = values[9] || '';
                
                let questionData = {
                    question: values[0],
                    correctAnswerText: values[5],
                    latitude: parseFloat(values[6]),
                    longitude: parseFloat(values[7]),
                    type: questionType,
                    extraData: extraData
                };
                
                if (questionType === 'multiple_choice') {
                    const choices = {
                        A: values[1],
                        B: values[2],
                        C: values[3],
                        D: values[4]
                    };
                    
                    // Find which choice matches the correct answer text
                    const correctAnswerText = values[5];
                    let correctLetter = 'A'; // default fallback
                    
                    for (let letter of ['A', 'B', 'C', 'D']) {
                        if (choices[letter] === correctAnswerText) {
                            correctLetter = letter;
                            break;
                        }
                    }
                    
                    questionData.choices = choices;
                    questionData.correctAnswer = correctLetter;
                } else if (questionType === 'picture_match') {
                    questionData.options = [values[1], values[2], values[3], values[4]];
                } else if (questionType === 'word_puzzle') {
                    questionData.scrambledWord = extraData;
                } else if (questionType === 'connect_puzzle') {
                    questionData.pieces = [values[1], values[2], values[3], values[4]];
                }
                
                this.questions.push(questionData);
            }
        }
        
        console.log(`Loaded ${this.questions.length} questions`);
        this.shuffleQuestions();
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
    }

    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    startGame() {
        if (this.questions.length === 0) {
            this.showError('Questions not loaded yet. Please wait a moment and try again.');
            return;
        }
        
        this.gameState = 'playing';
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.startBackgroundMusic();
        this.showScreen('question');
        this.displayQuestion();
    }

    displayQuestion() {
        console.log(`Displaying question ${this.currentQuestionIndex + 1} of ${this.questions.length}`);
        
        if (this.questions.length === 0) {
            this.showError('No questions loaded. Please check the CSV file.');
            return;
        }
        
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame(true);
            return;
        }

        this.currentQuestion = this.questions[this.currentQuestionIndex];
        console.log('Current question:', this.currentQuestion);
        
        this.questionText.textContent = this.currentQuestion.question;
        
        // Clear any previous interactive elements
        this.clearInteractiveElements();
        
        // Display question based on type
        switch (this.currentQuestion.type) {
            case 'multiple_choice':
                this.displayMultipleChoice();
                break;
            case 'picture_match':
                this.displayPictureMatch();
                break;
            case 'word_puzzle':
                this.displayWordPuzzle();
                break;
            case 'connect_puzzle':
                this.displayConnectPuzzle();
                break;
            default:
                this.displayMultipleChoice();
        }

        this.updateGameHeader();
    }
    
    clearInteractiveElements() {
        // Clear any interactive elements from previous questions
        const interactiveContainer = document.querySelector('.interactive-container');
        if (interactiveContainer) {
            interactiveContainer.remove();
        }
    }
    
    displayMultipleChoice() {
        this.answerButtons.forEach((btn, index) => {
            const choice = String.fromCharCode(65 + index);
            btn.textContent = `${choice}) ${this.currentQuestion.choices[choice]}`;
            btn.className = 'answer-btn';
            btn.disabled = false;
            btn.style.display = 'block';
        });
    }
    
    displayPictureMatch() {
        // Hide regular answer buttons
        this.answerButtons.forEach(btn => btn.style.display = 'none');
        
        // Create picture matching interface
        const container = document.createElement('div');
        container.className = 'interactive-container picture-match-container';
        
        const instructions = document.createElement('div');
        instructions.className = 'match-instructions';
        instructions.textContent = 'Click the correct emoji that matches the description in the question!';
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'picture-options';
        
        this.currentQuestion.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'picture-option';
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => this.selectPictureAnswer(option));
            optionsContainer.appendChild(optionBtn);
        });
        
        container.appendChild(instructions);
        container.appendChild(optionsContainer);
        
        // Insert after question text
        this.questionText.parentNode.insertBefore(container, this.questionText.nextSibling);
    }
    
    displayWordPuzzle() {
        // Hide regular answer buttons
        this.answerButtons.forEach(btn => btn.style.display = 'none');
        
        const container = document.createElement('div');
        container.className = 'interactive-container word-puzzle-container';
        
        const instructions = document.createElement('div');
        instructions.className = 'puzzle-instructions';
        instructions.textContent = 'Unscramble the letters to spell the location name:';
        
        const scrambledWord = this.currentQuestion.scrambledWord || 'DEVRELBEE';
        const lettersContainer = document.createElement('div');
        lettersContainer.className = 'letter-tiles';
        
        // Create letter tiles
        scrambledWord.split('').forEach((letter, index) => {
            const letterTile = document.createElement('button');
            letterTile.className = 'letter-tile';
            letterTile.textContent = letter;
            letterTile.dataset.index = index;
            letterTile.addEventListener('click', () => this.toggleLetter(letterTile));
            lettersContainer.appendChild(letterTile);
        });
        
        const answerContainer = document.createElement('div');
        answerContainer.className = 'word-answer';
        answerContainer.innerHTML = '<div class="answer-slots"></div>';
        
        const submitBtn = document.createElement('button');
        submitBtn.className = 'pixel-btn submit-word';
        submitBtn.textContent = 'SUBMIT ANSWER';
        submitBtn.addEventListener('click', () => this.submitWordAnswer());
        
        container.appendChild(instructions);
        container.appendChild(lettersContainer);
        container.appendChild(answerContainer);
        container.appendChild(submitBtn);
        
        this.questionText.parentNode.insertBefore(container, this.questionText.nextSibling);
        
        this.selectedLetters = [];
    }
    
    displayConnectPuzzle() {
        // Hide regular answer buttons
        this.answerButtons.forEach(btn => btn.style.display = 'none');
        
        const container = document.createElement('div');
        container.className = 'interactive-container connect-puzzle-container';
        
        const instructions = document.createElement('div');
        instructions.className = 'puzzle-instructions';
        instructions.textContent = 'Connect the puzzle pieces in the correct order:';
        
        const puzzleArea = document.createElement('div');
        puzzleArea.className = 'puzzle-area';
        
        // Create simplified connect-the-dots puzzle
        const dots = [
            { x: 50, y: 50, label: '1' },
            { x: 150, y: 50, label: '2' },
            { x: 150, y: 150, label: '3' },
            { x: 50, y: 150, label: '4' }
        ];
        
        dots.forEach(dot => {
            const dotElement = document.createElement('div');
            dotElement.className = 'puzzle-dot';
            dotElement.style.left = dot.x + 'px';
            dotElement.style.top = dot.y + 'px';
            dotElement.textContent = dot.label;
            dotElement.addEventListener('click', () => this.connectDot(dot.label));
            puzzleArea.appendChild(dotElement);
        });
        
        const resultArea = document.createElement('div');
        resultArea.className = 'puzzle-result';
        resultArea.textContent = 'Connect: ';
        
        container.appendChild(instructions);
        container.appendChild(puzzleArea);
        container.appendChild(resultArea);
        
        this.questionText.parentNode.insertBefore(container, this.questionText.nextSibling);
        
        this.connectedDots = [];
    }

    updateGameHeader() {
        this.scoreElement.textContent = this.score;
        this.currentQuestionElement.textContent = this.currentQuestionIndex + 1;
    }
    
    selectPictureAnswer(selectedOption) {
        const isCorrect = selectedOption === this.currentQuestion.correctAnswerText;
        
        // Visual feedback
        const options = document.querySelectorAll('.picture-option');
        options.forEach(option => {
            option.disabled = true;
            if (option.textContent === this.currentQuestion.correctAnswerText) {
                option.classList.add('correct');
            } else if (option.textContent === selectedOption && !isCorrect) {
                option.classList.add('wrong');
            }
        });
        
        if (isCorrect) {
            this.score += 100;
            this.playSound('correct');
            setTimeout(() => this.startGPSChallenge(), 1500);
        } else {
            this.playSound('wrong');
            setTimeout(() => this.endGame(false), 1500);
        }
    }
    
    toggleLetter(letterTile) {
        if (letterTile.classList.contains('selected')) {
            // Remove from selection
            letterTile.classList.remove('selected');
            const index = this.selectedLetters.indexOf(letterTile.textContent);
            if (index > -1) {
                this.selectedLetters.splice(index, 1);
            }
        } else {
            // Add to selection
            letterTile.classList.add('selected');
            this.selectedLetters.push(letterTile.textContent);
        }
        
        // Update answer display
        const answerSlots = document.querySelector('.answer-slots');
        answerSlots.textContent = this.selectedLetters.join('');
    }
    
    submitWordAnswer() {
        const userAnswer = this.selectedLetters.join('').toLowerCase();
        const correctAnswer = this.currentQuestion.correctAnswerText.toLowerCase();
        const isCorrect = userAnswer === correctAnswer;
        
        // Visual feedback
        const submitBtn = document.querySelector('.submit-word');
        const answerSlots = document.querySelector('.answer-slots');
        
        if (isCorrect) {
            answerSlots.classList.add('correct');
            submitBtn.textContent = 'CORRECT!';
            this.score += 100;
            this.playSound('correct');
            setTimeout(() => this.startGPSChallenge(), 1500);
        } else {
            answerSlots.classList.add('wrong');
            submitBtn.textContent = 'WRONG! Answer: ' + this.currentQuestion.correctAnswerText;
            this.playSound('wrong');
            setTimeout(() => this.endGame(false), 1500);
        }
        
        submitBtn.disabled = true;
    }
    
    connectDot(dotLabel) {
        this.connectedDots.push(dotLabel);
        
        // Update display
        const resultArea = document.querySelector('.puzzle-result');
        resultArea.textContent = 'Connect: ' + this.connectedDots.join(' → ');
        
        // Mark dot as connected
        const dotElements = document.querySelectorAll('.puzzle-dot');
        dotElements.forEach(dot => {
            if (dot.textContent === dotLabel) {
                dot.classList.add('connected');
            }
        });
        
        // Check if puzzle is complete (simple: connect all 4 dots in order)
        if (this.connectedDots.length === 4) {
            const correctOrder = ['1', '2', '3', '4'];
            const isCorrect = JSON.stringify(this.connectedDots) === JSON.stringify(correctOrder);
            
            if (isCorrect) {
                resultArea.textContent = 'CORRECT! Palace outline complete!';
                resultArea.classList.add('correct');
                this.score += 100;
                this.playSound('correct');
                setTimeout(() => this.startGPSChallenge(), 1500);
            } else {
                resultArea.textContent = 'Wrong order! Try again.';
                resultArea.classList.add('wrong');
                this.playSound('wrong');
                setTimeout(() => this.endGame(false), 1500);
            }
            
            // Disable further clicks
            dotElements.forEach(dot => dot.style.pointerEvents = 'none');
        }
    }

    selectAnswer(selectedAnswer) {
        this.answerButtons.forEach(btn => btn.disabled = true);
        
        const isCorrect = selectedAnswer === this.currentQuestion.correctAnswer;
        
        this.answerButtons.forEach((btn, index) => {
            const choice = String.fromCharCode(65 + index);
            if (choice === this.currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            } else if (choice === selectedAnswer && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

        if (isCorrect) {
            this.score += 100;
            this.playSound('correct');
            setTimeout(() => this.startGPSChallenge(), 1500);
        } else {
            this.playSound('wrong');
            setTimeout(() => this.endGame(false), 1500);
        }
    }

    startGPSChallenge() {
        this.targetLocation = {
            lat: this.currentQuestion.latitude,
            lng: this.currentQuestion.longitude
        };
        
        this.locationHint.textContent = `Walk to the location: ${this.currentQuestion.correctAnswerText}`;
        this.showScreen('gps');
        this.resetDistanceBar();
        this.startLocationTracking();
    }

    startLocationTracking() {
        if ('geolocation' in navigator) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => this.updateLocation(position),
                (error) => this.handleLocationError(error),
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 30000
                }
            );
        } else {
            this.distanceText.textContent = '📍 Geolocation not supported';
            this.gpsStatusText.textContent = '❌ GPS not available. Click SKIP to continue.';
        }
        
        // Start device orientation tracking
        this.startOrientationTracking();
    }

    startOrientationTracking() {
        // Check if device orientation is supported
        if ('DeviceOrientationEvent' in window) {
            // Create bound handler function
            this.orientationHandler = (event) => this.handleOrientation(event);
            
            // Request permission for iOS 13+
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', this.orientationHandler);
                        }
                    })
                    .catch(console.error);
            } else {
                // For Android and older iOS
                window.addEventListener('deviceorientation', this.orientationHandler);
            }
        }
    }

    handleOrientation(event) {
        // Get device heading (compass direction)
        this.deviceHeading = event.alpha || 0;
        
        // Update compass if we have location data
        if (this.userLocation && this.targetLocation) {
            this.updateCompass();
        }
    }

    updateLocation(position) {
        this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        const distance = this.calculateDistance(
            this.userLocation.lat,
            this.userLocation.lng,
            this.targetLocation.lat,
            this.targetLocation.lng
        );

        // Debug info for location accuracy
        console.log(`Current location: ${this.userLocation.lat.toFixed(6)}, ${this.userLocation.lng.toFixed(6)}`);
        console.log(`Target location: ${this.targetLocation.lat.toFixed(6)}, ${this.targetLocation.lng.toFixed(6)}`);
        console.log(`Distance: ${distance.toFixed(1)}m, GPS accuracy: ${position.coords.accuracy?.toFixed(1) || 'unknown'}m`);
        console.log(`Target name: ${this.currentQuestion.correctAnswerText}`);
        
        // Test simple distance calculation for debugging
        const latDiff = Math.abs(this.userLocation.lat - this.targetLocation.lat);
        const lngDiff = Math.abs(this.userLocation.lng - this.targetLocation.lng);
        const simpleDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // rough approximation
        console.log(`Simple distance calc: ${simpleDistance.toFixed(1)}m`);
        console.log(`Lat diff: ${latDiff.toFixed(6)}, Lng diff: ${lngDiff.toFixed(6)}`);
        
        // Show debug info in distance meters display instead
        this.distanceMeters.innerHTML = `${distance.toFixed(0)}m<br><small>Debug: ${this.userLocation.lat.toFixed(4)},${this.userLocation.lng.toFixed(4)} → ${this.targetLocation.lat.toFixed(4)},${this.targetLocation.lng.toFixed(4)}</small>`;

        this.updateDistanceBar(distance, position.coords.accuracy);
        this.updateCompass();

        // Reduced radius to 15m for better verification accuracy
        // If GPS accuracy is poor (>20m), be more lenient with acceptance radius
        const accuracy = position.coords.accuracy;
        const acceptanceRadius = (accuracy && accuracy > 20) ? Math.max(15, accuracy * 1.2) : 15;
        
        if (distance <= acceptanceRadius) {
            this.arriveAtLocation();
        }
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    handleLocationError(error) {
        console.error('Location error:', error);
        this.distanceText.textContent = '📍 Location access denied';
        this.gpsStatusText.textContent = '❌ Allow location access or click SKIP to continue.';
    }

    resetDistanceBar() {
        this.distanceText.textContent = '📍 Finding your location...';
        this.distanceBarFill.style.width = '0%';
        this.distanceBarText.textContent = '0%';
        this.distanceMeters.textContent = '--- m';
        this.gpsStatusText.textContent = '🚶 Start walking towards the target location';
        
        // Reset compass
        this.compassArrow.style.transform = 'rotate(0deg)';
    }

    updateDistanceBar(distance, accuracy) {
        // Update distance text with GPS accuracy info
        const accuracyText = accuracy ? ` (±${accuracy.toFixed(0)}m)` : '';
        this.distanceText.textContent = `📡 GPS Signal Active${accuracyText}`;
        this.distanceMeters.textContent = `${distance.toFixed(0)} m`;
        
        // Calculate progress (closer = higher percentage)
        const maxDistance = 1000; // Maximum distance for 0% progress
        const progress = Math.max(0, Math.min(100, (maxDistance - distance) / maxDistance * 100));
        
        // Update progress bar
        this.distanceBarFill.style.width = `${progress}%`;
        this.distanceBarText.textContent = `${progress.toFixed(0)}%`;
        
        // Update status text based on distance - adjusted for new 15m acceptance radius
        if (distance <= 15) {
            this.gpsStatusText.textContent = '🎉 Perfect! You reached the target location!';
            this.distanceBarFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
        } else if (distance <= 50) {
            this.gpsStatusText.textContent = '🔥 Very close! Almost there!';
            this.distanceBarFill.style.background = 'linear-gradient(90deg, #f39c12, #27ae60)';
        } else if (distance <= 150) {
            this.gpsStatusText.textContent = '👍 Getting closer! Keep walking!';
            this.distanceBarFill.style.background = 'linear-gradient(90deg, #e67e22, #f39c12)';
        } else if (distance <= 300) {
            this.gpsStatusText.textContent = '🚶 You\'re on the right track!';
            this.distanceBarFill.style.background = 'linear-gradient(90deg, #e74c3c, #e67e22)';
        } else {
            this.gpsStatusText.textContent = '🧭 Start walking towards the target location';
            this.distanceBarFill.style.background = 'linear-gradient(90deg, #c0392b, #e74c3c)';
        }
    }

    arriveAtLocation() {
        this.stopLocationTracking();
        this.playSound('arrival');
        this.score += 50; // Bonus for visiting location
        
        // Check if this is a commercial location
        const isCommercial = this.currentQuestion.extraData === 'commercial';
        
        if (isCommercial) {
            // Show discount screen for commercial locations
            this.showDiscountScreen();
        } else {
            // Show regular verification screen
            this.verifiedLocation.textContent = this.currentQuestion.correctAnswerText;
            this.showScreen('verification');
        }
    }

    skipGPS() {
        this.stopLocationTracking();
        // Show a confirmation message that they can skip if GPS is problematic
        const skipConfirm = confirm('Skip GPS challenge? You can continue without visiting the location.');
        if (skipConfirm) {
            this.currentQuestionIndex++;
            this.showScreen('question');
            this.displayQuestion();
        } else {
            // Return to GPS screen if they changed their mind
            this.startGPSChallenge();
        }
    }

    stopLocationTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        
        // Stop orientation tracking
        if (this.orientationHandler) {
            window.removeEventListener('deviceorientation', this.orientationHandler);
            this.orientationHandler = null;
        }
    }

    continueToNextQuestion() {
        this.currentQuestionIndex++;
        this.showScreen('question');
        this.displayQuestion();
    }

    stayAtLocation() {
        // Return to GPS screen to stay at location
        this.showScreen('gps');
        this.startLocationTracking();
    }

    showDiscountScreen() {
        // Set up discount information
        this.businessName.textContent = this.currentQuestion.correctAnswerText;
        
        // Different discounts based on business type
        if (this.currentQuestion.correctAnswerText.includes('Billiard-Sportpark')) {
            this.discountText.textContent = '20% off your next game session!';
            this.discountCode.textContent = 'BRUCHSAL20';
        } else {
            this.discountText.textContent = '15% off your purchase!';
            this.discountCode.textContent = 'QUEST15';
        }
        
        this.showScreen('discount');
    }

    claimDiscount() {
        // Add bonus points for claiming discount
        this.score += 100;
        alert('Discount claimed! Show this screen to the business to redeem your offer.');
    }

    continueFromDiscount() {
        this.currentQuestionIndex++;
        this.showScreen('question');
        this.displayQuestion();
    }

    retryQuestion() {
        this.showScreen('question');
        this.displayQuestion();
    }

    endGame(victory) {
        this.stopLocationTracking();
        this.stopBackgroundMusic();
        
        if (victory) {
            // Check for new personal best
            const isNewRecord = this.updateUserScore(this.score);
            
            this.showScreen('victory');
            this.finalScore.textContent = this.score;
            
            if (isNewRecord) {
                this.newRecord.style.display = 'block';
            } else {
                this.newRecord.style.display = 'none';
            }
        } else {
            this.showScreen('game-over');
            this.gameOverTitle.textContent = 'GAME OVER';
            this.gameOverCharacter.textContent = '💀';
            this.gameOverMessage.textContent = 'Wrong answer! Try again, brave adventurer!';
        }
    }

    restartGame() {
        this.stopLocationTracking();
        this.stopBackgroundMusic();
        this.shuffleQuestions();
        this.showScreen('start');
    }

    showScreen(screenName) {
        console.log('Switching to screen:', screenName);
        
        try {
            // Alternative approach: use query selector to find all screens
            const allScreens = document.querySelectorAll('.screen');
            
            // Remove active class from all screens
            allScreens.forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Find and activate target screen
            const targetScreen = document.getElementById(screenName + '-screen');
            
            if (targetScreen) {
                targetScreen.classList.add('active');
                console.log('Screen switched successfully to:', screenName);
            } else {
                console.error('Target screen not found:', screenName + '-screen');
                
                // Fallback: try to show login screen
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) {
                    loginScreen.classList.add('active');
                    console.log('Fallback: showing login screen');
                }
            }
        } catch (error) {
            console.error('Error in showScreen:', error);
        }
    }

    playSound(soundType) {
        try {
            let audio;
            switch (soundType) {
                case 'correct':
                    audio = this.correctSound;
                    break;
                case 'wrong':
                    audio = this.wrongSound;
                    break;
                case 'arrival':
                    audio = this.arrivalSound;
                    break;
            }
            
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio play failed:', e));
            }
        } catch (error) {
            console.log('Audio error:', error);
        }
    }

    showError(message) {
        this.questionText.textContent = message;
        this.answerButtons.forEach(btn => {
            btn.textContent = 'Error loading content';
            btn.disabled = true;
        });
    }

    createSoundEffects() {
        // Create 8-bit style sound effects using Web Audio API
        this.audioContext = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    createBeep(frequency, duration, type = 'square') {
        if (!this.audioContext || !this.soundEnabled) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playSound(soundType) {
        try {
            // First try to play HTML5 audio if available
            let audio;
            switch (soundType) {
                case 'correct':
                    audio = this.correctSound;
                    break;
                case 'wrong':
                    audio = this.wrongSound;
                    break;
                case 'arrival':
                    audio = this.arrivalSound;
                    break;
            }
            
            if (audio && audio.src) {
                audio.currentTime = 0;
                audio.play().catch(e => {
                    console.log('HTML5 audio failed, using Web Audio API');
                    this.playWebAudioSound(soundType);
                });
            } else {
                this.playWebAudioSound(soundType);
            }
        } catch (error) {
            console.log('Audio error:', error);
            this.playWebAudioSound(soundType);
        }
    }

    playWebAudioSound(soundType) {
        if (!this.audioContext) return;
        
        switch (soundType) {
            case 'correct':
                // Happy ascending notes
                this.createBeep(523, 0.1); // C5
                setTimeout(() => this.createBeep(659, 0.1), 100); // E5
                setTimeout(() => this.createBeep(784, 0.2), 200); // G5
                break;
            case 'wrong':
                // Sad descending buzz
                this.createBeep(200, 0.3, 'sawtooth');
                setTimeout(() => this.createBeep(150, 0.3, 'sawtooth'), 150);
                break;
            case 'arrival':
                // Achievement fanfare
                this.createBeep(523, 0.1); // C5
                setTimeout(() => this.createBeep(659, 0.1), 100); // E5
                setTimeout(() => this.createBeep(784, 0.1), 200); // G5
                setTimeout(() => this.createBeep(1047, 0.3), 300); // C6
                break;
        }
    }

    startBackgroundMusic() {
        if (this.musicPlaying || !this.soundEnabled) return;
        
        // Try HTML5 audio first
        if (this.backgroundMusic && this.backgroundMusic.src) {
            this.backgroundMusic.volume = 0.3;
            this.backgroundMusic.play().catch(e => {
                console.log('Background music failed, using Web Audio API');
                this.playWebAudioMusic();
            });
            this.musicPlaying = true;
        } else {
            this.playWebAudioMusic();
        }
    }

    playWebAudioMusic() {
        if (!this.audioContext || this.musicPlaying || !this.soundEnabled) return;
        
        this.musicPlaying = true;
        
        // Mario-style 8-bit adventure melody
        const playNote = (frequency, duration, delay = 0, volume = 0.15) => {
            setTimeout(() => {
                if (this.musicPlaying && this.soundEnabled) {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = 'square';
                    
                    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + duration);
                }
            }, delay);
        };
        
        const playMelody = () => {
            if (!this.musicPlaying) return;
            
            // Longer Mario-style adventure melody (like overworld theme)
            const melody = [
                // First phrase - heroic opening
                {freq: 659, dur: 0.15, delay: 0},    // E5
                {freq: 659, dur: 0.15, delay: 200},  // E5
                {freq: 0, dur: 0.15, delay: 400},    // Rest
                {freq: 659, dur: 0.15, delay: 600},  // E5
                {freq: 0, dur: 0.15, delay: 800},    // Rest
                {freq: 523, dur: 0.15, delay: 1000}, // C5
                {freq: 659, dur: 0.15, delay: 1200}, // E5
                {freq: 0, dur: 0.15, delay: 1400},   // Rest
                {freq: 784, dur: 0.3, delay: 1600},  // G5
                {freq: 0, dur: 0.3, delay: 2000},    // Rest
                {freq: 392, dur: 0.3, delay: 2400},  // G4
                
                // Second phrase - walking rhythm
                {freq: 523, dur: 0.15, delay: 2800}, // C5
                {freq: 0, dur: 0.15, delay: 3000},   // Rest
                {freq: 392, dur: 0.15, delay: 3200}, // G4
                {freq: 0, dur: 0.15, delay: 3400},   // Rest
                {freq: 330, dur: 0.15, delay: 3600}, // E4
                {freq: 0, dur: 0.15, delay: 3800},   // Rest
                {freq: 440, dur: 0.15, delay: 4000}, // A4
                {freq: 0, dur: 0.15, delay: 4200},   // Rest
                {freq: 494, dur: 0.15, delay: 4400}, // B4
                {freq: 0, dur: 0.15, delay: 4600},   // Rest
                {freq: 466, dur: 0.15, delay: 4800}, // Bb4
                {freq: 440, dur: 0.15, delay: 5000}, // A4
                
                // Third phrase - adventure continues
                {freq: 392, dur: 0.2, delay: 5200},  // G4
                {freq: 659, dur: 0.2, delay: 5500},  // E5
                {freq: 784, dur: 0.2, delay: 5800},  // G5
                {freq: 880, dur: 0.15, delay: 6100}, // A5
                {freq: 0, dur: 0.15, delay: 6300},   // Rest
                {freq: 698, dur: 0.15, delay: 6500}, // F5
                {freq: 784, dur: 0.15, delay: 6700}, // G5
                {freq: 0, dur: 0.15, delay: 6900},   // Rest
                {freq: 659, dur: 0.15, delay: 7100}, // E5
                {freq: 0, dur: 0.15, delay: 7300},   // Rest
                {freq: 523, dur: 0.15, delay: 7500}, // C5
                {freq: 587, dur: 0.15, delay: 7700}, // D5
                {freq: 494, dur: 0.3, delay: 7900},  // B4
                
                // Final phrase - triumphant ending
                {freq: 523, dur: 0.15, delay: 8300}, // C5
                {freq: 0, dur: 0.15, delay: 8500},   // Rest
                {freq: 392, dur: 0.15, delay: 8700}, // G4
                {freq: 0, dur: 0.15, delay: 8900},   // Rest
                {freq: 330, dur: 0.15, delay: 9100}, // E4
                {freq: 0, dur: 0.15, delay: 9300},   // Rest
                {freq: 440, dur: 0.15, delay: 9500}, // A4
                {freq: 0, dur: 0.15, delay: 9700},   // Rest
                {freq: 494, dur: 0.15, delay: 9900}, // B4
                {freq: 0, dur: 0.15, delay: 10100},  // Rest
                {freq: 466, dur: 0.15, delay: 10300}, // Bb4
                {freq: 440, dur: 0.15, delay: 10500}, // A4
                {freq: 392, dur: 0.4, delay: 10700},  // G4 (long ending note)
            ];
            
            melody.forEach(note => {
                if (note.freq > 0) { // Only play actual notes, skip rests
                    playNote(note.freq, note.dur, note.delay);
                }
            });
            
            // Loop the melody - total length is about 11 seconds
            setTimeout(playMelody, 11200);
        };
        
        playMelody();
    }

    stopBackgroundMusic() {
        this.musicPlaying = false;
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        if (this.soundEnabled) {
            this.soundToggle.textContent = '🔊';
            this.soundToggle.classList.remove('muted');
            // Restart background music if game is playing
            if (this.gameState === 'playing' && !this.musicPlaying) {
                this.startBackgroundMusic();
            }
        } else {
            this.soundToggle.textContent = '🔇';
            this.soundToggle.classList.add('muted');
            this.stopBackgroundMusic();
        }
    }






    calculateBearing(lat1, lng1, lat2, lng2) {
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        
        const y = Math.sin(dLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
        
        return Math.atan2(y, x);
    }

    updateCompass() {
        if (!this.userLocation || !this.targetLocation) return;
        
        // Calculate bearing from user to target
        const bearing = this.calculateBearing(
            this.userLocation.lat,
            this.userLocation.lng,
            this.targetLocation.lat,
            this.targetLocation.lng
        );
        
        // Convert bearing from radians to degrees
        const bearingDegrees = (bearing * 180 / Math.PI + 360) % 360;
        
        // Adjust for device orientation (which way phone is pointing)
        // Subtract device heading so arrow points correctly relative to phone orientation
        const adjustedBearing = (bearingDegrees - this.deviceHeading + 360) % 360;
        
        // Rotate compass arrow to point towards target relative to phone orientation
        this.compassArrow.style.transform = `rotate(${adjustedBearing}deg)`;
        
        // Log for debugging
        console.log(`Target bearing: ${bearingDegrees.toFixed(1)}°, Device heading: ${this.deviceHeading.toFixed(1)}°, Adjusted: ${adjustedBearing.toFixed(1)}°`);
    }






















    // ===== AUTHENTICATION SYSTEM =====
    
    checkAutoLogin() {
        try {
            const savedUser = localStorage.getItem('bruchsal_current_user');
            if (savedUser) {
                try {
                    this.currentUser = JSON.parse(savedUser);
                    this.isGuest = false;
                    this.showMainMenu();
                    this.updateUserDisplay();
                } catch (e) {
                    console.error('Error parsing saved user:', e);
                    this.showScreen('login');
                }
            } else {
                this.showScreen('login');
            }
        } catch (error) {
            console.error('Critical error in checkAutoLogin:', error);
            // Force show login screen as fallback
            if (this.loginScreen) {
                this.loginScreen.classList.add('active');
            }
        }
    }
    
    showLoginForm() {
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
        this.clearFormInputs();
    }
    
    showRegisterForm() {
        this.loginForm.style.display = 'none';
        this.registerForm.style.display = 'block';
        this.clearFormInputs();
    }
    
    clearFormInputs() {
        this.loginUsername.value = '';
        this.loginPassword.value = '';
        this.registerUsername.value = '';
        this.registerPassword.value = '';
        this.registerConfirm.value = '';
    }
    
    handleLogin() {
        const username = this.loginUsername.value.trim();
        const password = this.loginPassword.value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            this.isGuest = false;
            localStorage.setItem('bruchsal_current_user', JSON.stringify(user));
            this.showMainMenu();
            this.updateUserDisplay();
        } else {
            alert('Invalid username or password');
        }
    }
    
    handleRegister() {
        const username = this.registerUsername.value.trim();
        const password = this.registerPassword.value;
        const confirmPassword = this.registerConfirm.value;
        
        if (!username || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (username.length < 3) {
            alert('Username must be at least 3 characters long');
            return;
        }
        
        if (password.length < 4) {
            alert('Password must be at least 4 characters long');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            alert('Username already exists');
            return;
        }
        
        const newUser = {
            username: username,
            password: password,
            bestScore: 0,
            totalGames: 0,
            registeredAt: new Date().toISOString()
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        this.currentUser = newUser;
        this.isGuest = false;
        localStorage.setItem('bruchsal_current_user', JSON.stringify(newUser));
        
        alert('Registration successful! Welcome to Bruchsal Quest!');
        this.showMainMenu();
        this.updateUserDisplay();
    }
    
    loginAsGuest() {
        console.log('Logging in as guest...');
        this.currentUser = {
            username: 'Guest',
            bestScore: 0,
            totalGames: 0,
            isGuest: true
        };
        this.isGuest = true;
        console.log('Guest user created:', this.currentUser);
        this.showMainMenu();
        this.updateUserDisplay();
    }
    
    logout() {
        this.currentUser = null;
        this.isGuest = false;
        localStorage.removeItem('bruchsal_current_user');
        this.showScreen('login');
        this.clearFormInputs();
    }
    
    showMainMenu() {
        console.log('Showing main menu...');
        this.showScreen('start');
        this.gameState = 'start';
        console.log('Main menu should be visible now');
    }
    
    updateUserDisplay() {
        console.log('Updating user display...', this.currentUser);
        if (this.currentUser) {
            if (this.currentUserElement) {
                this.currentUserElement.textContent = this.currentUser.username;
            } else {
                console.error('currentUserElement not found');
            }
            
            if (this.userBestScore) {
                this.userBestScore.textContent = this.currentUser.bestScore;
            } else {
                console.error('userBestScore element not found');
            }
            
            // Hide logout button for guests
            if (this.logoutBtn) {
                if (this.isGuest) {
                    this.logoutBtn.style.display = 'none';
                } else {
                    this.logoutBtn.style.display = 'block';
                }
            } else {
                console.error('logoutBtn element not found');
            }
        }
    }
    
    // ===== USER DATA MANAGEMENT =====
    
    getUsers() {
        try {
            const users = localStorage.getItem('bruchsal_users');
            return users ? JSON.parse(users) : [];
        } catch (e) {
            console.error('Error parsing users:', e);
            return [];
        }
    }
    
    saveUsers(users) {
        localStorage.setItem('bruchsal_users', JSON.stringify(users));
    }
    
    updateUserScore(newScore) {
        if (!this.currentUser || this.isGuest) {
            return false;
        }
        
        const isNewRecord = newScore > this.currentUser.bestScore;
        
        if (isNewRecord) {
            this.currentUser.bestScore = newScore;
            this.currentUser.totalGames = (this.currentUser.totalGames || 0) + 1;
            
            // Update in localStorage
            localStorage.setItem('bruchsal_current_user', JSON.stringify(this.currentUser));
            
            // Update in users list
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.username === this.currentUser.username);
            if (userIndex !== -1) {
                users[userIndex] = { ...this.currentUser };
                this.saveUsers(users);
            }
            
            this.updateUserDisplay();
        }
        
        return isNewRecord;
    }
    
    // ===== LEADERBOARD SYSTEM =====
    
    showLeaderboard() {
        this.showScreen('leaderboard');
        this.updateLeaderboard();
    }
    
    updateLeaderboard() {
        const users = this.getUsers()
            .filter(user => user.bestScore > 0)
            .sort((a, b) => b.bestScore - a.bestScore)
            .slice(0, 10); // Top 10 players
        
        this.leaderboardList.innerHTML = '';
        
        if (users.length === 0) {
            this.leaderboardList.innerHTML = '<div class="empty-leaderboard">No scores yet. Be the first to play!</div>';
            this.userRank.textContent = '-';
            this.totalPlayers.textContent = '0';
            return;
        }
        
        users.forEach((user, index) => {
            const rank = index + 1;
            const entry = document.createElement('div');
            entry.className = 'leaderboard-entry';
            
            // Highlight current user
            if (this.currentUser && user.username === this.currentUser.username) {
                entry.classList.add('current-user');
            }
            
            const rankElement = document.createElement('div');
            rankElement.className = 'leaderboard-rank';
            if (rank === 1) rankElement.classList.add('first');
            else if (rank === 2) rankElement.classList.add('second');
            else if (rank === 3) rankElement.classList.add('third');
            
            rankElement.textContent = `#${rank}`;
            
            const nameElement = document.createElement('div');
            nameElement.className = 'leaderboard-name';
            nameElement.textContent = user.username;
            
            const scoreElement = document.createElement('div');
            scoreElement.className = 'leaderboard-score';
            scoreElement.textContent = `${user.bestScore} XP`;
            
            entry.appendChild(rankElement);
            entry.appendChild(nameElement);
            entry.appendChild(scoreElement);
            
            this.leaderboardList.appendChild(entry);
        });
        
        // Update user stats
        this.totalPlayers.textContent = users.length;
        
        if (this.currentUser && !this.isGuest) {
            const userRank = users.findIndex(u => u.username === this.currentUser.username) + 1;
            this.userRank.textContent = userRank > 0 ? userRank : '-';
        } else {
            this.userRank.textContent = '-';
        }
    }
    
    // ===== QUEST JOURNAL SYSTEM =====
    
    showQuestJournal() {
        this.showScreen('quest-journal');
        this.updateQuestJournal();
    }
    
    updateQuestJournal() {
        // Get completed locations from localStorage
        const completedLocations = this.getCompletedLocations();
        const totalLocations = this.questions.length;
        const taggedLocations = completedLocations.length;
        const remainingLocations = totalLocations - taggedLocations;
        
        // Update stats
        this.taggedCount.textContent = taggedLocations;
        this.remainingCount.textContent = remainingLocations;
        
        // Clear existing entries
        this.locationGrid.innerHTML = '';
        
        if (this.questions.length === 0) {
            this.locationGrid.innerHTML = '<div class="empty-leaderboard">No locations available</div>';
            return;
        }
        
        // Create location entries
        this.questions.forEach((question, index) => {
            const entry = document.createElement('div');
            entry.className = 'location-entry';
            
            const isCompleted = completedLocations.includes(question.correctAnswerText);
            if (isCompleted) {
                entry.classList.add('tagged');
            }
            
            const locationName = document.createElement('div');
            locationName.className = 'location-name';
            locationName.textContent = question.correctAnswerText || `Location ${index + 1}`;
            
            const locationStatus = document.createElement('div');
            locationStatus.className = 'location-status';
            locationStatus.textContent = isCompleted ? 'HIJACKED ✓' : 'TARGET LOCKED';
            
            entry.appendChild(locationName);
            entry.appendChild(locationStatus);
            
            this.locationGrid.appendChild(entry);
        });
    }
    
    getCompletedLocations() {
        try {
            const completed = localStorage.getItem('pathJack_completed_locations');
            return completed ? JSON.parse(completed) : [];
        } catch (e) {
            console.error('Error parsing completed locations:', e);
            return [];
        }
    }
    
    saveCompletedLocation(locationName) {
        try {
            const completed = this.getCompletedLocations();
            if (!completed.includes(locationName)) {
                completed.push(locationName);
                localStorage.setItem('pathJack_completed_locations', JSON.stringify(completed));
            }
        } catch (e) {
            console.error('Error saving completed location:', e);
        }
    }
    
    // Update the arrive at location method to save completed locations
    arriveAtLocation() {
        this.stopLocationTracking();
        this.playSound('arrival');
        this.score += 50; // Bonus for visiting location
        
        // Save this location as completed
        if (this.currentQuestion && this.currentQuestion.correctAnswerText) {
            this.saveCompletedLocation(this.currentQuestion.correctAnswerText);
        }
        
        // Check if this is a commercial location
        const isCommercial = this.currentQuestion.extraData === 'commercial';
        
        if (isCommercial) {
            // Show discount screen for commercial locations
            this.showDiscountScreen();
        } else {
            // Show regular verification screen
            this.verifiedLocation.textContent = this.currentQuestion.correctAnswerText;
            this.showScreen('verification');
        }
    }
    
    // Debug function to skip login
    debugSkipToMenu() {
        console.log('DEBUG: Skipping to main menu');
        this.currentUser = {
            username: 'DebugUser',
            bestScore: 100,
            totalGames: 5,
            isGuest: false
        };
        this.isGuest = false;
        this.showMainMenu();
        this.updateUserDisplay();
    }
}

// Global variable for the game instance
let gameInstance = null;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new BruchsalQuest();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
});