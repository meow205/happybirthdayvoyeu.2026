/**
 * ============================================================================
 * SINH NHẬT CHUCHU - LUXURY INTERACTIVE EXPERIENCE & PHYSICS ENGINE
 * Features:
 *  - 100% visible tall candles standing proudly ON TOP of the luxury cake.
 *  - Fast, responsive 2-second blowout duration for all candles (~2.0s).
 *  - Clean face: No dot on mouth, no circular rings when blowing.
 *  - Stardust stream, gentle hearts & aurora ribbons for blowing effects.
 *  - Harmonious proportion: Chuchu's face scaled to match the luxury cake.
 *  - Audio engine with overlap prevention: Single melody instance & celestial wish sound.
 *  - Fullscreen dynamic background: Nebulae waves, stars, floating hearts,
 *    bokeh fairy orbs, sky lanterns & shooting stars.
 *  - Stage 1 candle ghosting fix: Candles only render in Stage 2.
 *  - Google Apps Script & Gmail embedded directly into code.
 * ============================================================================
 */

// Initialize Lucide Icons
if (window.lucide) {
    lucide.createIcons();
}

// ============================================================================
// 1. GOOGLE APPS SCRIPT & GMAIL CẤU HÌNH TRỰC TIẾP TRONG CODE
// ============================================================================
const GOOGLE_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz6FqLgT8HsA4a0HQxXRhXGny_sVGLFr5SNXklcuV4HyitInrNHK4fBCh5OQvUWrEL7QA/exec";
const OWNER_GMAIL = "pvdat1505@gmail.com";

const appConfig = {
    googleScriptWebAppUrl: GOOGLE_SCRIPT_WEB_APP_URL,
    defaultOwnerGmail: OWNER_GMAIL,
    candleCount: 5,
    greetingMessage:
        "Chúc mừng sinh nhật cô gái tuyệt vời nhất của anh! 🎂✨💖\n\n" +
        "Thế là một tuổi mới thật rạng rỡ nữa lại đến. Chúc em luôn giữ mãi nụ cười tỏa nắng, nét đáng yêu ngọt ngào làm anh vui vẻ mỗi ngày. Chúc cho em luôn vui vẻ, hạnh phúc và mọi điều tốt đẹp nhất sẽ đến với em.\n\n" +
        "Chúc em sớm lấy chồng là anh nhó.\n" +
        "Chúc em sớm lấy chồng là anh nhó.\n" +
        "Chúc em sớm lấy chồng là anh nhó.\n" +
        "(Điều gì quan trọng nhắc lại 3 lần hihi) \n\n" +
        "Anh cũng không chuẩn bị được gì nhiều, chỉ có chiếc bánh sinh nhật này dành tặng cho em! 🌟💌"
};

// ============================================================================
// 2. APPLICATION STATE
// ============================================================================
const state = {
    currentStage: 1, // 1: Lời Chúc, 2: Thổi Nến, 3: Điều Ước
    isBlowing: false,
    blowPower: 0,
    micBlowPower: 0,
    allExtinguished: false,
    audioEnabled: true,
    micActive: false,
    // Exact puckered lips anchor measured on chuchu image
    lipAnchorRatio: { x: 0.272, y: 0.738 },
    lastSentWish: "",
    lastRecipientGmail: OWNER_GMAIL
};

// ============================================================================
// 3. DOM REFERENCES
// ============================================================================
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
const fxCanvas = document.getElementById('fxCanvas');
const fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;

const directPortraitImg = document.getElementById('directPortraitImg');
const portraitWrapper = document.getElementById('portraitWrapper');
const portraitInnerContainer = document.getElementById('portraitInnerContainer');
const cakeSvgContainer = document.getElementById('cakeSvgContainer');
const cakeLightHalo = document.getElementById('cakeLightHalo');

const stage1Greeting = document.getElementById('stage1Greeting');
const stage2BlowCandles = document.getElementById('stage2BlowCandles');
const stage3WishForm = document.getElementById('stage3WishForm');

const stepBtn1 = document.getElementById('stepBtn1');
const stepBtn2 = document.getElementById('stepBtn2');
const stepBtn3 = document.getElementById('stepBtn3');
const stepDot1 = document.getElementById('stepDot1');
const stepDot2 = document.getElementById('stepDot2');
const stepDot3 = document.getElementById('stepDot3');

const envelopeIntroBox = document.getElementById('envelopeIntroBox');
const greetingCardModal = document.getElementById('greetingCardModal');
const greetingTypewriter = document.getElementById('greetingTypewriter');
let typewriterStarted = false;

// ============================================================================
// 4. STAGE NAVIGATION CONTROLLER
// ============================================================================
function setStage(stageNum) {
    state.currentStage = stageNum;

    stage1Greeting.classList.remove('stage-visible');
    stage1Greeting.classList.add('stage-hidden');
    stage2BlowCandles.classList.remove('stage-visible');
    stage2BlowCandles.classList.add('stage-hidden');
    stage3WishForm.classList.remove('stage-visible');
    stage3WishForm.classList.add('stage-hidden');

    stepDot1.className = "w-5 h-5 rounded-full bg-white/15 text-white/70 flex items-center justify-center text-[11px] font-bold";
    stepBtn1.className = "flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/45 transition-all";
    stepDot2.className = "w-5 h-5 rounded-full bg-white/15 text-white/70 flex items-center justify-center text-[11px] font-bold";
    stepBtn2.className = "flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/45 transition-all";
    stepDot3.className = "w-5 h-5 rounded-full bg-white/15 text-white/70 flex items-center justify-center text-[11px] font-bold";
    stepBtn3.className = "flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/45 transition-all";

    const breathMeter = document.getElementById('breathMeterContainer');

    if (stageNum === 1) {
        stage1Greeting.classList.remove('stage-hidden');
        stage1Greeting.classList.add('stage-visible');
        stepDot1.className = "w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[11px] font-bold shadow-[0_0_14px_rgba(251,191,36,0.9)]";
        stepBtn1.className = "flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-300 transition-all";
        if (breathMeter) breathMeter.classList.add('opacity-0');
    } else if (stageNum === 2) {
        stage2BlowCandles.classList.remove('stage-hidden');
        stage2BlowCandles.classList.add('stage-visible');
        stepDot2.className = "w-5 h-5 rounded-full bg-pink-400 text-slate-950 flex items-center justify-center text-[11px] font-bold shadow-[0_0_14px_rgba(244,114,182,0.9)]";
        stepBtn2.className = "flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-pink-300 transition-all";
        if (breathMeter) breathMeter.classList.remove('opacity-0');
    } else if (stageNum === 3) {
        stage3WishForm.classList.remove('stage-hidden');
        stage3WishForm.classList.add('stage-visible');
        stepDot3.className = "w-5 h-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center text-[11px] font-bold shadow-[0_0_14px_rgba(56,189,248,0.9)]";
        stepBtn3.className = "flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-300 transition-all";
        if (breathMeter) breathMeter.classList.add('opacity-0');
    }
}

