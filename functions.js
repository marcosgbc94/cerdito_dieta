/* FUNCIONES */

let GAME_ERROR;
let GAME_PLAY;
let gameContainer;
let floor;
let character;
let block;
let gameContainerHeight;
let blockHeight;
let blockWidth;
let characterHeight;
let characterWidth;
let soundLevel;
let player = Array();
let config = Array();
let blockList = Array();
let blockGeneratorTimer;
let trigerBlock;
let blockDestroyerTimer;
let characterJumpMinimun;
let floorElements;
let statistics;

window.addEventListener('load', () => {
    // INICIALIZACION DE VARIABLES GLOBALES
    GAME_ERROR = false;
    GAME_PLAY = false;
    player['name'] = null;
    player['points'] = 0;
    config['character'] = [['Cerdito', 'pig'], ['Elefantito', 'elephant']];
    config['background'] = [['Nubes', 'clouds']];
    config['floor'] = [['Piedra', 'stone'], ['Metal', 'metal']];
    blockList = [
        ['tomato', 1],
        ['cabbage', 1],
        ['pumpkin', 1],
        ['broccoli', 1],
        ['pizza', 2],
        ['donuts', 2],
        ['urchin', 3],
        ['cactus', 3]
    ];

    // OBTENCION DEL DOM
    gameContainer = document.querySelector('#game-container');
    floor = document.querySelector('#floor');
    character = document.querySelector('#character');
    blockContainer = document.querySelector('#block-container');
    statistics = document.querySelector('#statistics');
    gameContainerHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--game-container-h'));
    blockHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--block-h'));
    blockWidth = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--block-w'));
    characterHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--character-h'));
    characterWidth = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--character-w'));
    floorElements = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--floor-elements'));
    characterJumpMinimun = gameContainerHeight - blockHeight - floorElements;

    // VALIDACIONES
    if (!gameContainer || gameContainer === undefined || gameContainer === null)
        setError('Hubo un error en el juego', 'Contenedor de juego (#game-container) no disponble');
    if (!floor || floor === undefined || floor === null)
        setError('Hubo un error en el juego', 'Suelo de juego (#floor) no disponble');
    if (!character || character === undefined || character === null)
        setError('Hubo un error en el juego', 'Perosnaje de juego (#character) no disponble');
    if (!blockContainer || blockContainer === undefined || blockContainer === null)
        setError('Hubo un error en el juego', 'Bloque de juego (#block-container) no disponble');
    if (!statistics || statistics === undefined || statistics === null)
        setError('Hubo un error en el juego', 'Bloque de juego (#statistics) no disponble');

    // ESTABLECE EL TEMA DEL JUEGO
    fillOptionsTheme('welcome-character', config['character']);
    fillOptionsTheme('welcome-background', config['background']);
    fillOptionsTheme('welcome-floor', config['floor']);

});

// Click en el botón de jugar en el inicio del juego
document.querySelector('#welcome-play').addEventListener('click', () => {
    gamePlay();
});

// Click en el botón de volver a jugar de las estadísticas
document.querySelector('#statistics-play').addEventListener('click', () => {
    setGameElementVisible(statistics, false);
    gamePlay();
});

// Controlador de teclado
window.addEventListener('keydown', (e) => {
    const key = e.code.toString().toLowerCase();

    switch (key) {
        case 'space':
            if (!GAME_ERROR && GAME_PLAY) {
                characterJump();
            }
            break;
    }
});

/**
 * Ejecuta el saldo del personaje
 * 
 * @author Marcos Bustos C.
 * @returns {boolean}
 */

function characterJump() {
    if (GAME_ERROR || !GAME_PLAY)
        return setError('Hubo un error en el juego', 'Hubo un error en la función gamePlay.');

    if (!character.classList.contains('jump')) {
        character.classList.add('jump');
        soundJump();
        window.setTimeout(() => {
            character.classList.remove('jump');
        }, 500);
    }

    return true;
}

/**
 * Intervalo que controla la creación de bloques
 * 
 * @author Marcos Bustos C.
 */
function blockGenerator() {
    blockGeneratorTimer = window.setInterval(() => {
        const createToggle = Math.random();
        if (createToggle >= 0.5) {
            setBlock();
        }
    }, 600);
}

