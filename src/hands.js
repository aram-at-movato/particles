export class HandTracker {
    constructor(videoElement) {
        this.video = videoElement;
        this.results = null;
        this.hands = new window.Hands({
            locateFile: (file) => {
                // Must point to the wasm files on CDN
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults(this.onResults.bind(this));

        this.lastVideoTime = 0;
    }

    onResults(results) {
        this.results = results;
    }

    async send(video) {
        // Only send if time has advanced (performance check)
        if (video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = video.currentTime;
            await this.hands.send({ image: video });
        }
    }
}