// Stage 1 Envelope Click to Open
if (envelopeIntroBox) {
    envelopeIntroBox.addEventListener('click', () => {
        playMagicalChime();
        playBackgroundMusic(); // Plays custom romantic background music if present
        envelopeIntroBox.classList.add('scale-0', 'opacity-0');
        setTimeout(() => {
            envelopeIntroBox.classList.add('hidden');
            greetingCardModal.classList.remove('hidden');
            setTimeout(() => {
                greetingCardModal.classList.remove('scale-95', 'opacity-0');
                greetingCardModal.classList.add('scale-100', 'opacity-100');
                if (!typewriterStarted) {
                    typewriterStarted = true;
                    startTypewriterEffect(appConfig.greetingMessage, greetingTypewriter, 24);
                }
            }, 60);
        }, 350);
    });
}

function startTypewriterEffect(text, element, speed) {
    if (!element) return;
    let i = 0;
    element.textContent = "";
    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    typing();
}

const btnGoToBlowStage = document.getElementById('btnGoToBlowStage');
if (btnGoToBlowStage) {
    btnGoToBlowStage.addEventListener('click', () => {
        playMagicalChime();
        setStage(2);
    });
}

if (stepBtn1) stepBtn1.addEventListener('click', () => setStage(1));
if (stepBtn2) stepBtn2.addEventListener('click', () => setStage(2));
if (stepBtn3) stepBtn3.addEventListener('click', () => {
    if (state.allExtinguished) setStage(3);
});

const btnBackToBlowAgain = document.getElementById('btnBackToBlowAgain');
if (btnBackToBlowAgain) {
    btnBackToBlowAgain.addEventListener('click', () => setStage(2));
}

const btnReplayFullJourney = document.getElementById('btnReplayFullJourney');
if (btnReplayFullJourney) {
    btnReplayFullJourney.addEventListener('click', () => {
        stopAllMelody();
        relightAllCandles();
        const successView = document.getElementById('wishSentSuccessView');
        if (successView) {
            successView.classList.add('hidden');
            successView.classList.remove('flex');
        }
        const inputView = document.getElementById('wishFormInputView');
        if (inputView) inputView.classList.remove('hidden');

        setStage(1);
        if (envelopeIntroBox) envelopeIntroBox.classList.remove('hidden', 'scale-0', 'opacity-0');
        if (greetingCardModal) greetingCardModal.classList.add('hidden', 'scale-95', 'opacity-0');
        typewriterStarted = false;
    });
}

// ============================================================================
// 5. WEB AUDIO SYNTHESIZER WITH OVERLAP PREVENTION
// ============================================================================
let audioCtx = null;
let activeMelodyNodes = [];

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function stopAllMelody() {
    activeMelodyNodes.forEach(node => {
        try {
            node.stop();
            node.disconnect();
        } catch (e) {}
    });
    activeMelodyNodes = [];
}

function playMagicalChime() {
    if (!state.audioEnabled) return;
    try {
        initAudioContext();
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0.08, now + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.65);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.7);
        });
    } catch (e) {}
}

function playExtinguishPuff() {
    if (!state.audioEnabled) return;
    try {
        initAudioContext();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    } catch (e) {}
}

// Celestial wish meteor ascending chime (clean harp-like arpeggio)
function playWishAscensionChime() {
    if (!state.audioEnabled) return;
    try {
        initAudioContext();
        const now = audioCtx.currentTime;
        const notes = [440.00, 554.37, 659.25, 880.00, 1108.73, 1318.51, 1760.00];
        notes.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.09, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.85);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.9);
        });
    } catch (e) {}
}

// ============================================================================
// 5B. BACKGROUND MUSIC & AUDIO CONTROLLERS
// ============================================================================
const customBgm = document.getElementById('customBgm');

function playBackgroundMusic() {
    if (!state.audioEnabled) return;
    if (customBgm) {
        customBgm.volume = 0.6;
        const promise = customBgm.play();
        if (promise !== undefined) {
            promise.catch(() => {
                // If music.mp3 is not loaded or autoplay requires gesture, fallback safely
            });
        }
    }
}

function pauseBackgroundMusic() {
    if (customBgm) {
        customBgm.pause();
    }
}

function playHappyBirthdaySong() {
    if (!state.audioEnabled) return;

    // If custom music.mp3 is playing, let it play smoothly
    if (customBgm && !customBgm.paused && customBgm.currentTime > 0) {
        return;
    }

    try {
        initAudioContext();
        stopAllMelody(); // Stop any currently playing song instance

        const now = audioCtx.currentTime;
        const melody = [
            { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 1.3 },
            { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.3 },
            { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 523.25, d: 0.7 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 0.7 }, { f: 293.66, d: 1.1 },
            { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.35 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.5 }
        ];
        let timeCursor = now + 0.1;
        melody.forEach(note => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, timeCursor);
            gain.gain.setValueAtTime(0.14, timeCursor);
            gain.gain.exponentialRampToValueAtTime(0.0001, timeCursor + note.d * 1.05);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(timeCursor);
            osc.stop(timeCursor + note.d * 1.1);
            activeMelodyNodes.push(osc);
            timeCursor += note.d * 1.15;
        });
    } catch (e) {}
}

const btnAudioToggle = document.getElementById('btnAudioToggle');
const audioIcon = document.getElementById('audioIcon');
if (btnAudioToggle && audioIcon) {
    btnAudioToggle.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        if (state.audioEnabled) {
            audioIcon.setAttribute('data-lucide', 'volume-2');
            audioIcon.className = "w-4 h-4 text-emerald-300";
            playMagicalChime();
            playBackgroundMusic();
        } else {
            audioIcon.setAttribute('data-lucide', 'volume-x');
            audioIcon.className = "w-4 h-4 text-rose-400";
            pauseBackgroundMusic();
            stopAllMelody();
        }
        if (window.lucide) lucide.createIcons();
    });
}

// ============================================================================
// 6. CANDLES ENTITY - EXACT 2-SECOND BLOWOUT DURATION
// ============================================================================
class Candle {
    constructor(id, relX, resistance, damageRate) {
        this.id = id;
        this.relX = relX;             // Horizontal offset from cake center (SVG 500w)
        this.resistance = resistance; // Wind threshold required to start taking damage
        this.damageRate = damageRate; // Calibrated damage per frame to finish in ~2s
        this.health = 100;
        this.lit = true;
        this.flickerOffset = Math.random() * 100;
        this.flameBend = 0;
        this.smokeAlpha = 0;
        this.emberCooldown = 0;
    }
}

// 5 candles on top tier (Calibrated to blow out progressively in ~2.0s total)
const candles = [
    new Candle(0, -72, 0.45, 1.2),  // Leftmost (extinguishes at ~2.0s)
    new Candle(1, -36, 0.38, 1.5),  // Mid-left (extinguishes at ~1.6s)
    new Candle(2, 0,   0.30, 2.0),  // Center (extinguishes at ~1.2s)
    new Candle(3, 36,  0.22, 2.7),  // Mid-right (extinguishes at ~0.8s)
    new Candle(4, 72,  0.15, 3.6)   // Rightmost closest to mouth (extinguishes at ~0.5s)
];

