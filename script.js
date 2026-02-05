// Valentine Proposal - Premium JavaScript
const { useState, useEffect, useRef } = React;

// ============================================
// CONFIGURATION - Edit your images here!
// ============================================

const ASSETS = {
    proposal: "will chu be my valentine.gif",
    success: "We're together.gif",
    bgMusic: "audio.mp3",
    // Optional: Add a different song for the success screen
    // If left empty or same as bgMusic, the current song continues
    successMusic: ""  // e.g., "success_song.mp3" - leave empty to keep same song
};

// Music start time in seconds
const MUSIC_START_TIME = 31;
const SUCCESS_MUSIC_START_TIME = 0;  // Start time for success music

// Default success message (can be overridden via URL param ?message=Your+Message)
const DEFAULT_SUCCESS_MESSAGE = "Can't wait for our date! 🌹";

// Images that change with each "No" click - ADD YOUR OWN GIFS HERE!
// Name them: no1.gif, no2.gif, no3.gif, etc. OR replace the filenames below
const REJECTION_IMAGES = [
    "will chu be my valentine.gif",  // Initial image (index 0)
    "no1.gif",   // After 1st No click
    "no2.gif",   // After 2nd No click  
    "no3.gif",   // After 3rd No click
    "no4.gif",   // After 4th No click
    "no5.gif",   // After 5th No click
    "no6.gif",   // After 6th No click
    "no7.gif",   // After 7th No click
    "no8.gif",   // After 8th No click
    "no9.gif",   // After 9th No click
    "no10.gif"   // After 10th No click (final)
];

// Title messages that change with each "No" click
const TITLE_PHRASES = [
    "Will you be my Valentine",  // Initial title
    "Are you sure? 🥲",
    "Really really?",
    "Abb mei ruth jaunga... 😢",
    "Maan jao na! 🥺",
    "Dil tod diya... 💔",
    "Soch lo acche se!😑",
    "Pakka?? 🥹",
    "Last chance!",
    "Plsss? :((",
    "Okay fine... click YES now! 😤"
];

// ============================================
// COMPONENTS
// ============================================

// Floating Hearts Background Component
function FloatingHearts() {
    const hearts = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${-Math.random() * 8}s`,  // Negative delay = starts mid-animation
        duration: `${6 + Math.random() * 4}s`,
        emoji: ['💕', '💖', '💗', '💝', '💘', '❤️', '🩷'][Math.floor(Math.random() * 7)]
    }));

    return React.createElement('div', { className: 'bg-hearts' },
        hearts.map(heart =>
            React.createElement('div', {
                key: heart.id,
                className: 'floating-heart',
                style: {
                    left: heart.left,
                    animationDelay: heart.delay,
                    animationDuration: heart.duration
                }
            }, heart.emoji)
        )
    );
}

// Envelope Component
function Envelope({ onOpen }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        if (isOpen) return;
        setIsOpen(true);
        setTimeout(() => {
            onOpen();
        }, 800);
    };

    return React.createElement('div', { className: `envelope-overlay ${isOpen ? 'hidden-overlay' : ''}` },
        React.createElement('div', {
            className: `envelope-wrapper ${isOpen ? 'open' : ''}`,
            onClick: handleOpen
        },
            React.createElement('div', { className: 'envelope' },
                React.createElement('div', { className: 'letter' }, 'For You 💌'),
                React.createElement('div', { className: 'pocket' })
            ),
            React.createElement('div', { className: 'instruction-text' }, 'Click to open!')
        )
    );
}

// Mouse/Touch Trail Component
function MouseTrail() {
    useEffect(() => {
        const createHeart = (x, y) => {
            if (Math.random() > 0.15) return;
            const heart = document.createElement('div');
            heart.innerHTML = ['💖', '💕', '💗', '💓'][Math.floor(Math.random() * 4)];
            heart.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                font-size: ${12 + Math.random() * 14}px;
                z-index: 9999;
                opacity: 1;
                transition: transform 1s ease-out, opacity 1s ease-out;
            `;
            document.body.appendChild(heart);

            setTimeout(() => {
                heart.style.transform = `translate(${Math.random() * 50 - 25}px, -${30 + Math.random() * 50}px)`;
                heart.style.opacity = '0';
            }, 10);

            setTimeout(() => heart.remove(), 1100);
        };

        const handleMouseMove = (e) => createHeart(e.clientX, e.clientY);
        const handleTouchMove = (e) => {
            const touch = e.touches[0];
            if (touch) createHeart(touch.clientX, touch.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);
    return null;
}

// Sound Effect Utility
const playPopSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) { console.error('Audio error', e); }
};

