// script.js

// --- Elementos do DOM ---
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const playMusicBtn = document.getElementById('play-music-btn');
const pauseMusicBtn = document.getElementById('pause-music-btn');


// Elementos da Modal de Alerta
const alertModal = document.getElementById('alert-modal');
const modalMessage = document.getElementById('modal-message');
const modalOkBtn = document.getElementById('modal-ok-btn');

// --- Constantes do Pomodoro ---
const WORK_TIME = 25 * 60; // 25 minutos em segundos
const SHORT_BREAK_TIME = 5 * 60; // 5 minutos em segundos
const LONG_BREAK_TIME = 25 * 60; // 25 minutos em segundos
const LOFI_PLAYLIST_ID = 'PLOzDu-MXXLlj7croDcwz33c-a5rpNEBNe'; // ID de uma playlist Lofi no YouTube

// --- Variáveis de Estado do Timer ---
let timerInterval; // Armazena o ID do setInterval para poder limpá-lo
let timeLeft = WORK_TIME; // Tempo restante no timer, inicializa com o tempo de trabalho
let isWorkSession = true; // Indica se a sessão atual é de trabalho (true) ou de pausa (false)
let pauseCount = 0; // Contador de pausas curtas para determinar a pausa longa (0 a 3)

// --- Variáveis de Áudio e Música ---
let player; // Objeto do player do YouTube
let alarmSound; // Objeto Audio para o som do alarme

// --- Funções de Utilidade ---

/**
 * Formata o tempo em segundos para o formato MM:SS.
 * @param {number} seconds - O número total de segundos.
 * @returns {string} O tempo formatado (ex: "25:00").
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Exibe a modal de alerta com uma mensagem específica.
 * @param {string} message - A mensagem a ser exibida na modal.
 */
function showAlertModal(message) {
    modalMessage.textContent = message;
    alertModal.style.display = 'flex'; // Usa flex para centralizar
}

/**
 * Esconde a modal de alerta.
 */
function hideAlertModal() {
    alertModal.style.display = 'none';
}

// --- Lógica do Timer ---

/**
 * Inicia ou retoma o timer.
 * Limpa qualquer timer anterior para evitar múltiplos intervalos.
 */
function startTimer() {
    clearInterval(timerInterval); // Garante que apenas um timer esteja ativo por vez
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerInterval); // Para o timer quando o tempo acaba
            handleTimerEnd(); // Lida com o fim da sessão/pausa
        }
    }, 1000); // Atualiza a cada 1 segundo (1000ms)

    // Inicia a música quando o timer é iniciado
    if (player) {
        player.playVideo();
    }
}

/**
 * Pausa o timer.
 * Limpa o intervalo do timer.
 */
function pauseTimer() {
    clearInterval(timerInterval);
    // Pausa a música quando o timer é pausado
    if (player) {
        player.pauseVideo();
    }
}

/**
 * Reinicia o timer para uma nova sessão de trabalho.
 * Pausa o timer, redefine o tempo, o estado da sessão e o contador de pausas.
 */
function resetTimer() {
    pauseTimer(); // Pausa qualquer timer ativo
    timeLeft = WORK_TIME; // Redefine para o tempo de trabalho inicial
    isWorkSession = true; // Define como sessão de trabalho
    pauseCount = 0; // Reinicia o contador de pausas
    timerDisplay.textContent = formatTime(timeLeft); // Atualiza o display
    // Pausa a música ao reiniciar
    if (player) {
        player.pauseVideo();
    }
    hideAlertModal(); // Garante que a modal esteja escondida
}

/**
 * Lida com o fim de uma sessão de trabalho ou de uma pausa.
 * Toca o alarme, exibe a modal e prepara o próximo ciclo.
 */