// Background & FX Particle Collections (NO shockwave rings)
let backgroundStars = [];
let floatingHearts = [];
let fairyBokehOrbs = [];
let floatingLanterns = [];
let breathParticles = [];
let auroraRibbons = [];
let emberSparks = [];
let smokePuffs = [];
let celebrationFireworks = [];
let celebrationConfetti = [];
let shootingStars = [];

function resizeCanvases() {
    if (!bgCanvas || !fxCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
    initBackgroundStars();
    initFloatingHearts();
    initFairyBokehOrbs();
    initFloatingLanterns();
}
window.addEventListener('resize', resizeCanvases);

// Rich multi-layer starfield with radiant diamond sparkles & flares
function initBackgroundStars() {
    backgroundStars = [];
    // Rich star density: ~600 - 800 sparkling stars
    const count = Math.floor((window.innerWidth * window.innerHeight) / 1600);
    for (let i = 0; i < count; i++) {
        const isSparkle = Math.random() < 0.42; // 42% are dazzling diamond sparkle stars
        backgroundStars.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            radius: Math.random() * 2.2 + 0.6,
            baseAlpha: Math.random() * 0.35 + 0.35,
            alpha: Math.random() * 0.8 + 0.2,
            twinkleSpeed: Math.random() * 0.06 + 0.03, // Dynamic sparkling
            twinklePhase: Math.random() * Math.PI * 2,
            isSparkleDiamond: isSparkle,
            sparkleSize: Math.random() * 6.5 + 3.5,
            rot: Math.random() * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.035,
            hasEightPoints: Math.random() < 0.28,     // 28% have 8 radiant celestial rays
            color: ['#ffffff', '#fef08a', '#fde68a', '#fbcfe8', '#bae6fd', '#fed7aa', '#e9d5ff'][Math.floor(Math.random() * 7)]
        });
    }
}

// Floating glowing pastel hearts in background
function initFloatingHearts() {
    floatingHearts = [];
    const heartCount = Math.floor(window.innerWidth / 90);
    for (let i = 0; i < heartCount; i++) {
        floatingHearts.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            size: Math.random() * 7 + 4,
            vy: -(Math.random() * 0.45 + 0.25),
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayDist: Math.random() * 20 + 8,
            swayOffset: Math.random() * Math.PI * 2,
            alpha: Math.random() * 0.4 + 0.15,
            color: ['#f472b6', '#fbcfe8', '#fde68a', '#c084fc'][Math.floor(Math.random() * 4)]
        });
    }
}

// Optical bokeh fairy lights
function initFairyBokehOrbs() {
    fairyBokehOrbs = [];
    for (let i = 0; i < 14; i++) {
        fairyBokehOrbs.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            radius: Math.random() * 45 + 25,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.14 + 0.05,
            color: Math.random() > 0.5 ? '244, 114, 182' : '251, 191, 36'
        });
    }
}

// Romantic sky lanterns (lồng đèn ước nguyện)
function initFloatingLanterns() {
    floatingLanterns = [];
    for (let i = 0; i < 11; i++) {
        floatingLanterns.push({
            x: Math.random() * bgCanvas.width,
            y: bgCanvas.height + Math.random() * 300,
            vy: -(Math.random() * 0.4 + 0.25),
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayDist: Math.random() * 24 + 10,
            swayOffset: Math.random() * Math.PI * 2,
            width: Math.random() * 14 + 12,
            height: Math.random() * 20 + 16,
            alpha: Math.random() * 0.5 + 0.35
        });
    }
}

// Background shooting stars
function spawnRandomShootingStar() {
    if (shootingStars.length > 2) return;
    shootingStars.push({
        x: Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1,
        y: Math.random() * window.innerHeight * 0.3,
        vx: -(Math.random() * 10 + 8),
        vy: Math.random() * 5 + 3,
        length: Math.random() * 75 + 45,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012,
        color: '#fef08a'
    });
}
setInterval(() => {
    if (Math.random() < 0.45) {
        spawnRandomShootingStar();
    }
}, 3500);

// ============================================================================
// 7. BLOWING CONTROLS & MICROPHONE SENSING
// ============================================================================
let mediaStream = null;
let audioAnalyser = null;
let micInterval = null;
const btnMicBlow = document.getElementById('btnMicBlow');
const micBtnText = document.getElementById('micBtnText');

if (btnMicBlow) {
    btnMicBlow.addEventListener('click', async () => {
        if (!state.micActive) {
            try {
                initAudioContext();
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                const source = audioCtx.createMediaStreamSource(mediaStream);
                audioAnalyser = audioCtx.createAnalyser();
                audioAnalyser.fftSize = 512;
                source.connect(audioAnalyser);
                state.micActive = true;
                if (micBtnText) micBtnText.textContent = "Đang Thổi...";
                btnMicBlow.classList.add('border-sky-400', 'bg-sky-500/25');

                const dataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
                micInterval = setInterval(() => {
                    if (!state.micActive) return;
                    audioAnalyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                    let avg = sum / dataArray.length;
                    if (avg > 18) {
                        state.micBlowPower = Math.min(1, avg / 55);
                        state.isBlowing = true;
                    } else {
                        state.micBlowPower = Math.max(0, state.micBlowPower - 0.08);
                        if (state.micBlowPower === 0) {
                            state.isBlowing = false;
                        }
                    }
                }, 30);
            } catch (err) {
                alert("Không thể mở Microphone. Bạn có thể nhấn giữ nút 'Giữ Để Thổi Nến' hoặc phím Space nhé!");
            }
        } else {
            if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
            if (micInterval) clearInterval(micInterval);
            state.micActive = false;
            state.micBlowPower = 0;
            state.isBlowing = false;
            if (micBtnText) micBtnText.textContent = "Bật Mic";
            btnMicBlow.classList.remove('border-sky-400', 'bg-sky-500/25');
            resetBlowState();
        }
    });
}

// Hold to Blow Mouse / Touch / Keyboard
const btnHoldBlow = document.getElementById('btnHoldBlow');
const blowBtnLabel = document.getElementById('blowBtnLabel');
const breathMeterBar = document.getElementById('breathMeterBar');
const breathPercentText = document.getElementById('breathPercentText');

function startBlowing() {
    if (state.allExtinguished || state.currentStage !== 2) return;
    state.isBlowing = true;
    if (btnHoldBlow) btnHoldBlow.classList.add('active-blowing');
    if (blowBtnLabel) blowBtnLabel.textContent = "Đang Thổi Gió Mạnh... 💨";
    playMagicalChime();
}

function stopBlowing() {
    state.isBlowing = false;
    if (btnHoldBlow) btnHoldBlow.classList.remove('active-blowing');
    if (blowBtnLabel) blowBtnLabel.textContent = "Giữ Để Thổi Nến 💨";
    if (!state.micActive) {
        state.blowPower = 0;
        resetBlowState();
    }
}

function resetBlowState() {
    updateBreathMeter(0);
    if (portraitWrapper) {
        // Clear inline transform so CSS classes & idle breathe keyframes take over seamlessly
        portraitWrapper.style.transform = '';
    }
}

