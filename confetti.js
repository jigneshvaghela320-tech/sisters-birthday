// Lightweight Zero-Dependency Confetti Engine
(function () {
    const Confetti = {
        canvas: null,
        ctx: null,
        particles: [],
        animId: null,

        init() {
            if (this.canvas) return;
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'confetti-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '99999';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        },

        resize() {
            if (!this.canvas) return;
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        burst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 80) {
            this.init();
            const colors = ['#ff4d79', '#ff9a3c', '#ffea6c', '#48dbfb', '#a55eea', '#ff6b81', '#2ed573', '#fd79a8'];
            const shapes = ['rect', 'circle', 'star'];

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 12 + 4;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 4,
                    size: Math.random() * 8 + 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    shape: shapes[Math.floor(Math.random() * shapes.length)],
                    rotation: Math.random() * 360,
                    vRot: (Math.random() - 0.5) * 15,
                    gravity: 0.28,
                    drag: 0.96,
                    alpha: 1,
                    decay: Math.random() * 0.015 + 0.008
                });
            }

            if (!this.animId) {
                this.animate();
            }
        },

        shower(durationMs = 3000) {
            this.init();
            const startTime = Date.now();
            const interval = setInterval(() => {
                const now = Date.now();
                if (now - startTime > durationMs) {
                    clearInterval(interval);
                    return;
                }
                this.burst(Math.random() * window.innerWidth, -10, 15);
            }, 120);
        },

        animate() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.vx *= p.drag;
                p.vy *= p.drag;
                p.vy += p.gravity;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.vRot;
                p.alpha -= p.decay;

                if (p.alpha <= 0 || p.y > this.canvas.height + 20) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.globalAlpha = Math.max(0, p.alpha);
                this.ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
                } else if (p.shape === 'circle') {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Star shape
                    this.drawStar(this.ctx, 0, 0, 5, p.size, p.size / 2);
                }
                this.ctx.restore();
            }

            if (this.particles.length > 0) {
                this.animId = requestAnimationFrame(() => this.animate());
            } else {
                this.animId = null;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        },

        drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
            let rot = (Math.PI / 2) * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fill();
        }
    };

    window.Confetti = Confetti;
})();
