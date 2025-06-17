// Bruchsal Quest - 8-bit Trivia Game
class BruchsalQuest {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameState = 'start';
        this.currentQuestion = null;
        this.userLocation = null;
        this.targetLocation = null;
        this.watchId = null;
        this.musicPlaying = false;
        this.soundEnabled = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadQuestions();
        this.createSoundEffects();
    }

    initializeElements() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.questionScreen = document.getElementById('question-screen');
        this.gpsScreen = document.getElementById('gps-screen');
        this.verificationScreen = document.getElementById('verification-screen');
        this.discountScreen = document.getElementById('discount-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.victoryScreen = document.getElementById('victory-screen');

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
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.skipGpsBtn.addEventListener('click', () => this.skipGPS());
        this.continueBtn.addEventListener('click', () => this.continueToNextQuestion());
        this.stayBtn.addEventListener('click', () => this.stayAtLocation());
        this.claimDiscountBtn.addEventListener('click', () => this.claimDiscount());
        this.continueGameBtn.addEventListener('click', () => this.continueFromDiscount());
        this.retryBtn.addEventListener('click', () => this.retryQuestion());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.playAgainBtn.addEventListener('click', () => this.restartGame());

        this.answerButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectAnswer(String.fromCharCode(65 + index)));
        });

        this.soundToggle.addEventListener('click', () => this.toggleSound());
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
            this.showScreen('victory');
            this.finalScore.textContent = this.score;
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
        const screens = [this.startScreen, this.questionScreen, this.gpsScreen, this.verificationScreen, this.discountScreen, this.gameOverScreen, this.victoryScreen];
        screens.forEach(screen => screen.classList.remove('active'));
        
        switch (screenName) {
            case 'start':
                this.startScreen.classList.add('active');
                break;
            case 'question':
                this.questionScreen.classList.add('active');
                break;
            case 'gps':
                this.gpsScreen.classList.add('active');
                break;
            case 'verification':
                this.verificationScreen.classList.add('active');
                break;
            case 'discount':
                this.discountScreen.classList.add('active');
                break;
            case 'game-over':
                this.gameOverScreen.classList.add('active');
                break;
            case 'victory':
                this.victoryScreen.classList.add('active');
                break;
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
        
        // Rotate compass arrow to point towards target
        this.compassArrow.style.transform = `rotate(${bearingDegrees}deg)`;
        
        // Log for debugging
        console.log(`Compass bearing: ${bearingDegrees.toFixed(1)}°`);
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