if (btnHoldBlow) {
    btnHoldBlow.addEventListener('mousedown', startBlowing);
    window.addEventListener('mouseup', stopBlowing);
    btnHoldBlow.addEventListener('touchstart', (e) => { e.preventDefault(); startBlowing(); });
    window.addEventListener('touchend', stopBlowing);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !state.isBlowing && state.currentStage === 2) {
        e.preventDefault();
        startBlowing();
    }
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        stopBlowing();
    }
});

function updateBreathMeter(power) {
    const pct = Math.round(power * 100);
    if (breathMeterBar) breathMeterBar.style.width = `${pct}%`;
    if (breathPercentText) breathPercentText.textContent = `${pct}%`;
    document.documentElement.style.setProperty('--candle-glow', Math.max(0.12, 1 - power * 0.72));
}

// ============================================================================
// 8. LIP-TO-CANDLE TRAJECTORY & 2-SECOND DAMAGE CALCULATION
// ============================================================================
function getLipOriginCoordinates() {
    if (!directPortraitImg) {
        return { x: window.innerWidth * 0.65, y: window.innerHeight * 0.44 };
    }
    const rect = directPortraitImg.getBoundingClientRect();
    return {
        x: rect.left + rect.width * state.lipAnchorRatio.x,
        y: rect.top + rect.height * state.lipAnchorRatio.y
    };
}

// Precise coordinates for candles standing ON TOP of the luxury cake
function getCakeCandleCoordinates(candle) {
    if (!cakeSvgContainer) {
        return { x: window.innerWidth * 0.35, y: window.innerHeight * 0.44 };
    }
    const cakeRect = cakeSvgContainer.getBoundingClientRect();
    const cakeCenterX = cakeRect.left + cakeRect.width * 0.5;
    
    // In SVG (500x420), top tier surface is at y = 115
    const cakeTopSurfaceY = cakeRect.top + cakeRect.height * (115 / 420);
    const spreadX = cakeCenterX + (candle.relX * (cakeRect.width / 500));
    
    // Gentle curve following the elliptical surface rim
    const curveOffset = Math.pow(candle.relX / 130, 2) * (10 * (cakeRect.height / 420));
    return {
        x: spreadX,
        y: cakeTopSurfaceY + curveOffset
    };
}

// Fast & Crisp 2-Second Blowing Loop (Clean effects: Stardust, Hearts, Aurora only)
function processBlowingFrame() {
    if (state.currentStage !== 2) return;

    if (state.isBlowing) {
        // Fast power ramp-up in ~0.3s
        state.blowPower = Math.min(1.0, state.blowPower + 0.055);
        updateBreathMeter(state.blowPower);

        // Portrait leans forward and tilts downwards into the blow
        if (portraitWrapper) {
            const isMobile = window.innerWidth < 640;
            const baseTranslateY = isMobile ? -55 : -85;
            const baseTilt = isMobile ? -12 : -14;
            const blowTilt = baseTilt - (state.blowPower * 5); // Tilts downwards from -14deg to -19deg
            const forwardShift = -state.blowPower * (isMobile ? 10 : 16); // Leans towards the cake
            const downDip = baseTranslateY + (state.blowPower * 6);
            portraitWrapper.style.transform = `translate(${forwardShift}px, ${downDip}px) rotate(${blowTilt}deg) scale(${1 + state.blowPower * 0.03})`;
        }

        const lip = getLipOriginCoordinates();

        // 1. Emit Aurora Wind Ribbons streaming downwards towards candles
        if (Math.random() < 0.42 * state.blowPower) {
            const centerCandlePos = getCakeCandleCoordinates(candles[2]);
            const windDx = (centerCandlePos.x - 25) - lip.x;
            const windDy = (centerCandlePos.y - 25) - lip.y;
            const windDist = Math.hypot(windDx, windDy) || 1;
            const windSpeed = Math.random() * 4 + 12;

            auroraRibbons.push({
                x: lip.x,
                y: lip.y,
                vx: (windDx / windDist) * windSpeed,
                vy: (windDy / windDist) * windSpeed, // Streams downwards directly onto flames!
                length: Math.random() * 90 + 60,
                alpha: 0.85,
                color: Math.random() > 0.5 ? '#67e8f9' : '#fbcfe8',
                wavePhase: Math.random() * Math.PI * 2
            });
        }

        // 2. Emit Stardust & Heart Particles straight towards candles
        const emitCount = Math.ceil(state.blowPower * 7);
        for (let i = 0; i < emitCount; i++) {
            const targetCandle = candles[Math.floor(Math.random() * candles.length)];
            const targetPos = getCakeCandleCoordinates(targetCandle);
            const flameTargetY = targetPos.y - 48; // Target candle flames
            const dx = targetPos.x - lip.x;
            const dy = flameTargetY - lip.y;
            const dist = Math.hypot(dx, dy) || 1;
            const speed = Math.random() * 8 + 11;

            breathParticles.push({
                x: lip.x + (Math.random() - 0.5) * 10,
                y: lip.y + (Math.random() - 0.5) * 10,
                vx: (dx / dist) * speed + (Math.random() - 0.5) * 2,
                vy: (dy / dist) * speed + (Math.random() - 0.5) * 2,
                radius: Math.random() * 3.5 + 1.5,
                color: ['#38bdf8', '#bae6fd', '#f472b6', '#fde68a', '#ffffff', '#e0e7ff'][Math.floor(Math.random() * 6)],
                isHeart: Math.random() < 0.28,
                alpha: Math.random() * 0.85 + 0.15,
                decay: Math.random() * 0.024 + 0.016
            });
        }

        // 3. Exact 2-Second Progressive Extinguishing
        candles.forEach((c) => {
            if (c.lit && state.blowPower >= c.resistance) {
                // Apply damage calibrated for ~2s total duration
                c.health = Math.max(0, c.health - c.damageRate);

                // Embers fly off wick
                if (Math.random() < 0.28) {
                    const candlePos = getCakeCandleCoordinates(c);
                    emberSparks.push({
                        x: candlePos.x - c.flameBend * 0.6,
                        y: candlePos.y - 48,
                        vx: -(Math.random() * 5 + 3),
                        vy: (Math.random() - 0.5) * 3,
                        radius: Math.random() * 2 + 1,
                        color: '#fbbf24',
                        alpha: 0.9,
                        decay: 0.035
                    });
                }

                // Extinguish when health reaches 0
                if (c.health <= 0) {
                    extinguishCandle(c);
                }
            }
        });

    } else if (state.blowPower > 0) {
        state.blowPower = Math.max(0, state.blowPower - 0.06);
        updateBreathMeter(state.blowPower);

        // Lit candles quickly recover if released
        candles.forEach(c => {
            if (c.lit && c.health < 100) {
                c.health = Math.min(100, c.health + 2.5);
            }
        });

        if (state.blowPower === 0) {
            resetBlowState();
        }
    }

    updateSubtitleStatus();
}