/**
 * Intervalo que controla la destrucción de los bloques ya no utilizados
 * 
 * @author Marcos Bustos C.
 */
function blockDestroyer() {
    blockDestroyerTimer = window.setInterval(() => {
        const firstBlock = blockContainer.querySelector('.block');
        if (firstBlock) {
            if (firstBlock.getAttribute('data-visible') === 'false' || firstBlock.offsetLeft === 0) {
                firstBlock.remove();
            }
        }
    }, 10);
}

/**
 * Intervalo que controla la colición de los bloques con el personaje
 * 
 * @author Marcos Bustos C.
 */
function trigers() {
    trigerBlock = window.setInterval(() => {
        const firstBlock = blockContainer.querySelector('.block');
        const characterLeft = parseInt(window.getComputedStyle(character).getPropertyValue('left'));
        const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue('top'));

        if (!firstBlock || firstBlock === undefined || firstBlock === null || firstBlock.getAttribute('data-visible') === 'false')
            return false;
        if (!characterLeft || characterLeft === undefined || characterLeft === null)
            return false;
        if (!characterTop || characterTop === undefined || characterTop === null)
            return false;
       
        const blockLeft = firstBlock.offsetLeft;
        const blockRight = blockLeft + blockWidth;
        const characterRight = characterLeft + characterWidth;
        const characterBottom = characterTop + characterHeight - floorElements;

        if (((blockRight >= characterLeft && blockRight <= characterRight) || (blockLeft >= characterLeft && blockLeft <= characterRight)) && characterBottom >= characterJumpMinimun) {
            setGameElementVisible(firstBlock, false);
            switch (firstBlock.getAttribute('data-type-item')) {
                case '1':
                    // Vegetales
                    soundPlus();
                    setPlayer(null, player['points'] + 1);
                    setPlayerInfo();
                    break;
                case '2':
                    // Chatarra
                    soundLess();
                    setPlayer(null, player['points'] - 1);
                    setPlayerInfo();
                    break;
                case '3':
                    // Obstaculos
                    gameOver();
                    break;
            }
        }

    }, 10);
}

