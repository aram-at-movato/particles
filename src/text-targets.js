export class TextTargetGen {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
    }

    generateTargets(text) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Responsive font size
        const fontSize = Math.min(this.width, this.height) * 0.25;
        this.ctx.font = `bold ${fontSize}px monospace`;
        this.ctx.fillText(text, this.width / 2, this.height / 2);

        const data = this.ctx.getImageData(0, 0, this.width, this.height).data;
        const targets = [];

        // Scan for pixel data
        const step = 8; // Density
        for (let y = 0; y < this.height; y += step) {
            for (let x = 0; x < this.width; x += step) {
                const index = (y * this.width + x) * 4;
                if (data[index + 3] > 128) { // Alpha > 128
                    targets.push({ x, y });
                }
            }
        }

        return targets;
    }
}