function updateSubtitleStatus() {
    const statusSub = document.getElementById('statusSubtitle');
    if (!statusSub || state.allExtinguished) return;

    const litCount = candles.filter(c => c.lit).length;
    if (litCount === 5) {
        statusSub.innerHTML = `Nhấn giữ nút <strong class="text-pink-300">"Giữ Để Thổi Nến 💨"</strong>, phím <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-amber-200 font-mono text-[11px]">Space</kbd> hoặc bật Mic để Vợ iu thổi tắt nến ✨`;
    } else if (litCount >= 3) {
        statusSub.innerHTML = `<span class="text-amber-300 font-medium">✨ Nến đang tắt dần rất nhanh! Thổi tiếp đi em ơi... 💨</span>`;
    } else if (litCount >= 1) {
        statusSub.innerHTML = `<span class="text-pink-300 font-bold">✨ Sắp tắt hết rồi! Cố lên một chút nữa thôi Snow iu ơi! 💖💨</span>`;
    }
}

function extinguishCandle(c) {
    if (!c.lit) return;
    c.lit = false;
    c.smokeAlpha = 1.0;
    c.emberCooldown = 1.0;
    playExtinguishPuff();

    const candlePos = getCakeCandleCoordinates(c);

    // Burst golden ember sparks to the left
    for (let i = 0; i < 20; i++) {
        emberSparks.push({
            x: candlePos.x,
            y: candlePos.y - 48,
            vx: -(Math.random() * 8 + 4),
            vy: (Math.random() - 0.6) * 6,
            radius: Math.random() * 2.8 + 1.2,
            color: Math.random() > 0.4 ? '#fbbf24' : '#f97316',
            alpha: 1,
            decay: Math.random() * 0.03 + 0.018
        });
    }

    checkAllExtinguished();
}

function checkAllExtinguished() {
    const allOut = candles.every(c => !c.lit);
    if (allOut && !state.allExtinguished) {
        state.allExtinguished = true;
        resetBlowState();

        const statusSub = document.getElementById('statusSubtitle');
        if (statusSub) {
            statusSub.innerHTML = "<strong class='text-amber-300 text-sm md:text-base'>✨ ĐÃ THỔI TẮT HẾT NẾN! ĐIỀU ƯỚC ĐANG ĐƯỢC CHẮP CÁNH... 💖✨</strong>";
        }

        // Play celebration birthday song
        playHappyBirthdaySong();

        // Celebration fireworks
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const fxX = window.innerWidth * (0.18 + Math.random() * 0.64);
                const fxY = window.innerHeight * (0.16 + Math.random() * 0.35);
                spawnCelebrationFirework(fxX, fxY, 150);
            }, i * 350);
        }

        // Confetti shower
        spawnCelebrationConfettiShower(240);

        // Transition to Stage 3
        setTimeout(() => {
            setStage(3);
        }, 3200);
    }
}

function relightAllCandles() {
    candles.forEach(c => {
        c.lit = true;
        c.health = 100;
        c.smokeAlpha = 0;
        c.flameBend = 0;
        c.emberCooldown = 0;
    });
    state.allExtinguished = false;
    updateBreathMeter(0);
    updateSubtitleStatus();
}

const btnRelight = document.getElementById('btnRelight');
if (btnRelight) {
    btnRelight.addEventListener('click', () => {
        relightAllCandles();
        playMagicalChime();
    });
}

function spawnCelebrationFirework(x, y, count) {
    const palette = ['#fde68a', '#f472b6', '#38bdf8', '#c084fc', '#fb7185', '#4ade80'];
    const chosenColor = palette[Math.floor(Math.random() * palette.length)];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 3;
        celebrationFireworks.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1.5,
            color: Math.random() > 0.3 ? chosenColor : '#ffffff',
            alpha: 1,
            gravity: 0.14,
            decay: Math.random() * 0.015 + 0.01
        });
    }
}

function spawnCelebrationConfettiShower(count) {
    const colors = ['#fde68a', '#f472b6', '#38bdf8', '#c084fc', '#fb7185', '#fbbf24'];
    for (let i = 0; i < count; i++) {
        celebrationConfetti.push({
            x: Math.random() * window.innerWidth,
            y: -Math.random() * 200,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 3 + 2,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.1,
            w: Math.random() * 10 + 6,
            h: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1
        });
    }
}

function launchWishMeteorToSky() {
    playWishAscensionChime(); // Gentle ascending wish chime (no song overlap)
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            shootingStars.push({
                x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 60,
                y: window.innerHeight * 0.75,
                vx: (Math.random() - 0.5) * 8 - 10,
                vy: -Math.random() * 14 - 12,
                length: Math.random() * 100 + 70,
                alpha: 1,
                decay: 0.012,
                color: '#fef08a'
            });
        }, i * 220);
    }
}

// ============================================================================
// 9. MAIN 60FPS RENDERING ENGINE (BACKGROUND & FOREGROUND)
// ============================================================================
let animTime = 0;

function drawDiamondSparkleStar(ctx, x, y, size, alpha, rot, hasEightPoints, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    ctx.fillStyle = color || '#ffffff';
    ctx.globalAlpha = Math.min(1.0, alpha);

    // Primary 4-point Diamond Star
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(0, 0, size * 0.22, 0);
    ctx.quadraticCurveTo(0, 0, 0, size);
    ctx.quadraticCurveTo(0, 0, -size * 0.22, 0);
    ctx.quadraticCurveTo(0, 0, 0, -size);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.quadraticCurveTo(0, 0, 0, size * 0.22);
    ctx.quadraticCurveTo(0, 0, size, 0);
    ctx.quadraticCurveTo(0, 0, -size * 0.22, 0);
    ctx.quadraticCurveTo(0, 0, -size, 0);
    ctx.fill();

    // Optional 4 secondary diagonal rays (8-point celestial flare)
    if (hasEightPoints) {
        const diagSize = size * 0.55;
        ctx.save();
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, -diagSize);
        ctx.quadraticCurveTo(0, 0, diagSize * 0.18, 0);
        ctx.quadraticCurveTo(0, 0, 0, diagSize);
        ctx.quadraticCurveTo(0, 0, -diagSize * 0.18, 0);
        ctx.quadraticCurveTo(0, 0, 0, -diagSize);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-diagSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, diagSize * 0.18);
        ctx.quadraticCurveTo(0, 0, diagSize, 0);
        ctx.quadraticCurveTo(0, 0, -diagSize * 0.18, 0);
        ctx.quadraticCurveTo(0, 0, -diagSize, 0);
        ctx.fill();
        ctx.restore();
    }

    // Radiant core gleam
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1, size * 0.2), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawHeartShape(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - size, y - size, x - size * 1.4, y + size * 0.5, x, y + size * 1.3);
    ctx.bezierCurveTo(x + size * 1.4, y + size * 0.5, x + size, y - size, x, y);
    ctx.fill();
    ctx.restore();
}

