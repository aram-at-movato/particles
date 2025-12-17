export class MotionDetector {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Downsample for performance (e.g. check every 10th pixel roughly, by scaling down)
        // Actually, let's use a small offscreen canvas for the diffing
        this.scale = 0.1; // 1/10th size
        this.w = Math.floor(this.width * this.scale);
        this.h = Math.floor(this.height * this.scale);

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        this.prevFrame = null;
    }

    detect(video) {
        // Draw current video frame to smaller canvas
        this.ctx.drawImage(video, 0, 0, this.w, this.h);

        const frameData = this.ctx.getImageData(0, 0, this.w, this.h);
        const data = frameData.data;
        const len = data.length;

        const motionPoints = [];

        // If we have a previous frame, compare
        if (this.prevFrame) {
            // Loop through pixels (R G B A)
            for (let i = 0; i < len; i += 4) {
                // Simple luminance diff or just raw difference
                const rDiff = Math.abs(data[i] - this.prevFrame[i]);
                const gDiff = Math.abs(data[i + 1] - this.prevFrame[i + 1]);
                const bDiff = Math.abs(data[i + 2] - this.prevFrame[i + 2]);

                if (rDiff + gDiff + bDiff > 100) { // Threshold
                    // Map back to screen coordinates
                    const pixelIndex = i / 4;
                    const x = (pixelIndex % this.w) / this.scale;
                    const y = Math.floor(pixelIndex / this.w) / this.scale;

                    // Add some randomness to spread them out a bit or just push the center
                    motionPoints.push({ x, y });
                }
            }
        }

        // Store current frame for next loop
        this.prevFrame = data; // Note: this is a Uint8ClampedArray ref. 
        // Wait, getImageData returns a new object every time, so keeping 'data' is fine.
        // However, fast rendering browsers might recycle the buffer if we aren't careful?
        // standard 'getImageData' returns a copy so it should be safe.
        // To be super safe and memory efficient we could flip-flop buffers but this is JS.
        // Actually, let's just keep it simple.

        return motionPoints;
    }
}