/**
 * Muestra los errores del juego
 * 
 * @param {string} msgUser Texto que verá el usuario en el alerta
 * @param {string} msgConsole Texto que verá un usuario en la consola
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function setError(msgUser, msgConsole) {
    console.error(msgConsole);
    alert(msgUser);
    GAME_ERROR = true;
    GAME_PLAY = false;
    return false;
}

/**
 * Se ejecuta cuando se inicia la partida
 * 
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function gamePlay() {
    if (GAME_ERROR || GAME_PLAY)
        return setError('Hubo un error en el juego', 'Hubo un error en la función gamePlay.');

    const welcome = document.querySelector('#welcome');
    const welcomePlayer = document.querySelector('#welcome-player');
    const welcomeCharacter = document.querySelector('#welcome-character');
    const welcomeFloor = document.querySelector('#welcome-floor');
    const welcomeBackground = document.querySelector('#welcome-background');

    if (!welcome || welcome === undefined || welcome === null)
        return setError('No se encuentrá componente del juego', 'Componente de juego (#welcome) no disponble');
    if (!welcomePlayer || welcomePlayer === undefined || welcomePlayer === null)
        return setError('No se encuentrá componente del juego', 'Componente de juego (#welcome-player) no disponble');
    if (!welcomeCharacter || welcomeCharacter === undefined || welcomeCharacter === null)
        return setError('No se encuentrá componente del juego', 'Componente de juego (#welcome-character) no disponble');
    if (!welcomeFloor || welcomeFloor === undefined || welcomeFloor === null)
        return setError('No se encuentrá componente del juego', 'Componente de juego (#welcome-floor) no disponble');
    if (!welcomeBackground || welcomeBackground === undefined || welcomeBackground === null)
        return setError('No se encuentrá componente del juego', 'Componente de juego (#welcome-background) no disponble');

    GAME_PLAY = true;
    setPlayer(welcomePlayer.value, 0);
    setPlayerInfo();
    setThemeElements(welcomeBackground.value, welcomeFloor.value, welcomeCharacter.value);
    setGameElementVisible(welcome, false);
    setGameElementVisible(character);
    setGameElementAnimate(gameContainer);
    setGameElementAnimate(floor);
    setGameElementAnimate(blockContainer);
    blockGenerator();
    trigers();
    blockDestroyer();
    soundGameLevel();

    return true;
}

/**
 * Se ejecuta cuando se finaliza la partida
 * 
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function gameOver() {
    if (GAME_ERROR || !GAME_PLAY)
        return setError('Hubo un error en el juego', 'Hubo un error en la función gameOver.');

    setGameElementAnimate(gameContainer, false);
    setGameElementAnimate(floor, false);
    clearInterval(trigerBlock);
    clearInterval(blockGeneratorTimer);
    clearInterval(blockDestroyerTimer);
    clearBlockContainer();
    setGameElementVisible(character, false);
    soundLevel.pause();
    soundGameOver();
    setGameElementVisible(statistics, 'true');
    setStatistics();
    GAME_PLAY = false;

    return true;
}

/**
 * Remueve todos los bloques del contenedor de bloques
 * 
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function clearBlockContainer() {
    if (GAME_ERROR)
        return setError('Hubo un error en el juego', 'Hubo un error en la función clearBlockContainer.');

    if (blockContainer.querySelectorAll('.block').length > 0) {
        blockContainer.querySelectorAll('.block').forEach(block => {
            block.remove();
        });
    }

    return true;
}

/**
 * Establece el thema de los diferentes elementos de juego
 * 
 * @param {string} bg Background o fondo del juego
 * @param {string} fl Floor o suelo del juego
 * @param {string} ch Character o personaje del juego
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function setThemeElements(bg = null, fl = null, ch = null) {
    if (GAME_ERROR)
        return setError('Hubo un error en el juego', 'Hubo un error en la función setThemeElements.');
    if (!bg || bg === undefined || bg === null)
        bg = 'clouds';
    if (!fl || fl === undefined || fl === null)
        fl = 'stone';
    if (!ch || ch === undefined || ch === null)
        ch = 'pig';

    gameContainer.setAttribute('data-theme', bg);
    character.setAttribute('data-theme', ch);
    floor.setAttribute('data-theme', fl);

    return true;
}

/**
 * Escribe las estadísticas de final de juego
 * 
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function setStatistics() {
    if (GAME_ERROR)
        return setError('Hubo un error en el juego', 'Hubo un error en la función setStatistics.');

    const statisticsPlayer = document.querySelector('#statistics-player');
    const statisticsPoints = document.querySelector('#statistics-points');

    if (!statisticsPlayer || statisticsPlayer === undefined || statisticsPlayer === null)
        return setError('No se encuentrá componente del juego', 'Componente de juego (#statistics-player) no disponble');
    if (!statisticsPoints || statisticsPoints === undefined || statisticsPoints === null)
        return setError('No se encuentrá componente del juego', 'Componente de juego (#statistics-points) no disponble');

    statisticsPlayer.innerHTML = `<b>Jugador:</b>${player['name']}`;
    statisticsPoints.innerHTML = `<b>Puntaje:</b>${player['points']}`;

    return true;
}

/**
 * Crea los bloques que son los consumibles y obstaculos del juego
 * 
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function setBlock() {
    if (GAME_ERROR)
        return setError('Hubo un error en el juego', 'Hubo un error en la función setBlock.');

    const currentBlockImage = blockList[Math.floor(Math.random() * blockList.length)];
    const block = document.createElement('div');
    block.className = 'block';
    block.setAttribute('data-animated', 'true');
    block.setAttribute('data-visible', 'true');
    block.setAttribute('data-type-item', currentBlockImage[1]);
    block.setAttribute('data-theme', currentBlockImage[0]);
    blockContainer.appendChild(block);

    return true;
}

/**
 * Crea las opciones de elementos del juego, por ejemplo, rellena el select para cambiar de personaje
 * 
 * @param {string} optionID Identificador del elemento del DOM
 * @param {Array} options Lista de opciones
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function fillOptionsTheme(optionID, options) {
    if (GAME_ERROR || GAME_PLAY)
        return setError('Hubo un error en el juego', 'Hubo un error en la función fillOptionsTheme.');
    if (!optionID || optionID === undefined || optionID === null)
        return setError('Hubo un error en el juego', 'Hubo un error en la función fillOptionsTheme.');
    if (!options || options === undefined || options === null)
        return setError('Hubo un error en el juego', 'Hubo un error en la función fillOptionsTheme.');

    const option = document.querySelector(`#${optionID}`);

    if (!option || option === undefined || option === null)
        return setError('Hubo un error en el juego', 'Hubo un error en la función fillOptionsTheme.');

    options.forEach(value => {
        const opt = document.createElement('option');
        opt.innerHTML = value[0];
        opt.value = value[1];
        option.appendChild(opt);
    });

    return true;
}

/**
 * Se actualiza las estadísticas del jugador a nivel interno
 * 
 * @param {string} name Nombre del jugador
 * @param {number} points Punaje del jugador
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function setPlayer(name = null, points = 0) {
    if (GAME_ERROR)
        return setError('Hubo un error en el juego', 'Hubo un error en la función setPlayer.');

    if (name && name !== undefined && name != null) {
        player['name'] = name;
    } else if (player['name'] === null) {
        player['name'] = 'Anónimo';
    }

    if (points !== undefined && points != null)
        player['points'] = points;

    return true;
}

/**
 * Se escribe en el DOM las estadísticas dentro del juego
 * 
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function setPlayerInfo() {
    if (GAME_ERROR)
        return setError('Hubo un error en el juego', 'Hubo un error en la función setPlayerInfo.');

    const playerInfo = document.querySelector('#player-info');

    if (!playerInfo || playerInfo === undefined || playerInfo === null) {
        setError('No se encuentrá componente del juego', 'Componente de juego (#player-info) no disponble');
        return false;
    }

    playerInfo.innerHTML = `<b>${player['name']}</b> | <b>${player['points']} pts.</b>`;
    playerInfo.setAttribute('data-visible', 'true');

    return true;
}

/**
 * Animo o para una animación de un elemento del DOM
 * 
 * @param {element} element Elemento del DOM
 * @param {boolean} play Si es true se anime, si es false se para la animación
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function setGameElementAnimate(element, play = true) {
    if (GAME_ERROR)
        return setError('Hubo un error en el juego', 'Hubo un error en la función setGameElementAnimate.');
    if (!element || element === undefined || element === null)
        return setError('No se encuentró componente del juego', 'Hubo un error en la función setCharacterVisible.');

    if (play) {
        element.setAttribute('data-animated', 'true');
    } else {
        element.setAttribute('data-animated', 'false');
    }

    return true;
}

/**
 * Esconde o aparece un elemento del DOM
 * 
 * @param {element} element Elemento del DOM
 * @param {boolean} visible Si es true se muestro, si es false se esconde
 * @author Marcos Bustos C.
 * @returns {boolean}
 */