function animateScene() {
    animTime += 0.035;

    // ------------------------------------------------------------------------
    // A. BACKGROUND SKY CANVAS
    // ------------------------------------------------------------------------
    if (bgCtx && bgCanvas) {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

        const w = bgCanvas.width;
        const h = bgCanvas.height;

        // Dynamic Nebula Waves
        const nebGrad1 = bgCtx.createRadialGradient(
            w * 0.35 + Math.sin(animTime * 0.5) * 50,
            h * 0.45 + Math.cos(animTime * 0.4) * 40,
            10,
            w * 0.35,
            h * 0.45,
            w * 0.45
        );
        nebGrad1.addColorStop(0, 'rgba(236, 72, 153, 0.14)');
        nebGrad1.addColorStop(0.6, 'rgba(168, 85, 247, 0.06)');
        nebGrad1.addColorStop(1, 'transparent');
        bgCtx.fillStyle = nebGrad1;
        bgCtx.fillRect(0, 0, w, h);

        const nebGrad2 = bgCtx.createRadialGradient(
            w * 0.72 + Math.cos(animTime * 0.6) * 60,
            h * 0.38 + Math.sin(animTime * 0.5) * 50,
            10,
            w * 0.72,
            h * 0.38,
            w * 0.5
        );
        nebGrad2.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
        nebGrad2.addColorStop(0.5, 'rgba(244, 114, 182, 0.05)');
        nebGrad2.addColorStop(1, 'transparent');
        bgCtx.fillStyle = nebGrad2;
        bgCtx.fillRect(0, 0, w, h);

        // Bokeh Orbs
        fairyBokehOrbs.forEach(orb => {
            orb.x += orb.vx;
            orb.y += orb.vy;
            if (orb.x < -100) orb.x = w + 100;
            if (orb.x > w + 100) orb.x = -100;
            if (orb.y < -100) orb.y = h + 100;
            if (orb.y > h + 100) orb.y = -100;

            const pulse = Math.sin(animTime * 1.5 + orb.x) * 0.04;
            const grad = bgCtx.createRadialGradient(orb.x, orb.y, 2, orb.x, orb.y, orb.radius);
            grad.addColorStop(0, `rgba(${orb.color}, ${Math.max(0.02, orb.alpha + pulse)})`);
            grad.addColorStop(1, 'transparent');
            bgCtx.fillStyle = grad;
            bgCtx.beginPath();
            bgCtx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            bgCtx.fill();
        });

        // Twinkling Stars (Lấp Lánh Nhiều Hơn với Kim Cương & Sao 8 Cánh Tỏa Sáng)
        backgroundStars.forEach(s => {
            s.rot += s.rotationSpeed;
            const wave = Math.sin(animTime * s.twinkleSpeed * 50 + s.twinklePhase);
            s.alpha = Math.max(0.12, Math.min(1.0, s.baseAlpha + wave * 0.58));

            if (s.isSparkleDiamond) {
                const dynamicSize = s.sparkleSize * (0.65 + s.alpha * 0.7);
                drawDiamondSparkleStar(bgCtx, s.x, s.y, dynamicSize, s.alpha, s.rot, s.hasEightPoints, s.color);
                
                // Sparkling halo glow at peak twinkle
                if (s.alpha > 0.6) {
                    bgCtx.save();
                    const glowRadius = dynamicSize * 2.2;
                    const glowGrad = bgCtx.createRadialGradient(s.x, s.y, 1, s.x, s.y, glowRadius);
                    glowGrad.addColorStop(0, 'rgba(255, 255, 255, ' + (s.alpha * 0.5) + ')');
                    glowGrad.addColorStop(0.35, 'rgba(254, 240, 138, ' + (s.alpha * 0.25) + ')');
                    glowGrad.addColorStop(1, 'transparent');
                    bgCtx.fillStyle = glowGrad;
                    bgCtx.beginPath();
                    bgCtx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
                    bgCtx.fill();
                    bgCtx.restore();
                }
            } else {
                bgCtx.fillStyle = s.color || '#ffffff';
                bgCtx.globalAlpha = s.alpha;
                bgCtx.beginPath();
                bgCtx.arc(s.x, s.y, s.radius * (0.75 + s.alpha * 0.45), 0, Math.PI * 2);
                bgCtx.fill();
            }
        });
        bgCtx.globalAlpha = 1;

        // Floating Pastel Hearts
        floatingHearts.forEach(ht => {
            ht.y += ht.vy;
            const sway = Math.sin(animTime * 1.8 + ht.swayOffset) * ht.swayDist * 0.05;
            const drawX = ht.x + sway;

            if (ht.y < -30) {
                ht.y = h + 20;
                ht.x = Math.random() * w;
            }

            drawHeartShape(bgCtx, drawX, ht.y, ht.size, ht.color, ht.alpha);
        });

        // Floating Wish Lanterns
        floatingLanterns.forEach(lt => {
            lt.y += lt.vy;
            const sway = Math.sin(animTime * 1.4 + lt.swayOffset) * lt.swayDist * 0.05;
            const drawX = lt.x + sway;

            if (lt.y < -50) {
                lt.y = h + 50;
                lt.x = Math.random() * w;
            }

            const grad = bgCtx.createRadialGradient(drawX, lt.y, 2, drawX, lt.y, lt.width * 2);
            grad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
            grad.addColorStop(1, 'transparent');
            bgCtx.fillStyle = grad;
            bgCtx.beginPath();
            bgCtx.arc(drawX, lt.y, lt.width * 2, 0, Math.PI * 2);
            bgCtx.fill();

            bgCtx.fillStyle = `rgba(254, 215, 170, ${lt.alpha})`;
            bgCtx.beginPath();
            bgCtx.roundRect(drawX - lt.width * 0.5, lt.y - lt.height * 0.5, lt.width, lt.height, 4);
            bgCtx.fill();

            const flicker = Math.sin(animTime * 8 + lt.swayOffset) * 1.5;
            bgCtx.fillStyle = 'rgba(255, 255, 235, 0.95)';
            bgCtx.beginPath();
            bgCtx.arc(drawX, lt.y + lt.height * 0.15, lt.width * 0.28 + flicker * 0.1, 0, Math.PI * 2);
            bgCtx.fill();
        });
    }

    // ------------------------------------------------------------------------
    // B. PROCESS BLOWING LOGIC
    // ------------------------------------------------------------------------
    processBlowingFrame();

    // ------------------------------------------------------------------------
    // C. FOREGROUND FX CANVAS (ONLY DRAW CANDLES & PARTICLES IN STAGE 2)
    // ------------------------------------------------------------------------
    if (fxCtx && fxCanvas) {
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

        // 1. Aurora Wind Ribbons
        auroraRibbons.forEach((rb, idx) => {
            rb.x += rb.vx;
            rb.y += rb.vy + Math.sin(animTime * 6 + rb.wavePhase) * 1.5;
            rb.alpha *= 0.95;

            fxCtx.save();
            fxCtx.strokeStyle = rb.color;
            fxCtx.lineWidth = 3;
            fxCtx.lineCap = 'round';
            fxCtx.globalAlpha = rb.alpha;
            fxCtx.beginPath();
            fxCtx.moveTo(rb.x, rb.y);
            fxCtx.quadraticCurveTo(rb.x + rb.length * 0.5, rb.y - 8, rb.x + rb.length, rb.y);
            fxCtx.stroke();
            fxCtx.restore();

            if (rb.alpha < 0.04) auroraRibbons.splice(idx, 1);
        });

        // 2. Stardust Breath & Heart Particles
        breathParticles.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            fxCtx.save();
            fxCtx.globalAlpha = Math.max(0, p.alpha);
            fxCtx.fillStyle = p.color;

            if (p.isHeart) {
                drawHeartShape(fxCtx, p.x, p.y, p.radius * 1.4, p.color, p.alpha);
            } else {
                fxCtx.beginPath();
                fxCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                fxCtx.fill();
            }
            fxCtx.restore();

            if (p.alpha <= 0) breathParticles.splice(idx, 1);
        });

        // 3. Ember Sparks
        emberSparks.forEach((sp, idx) => {
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vy += 0.08;
            sp.alpha -= sp.decay;
            fxCtx.save();
            fxCtx.fillStyle = sp.color;
            fxCtx.globalAlpha = Math.max(0, sp.alpha);
            fxCtx.beginPath();
            fxCtx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
            fxCtx.fill();
            fxCtx.restore();
            if (sp.alpha <= 0) emberSparks.splice(idx, 1);
        });

        // 4. Shooting Stars / Wish Meteors
        shootingStars.forEach((st, idx) => {
            st.x += st.vx;
            st.y += st.vy;
            st.alpha -= st.decay;

            fxCtx.save();
            const grad = fxCtx.createLinearGradient(st.x, st.y, st.x - st.vx * 3.5, st.y - st.vy * 3.5);
            grad.addColorStop(0, 'rgba(255, 255, 255, ' + st.alpha + ')');
            grad.addColorStop(0.3, 'rgba(253, 230, 138, ' + (st.alpha * 0.9) + ')');
            grad.addColorStop(1, 'transparent');
            fxCtx.strokeStyle = grad;
            fxCtx.lineWidth = 3.5;
            fxCtx.lineCap = 'round';
            fxCtx.beginPath();
            fxCtx.moveTo(st.x, st.y);
            fxCtx.lineTo(st.x - st.vx * 3.5, st.y - st.vy * 3.5);
            fxCtx.stroke();
            fxCtx.restore();

            if (st.alpha <= 0) shootingStars.splice(idx, 1);
        });

        // 5. Celebration Fireworks
        celebrationFireworks.forEach((fw, idx) => {
            fw.x += fw.vx;
            fw.y += fw.vy;
            fw.vy += fw.gravity;
            fw.alpha -= fw.decay;
            fxCtx.save();
            fxCtx.fillStyle = fw.color;
            fxCtx.globalAlpha = Math.max(0, fw.alpha);
            fxCtx.beginPath();
            fxCtx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
            fxCtx.fill();
            fxCtx.restore();
            if (fw.alpha <= 0) celebrationFireworks.splice(idx, 1);
        });

        // 6. Celebration Confetti
        celebrationConfetti.forEach((cf, idx) => {
            cf.x += cf.vx;
            cf.y += cf.vy;
            cf.rot += cf.vRot;
            fxCtx.save();
            fxCtx.translate(cf.x, cf.y);
            fxCtx.rotate(cf.rot);
            fxCtx.fillStyle = cf.color;
            fxCtx.globalAlpha = cf.alpha;
            fxCtx.fillRect(-cf.w * 0.5, -cf.h * 0.5, cf.w, cf.h);
            fxCtx.restore();
            if (cf.y > window.innerHeight + 50) celebrationConfetti.splice(idx, 1);
        });

        // --------------------------------------------------------------------
        // 7. RENDER TALL VISIBLE CANDLES ON TOP OF THE CAKE (ONLY IN STAGE 2!)
        // --------------------------------------------------------------------
        if (state.currentStage === 2) {
            candles.forEach((c) => {
                const pos = getCakeCandleCoordinates(c);
                const spreadX = pos.x;
                const baseY = pos.y; // Base touches the top cake surface

                // Stand tall above the surface (44px height)
                const stickWidth = 9;
                const stickHeight = 44;
                const topY = baseY - stickHeight;
                const wickY = topY - 7;

                // A. Candle Stick (Standing Tall UPWARDS above the cake surface)
                fxCtx.save();
                const stickGrad = fxCtx.createLinearGradient(spreadX - stickWidth * 0.5, topY, spreadX + stickWidth * 0.5, baseY);
                stickGrad.addColorStop(0, '#fef08a');
                stickGrad.addColorStop(0.3, '#fbbf24');
                stickGrad.addColorStop(0.7, '#f472b6');
                stickGrad.addColorStop(1, '#db2777');
                fxCtx.fillStyle = stickGrad;
                fxCtx.beginPath();
                fxCtx.roundRect(spreadX - stickWidth * 0.5, topY, stickWidth, stickHeight, 2.5);
                fxCtx.fill();

                // Spiral Golden Ribbons on Candle Body
                fxCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
                fxCtx.lineWidth = 1.8;
                for (let sy = topY + 6; sy < baseY - 4; sy += 9) {
                    fxCtx.beginPath();
                    fxCtx.moveTo(spreadX - stickWidth * 0.5, sy);
                    fxCtx.lineTo(spreadX + stickWidth * 0.5, sy - 5);
                    fxCtx.stroke();
                }

                // Candle Wick
                fxCtx.strokeStyle = c.lit ? '#1e293b' : (c.emberCooldown > 0 ? '#ef4444' : '#334155');
                fxCtx.lineWidth = 2.2;
                fxCtx.beginPath();
                fxCtx.moveTo(spreadX, topY);
                fxCtx.lineTo(spreadX - 1.2, wickY);
                fxCtx.stroke();
                fxCtx.restore();

                if (c.lit) {
                    // Flame flutter & dynamic wind bending
                    const naturalFlicker = Math.sin(animTime * 11 + c.flickerOffset) * 2.5;
                    const windBend = (state.blowPower * 30) + (state.micBlowPower * 25);
                    c.flameBend += (windBend - c.flameBend) * 0.3;

                    const healthRatio = Math.max(0.45, c.health / 100);
                    const flameTipX = spreadX - c.flameBend + naturalFlicker;
                    const flameTipY = wickY - 26 * healthRatio + (c.flameBend * 0.18);

                    // A. Outer Warm Glow Halo
                    const haloRadius = 32 * (1 - state.blowPower * 0.25) * healthRatio;
                    const haloGrad = fxCtx.createRadialGradient(spreadX - c.flameBend * 0.4, wickY - 10, 2, spreadX - c.flameBend * 0.4, wickY - 10, haloRadius);
                    haloGrad.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
                    haloGrad.addColorStop(0.35, 'rgba(251, 191, 36, 0.6)');
                    haloGrad.addColorStop(0.7, 'rgba(244, 114, 182, 0.25)');
                    haloGrad.addColorStop(1, 'transparent');

                    fxCtx.save();
                    fxCtx.fillStyle = haloGrad;
                    fxCtx.beginPath();
                    fxCtx.arc(spreadX - c.flameBend * 0.4, wickY - 10, haloRadius, 0, Math.PI * 2);
                    fxCtx.fill();

                    // B. Outer Amber Tear-Drop Flame Body
                    fxCtx.fillStyle = '#f59e0b';
                    fxCtx.beginPath();
                    fxCtx.moveTo(spreadX, wickY);
                    fxCtx.quadraticCurveTo(spreadX - 8 * healthRatio - c.flameBend * 0.7, wickY - 14, flameTipX, flameTipY);
                    fxCtx.quadraticCurveTo(spreadX + 8 * healthRatio - c.flameBend * 0.3, wickY - 14, spreadX, wickY);
                    fxCtx.fill();

                    // C. Inner Golden-White Core
                    fxCtx.fillStyle = '#fef08a';
                    fxCtx.beginPath();
                    fxCtx.moveTo(spreadX, wickY);
                    fxCtx.quadraticCurveTo(spreadX - 4 * healthRatio - c.flameBend * 0.7, wickY - 10, flameTipX * 0.6 + spreadX * 0.4, flameTipY + 4);
                    fxCtx.quadraticCurveTo(spreadX + 4 * healthRatio - c.flameBend * 0.3, wickY - 10, spreadX, wickY);
                    fxCtx.fill();

                    // D. Hot Blue Electric Flame Root
                    fxCtx.fillStyle = '#38bdf8';
                    fxCtx.beginPath();
                    fxCtx.moveTo(spreadX - 2.5, wickY);
                    fxCtx.quadraticCurveTo(spreadX, wickY - 7, spreadX + 2.5, wickY);
                    fxCtx.fill();
                    fxCtx.restore();

                } else {
                    // Rising organic smoke wisps
                    if (c.smokeAlpha > 0) {
                        c.smokeAlpha = Math.max(0, c.smokeAlpha - 0.015);
                        if (Math.random() < 0.65) {
                            smokePuffs.push({
                                x: spreadX + (Math.random() - 0.5) * 4,
                                y: wickY - 4,
                                vx: -(Math.random() * 2 + 1),
                                vy: -(Math.random() * 1.5 + 1.2),
                                radius: Math.random() * 4 + 3,
                                alpha: c.smokeAlpha * 0.85,
                                decay: 0.018
                            });
                        }
                    }
                }
            });

            // 8. Render Smoke Puffs
            smokePuffs.forEach((sm, idx) => {
                sm.x += sm.vx + Math.sin(animTime * 4 + sm.y * 0.08) * 0.8;
                sm.y += sm.vy;
                sm.radius += 0.4;
                sm.alpha -= sm.decay;

                fxCtx.save();
                fxCtx.fillStyle = `rgba(240, 230, 245, ${Math.max(0, sm.alpha)})`;
                fxCtx.beginPath();
                fxCtx.arc(sm.x, sm.y, sm.radius, 0, Math.PI * 2);
                fxCtx.fill();
                fxCtx.restore();

                if (sm.alpha <= 0) smokePuffs.splice(idx, 1);
            });
        }
    }

    requestAnimationFrame(animateScene);
}

