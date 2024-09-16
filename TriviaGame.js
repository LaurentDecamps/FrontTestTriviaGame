class TriviaGame {
    constructor() {
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.timeLeft = 150; // 30 seconds per question, 5 questions
        this.isAnswered = false;
        this.correctAnswers = 0;
    }

    async fetchQuestions() {
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=5&difficulty=medium&type=multiple');
            const data = await response.json();
            this.questions = data.results;
            return this.questions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    checkAnswer(selectedAnswer) {
        if (this.isAnswered) return false;
        this.isAnswered = true;
        const question = this.getCurrentQuestion();
        const isCorrect = selectedAnswer === question.correct_answer;
        if (isCorrect) this.correctAnswers++;
        return isCorrect;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.isAnswered = false;
        return this.currentQuestionIndex < this.questions.length;
    }

    decrementTimer() {
        this.timeLeft--;
        return this.timeLeft;
    }

    isGameOver() {
        return this.timeLeft <= 0 || this.currentQuestionIndex >= this.questions.length;
    }

    getFinalScore() {
        return `You got ${this.correctAnswers} out of ${this.questions.length} questions correct!`;
    }
}

const game = new TriviaGame();
let timer;

// DOM elements
const questionNumberEl = document.getElementById('question-number');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const timerEl = document.getElementById('timer');
const resultEl = document.getElementById('result');
const finalScoreEl = document.getElementById('final-score');
const gameOverEl = document.getElementById('game-over');

async function startGame() {
    await game.fetchQuestions();
    displayQuestion();
    startTimer();
}

function displayQuestion() {
    const question = game.getCurrentQuestion();
    questionNumberEl.textContent = `Question ${game.currentQuestionIndex + 1} of ${game.questions.length}`;
    questionEl.innerHTML = decodeHTML(question.question);
    
    const answers = [...question.incorrect_answers, question.correct_answer];
    shuffleArray(answers);
    
    answersEl.innerHTML = '';
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = decodeHTML(answer);
        button.addEventListener('click', () => handleAnswer(answer));
        answersEl.appendChild(button);
    });

    nextBtn.style.display = 'none';
    resultEl.textContent = '';
}

function handleAnswer(selectedAnswer) {
    const isCorrect = game.checkAnswer(selectedAnswer);
    
    resultEl.textContent = isCorrect ? 'Correct!' : 'Wrong!';
    resultEl.style.color = isCorrect ? 'green' : 'red';
    
    Array.from(answersEl.children).forEach(button => {
        button.disabled = true;
        if (button.innerHTML === decodeHTML(game.getCurrentQuestion().correct_answer)) {
            button.style.backgroundColor = 'green';
        } else if (button.innerHTML === decodeHTML(selectedAnswer) && !isCorrect) {
            button.style.backgroundColor = 'red';
        }
    });

    if (game.currentQuestionIndex < game.questions.length - 1) {
        nextBtn.style.display = 'block';
    } else {
        endGame();
    }
}

function startTimer() {
    updateTimerDisplay();
    timer = setInterval(() => {
        game.decrementTimer();
        updateTimerDisplay();
        if (game.isGameOver()) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timerEl.textContent = `Time left: ${game.timeLeft}`;
}

function endGame() {
    clearInterval(timer);
    questionNumberEl.style.display = 'none';
    questionEl.style.display = 'none';
    answersEl.innerHTML = '';
    nextBtn.style.display = 'none';
    timerEl.style.display = 'none';
    resultEl.style.display = 'none';
    gameOverEl.textContent = 'Game Over!';
    finalScoreEl.textContent = game.getFinalScore();
}

// Utility functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Event listeners
nextBtn.addEventListener('click', () => {
    game.nextQuestion();
    displayQuestion();
});

// Start the game
startGame();