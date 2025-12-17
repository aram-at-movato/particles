import './style.css'
import { Webcam } from './webcam.js';
import { MotionDetector } from './motion.js';
import { ParticleSystem } from './particles.js';
import { HandTracker } from './hands.js';
import { GestureClassifier } from './gesture.js';
import { TextTargetGen } from './text-targets.js';

async function main() {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let particles;
  let motion;
  let textGen;
  let currentGesture = null;

  // Fullscreen canvas
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (particles) particles.resize(canvas.width, canvas.height);
    if (textGen) textGen = new TextTargetGen(canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);

  // Initialize Modules
  console.log("Initializing Webcam...");
  const webcam = new Webcam(video);
  const success = await webcam.init();

  if (!success) {
    console.error("Webcam init failed");
    alert("Failed to access camera. Check console/permissions.");
    return;
  }

  console.log("Webcam ready:", webcam.width, webcam.height);

  motion = new MotionDetector(webcam.width, webcam.height);
  particles = new ParticleSystem(canvas.width, canvas.height);
  textGen = new TextTargetGen(canvas.width, canvas.height);

  console.log("Initializing Hands...");
  const handTracker = new HandTracker(video);
  const classifier = new GestureClassifier();

  // Resize once to be sure
  resize();

  // Main Loop
  async function loop() {
    // Hypnotic Trails: Draw semi-transparent black rect instead of clearRect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 0. Hand Tracking
    // Note: sending to MP Hands is async and expensive if done every frame. 
    // HandTracker handles checks but 'await' might block logic?
    // Usually standard to run it.
    await handTracker.send(webcam.video);

    let detectedGesture = null;
    if (handTracker.results && handTracker.results.multiHandLandmarks && handTracker.results.multiHandLandmarks.length > 0) {
      // Analyze first hand
      detectedGesture = classifier.classify(handTracker.results.multiHandLandmarks[0]);
    }

    // State machine for gestures
    if (detectedGesture !== currentGesture) {
      currentGesture = detectedGesture;
      console.log("Gesture Detected:", currentGesture);

      if (currentGesture) {
        // Generate targets for this word
        const targets = textGen.generateTargets(currentGesture);
        particles.setMode('TEXT', targets);
      } else {
        // Lost gesture -> Back to flow
        particles.setMode('FLOW');
      }
    }

    // 1. Detect Motion (Only if NO gesture is active logic? Or always?)
    // If Text Mode is active, we basically ignore motion spawning in particle system anyway
    // We need to map video coordinates to canvas coordinates effectively if we want 1:1 interaction
    // Since video is usually 4:3 and screen is whatever, we might need scaling logic.
    // For now, let's just mirror the video to the canvas size or center it.
    // Actually, the motion detector works in video space (640x480).
    // We need to map those points to the canvas dimensions.

    const rawMotion = motion.detect(webcam.video);

    // Transform motion points to screen space
    const scaleX = canvas.width / webcam.width;
    const scaleY = canvas.height / webcam.height;

    // To keep aspect ratio correct, we should do 'contain' or 'cover' logic,
    // but users asked for "responsive", usually filling the screen is best for this effect.
    // Let's stretch for full immersion (it's abstract particles anyway).
    // BUT we need to mirror interaction horizontally because it's a webcam (mirror effect).

    const mappedMotion = rawMotion.map(p => ({
      x: (webcam.width - p.x) * scaleX, // Mirroring x
      y: p.y * scaleY
    }));

    // 2. Update Particles
    particles.addParticles(mappedMotion);
    particles.update();

    // 3. Draw
    particles.draw(ctx);

    requestAnimationFrame(loop);
  }

  loop();
}

main();
