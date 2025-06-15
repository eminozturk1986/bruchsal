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
        this.soundEnabled = true;
        
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
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.victoryScreen = document.getElementById('victory-screen');

        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.skipGpsBtn = document.getElementById('skip-gps');
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
        this.progressFill = document.getElementById('progress-fill');
        this.locationHint = document.getElementById('location-hint');
        this.gpsMap = document.getElementById('gps-map');
        this.mapCtx = this.gpsMap.getContext('2d');

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
            if (values.length >= 8 && values[0].length > 0) {
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
                
                this.questions.push({
                    question: values[0],
                    choices: choices,
                    correctAnswer: correctLetter,
                    correctAnswerText: correctAnswerText,
                    latitude: parseFloat(values[6]),
                    longitude: parseFloat(values[7])
                });
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
        
        this.answerButtons.forEach((btn, index) => {
            const choice = String.fromCharCode(65 + index);
            btn.textContent = `${choice}) ${this.currentQuestion.choices[choice]}`;
            btn.className = 'answer-btn';
            btn.disabled = false;
        });

        this.updateGameHeader();
    }

    updateGameHeader() {
        this.scoreElement.textContent = this.score;
        this.currentQuestionElement.textContent = this.currentQuestionIndex + 1;
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
        
        this.locationHint.textContent = `Go to the location from the previous question: ${this.currentQuestion.question.split('?')[0]}?`;
        this.showScreen('gps');
        this.initGPSMap();
        this.startLocationTracking();
    }

    startLocationTracking() {
        if ('geolocation' in navigator) {
            this.watchId = navigator.geolocation.watchPosition(
                (position) => this.updateLocation(position),
                (error) => this.handleLocationError(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        } else {
            this.distanceText.textContent = 'Geolocation not supported. Click SKIP to continue.';
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

        this.distanceText.textContent = `Distance to target: ${distance.toFixed(0)}m`;
        
        const maxDistance = 1000; // 1km
        const progress = Math.max(0, (maxDistance - distance) / maxDistance * 100);
        this.progressFill.style.width = `${progress}%`;

        // Update the 8-bit map
        this.updateGPSMap();

        if (distance <= 50) { // Within 50 meters
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
        this.distanceText.textContent = 'Location access denied. Click SKIP to continue.';
    }

    arriveAtLocation() {
        this.stopLocationTracking();
        this.playSound('arrival');
        this.score += 50; // Bonus for visiting location
        
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showScreen('question');
            this.displayQuestion();
        }, 2000);
    }

    skipGPS() {
        this.stopLocationTracking();
        this.currentQuestionIndex++;
        this.showScreen('question');
        this.displayQuestion();
    }

    stopLocationTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
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
        const screens = [this.startScreen, this.questionScreen, this.gpsScreen, this.gameOverScreen, this.victoryScreen];
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

    initGPSMap() {
        if (!this.mapCtx) return;
        
        // Set up the 8-bit style map
        this.mapCtx.imageSmoothingEnabled = false;
        this.updateGPSMap();
    }

    updateGPSMap() {
        if (!this.mapCtx || !this.targetLocation) return;
        
        const canvas = this.gpsMap;
        const ctx = this.mapCtx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw 8-bit street pattern
        this.draw8BitStreets(ctx, canvas.width, canvas.height);
        
        // Draw grid overlay (subtle)
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        const gridSize = 25;
        
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        
        // Draw compass rose
        this.drawCompass(ctx, centerX, centerY);
        
        // Draw range circles
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        for (let radius = 40; radius <= 140; radius += 35) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        
        // Player is always at center (blue dot with pulse effect)
        this.drawPixelDot(ctx, centerX, centerY, '#3498db', 8);
        this.drawPixelDot(ctx, centerX, centerY, '#87ceeb', 4);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU', centerX, centerY + 20);
        
        // Calculate target position relative to player
        if (this.userLocation) {
            const distance = this.calculateDistance(
                this.userLocation.lat,
                this.userLocation.lng,
                this.targetLocation.lat,
                this.targetLocation.lng
            );
            
            // Calculate bearing (direction)
            const bearing = this.calculateBearing(
                this.userLocation.lat,
                this.userLocation.lng,
                this.targetLocation.lat,
                this.targetLocation.lng
            );
            
            // Map distance to pixel distance (max 140px radius for larger map)
            const maxDistance = 1000; // 1km
            const pixelDistance = Math.min((distance / maxDistance) * 140, 140);
            
            // Convert bearing to canvas coordinates
            const targetX = centerX + Math.sin(bearing) * pixelDistance;
            const targetY = centerY - Math.cos(bearing) * pixelDistance;
            
            // Draw target (red dot with glow)
            this.drawPixelDot(ctx, targetX, targetY, '#e74c3c', 8);
            this.drawPixelDot(ctx, targetX, targetY, '#ff6b6b', 4);
            
            // Add target label
            ctx.fillStyle = '#ffffff';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('TARGET', targetX, targetY + 18);
            
            // Draw directional arrow if target is off-map
            if (pixelDistance >= 140) {
                this.drawDirectionalArrow(ctx, centerX, centerY, bearing);
            }
            
            // Draw connecting line
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1.0;
            
            // Draw distance text on map
            ctx.fillStyle = '#ecf0f1';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${distance.toFixed(0)}m`, centerX, canvas.height - 10);
        } else {
            // Show target at approximate location if no GPS yet
            this.drawPixelDot(ctx, centerX, centerY - 60, '#e74c3c', 8);
            this.drawPixelDot(ctx, centerX, centerY - 60, '#ff6b6b', 4);
            
            ctx.fillStyle = '#ffd700';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('🔍 SEARCHING GPS...', centerX, canvas.height - 15);
        }
    }

    drawPixelDot(ctx, x, y, color, size) {
        ctx.fillStyle = color;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Add white border for better visibility
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
    }

    drawCompass(ctx, centerX, centerY) {
        const compassSize = 20;
        
        // Compass background circle
        ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX, centerY - compassSize - 130, 25, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // North arrow
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - compassSize - 145);
        ctx.lineTo(centerX - 6, centerY - compassSize - 125);
        ctx.lineTo(centerX + 6, centerY - compassSize - 125);
        ctx.closePath();
        ctx.fill();
        
        // South arrow
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - compassSize - 115);
        ctx.lineTo(centerX - 4, centerY - compassSize - 125);
        ctx.lineTo(centerX + 4, centerY - compassSize - 125);
        ctx.closePath();
        ctx.fill();
        
        // N label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('N', centerX, centerY - compassSize - 100);
    }

    drawDirectionalArrow(ctx, centerX, centerY, bearing) {
        const arrowDistance = 120;
        const arrowX = centerX + Math.sin(bearing) * arrowDistance;
        const arrowY = centerY - Math.cos(bearing) * arrowDistance;
        
        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(bearing);
        
        // Draw larger arrow pointing towards target
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-8, 5);
        ctx.lineTo(8, 5);
        ctx.closePath();
        ctx.fill();
        
        // Add arrow outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
        
        // Add distance text near arrow
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TARGET', arrowX, arrowY + 20);
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

    async loadRealStreets(centerLat, centerLng, radiusKm = 0.8) {
        try {
            // Use Overpass API to get comprehensive map data
            const overpassUrl = 'https://overpass-api.de/api/interpreter';
            const query = `
                [out:json][timeout:30];
                (
                  // Major streets with names
                  way["highway"~"^(primary|secondary|tertiary|trunk|residential)$"]["name"]
                     (around:${radiusKm * 1000},${centerLat},${centerLng});
                  // Also get streets without names for better coverage
                  way["highway"~"^(primary|secondary|tertiary|trunk)$"]
                     (around:${radiusKm * 1000},${centerLat},${centerLng});
                  // Important buildings
                  way["building"~"^(palace|castle|church|cathedral|museum|town_hall|civic|public)$"]
                     (around:${radiusKm * 1000},${centerLat},${centerLng});
                  way["tourism"~"^(museum|attraction|castle|palace)$"]
                     (around:${radiusKm * 1000},${centerLat},${centerLng});
                  way["amenity"~"^(townhall|place_of_worship|museum|theatre)$"]
                     (around:${radiusKm * 1000},${centerLat},${centerLng});
                  // Parks and green spaces
                  way["leisure"~"^(park|garden)$"]
                     (around:${radiusKm * 1000},${centerLat},${centerLng});
                );
                out geom;
            `;
            
            const response = await fetch(overpassUrl, {
                method: 'POST',
                body: 'data=' + encodeURIComponent(query),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Loaded real map data:', data.elements.length, 'elements');
                return this.processMapData(data.elements);
            }
        } catch (error) {
            console.log('Could not load real streets, using fallback pattern');
        }
        return null;
    }

    processMapData(elements) {
        const mapData = {
            streets: [],
            buildings: [],
            parks: []
        };

        elements.forEach(element => {
            if (element.tags) {
                if (element.tags.highway) {
                    mapData.streets.push({
                        ...element,
                        name: element.tags.name || 'Street',
                        type: element.tags.highway
                    });
                } else if (element.tags.building || element.tags.tourism || element.tags.amenity) {
                    mapData.buildings.push({
                        ...element,
                        name: element.tags.name || this.getBuildingTypeLabel(element.tags),
                        type: this.getBuildingType(element.tags)
                    });
                } else if (element.tags.leisure) {
                    mapData.parks.push({
                        ...element,
                        name: element.tags.name || 'Park',
                        type: element.tags.leisure
                    });
                }
            }
        });

        return mapData;
    }

    getBuildingType(tags) {
        if (tags.tourism === 'castle' || tags.tourism === 'palace' || tags.building === 'palace') return 'palace';
        if (tags.amenity === 'place_of_worship' || tags.building === 'church') return 'church';
        if (tags.tourism === 'museum' || tags.amenity === 'museum') return 'museum';
        if (tags.amenity === 'townhall' || tags.building === 'civic') return 'townhall';
        if (tags.amenity === 'theatre') return 'theatre';
        return 'building';
    }

    getBuildingTypeLabel(tags) {
        if (tags.tourism === 'castle' || tags.tourism === 'palace') return 'Palace';
        if (tags.amenity === 'place_of_worship') return 'Church';
        if (tags.tourism === 'museum') return 'Museum';
        if (tags.amenity === 'townhall') return 'Town Hall';
        if (tags.amenity === 'theatre') return 'Theatre';
        return 'Building';
    }

    async draw8BitStreets(ctx, width, height) {
        // Clear background with tourist map color
        ctx.fillStyle = '#f5f5dc'; // Beige background like tourist maps
        ctx.fillRect(0, 0, width, height);
        
        let mapData = null;
        
        // Try to load real map data if we have user location
        if (this.userLocation) {
            mapData = await this.loadRealStreets(this.userLocation.lat, this.userLocation.lng, 0.8);
        }
        
        if (mapData && (mapData.streets.length > 0 || mapData.buildings.length > 0)) {
            // Draw real tourist map in 8-bit style
            this.drawTouristMap8Bit(ctx, width, height, mapData);
        } else {
            // Fallback to generic pattern
            this.drawGenericStreets8Bit(ctx, width, height);
        }
    }

    drawTouristMap8Bit(ctx, width, height, mapData) {
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Calculate bounds for all elements
        const bounds = this.calculateMapBounds(mapData);
        
        // Draw parks first (green background areas)
        this.drawParks8Bit(ctx, width, height, mapData.parks, bounds);
        
        // Draw major streets with names
        this.drawMajorStreets8Bit(ctx, width, height, mapData.streets, bounds);
        
        // Draw important buildings with icons
        this.drawImportantBuildings8Bit(ctx, width, height, mapData.buildings, bounds);
        
        // Add your location marker
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(centerX - 6, centerY - 6, 12, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
        
        // Add location label
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU', centerX, centerY + 20);
        
        // Add map legend/compass
        this.drawMapLegend8Bit(ctx, width, height);
    }

    drawParks8Bit(ctx, width, height, parks, bounds) {
        ctx.fillStyle = '#90EE90'; // Light green for parks
        
        parks.forEach(park => {
            if (park.geometry && park.geometry.length > 2) {
                ctx.beginPath();
                let firstPoint = true;
                
                park.geometry.forEach(node => {
                    const pixelCoords = this.geoToPixel(node.lat, node.lon, bounds, width, height);
                    if (firstPoint) {
                        ctx.moveTo(pixelCoords.x, pixelCoords.y);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(pixelCoords.x, pixelCoords.y);
                    }
                });
                ctx.closePath();
                ctx.fill();
                
                // Add park label
                if (park.geometry.length > 0) {
                    const centerPoint = this.getPolygonCenter(park.geometry, bounds, width, height);
                    ctx.fillStyle = '#006400';
                    ctx.font = '8px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('🌳', centerPoint.x, centerPoint.y);
                    ctx.fillText(park.name, centerPoint.x, centerPoint.y + 12);
                    ctx.fillStyle = '#90EE90';
                }
            }
        });
    }

    drawMajorStreets8Bit(ctx, width, height, streets, bounds) {
        const streetsByType = {
            trunk: { color: '#2A2A2A', width: 10 }, // Very dark for highways
            primary: { color: '#4A4A4A', width: 8 }, // Dark gray for major roads
            secondary: { color: '#6A6A6A', width: 6 }, // Medium gray for secondary
            tertiary: { color: '#8A8A8A', width: 4 }, // Light gray for smaller roads
            residential: { color: '#AAAAAA', width: 2 } // Very light gray for residential
        };
        
        console.log('Drawing streets:', streets.length, 'street elements');
        
        // Draw streets by importance - draw ALL street types
        ['trunk', 'primary', 'secondary', 'tertiary', 'residential'].forEach(streetType => {
            const style = streetsByType[streetType] || { color: '#8A8A8A', width: 3 };
            
            streets.filter(street => street.type === streetType).forEach(street => {
                if (street.geometry && street.geometry.length > 1) {
                    // Draw street
                    ctx.strokeStyle = style.color;
                    ctx.lineWidth = style.width;
                    ctx.lineCap = 'round';
                    
                    ctx.beginPath();
                    let firstPoint = true;
                    let midPoint = null;
                    
                    street.geometry.forEach((node, index) => {
                        const pixelCoords = this.geoToPixel(node.lat, node.lon, bounds, width, height);
                        if (firstPoint) {
                            ctx.moveTo(pixelCoords.x, pixelCoords.y);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(pixelCoords.x, pixelCoords.y);
                        }
                        
                        // Remember middle point for street name
                        if (index === Math.floor(street.geometry.length / 2)) {
                            midPoint = pixelCoords;
                        }
                    });
                    ctx.stroke();
                    
                    // Add street name for major roads
                    if ((streetType === 'primary' || streetType === 'trunk' || streetType === 'secondary') && midPoint && street.name && street.name !== 'Street') {
                        ctx.fillStyle = '#000000';
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 3;
                        ctx.font = 'bold 8px monospace';
                        ctx.textAlign = 'center';
                        
                        // Draw text outline for better visibility
                        ctx.strokeText(street.name, midPoint.x, midPoint.y - 5);
                        ctx.fillText(street.name, midPoint.x, midPoint.y - 5);
                    }
                }
            });
        });
    }

    drawImportantBuildings8Bit(ctx, width, height, buildings, bounds) {
        const buildingStyles = {
            palace: { icon: '🏰', color: '#FFD700', label: 'Palace' },
            church: { icon: '⛪', color: '#8B4513', label: 'Church' },
            museum: { icon: '🏛️', color: '#4169E1', label: 'Museum' },
            townhall: { icon: '🏛️', color: '#DC143C', label: 'Town Hall' },
            theatre: { icon: '🎭', color: '#800080', label: 'Theatre' }
        };
        
        buildings.forEach(building => {
            const style = buildingStyles[building.type] || buildingStyles.building;
            
            if (building.geometry && building.geometry.length > 0) {
                const centerPoint = this.getPolygonCenter(building.geometry, bounds, width, height);
                
                // Draw building background
                ctx.fillStyle = style.color;
                ctx.fillRect(centerPoint.x - 8, centerPoint.y - 8, 16, 16);
                
                // Draw building border
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(centerPoint.x - 8, centerPoint.y - 8, 16, 16);
                
                // Draw icon
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(style.icon, centerPoint.x, centerPoint.y + 3);
                
                // Draw building name
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                
                // Draw text with white outline for visibility
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.strokeText(building.name, centerPoint.x, centerPoint.y + 20);
                ctx.fillText(building.name, centerPoint.x, centerPoint.y + 20);
            }
        });
    }

    drawMapLegend8Bit(ctx, width, height) {
        // Draw compass
        const compassX = width - 30;
        const compassY = 30;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.fillRect(compassX - 15, compassY - 15, 30, 30);
        ctx.strokeRect(compassX - 15, compassY - 15, 30, 30);
        
        // North arrow
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(compassX, compassY - 10);
        ctx.lineTo(compassX - 5, compassY + 5);
        ctx.lineTo(compassX + 5, compassY + 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('N', compassX, compassY + 25);
    }

    getPolygonCenter(geometry, bounds, width, height) {
        let sumX = 0, sumY = 0;
        geometry.forEach(node => {
            const pixelCoords = this.geoToPixel(node.lat, node.lon, bounds, width, height);
            sumX += pixelCoords.x;
            sumY += pixelCoords.y;
        });
        return {
            x: sumX / geometry.length,
            y: sumY / geometry.length
        };
    }

    calculateMapBounds(mapData) {
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;
        
        [...mapData.streets, ...mapData.buildings, ...mapData.parks].forEach(element => {
            if (element.geometry) {
                element.geometry.forEach(node => {
                    minLat = Math.min(minLat, node.lat);
                    maxLat = Math.max(maxLat, node.lat);
                    minLon = Math.min(minLon, node.lon);
                    maxLon = Math.max(maxLon, node.lon);
                });
            }
        });
        
        return { minLat, maxLat, minLon, maxLon };
    }

    calculateBounds(streetData) {
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;
        
        streetData.forEach(way => {
            if (way.geometry) {
                way.geometry.forEach(node => {
                    minLat = Math.min(minLat, node.lat);
                    maxLat = Math.max(maxLat, node.lat);
                    minLon = Math.min(minLon, node.lon);
                    maxLon = Math.max(maxLon, node.lon);
                });
            }
        });
        
        return { minLat, maxLat, minLon, maxLon };
    }

    geoToPixel(lat, lon, bounds, width, height) {
        const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
        const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
        return { x, y };
    }

    addRandomBuildings8Bit(ctx, width, height, streetData, bounds) {
        // Add simple building blocks in 8-bit style
        ctx.fillStyle = '#404040';
        
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * (width - 20) + 10;
            const y = Math.random() * (height - 20) + 10;
            const size = 12 + Math.random() * 8;
            
            ctx.fillRect(x, y, size, size);
            
            // Add windows
            ctx.fillStyle = '#ffd700';
            if (Math.random() > 0.5) {
                ctx.fillRect(x + 2, y + 2, 2, 2);
                ctx.fillRect(x + size - 4, y + 2, 2, 2);
            }
            ctx.fillStyle = '#404040';
        }
    }

    drawGenericStreets8Bit(ctx, width, height) {
        // Fallback generic pattern (your original code)
        ctx.fillStyle = '#505050';
        
        // Main horizontal streets
        for (let y = 40; y < height; y += 80) {
            ctx.fillRect(0, y - 8, width, 16);
        }
        
        // Main vertical streets  
        for (let x = 60; x < width; x += 100) {
            ctx.fillRect(x - 8, 0, 16, height);
        }
        
        // Add yellow center lines
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        
        for (let y = 40; y < height; y += 80) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        for (let x = 60; x < width; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        
        // Add buildings
        this.addRandomBuildings8Bit(ctx, width, height, null, null);
        
        // Add tourist-style landmarks
        const landmarks = [
            { x: width/2, y: height/2, icon: '🏰', name: 'Palace', color: '#FFD700' },
            { x: width/4, y: height/3, icon: '⛪', name: 'Church', color: '#8B4513' },
            { x: 3*width/4, y: 2*height/3, icon: '🏛️', name: 'Museum', color: '#4169E1' }
        ];
        
        landmarks.forEach(landmark => {
            // Draw building background
            ctx.fillStyle = landmark.color;
            ctx.fillRect(landmark.x - 12, landmark.y - 12, 24, 24);
            
            // Draw border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(landmark.x - 12, landmark.y - 12, 24, 24);
            
            // Draw icon
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(landmark.icon, landmark.x, landmark.y + 4);
            
            // Draw name
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 8px monospace';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeText(landmark.name, landmark.x, landmark.y + 25);
            ctx.fillText(landmark.name, landmark.x, landmark.y + 25);
        });
        
        // Add street names
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeText('MAIN STREET', width/2, 30);
        ctx.fillText('MAIN STREET', width/2, 30);
        
        // Add compass
        this.drawMapLegend8Bit(ctx, width, height);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BruchsalQuest();
    
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