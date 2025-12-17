export class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        // Random initial velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;

        this.hue = hue;
        this.size = Math.random() * 3 + 1;

        this.target = null; // {x, y}
    }

    update() {
        if (this.target) {
            // Seek Behavior
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                // Spring / Steering
                const force = 0.05;
                this.vx += dx * force * 0.1; // simple spring
                this.vy += dy * force * 0.1;

                // Strong Damping to stop at target
                this.vx *= 0.8;
                this.vy *= 0.8;
            }

            // Keep alive while targeted
            this.life = 1.0;

        } else {
            // Normal Flow Behavior
            // Friction
            this.vx *= 0.95;
            this.vy *= 0.95;

            this.life -= this.decay;
        }

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class ParticleSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.particles = [];
        this.hueCycle = 0;
        this.targets = null; // Array of {x, y}
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        // If targets exist, they need regeneration usually, but let's clear for now
        this.targets = null;
    }

    setMode(modeName, targetPoints = []) {
        if (modeName === 'TEXT') {
            this.targets = targetPoints;

            // Assign targets to existing particles
            // If not enough particles, spawn more!
            // If too many, some drift?

            // 1. Shuffle targets so filling looks organic
            const shuffledTargets = [...targetPoints].sort(() => Math.random() - 0.5);

            // Ensure enough particles
            while (this.particles.length < shuffledTargets.length) {
                this.particles.push(new Particle(Math.random() * this.width, Math.random() * this.height, this.hueCycle));
            }

            // Assign
            for (let i = 0; i < this.particles.length; i++) {
                if (i < shuffledTargets.length) {
                    this.particles[i].target = shuffledTargets[i];
                    // Change color to steady white/cyan for text? Or keep rainbow?
                    // Let's keep hue but make it bright
                    this.particles[i].hue = (this.hueCycle + i) % 360;
                } else {
                    this.particles[i].target = null; // Release extras
                }
            }

        } else {
            // FLOW Mode
            this.targets = null;
            for (const p of this.particles) {
                p.target = null;
            }
        }
    }

    addParticles(motionPoints) {
        // Only spawn from motion if we are NOT in text mode (targets differ)
        // Or allow mixing? Let's disable motion spawn if showing text for clarity.
        if (this.targets) return;

        const step = 4;
        for (let i = 0; i < motionPoints.length; i += step) {
            if (Math.random() > 0.9) {
                const p = motionPoints[i];
                this.particles.push(new Particle(p.x, p.y, this.hueCycle));
            }
        }

        this.hueCycle = (this.hueCycle + 0.5) % 360;
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();

            // Kill if dead AND NOT targeted
            if (p.life <= 0 && !p.target) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.globalCompositeOperation = 'lighter';
        for (const p of this.particles) {
            p.draw(ctx);
        }
        ctx.globalCompositeOperation = 'source-over';
    }
}