function handleTimerEnd() {
    playAlarm(); // Toca o som do alarme
    if (player) {
        player.pauseVideo(); // Pausa a música para o alarme ser audível
    }

    if (isWorkSession) {
        // Fim da sessão de trabalho
        if (pauseCount < 3) {
            showAlertModal('Sessão de estudo terminada! Inicie uma pausa curta de 5 minutos.');
            timeLeft = SHORT_BREAK_TIME;
            pauseCount++;
        } else {
            showAlertModal('Sessão de estudo terminada! Inicie uma pausa longa de 25 minutos.');
            timeLeft = LONG_BREAK_TIME;
            pauseCount = 0; // Reinicia o ciclo de pausas após a pausa longa
        }
        isWorkSession = false; // Muda para estado de pausa
    } else {
        // Fim da pausa
        showAlertModal('Descanso terminado! Clique em Iniciar para começar a próxima sessão de estudo.');
        timeLeft = WORK_TIME; // Redefine para o tempo de trabalho
        isWorkSession = true; // Muda para estado de trabalho
    }
    timerDisplay.textContent = formatTime(timeLeft); // Atualiza o display com o novo tempo
}

// --- Lógica do Alarme ---

/**
 * Toca o som do alarme.
 * Tenta reproduzir o áudio e captura erros de reprodução.
 */
function playAlarm() {
    // URL de um som de alarme de exemplo (pode ser substituído por um arquivo local)
    alarmSound = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    alarmSound.loop = true; // Faz o alarme tocar em loop

    alarmSound.play().catch(error => {
        console.error("Erro ao reproduzir o alarme:", error);
        // Feedback ao usuário se o alarme não puder ser reproduzido (ex: autoplay bloqueado)
        showAlertModal("Erro ao reproduzir o alarme. Por favor, verifique as permissões de áudio.");
    });
}

/**
 * Para o som do alarme e o reinicia para o início.
 */
function stopAlarm() {
    if (alarmSound) {
        alarmSound.pause();
        alarmSound.currentTime = 0; // Volta o áudio para o início
    }
}

// --- Integração com a API do YouTube ---

/**
 * Função chamada automaticamente quando a API do YouTube IFrame está pronta.
 * Inicializa o player do YouTube.
 */
function onYouTubeIframeAPIReady() {
    // Gera um índice aleatório para iniciar a música em um ponto diferente da playlist
    // O número 43 é um exemplo, ajuste conforme o número de músicas na playlist real.
    const randomIndex = Math.floor(Math.random() * 43); 

    player = new YT.Player('player', {
        height: '0', // Altura 0 para esconder o player
        width: '0',  // Largura 0 para esconder o player
        playerVars: {
            'listType': 'playlist', // Indica que é uma playlist
            'list': LOFI_PLAYLIST_ID, // ID da playlist Lofi
            'autoplay': 0, // Não iniciar automaticamente
            'controls': 0, // Esconder os controles do player
            'index': randomIndex // Iniciar em uma música aleatória da playlist
        },
        events: {
            'onReady': onPlayerReady // Chama onPlayerReady quando o player estiver pronto
        }
    });
}

/**
 * Função chamada quando o player do YouTube está pronto para uso.
 * Pode ser usada para depuração ou para realizar ações iniciais no player.
 * @param {Object} event - O objeto de evento do player.
 */
function onPlayerReady(event) {
    console.log('YouTube Player is ready!');
    // Exemplo: event.target.setVolume(50); // Definir volume inicial
}

// --- Event Listeners dos Botões ---

startBtn.addEventListener('click', () => {
    startTimer();
    hideAlertModal(); // Esconde a modal se estiver visível ao iniciar
});

pauseBtn.addEventListener('click', () => {
    pauseTimer();
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

// Event listener para o botão "OK" da modal
modalOkBtn.addEventListener('click', () => {
    stopAlarm(); // Para o alarme quando o usuário clica em OK
    hideAlertModal(); // Esconde a modal
});

// Inicializa o display do timer ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    timerDisplay.textContent = formatTime(WORK_TIME);
});
