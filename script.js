document.addEventListener('DOMContentLoaded', () => {
            // DOM Elements
            const timeDisplay = document.getElementById('time');
            const startBtn = document.getElementById('startBtn');
            const pauseBtn = document.getElementById('pauseBtn');
            const resetBtn = document.getElementById('resetBtn');
            const statusDisplay = document.getElementById('status');
            const progressBar = document.getElementById('progress');
            const pomoCountDisplay = document.getElementById('pomoCount');
            
            // Settings elements
            const pomoDurationInput = document.getElementById('pomoDuration');
            const shortBreakInput = document.getElementById('shortBreak');
            const longBreakInput = document.getElementById('longBreak');
            const pomosBeforeLongInput = document.getElementById('pomosBeforeLong');
            const autoStartCheckbox = document.getElementById('autoStart');
            
            // Timer variables
            let timer;
            let timeLeft = 25 * 60; // 25 minutes in seconds
            let isRunning = false;
            let isPaused = false;
            let currentMode = 'pomo'; // 'pomo', 'shortBreak', 'longBreak'
            let pomodorosCompleted = 0;
            let totalSeconds = 25 * 60;
            let startTime;
            
            // Initialize the timer
            function initTimer() {
                updateTimeDisplay();
                createPomoDots();
            }
            
            // Update the time display
            function updateTimeDisplay() {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Update progress bar
                const progressPercentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;
                progressBar.style.width = `${progressPercentage}%`;
            }
            
            // Create pomodoro count dots
            function createPomoDots() {
                pomoCountDisplay.innerHTML = '';
                const totalPomos = parseInt(pomosBeforeLongInput.value);
                
                for (let i = 0; i < totalPomos; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'pomo-dot';
                    if (i < pomodorosCompleted) {
                        dot.classList.add('completed');
                    }
                    pomoCountDisplay.appendChild(dot);
                }
            }
            
            // Start the timer
            function startTimer() {
                if (isRunning && !isPaused) return;
                
                if (!isRunning) {
                    totalSeconds = timeLeft;
                    startTime = Date.now();
                }
                
                isRunning = true;
                isPaused = false;
                startBtn.textContent = 'Resume';
                statusDisplay.textContent = currentMode === 'pomo' ? 'Focus Time' : 
                                          currentMode === 'shortBreak' ? 'Short Break' : 'Long Break';
                
                if (currentMode === 'pomo') {
                    document.body.style.backgroundImage = 
                        `radial-gradient(circle at 20% 30%, ${getComputedStyle(document.documentElement).getPropertyValue('--secondary')} 0%, transparent 20%),
                         radial-gradient(circle at 80% 70%, ${getComputedStyle(document.documentElement).getPropertyValue('--primary')} 0%, transparent 20%),
                         radial-gradient(circle at 50% 90%, ${getComputedStyle(document.documentElement).getPropertyValue('--accent')} 0%, transparent 30%)`;
                } else {
                    document.body.style.backgroundImage = 
                        `radial-gradient(circle at 30% 20%, ${getComputedStyle(document.documentElement).getPropertyValue('--secondary')} 0%, transparent 20%),
                         radial-gradient(circle at 70% 80%, ${getComputedStyle(document.documentElement).getPropertyValue('--primary')} 0%, transparent 20%),
                         radial-gradient(circle at 90% 50%, ${getComputedStyle(document.documentElement).getPropertyValue('--accent')} 0%, transparent 30%)`;
                }
                
                timer = setInterval(() => {
                    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                    timeLeft = totalSeconds - elapsedSeconds;
                    
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        timeLeft = 0;
                        timerComplete();
                    }
                    
                    updateTimeDisplay();
                }, 1000);
            }
            
            // Pause the timer
            function pauseTimer() {
                if (!isRunning) return;
                
                clearInterval(timer);
                isRunning = false;
                isPaused = true;
                statusDisplay.textContent = 'Paused';
            }
            
            // Reset the timer
            function resetTimer() {
                clearInterval(timer);
                isRunning = false;
                isPaused = false;
                startBtn.textContent = 'Start';
                
                switch (currentMode) {
                    case 'pomo':
                        timeLeft = parseInt(pomoDurationInput.value) * 60;
                        statusDisplay.textContent = 'Ready to Focus';
                        break;
                    case 'shortBreak':
                        timeLeft = parseInt(shortBreakInput.value) * 60;
                        statusDisplay.textContent = 'Ready for Short Break';
                        break;
                    case 'longBreak':
                        timeLeft = parseInt(longBreakInput.value) * 60;
                        statusDisplay.textContent = 'Ready for Long Break';
                        break;
                }
                
                totalSeconds = timeLeft;
                updateTimeDisplay();
                progressBar.style.width = '0%';
                
                // Reset background
                document.body.style.backgroundImage = 
                    `radial-gradient(circle at 20% 30%, ${getComputedStyle(document.documentElement).getPropertyValue('--secondary')} 0%, transparent 20%),
                     radial-gradient(circle at 80% 70%, ${getComputedStyle(document.documentElement).getPropertyValue('--primary')} 0%, transparent 20%),
                     radial-gradient(circle at 50% 90%, ${getComputedStyle(document.documentElement).getPropertyValue('--accent')} 0%, transparent 30%)`;
            }
            
            // When timer completes
            function timerComplete() {
                // Play sound
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
                audio.play();
                
                if (currentMode === 'pomo') {
                    pomodorosCompleted++;
                    createPomoDots();
                    
                    // Check if it's time for a long break
                    if (pomodorosCompleted % parseInt(pomosBeforeLongInput.value) === 0) {
                        currentMode = 'longBreak';
                        timeLeft = parseInt(longBreakInput.value) * 60;
                    } else {
                        currentMode = 'shortBreak';
                        timeLeft = parseInt(shortBreakInput.value) * 60;
                    }
                    
                    statusDisplay.textContent = 'Break Time!';
                } else {
                    currentMode = 'pomo';
                    timeLeft = parseInt(pomoDurationInput.value) * 60;
                    statusDisplay.textContent = 'Ready to Focus';
                }
                
                totalSeconds = timeLeft;
                updateTimeDisplay();
                progressBar.style.width = '0%';
                
                // Auto-start next timer if enabled
                if (autoStartCheckbox.checked) {
                    startTimer();
                } else {
                    isRunning = false;
                    startBtn.textContent = 'Start';
                }
            }
            
            // Event listeners
            startBtn.addEventListener('click', startTimer);
            pauseBtn.addEventListener('click', pauseTimer);
            resetBtn.addEventListener('click', resetTimer);
            
            // Settings change listeners
            pomoDurationInput.addEventListener('change', () => {
                if (currentMode === 'pomo' && !isRunning) {
                    timeLeft = parseInt(pomoDurationInput.value) * 60;
                    totalSeconds = timeLeft;
                    updateTimeDisplay();
                }
            });
            
            shortBreakInput.addEventListener('change', () => {
                if (currentMode === 'shortBreak' && !isRunning) {
                    timeLeft = parseInt(shortBreakInput.value) * 60;
                    totalSeconds = timeLeft;
                    updateTimeDisplay();
                }
            });
            
            longBreakInput.addEventListener('change', () => {
                if (currentMode === 'longBreak' && !isRunning) {
                    timeLeft = parseInt(longBreakInput.value) * 60;
                    totalSeconds = timeLeft;
                    updateTimeDisplay();
                }
            });
            
            pomosBeforeLongInput.addEventListener('change', createPomoDots);
            
            // Initialize
            initTimer();
        });