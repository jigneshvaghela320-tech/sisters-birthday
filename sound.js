// Zero-Dependency Web Audio API Sound Effects & Happy Birthday Music Synthesizer
(function () {
    let audioCtx = null;
    let isMuted = false;
    let isPlayingMusic = false;
    let musicTimeout = null;
    let currentNoteIndex = 0;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Melodic notes frequency table (Hz)
    const NOTES = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
        'G5': 783.99, 'A5': 880.00, 'Bb4': 466.16
    };

    // "Happy Birthday To You" note sequence: [note, duration in seconds, pause after]
    const BIRTHDAY_SONG = [
        ['G4', 0.28], ['G4', 0.28], ['A4', 0.55], ['G4', 0.55], ['C5', 0.55], ['B4', 1.0],
        ['G4', 0.28], ['G4', 0.28], ['A4', 0.55], ['G4', 0.55], ['D5', 0.55], ['C5', 1.0],
        ['G4', 0.28], ['G4', 0.28], ['G5', 0.55], ['E5', 0.55], ['C5', 0.55], ['B4', 0.55], ['A4', 0.8],
        ['F5', 0.3], ['F5', 0.3], ['E5', 0.55], ['C5', 0.55], ['D5', 0.55], ['C5', 1.2]
    ];

    const Sound = {
        get isMuted() {
            return isMuted;
        },
        toggleMute() {
            isMuted = !isMuted;
            if (isMuted && isPlayingMusic) {
                this.stopMusic();
            }
            return isMuted;
        },

        // Play musical chime tone (Music Box / Celesta vibe)
        playChimeTone(freq, duration = 0.5, type = 'sine') {
            if (isMuted) return;
            try {
                const ctx = getAudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                // Celesta harmonic sparkle
                const osc2 = ctx.createOscillator();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
                const gain2 = ctx.createGain();

                gain.gain.setValueAtTime(0.18, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

                gain2.gain.setValueAtTime(0.06, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

                osc.connect(gain);
                osc2.connect(gain2);
                gain.connect(ctx.destination);
                gain2.connect(ctx.destination);

                osc.start();
                osc2.start();
                osc.stop(ctx.currentTime + duration);
                osc2.stop(ctx.currentTime + duration);
            } catch (e) {
                console.warn('Web Audio error:', e);
            }
        },

        // Play the "Happy Birthday" melody
        playMusic(onNoteChange = null, onEnd = null) {
            if (isMuted) return;
            this.stopMusic();
            isPlayingMusic = true;
            currentNoteIndex = 0;

            const playNext = () => {
                if (!isPlayingMusic) return;
                if (currentNoteIndex >= BIRTHDAY_SONG.length) {
                    currentNoteIndex = 0;
                    if (onEnd) onEnd();
                    // Loop music after small breath
                    musicTimeout = setTimeout(playNext, 1200);
                    return;
                }

                const [noteName, duration] = BIRTHDAY_SONG[currentNoteIndex];
                const freq = NOTES[noteName] || 440;
                this.playChimeTone(freq, duration * 1.1, 'sine');

                if (onNoteChange) onNoteChange(currentNoteIndex, noteName);

                currentNoteIndex++;
                musicTimeout = setTimeout(playNext, (duration + 0.08) * 1000);
            };

            playNext();
        },

        stopMusic() {
            isPlayingMusic = false;
            if (musicTimeout) {
                clearTimeout(musicTimeout);
                musicTimeout = null;
            }
            currentNoteIndex = 0;
        },

        get isPlayingMusic() {
            return isPlayingMusic;
        },

        // Balloon pop effect: quick noise burst + pitch envelope
        pop() {
            if (isMuted) return;
            try {
                const ctx = getAudioContext();
                // Pop tone
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.frequency.setValueAtTime(260, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.12);

                // Add small white noise snap
                const bufferSize = ctx.sampleRate * 0.05;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                noise.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                noise.start();
            } catch (e) {}
        },

        // Candle blow gust effect
        blowCandle() {
            if (isMuted) return;
            try {
                const ctx = getAudioContext();
                const bufferSize = ctx.sampleRate * 0.45;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(500, ctx.currentTime);

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.4, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                noise.start();
            } catch (e) {}
        },

        // Triumphant Fanfare / Celebration cheer
        fanfare() {
            if (isMuted) return;
            const arpeggio = [523.25, 659.25, 783.99, 1046.50];
            arpeggio.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playChimeTone(freq, 0.4, 'triangle');
                }, idx * 110);
            });
        },

        // Positive sparkle sound
        sparkle() {
            if (isMuted) return;
            const notes = [659.25, 783.99, 987.77, 1318.51];
            notes.forEach((freq, i) => {
                setTimeout(() => this.playChimeTone(freq, 0.25, 'sine'), i * 70);
            });
        },

        // Click / Gentle tap sound
        click() {
            if (isMuted) return;
            this.playChimeTone(587.33, 0.08, 'sine');
        },

        // Gentle buzzer for wrong quiz answer
        buzz() {
            if (isMuted) return;
            try {
                const ctx = getAudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.2);
            } catch (e) {}
        }
    };

    window.Sound = Sound;
})();
