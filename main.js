// Global State, Personalization, UI Components & Sibling Hub
(function () {
    const STORAGE_KEY = 'sister_birthday_profile';

    // Default configuration for the birthday sister
    const DEFAULT_PROFILE = {
        sisterName: 'Didi',
        nickname: 'Queen of the Family',
        age: 'Fabulous & Thriving',
        siblingName: 'Your Younger Sibling',
        birthdayDate: new Date().toISOString().split('T')[0], // Default today
        customWish: 'Thank you for being my constant guide, my biggest cheerleader, and my favourite person to annoy! You deserve all the joy, love, and magic this world has to offer today and always.'
    };

    const SisterApp = {
        profile: { ...DEFAULT_PROFILE },

        init() {
            this.loadProfile();
            this.applyProfile();
            this.setupNavigation();
            this.setupPersonalizationModal();
            this.setupFloatingDecorations();
            this.setupSoundControls();
            this.setupCountdown();
            this.setupQuoteGenerator();
        },

        loadProfile() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    this.profile = { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
                }
            } catch (e) {
                console.warn('Could not read from localStorage', e);
            }
        },

        saveProfile(newProfile) {
            this.profile = { ...this.profile, ...newProfile };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
            } catch (e) {
                console.warn('Could not save to localStorage', e);
            }
            this.applyProfile();
            this.showToast('✨ Birthday details updated successfully!');
            if (window.Confetti) window.Confetti.burst();
            if (window.Sound) window.Sound.sparkle();
        },

        applyProfile() {
            // Update all elements with sister-name class or data attribute
            document.querySelectorAll('.sister-name').forEach(el => {
                el.textContent = this.profile.sisterName || 'Didi';
            });

            document.querySelectorAll('.sister-nickname').forEach(el => {
                el.textContent = this.profile.nickname || 'Queen';
            });

            document.querySelectorAll('.sister-age').forEach(el => {
                el.textContent = this.profile.age || '';
            });

            document.querySelectorAll('.sibling-name').forEach(el => {
                el.textContent = this.profile.siblingName || 'Your Younger Sibling';
            });

            document.querySelectorAll('.custom-wish-text').forEach(el => {
                el.textContent = this.profile.customWish || DEFAULT_PROFILE.customWish;
            });
        },

        setupNavigation() {
            // Mobile menu toggle
            const hamburger = document.querySelector('.navbar-toggle');
            const navMenu = document.querySelector('.navbar-links');
            if (hamburger && navMenu) {
                hamburger.addEventListener('click', () => {
                    navMenu.classList.toggle('active');
                    hamburger.classList.toggle('open');
                });
            }

            // Highlight current page
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        },

        setupPersonalizationModal() {
            const modal = document.getElementById('personalize-modal');
            const openBtns = document.querySelectorAll('.open-personalize-btn');
            const closeBtn = document.querySelector('.close-modal-btn');
            const form = document.getElementById('personalize-form');

            if (!modal) return;

            openBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.populateModalForm();
                    modal.classList.add('active');
                    if (window.Sound) window.Sound.click();
                });
            });

            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            }

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });

            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const newProfile = {
                        sisterName: document.getElementById('input-sister-name').value.trim() || 'Didi',
                        nickname: document.getElementById('input-sister-nickname').value.trim() || 'Queen of the Family',
                        age: document.getElementById('input-sister-age').value.trim() || 'Fabulous',
                        siblingName: document.getElementById('input-sibling-name').value.trim() || 'Your Younger Sibling',
                        birthdayDate: document.getElementById('input-birthday-date').value || this.profile.birthdayDate,
                        customWish: document.getElementById('input-custom-wish').value.trim() || DEFAULT_PROFILE.customWish
                    };
                    this.saveProfile(newProfile);
                    modal.classList.remove('active');
                });
            }
        },

        populateModalForm() {
            const nameInput = document.getElementById('input-sister-name');
            const nickInput = document.getElementById('input-sister-nickname');
            const ageInput = document.getElementById('input-sister-age');
            const sibInput = document.getElementById('input-sibling-name');
            const dateInput = document.getElementById('input-birthday-date');
            const wishInput = document.getElementById('input-custom-wish');

            if (nameInput) nameInput.value = this.profile.sisterName;
            if (nickInput) nickInput.value = this.profile.nickname;
            if (ageInput) ageInput.value = this.profile.age;
            if (sibInput) sibInput.value = this.profile.siblingName;
            if (dateInput) dateInput.value = this.profile.birthdayDate;
            if (wishInput) wishInput.value = this.profile.customWish;
        },

        setupSoundControls() {
            const soundBtn = document.querySelector('.sound-toggle-btn');
            if (soundBtn && window.Sound) {
                soundBtn.addEventListener('click', () => {
                    const muted = window.Sound.toggleMute();
                    soundBtn.innerHTML = muted ? '🔇 <span>Sound Off</span>' : '🔊 <span>Sound On</span>';
                    soundBtn.title = muted ? 'Turn Sound On' : 'Mute Sound';
                    if (!muted) {
                        window.Sound.sparkle();
                    }
                });
            }

            // Global music player pill button if present
            const musicBtn = document.getElementById('bday-music-btn');
            if (musicBtn && window.Sound) {
                musicBtn.addEventListener('click', () => {
                    if (window.Sound.isPlayingMusic) {
                        window.Sound.stopMusic();
                        musicBtn.innerHTML = '🎵 Play Birthday Song';
                        musicBtn.classList.remove('playing');
                    } else {
                        musicBtn.innerHTML = '⏸️ Pause Melody';
                        musicBtn.classList.add('playing');
                        window.Sound.playMusic(
                            (idx, note) => {
                                // optional pulse visual
                            },
                            () => {
                                // song finished one loop
                            }
                        );
                    }
                });
            }
        },

        setupFloatingDecorations() {
            const container = document.createElement('div');
            container.className = 'floating-bg-container';
            container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
            document.body.appendChild(container);

            const emojis = ['🎈', '✨', '💖', '⭐', '🌸', '🎂', '🎉', '🦋'];
            for (let i = 0; i < 16; i++) {
                const el = document.createElement('div');
                el.className = 'floating-bg-item';
                el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                el.style.position = 'absolute';
                el.style.left = `${Math.random() * 100}%`;
                el.style.top = `${Math.random() * 100}%`;
                el.style.fontSize = `${Math.random() * 16 + 14}px`;
                el.style.opacity = (Math.random() * 0.25 + 0.1).toFixed(2);
                el.style.animation = `floatUp ${Math.random() * 10 + 12}s linear infinite`;
                el.style.animationDelay = `-${Math.random() * 12}s`;
                container.appendChild(el);
            }
        },

        setupCountdown() {
            const daysEl = document.getElementById('count-days');
            const hoursEl = document.getElementById('count-hours');
            const minsEl = document.getElementById('count-mins');
            const secsEl = document.getElementById('count-secs');
            const countdownTitle = document.getElementById('countdown-status-text');

            if (!daysEl) return;

            const updateClock = () => {
                const now = new Date();
                let bday = new Date(this.profile.birthdayDate);
                // Check if valid date
                if (isNaN(bday.getTime())) {
                    bday = new Date();
                }

                // Match month and day with current year
                let target = new Date(now.getFullYear(), bday.getMonth(), bday.getDate(), 0, 0, 0);
                if (target < now && (now - target > 86400000)) {
                    // Birthday already passed this year, point to next year
                    target = new Date(now.getFullYear() + 1, bday.getMonth(), bday.getDate(), 0, 0, 0);
                }

                const diff = target - now;

                // If today is the birthday!
                if (now.getDate() === bday.getDate() && now.getMonth() === bday.getMonth()) {
                    if (countdownTitle) countdownTitle.textContent = "🎉 IT'S CELEBRATION DAY TODAY! HAPPY BIRTHDAY! 🎉";
                    daysEl.textContent = '00';
                    hoursEl.textContent = '00';
                    minsEl.textContent = '00';
                    secsEl.textContent = '00';
                    return;
                }

                if (countdownTitle) countdownTitle.textContent = "Countdown to the Birthday Celebration ✨";

                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / (1000 * 60)) % 60);
                const s = Math.floor((diff / 1000) % 60);

                daysEl.textContent = String(d).padStart(2, '0');
                hoursEl.textContent = String(h).padStart(2, '0');
                minsEl.textContent = String(m).padStart(2, '0');
                secsEl.textContent = String(s).padStart(2, '0');
            };

            updateClock();
            setInterval(updateClock, 1000);
        },

        setupQuoteGenerator() {
            const quoteBtn = document.getElementById('new-quote-btn');
            const quoteText = document.getElementById('sister-quote-display');
            if (!quoteBtn || !quoteText) return;

            const quotes = [
                "“Having an older sister is like having a bodyguard, a stylist, a therapist, and a lifelong best friend all wrapped into one.”",
                "“Big sisters are the people who teach us about the world, and then protect us from it.”",
                "“Side by side or miles apart, sisters will always be connected by the heart.”",
                "“Behind every awesome younger sibling is an older sister who took all the blame first!”",
                "“You’re not just my sister; you are my anchor, my cheerleader, and my favourite reason to laugh.”",
                "“A sister is both your mirror and your opposite — you show me who I can become.”",
                "“Nobody will ever understand our family crazies quite like you do!”",
                "“You are proof that superheroes don’t always wear capes; sometimes they wear cute outfits and give great advice.”",
                "“Thank you for breaking all the house rules first so my life was 100x easier!”",
                "“To the girl who taught me how to share, how to stand tall, and how to never give up on my dreams.”"
            ];

            quoteBtn.addEventListener('click', () => {
                const random = quotes[Math.floor(Math.random() * quotes.length)];
                quoteText.style.opacity = '0';
                setTimeout(() => {
                    quoteText.textContent = random;
                    quoteText.style.opacity = '1';
                }, 200);

                if (window.Confetti) window.Confetti.burst();
                if (window.Sound) window.Sound.sparkle();
            });
        },

        showToast(message) {
            let toast = document.querySelector('.sister-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.className = 'sister-toast';
                document.body.appendChild(toast);
            }
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3200);
        }
    };

    window.SisterApp = SisterApp;
    document.addEventListener('DOMContentLoaded', () => SisterApp.init());
})();
