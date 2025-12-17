export class Webcam {
    constructor(videoElement) {
        this.video = videoElement;
        this.width = 0;
        this.height = 0;
        this.isReady = false;
    }

    async init() {
        console.log("Webcam.init() called");
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("navigator.mediaDevices.getUserMedia is not supported");
            alert("Your browser does not support camera access or is not in a secure context.");
            return false;
        }

        try {
            console.log("Requesting user media...");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 60 }
                },
                audio: false
            });
            console.log("Stream acquired", stream);
            this.video.srcObject = stream;

            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    console.log("Video metadata loaded");
                    this.width = this.video.videoWidth;
                    this.height = this.video.videoHeight;
                    this.video.play();
                    this.isReady = true;
                    resolve(true);
                };
            });
        } catch (e) {
            console.error("Error accessing webcam details:", e);
            alert("Error accessing webcam: " + e.message);
            return false;
        }
    }
}