function setGameElementVisible(element, visible = true) {
    if (GAME_ERROR)
        return setError('Hubo un error en el juego', 'Hubo un error en la función setCharacterVisible.');
    if (!element || element === undefined || element === null)
        return setError('No se encuentró componente del juego', 'Hubo un error en la función setCharacterVisible.');

    if (visible) {
        element.setAttribute('data-visible', 'true');
    } else {
        element.setAttribute('data-visible', 'false');
    }

    return true;
}

/**
 * Audio se consume vegetales
 * 
 * @author Marcos Bustos C.
 */
function soundPlus() {
    const sound = new Audio('./sounds/plus.mp3');
    sound.play();
}

/**
 * Audio se consume comida chatarra
 * 
 * @author Marcos Bustos C.
 */
function soundLess() {
    const sound = new Audio('./sounds/less.wav');
    sound.play();
}

/**
 * Audio de termino del juego
 * 
 * @author Marcos Bustos C.
 */
function soundGameOver() {
    const sound = new Audio('./sounds/gameover.wav');
    sound.play();
}

/**
 * Audio cuando el personaje salta
 * 
 * @author Marcos Bustos C.
 */
function soundJump() {
    const sound = new Audio('./sounds/jump.mp3');
    sound.play();
}

/**
 * Audio de nivel del juego
 * 
 * @author Marcos Bustos C.
 */
function soundGameLevel() {
    soundLevel = new Audio('./sounds/gamelevel.wav');
    soundLevel.loop = true;
    soundLevel.volume = 0.5;
    soundLevel.play();
}