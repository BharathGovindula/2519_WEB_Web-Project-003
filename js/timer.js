export class CookingTimer {
    constructor() {
      this.timerModal = document.getElementById("timerModal");
      this.timerDisplay = document.getElementById("timerDisplay");
      this.timerMinutesInput = document.getElementById("timerMinutes");
      this.timerSecondsInput = document.getElementById("timerSeconds");
      this.startBtn = document.getElementById("startTimer");
      this.pauseBtn = document.getElementById("pauseTimer");
      this.resetBtn = document.getElementById("resetTimer");
      this.progressBar = document.getElementById("progress");
      
      this.timerInterval = null;
      this.totalSeconds = 0;
      this.remainingSeconds = 0;
      this.isRunning = false;
      this.isPaused = false;
      
      this.initEventListeners();
    }
    
    initEventListeners() {
      // Open timer modal when clicking any timer button
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('open-timer-btn')) {
          this.openTimerModal();
        }
      });
      
      // Timer controls
      this.startBtn.addEventListener('click', () => this.startTimer());
      this.pauseBtn.addEventListener('click', () => this.pauseTimer());
      this.resetBtn.addEventListener('click', () => this.resetTimer());
      
      // Close modal
      document.getElementById('closeTimerModal')?.addEventListener('click', () => {
        this.closeTimerModal();
      });
      
      // Allow only numbers in time inputs
      this.timerMinutesInput?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      });
      
      this.timerSecondsInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value > 59) value = 59;
        e.target.value = value;
      });
    }
    
    openTimerModal() {
      this.timerModal.style.display = "block";
      this.resetTimer();
    }
    
    closeTimerModal() {
      this.timerModal.style.display = "none";
      clearInterval(this.timerInterval);
      this.isRunning = false;
      this.isPaused = false;
      this.updateButtonStates();
    }
    
    startTimer() {
      if (this.isRunning) return;
      
      const minutes = parseInt(this.timerMinutesInput.value) || 0;
      const seconds = parseInt(this.timerSecondsInput.value) || 0;
      this.totalSeconds = minutes * 60 + seconds;
      
      if (this.totalSeconds <= 0) return;
      
      if (this.isPaused) {
        // Resume from paused state
        this.isPaused = false;
      } else {
        // Start fresh timer
        this.remainingSeconds = this.totalSeconds;
      }
      
      this.isRunning = true;
      this.updateButtonStates();
      
      this.timerInterval = setInterval(() => {
        if (this.remainingSeconds <= 0) {
          this.timerComplete();
          return;
        }
        
        this.remainingSeconds--;
        this.updateDisplay();
        
        // Update progress bar
        const progressPercentage = (this.remainingSeconds / this.totalSeconds) * 100;
        this.progressBar.style.width = `${progressPercentage}%`;
      }, 1000);
    }
    
    pauseTimer() {
      if (!this.isRunning) return;
      
      clearInterval(this.timerInterval);
      this.isRunning = false;
      this.isPaused = true;
      this.updateButtonStates();
    }
    
    resetTimer() {
      clearInterval(this.timerInterval);
      this.isRunning = false;
      this.isPaused = false;
      this.timerMinutesInput.value = 0;
      this.timerSecondsInput.value = 0;
      this.remainingSeconds = 0;
      this.updateDisplay();
      this.progressBar.style.width = '0%';
      this.updateButtonStates();
    }
    
    timerComplete() {
      clearInterval(this.timerInterval);
      this.timerDisplay.textContent = "00:00";
      this.progressBar.style.width = '0%';
      this.isRunning = false;
      this.updateButtonStates();
      
      // Play sound and show alert
      this.playTimerSound();
      alert("⏰ Time's up!");
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        this.closeTimerModal();
      }, 3000);
    }
    
    updateDisplay() {
      this.timerDisplay.textContent = this.formatTime(this.remainingSeconds);
    }
    
    formatTime(seconds) {
      const m = String(Math.floor(seconds / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      return `${m}:${s}`;
    }
    
    updateButtonStates() {
      this.startBtn.disabled = this.isRunning;
      this.pauseBtn.disabled = !this.isRunning;
      this.resetBtn.disabled = !this.isRunning && !this.isPaused;
    }
    
    playTimerSound() {
      const audio = new Audio('assets/timer-alarm.mp3');
      audio.play().catch(e => console.log('Audio playback failed:', e));
    }
  }
  
  // Initialize timer when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('timerModal')) {
      new CookingTimer();
    }
  });