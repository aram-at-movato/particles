export class GestureClassifier {
    constructor() { }

    // Landmarks: 0-20. 
    // 8: Index tip, 12: Middle tip, 16: Ring tip, 20: Pinky tip
    // 5, 9, 13, 17 are MCP (knuckles)

    classify(landmarks) {
        if (!landmarks) return null;

        const isFingerUp = (tipIdx, mcpIdx) => {
            return landmarks[tipIdx].y < landmarks[mcpIdx].y; // y is 0 at top
        };

        // Check main fingers
        const indexUp = isFingerUp(8, 5);
        const middleUp = isFingerUp(12, 9);
        const ringUp = isFingerUp(16, 13);
        const pinkyUp = isFingerUp(20, 17);

        // Thumb is tricky (x usage?), let's simplify usage
        // Thumb tip 4, IP 3.
        // just check y for now or skip thumb for robustness

        const count = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

        // Peace: Index + Middle
        if (indexUp && middleUp && !ringUp && !pinkyUp) return "PEACE";

        // Open Palm: All 4 (thumb usually out too)
        if (count === 4) return "FLOW";

        // Fist: All down
        if (count === 0) return "POWER";

        // Rock: Index + Pinky
        if (indexUp && pinkyUp && !middleUp && !ringUp) return "ROCK";

        // Love (ILY): Thumb, Index, Pinky (We ignored thumb check earlier but assumed it based on others)
        // Actually need thumb for ILY vs Rock.
        // Let's assume thumb is up for ILY.
        // If Index + Pinky up, it could be Rock or Love.
        // Let's differentiate: Rock is aggressive, Love is inclusive.
        // Since thumb is hard to track with simple Y-checks (it moves X), let's skip strict thumb check for now
        // and just reuse Rock for Love or add distinct?
        // "OK" sign? (Thumb + Index touching).
        // Let's try standard ILY (Thumb+Index+Pinky).
        // Since we aren't checking thumb, Rock == ILY roughly. 
        // Let's assign Index+Pinky to "LOVE" instead of Rock for positive vibes?
        // Or check Thumb x-position?

        // Thumbs Up: All fingers down except thumb?
        // We detected count===0 as Fist. 
        // If count === 0, it might be thumbs up if thumb is high.
        // Let's check thumb tip vs index MCP. 
        // Thumb tip (4) < Index MCP (5)? (Remember y=0 is top)
        const thumbUp = landmarks[4].y < landmarks[5].y;

        if (count === 0) {
            if (thumbUp) return "LIKE";
            return "POWER";
        }

        // Update Rock/Love logic
        if (indexUp && pinkyUp && !middleUp && !ringUp) {
            // If thumb is out (x distance form index mcp?), it's Love.
            // If thumb is in (across fingers), it's Rock.
            // Hard to do reliably with 2D heuristics.
            // Let's just make it LOVE.
            return "LOVE";
        }

        return null;
    }
}
