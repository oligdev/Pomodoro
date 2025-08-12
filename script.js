// script.js
// Obtém os elementos do DOM
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const playMusicBtn = document.getElementById('play-music-btn');
const pauseMusicBtn = document.getElementById('pause-music-btn');
// Constantes do Pomodoro
const WORK_TIME = 25 * 60; 
const SHORT_BREAK_TIME = 5 * 60; 
const LONG_BREAK_TIME = 25 * 60; 
let timerInterval;
let timeLeft = WORK_TIME;
let player;
let isWorkSession = true; 
let alarmSound; 
let pauseCount = 0; 
const LOFI_PLAYLIST_ID = 'PLOzDu-MXXLlj7croDcwz33c-a5rpNEBNe'; 
// Formata o tempo em minutos e segundos
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Lógica do timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playAlarm();
            if (player) {
                player.pauseVideo();
            }

            if (isWorkSession) {
                // Fim da sessão de trabalho, inicia pausa
                if (pauseCount < 3) {
                    alert('Sessão de estudo terminada! Inicie uma pausa curta de 5 minutos.');
                    stopAlarm();
                    timeLeft = SHORT_BREAK_TIME;
                    pauseCount++;
                } else {
                    alert('Sessão de estudo terminada! Inicie uma pausa longa de 25 minutos.');
                    stopAlarm();
                    timeLeft = LONG_BREAK_TIME;
                    pauseCount = 0; // Reinicia o ciclo
                }
                isWorkSession = false;
                timerDisplay.textContent = formatTime(timeLeft);
            } else {
                // Fim da pausa, volta para o estudo
                alert('Descanso terminado! Clique em Iniciar para começar a próxima sessão de estudo.');
                stopAlarm();
                timeLeft = WORK_TIME;
                isWorkSession = true;
                timerDisplay.textContent = formatTime(timeLeft);
            }
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    timeLeft = WORK_TIME;
    isWorkSession = true;
    timerDisplay.textContent = formatTime(timeLeft);
    if (player) {
        player.pauseVideo();
    }
}

// Lógica do alarme
function playAlarm() {
    alarmSound = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    alarmSound.loop = true;
    alarmSound.play().catch(error => console.error("Erro ao reproduzir o alarme:", error));
}

function stopAlarm() {
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }
}

// Integração com a API do YouTube
function onYouTubeIframeAPIReady() {
    // Número aleatório para o índice da música (0 a 49, ajuste conforme o tamanho da playlist)
    const randomIndex = Math.floor(Math.random() * 43);

    player = new YT.Player('player', {
        height: '0',
        width: '0',
        playerVars: {
            'listType': 'playlist',
            'list': LOFI_PLAYLIST_ID,
            'autoplay': 0,
            'controls': 0,
            'index': randomIndex // Inicia em música aleatória
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube Player is ready!');
}

// Eventos dos botões
startBtn.addEventListener('click', () => {
    startTimer();
    if (player) {
        player.playVideo();
    }
});

pauseBtn.addEventListener('click', () => {
    pauseTimer();
    if (player) {
        player.pauseVideo();
    }
});

resetBtn.addEventListener('click', resetTimer);

playMusicBtn.addEventListener('click', () => {
    if (player) {
        player.playVideo();
    }
});

pauseMusicBtn.addEventListener('click', () => {
    if (player) {
        player.pauseVideo();
    }
});