// Main App Component
function App() {
    const [name, setName] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [noClickCount, setNoClickCount] = useState(0);
    const [musicPlaying, setMusicPlaying] = useState(false);
    const [envelopeOpened, setEnvelopeOpened] = useState(false);
    const [showEnvelope, setShowEnvelope] = useState(true);
    const [audio] = useState(() => {
        const a = new Audio(ASSETS.bgMusic);
        a.loop = true;
        a.volume = 0.4;  // 40% volume
        a.currentTime = MUSIC_START_TIME;
        return a;
    });

    const wasPlayingRef = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setName(params.get('name') || '');
        setCustomMessage(params.get('message') || '');

        // Try to autoplay music
        audio.play().then(() => {
            setMusicPlaying(true);
            wasPlayingRef.current = true;
        }).catch(() => {
            // Autoplay blocked by browser, user needs to click button
            setMusicPlaying(false);
        });

        // Pause music when tab is not visible, resume when visible
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (!audio.paused) {
                    wasPlayingRef.current = true;
                    audio.pause();
                }
            } else {
                if (wasPlayingRef.current) {
                    audio.play().catch(() => { });
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup on unmount
        return () => {
            audio.pause();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);



    const toggleMusic = () => {
        playPopSound();
        if (musicPlaying) {
            audio.pause();
        } else {
            audio.currentTime = MUSIC_START_TIME;
            audio.play();
        }
        setMusicPlaying(!musicPlaying);
    };

    const handleEnvelopeOpen = () => {
        playPopSound();
        setEnvelopeOpened(true);
        // Attempt to start music on interaction (user clicked envelope)
        if (!musicPlaying) {
            audio.play().then(() => {
                setMusicPlaying(true);
            }).catch(() => { });
        }
        setTimeout(() => {
            setShowEnvelope(false);
        }, 500);
    };

    const handleNoClick = () => {
        playPopSound();
        const nextCount = noClickCount + 1;
        setNoClickCount(nextCount);
    };

    const handleYesClick = () => {
        playPopSound();
        setAccepted(true);
        // Launch confetti!
        const duration = 4000;
        const end = Date.now() + duration;
        const colors = ['#ff69b4', '#ff1493', '#ff6b6b', '#ffffff', '#ffd700'];

        (function frame() {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        // Big burst in the center
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: colors
        });

        // Switch to success music if configured
        if (ASSETS.successMusic && ASSETS.successMusic !== ASSETS.bgMusic) {
            audio.src = ASSETS.successMusic;
            audio.currentTime = SUCCESS_MUSIC_START_TIME;
            audio.play().catch(() => { });
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const currentTitle = TITLE_PHRASES[Math.min(noClickCount, TITLE_PHRASES.length - 1)];
    const currentImage = REJECTION_IMAGES[Math.min(noClickCount, REJECTION_IMAGES.length - 1)];
    const isLastPhrase = noClickCount >= TITLE_PHRASES.length - 1;

    // Format title with name if provided
    const displayTitle = noClickCount === 0
        ? (name ? `${currentTitle}, ${name}?` : `${currentTitle}?`)
        : currentTitle;

    return React.createElement(React.Fragment, null,
        React.createElement(MouseTrail),
        React.createElement(FloatingHearts),
        !accepted ? (
            React.createElement(React.Fragment, null,
                showEnvelope && React.createElement(Envelope, { onOpen: handleEnvelopeOpen }),
                React.createElement('div', {
                    className: 'card',
                    style: { opacity: envelopeOpened ? 1 : 0, transition: 'opacity 1s' }
                },
                    React.createElement('h1', { className: 'title' }, displayTitle),
                    React.createElement('div', { className: 'gif-container' },
                        React.createElement('img', { src: currentImage, alt: 'Please say yes!' })
                    ),
                    React.createElement('div', { className: isLastPhrase ? 'button-container center-only' : 'button-container' },
                        React.createElement('button', { className: 'btn btn-yes', onClick: handleYesClick }, 'YES 💖'),
                        !isLastPhrase && React.createElement('button', { className: 'btn btn-no', onClick: handleNoClick }, 'No')
                    )
                )
            )
        ) : (
            React.createElement('div', { className: 'card success-card' },
                React.createElement('h1', { className: 'success-title' }, 'YAY! I knew it! 💖'),
                React.createElement('div', { className: 'gif-container' },
                    React.createElement('img', { src: ASSETS.success, alt: "We're together!" })
                ),
                React.createElement('p', { className: 'success-message' }, customMessage || DEFAULT_SUCCESS_MESSAGE),
                React.createElement('div', { className: 'sparkle-container' },
                    React.createElement('span', { className: 'sparkle' }, '✨'),
                    React.createElement('span', { className: 'sparkle' }, '💖'),
                    React.createElement('span', { className: 'sparkle' }, '✨')
                )
            )
        ),
        React.createElement('button', {
            className: 'music-btn',
            onClick: toggleMusic,
            title: musicPlaying ? 'Pause Music' : 'Play Music'
        }, musicPlaying ? '🔊' : '🔇'),
        React.createElement('div', { className: 'footer' },
            'Made with 🩵 by Amit'
        )
    );
}

// ============================================
// INITIALIZE APP
// ============================================
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
