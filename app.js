document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const screenMenu = document.getElementById('screen-menu');
    const screenGame = document.getElementById('screen-game');
    const screenGameOver = document.getElementById('screen-game-over');

    // UI Elements
    const btnStart = document.getElementById('btn-start');
    const btnRestart = document.getElementById('btn-restart');
    const btnMenu = document.getElementById('btn-menu');
    const problemEl = document.getElementById('problem');
    const optionsEls = document.querySelectorAll('.option');
    const currentScoreEl = document.getElementById('current-score');
    const highScoreEl = document.getElementById('high-score-display');
    const finalScoreEl = document.getElementById('final-score-display');
    const timerBar = document.getElementById('timer-bar');

    // Game State
    let score = 0;
    let highScore = localStorage.getItem('mathDashHighScore') || 0;
    highScoreEl.textContent = highScore;
    
    let currentAnswer = 0;
    let timerId = null;
    let timeRemaining = 3000; // 3 seconds in ms
    let lastTime = 0;
    let isGameOver = false;
    let acceptingInput = false;

    // Initialization
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    btnStart.addEventListener('click', startGame);
    btnRestart.addEventListener('click', startGame);
    btnMenu.addEventListener('click', () => showScreen(screenMenu));

    optionsEls.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (!acceptingInput || isGameOver) return;
            checkAnswer(parseInt(e.target.textContent), e.target);
        });
    });

    function startGame() {
        score = 0;
        currentScoreEl.textContent = score;
        isGameOver = false;
        showScreen(screenGame);
        nextTurn();
    }

    function generateProblem() {
        const operations = ['+', '-', '*', '/'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;

        if (op === '+') {
            num1 = Math.floor(Math.random() * 11);
            num2 = Math.floor(Math.random() * 11);
            answer = num1 + num2;
        } else if (op === '-') {
            num1 = Math.floor(Math.random() * 11);
            num2 = Math.floor(Math.random() * 11);
            // Ensure no negative results to keep it simple
            if (num2 > num1) [num1, num2] = [num2, num1];
            answer = num1 - num2;
        } else if (op === '*') {
            num1 = Math.floor(Math.random() * 11);
            num2 = Math.floor(Math.random() * 11);
            answer = num1 * num2;
        } else if (op === '/') {
            // Avoid division by zero and decimals
            num2 = Math.floor(Math.random() * 10) + 1; // 1 to 10
            answer = Math.floor(Math.random() * 11); // 0 to 10
            num1 = num2 * answer;
        }

        currentAnswer = answer;
        let displayOp = op;
        if (op === '*') displayOp = '×';
        if (op === '/') displayOp = '÷';
        
        problemEl.textContent = `${num1} ${displayOp} ${num2}`;

        // Generate options
        let options = [answer];
        while (options.length < 3) {
            // Generate plausible wrong answers
            let offset = Math.floor(Math.random() * 5) + 1;
            let wrongAnswer = Math.random() > 0.5 ? answer + offset : answer - offset;
            if (wrongAnswer < 0 && op !== '-') wrongAnswer = Math.abs(wrongAnswer);
            
            if (!options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }

        // Shuffle options
        options.sort(() => Math.random() - 0.5);

        optionsEls.forEach((el, index) => {
            el.textContent = options[index];
            el.className = 'btn option'; // reset classes
        });
    }

    function startTimer() {
        cancelAnimationFrame(timerId);
        timeRemaining = 3000; // Reset to 3s
        lastTime = performance.now();
        
        function updateTimer(currentTime) {
            if (isGameOver) return;
            
            const dt = currentTime - lastTime;
            lastTime = currentTime;
            timeRemaining -= dt;

            const percentage = Math.max(0, (timeRemaining / 3000) * 100);
            timerBar.style.transform = `scaleX(${percentage / 100})`;

            // Change color based on time
            if (percentage > 50) {
                timerBar.style.backgroundColor = 'var(--timer-color)';
            } else if (percentage > 25) {
                timerBar.style.backgroundColor = '#eab308'; // yellow
            } else {
                timerBar.style.backgroundColor = 'var(--wrong-color)';
            }

            if (timeRemaining <= 0) {
                endGame(true); // timeout
            } else {
                timerId = requestAnimationFrame(updateTimer);
            }
        }

        timerId = requestAnimationFrame(updateTimer);
    }

    function checkAnswer(selectedAnswer, element) {
        acceptingInput = false;
        
        if (selectedAnswer === currentAnswer) {
            // Correct
            element.classList.add('correct');
            score++;
            currentScoreEl.textContent = score;
            
            // Brief pause to show correct color
            setTimeout(() => {
                if (!isGameOver) nextTurn();
            }, 300);
        } else {
            // Wrong
            element.classList.add('wrong');
            // Find correct element to highlight it
            optionsEls.forEach(el => {
                if (parseInt(el.textContent) === currentAnswer) {
                    el.classList.add('correct');
                }
            });
            setTimeout(() => {
                endGame(false);
            }, 500);
        }
    }

    function nextTurn() {
        generateProblem();
        acceptingInput = true;
        startTimer();
    }

    function endGame(timeout) {
        isGameOver = true;
        cancelAnimationFrame(timerId);
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('mathDashHighScore', highScore);
            highScoreEl.textContent = highScore;
        }

        finalScoreEl.textContent = score;
        
        if (timeout) {
            document.querySelector('.game-over-title').textContent = "Time's Up!";
        } else {
            document.querySelector('.game-over-title').textContent = "Game Over!";
        }

        showScreen(screenGameOver);
    }
});