// ============================================================================
// 10. GOOGLE APPS SCRIPT WISH SUBMISSION
// ============================================================================
// Preset Wish Chips
document.querySelectorAll('.wish-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const inputWishContent = document.getElementById('inputWishContent');
        if (inputWishContent) {
            const cleanText = chip.textContent.trim().replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u, '');
            if (inputWishContent.value) {
                inputWishContent.value += "\n" + cleanText;
            } else {
                inputWishContent.value = cleanText;
            }
            playMagicalChime();
        }
    });
});

// Send Wish Button Handler (No song overlap!)
const btnSendWishToGmail = document.getElementById('btnSendWishToGmail');
if (btnSendWishToGmail) {
    btnSendWishToGmail.addEventListener('click', async () => {
        const inputSenderName = document.getElementById('inputSenderName');
        const inputWishContent = document.getElementById('inputWishContent');
        const wishStatusMsg = document.getElementById('wishStatusMsg');
        const sendWishBtnText = document.getElementById('sendWishBtnText');

        const sender = inputSenderName ? inputSenderName.value.trim() : "Snow - Vợ Iu 💖";
        const content = inputWishContent ? inputWishContent.value.trim() : "";

        if (!content) {
            if (wishStatusMsg) {
                wishStatusMsg.textContent = "Em hãy viết điều ước của mình vào ô trên nhé! ✨";
                wishStatusMsg.classList.remove('hidden');
            }
            return;
        }

        if (wishStatusMsg) wishStatusMsg.classList.add('hidden');
        if (sendWishBtnText) sendWishBtnText.textContent = "Đang Thả Sao Băng... 🌠";
        btnSendWishToGmail.disabled = true;

        // Launch shooting star meteor into the sky with single celestial chime
        launchWishMeteorToSky();
        state.lastSentWish = content;

        // Save wish into browser storage
        try {
            const wishRecord = {
                sender: sender,
                content: content,
                time: new Date().toLocaleString("vi-VN")
            };
            localStorage.setItem('chuchu_birthday_wish_latest', JSON.stringify(wishRecord));
            const history = JSON.parse(localStorage.getItem('chuchu_birthday_wishes_history') || '[]');
            history.push(wishRecord);
            localStorage.setItem('chuchu_birthday_wishes_history', JSON.stringify(history));
        } catch (e) {}

        const payload = {
            senderName: sender,
            wishContent: content,
            ownerEmail: OWNER_GMAIL,
            timestamp: new Date().toISOString()
        };

        if (GOOGLE_SCRIPT_WEB_APP_URL) {
            try {
                // Post to Google Apps Script as text/plain simple CORS request
                await fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
            } catch (e) {
                console.log("Apps script request sent.");
            }
        }

        setTimeout(() => {
            const inputView = document.getElementById('wishFormInputView');
            const successView = document.getElementById('wishSentSuccessView');
            const previewText = document.getElementById('sentWishPreviewText');

            if (inputView) inputView.classList.add('hidden');
            if (successView) {
                successView.classList.remove('hidden');
                successView.classList.add('flex');
            }
            if (previewText) previewText.textContent = `"${content}"`;

            spawnCelebrationFirework(window.innerWidth * 0.5, window.innerHeight * 0.35, 160);
            playMagicalChime(); // Gentle sparkle chime (NEVER overlaps Happy Birthday!)

            if (sendWishBtnText) sendWishBtnText.textContent = "Gửi Điều Ước Lên Trời Sao 💌";
            btnSendWishToGmail.disabled = false;
        }, 1200);
    });
}

const btnWriteAnotherWish = document.getElementById('btnWriteAnotherWish');
if (btnWriteAnotherWish) {
    btnWriteAnotherWish.addEventListener('click', () => {
        const inputView = document.getElementById('wishFormInputView');
        const successView = document.getElementById('wishSentSuccessView');
        const inputWishContent = document.getElementById('inputWishContent');

        if (successView) {
            successView.classList.add('hidden');
            successView.classList.remove('flex');
        }
        if (inputView) inputView.classList.remove('hidden');
        if (inputWishContent) {
            inputWishContent.value = "";
            inputWishContent.focus();
        }
    });
}

// ============================================================================
// INITIALIZATION ON LOAD
// ============================================================================
window.addEventListener('load', () => {
    resizeCanvases();
    requestAnimationFrame(animateScene);
});
