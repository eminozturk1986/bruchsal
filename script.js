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
        this.googleMap = document.getElementById('google-map');
        
        // Google Maps
        this.map = null;
        this.playerMarker = null;
        this.targetMarker = null;

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

        // Update Google Maps markers
        this.updateGoogleMapMarkers();

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
        this.initGoogleMap();
    }

    initGoogleMap() {
        // Default location (Bruchsal)
        const bruchsal = { lat: 49.1244, lng: 8.5985 };
        
        this.map = new google.maps.Map(this.googleMap, {
            zoom: 16,
            center: bruchsal,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            styles: [
                {
                    "featureType": "all",
                    "elementType": "all",
                    "stylers": [{"saturation": -20}]
                }
            ]
        });

        // Center on user location if available
        if (this.userLocation) {
            const userPos = { lat: this.userLocation.lat, lng: this.userLocation.lng };
            this.map.setCenter(userPos);
        }
    }


    updateGPSMap() {
        this.updateGoogleMapMarkers();
    }

    updateGoogleMapMarkers() {
        if (!this.map) return;

        // Update user location marker
        if (this.userLocation) {
            const userPos = { lat: this.userLocation.lat, lng: this.userLocation.lng };
            
            if (this.playerMarker) {
                this.playerMarker.setPosition(userPos);
            } else {
                this.playerMarker = new google.maps.Marker({
                    position: userPos,
                    map: this.map,
                    title: 'Your Location',
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="10" cy="10" r="8" fill="#3498db" stroke="#ffffff" stroke-width="2"/>
                                <circle cx="10" cy="10" r="4" fill="#87ceeb"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(20, 20),
                        anchor: new google.maps.Point(10, 10)
                    }
                });
            }
            
            // Center map on player
            this.map.setCenter(userPos);
        }

        // Update target location marker
        if (this.targetLocation) {
            const targetPos = { lat: this.targetLocation.lat, lng: this.targetLocation.lng };
            
            if (this.targetMarker) {
                this.targetMarker.setPosition(targetPos);
            } else {
                this.targetMarker = new google.maps.Marker({
                    position: targetPos,
                    map: this.map,
                    title: 'Target Location',
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#ffffff" stroke-width="2"/>
                                <circle cx="12" cy="12" r="6" fill="#ff6b6b"/>
                                <text x="12" y="16" text-anchor="middle" fill="white" font-size="8" font-family="monospace">🎯</text>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(24, 24),
                        anchor: new google.maps.Point(12, 12)
                    }
                });
            }
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






















}

// Global variable for the game instance
let gameInstance = null;

// Global initMap function for Google Maps API
function initMap() {
    if (gameInstance && gameInstance.map === null) {
        gameInstance.initGoogleMap();
    }
}

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