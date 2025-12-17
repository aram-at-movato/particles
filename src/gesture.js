export class GestureClassifier {
    constructor() { }

    // Landmarks: 0-20. 
    // 8: Index tip, 12: Middle tip, 16: Ring tip, 20: Pinky tip
    // 5, 9, 13, 17 are MCP (knuckles)

    classify(landmarks) {
        if (!landmarks) return null;

        // Y coords: 0 is top, 1 is bottom.
        // Check if finger tip is higher (smaller y) than its base knuckle (MCP)
        const isFingerUp = (tipIdx, mcpIdx) => {
            return landmarks[tipIdx].y < landmarks[mcpIdx].y;
        };

        const indexUp = isFingerUp(8, 5);
        const middleUp = isFingerUp(12, 9);
        const ringUp = isFingerUp(16, 13);
        const pinkyUp = isFingerUp(20, 17);

        // Thumb: Compare Tip (4) to Index MCP (5). 
        // If tip is significantly above index knuckle, it's UP.
        // landmarks[4].y < landmarks[5].y
        const thumbUp = landmarks[4].y < landmarks[5].y;

        const fingerCount = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;

        // 1. LIKE (Thumb Up, others closed)
        // We explicitly check count === 0 (all main fingers closed)
        if (fingerCount === 0) {
            if (thumbUp) return "LIKE";
            return "POWER"; // Fist
        }

        // 2. FLOW (Open Palm)
        if (fingerCount === 4) return "FLOW";

        // 3. PEACE (Index + Middle)
        if (indexUp && middleUp && !ringUp && !pinkyUp) return "PEACE";

        // 4. ROCK vs LOVE
        // Both have Index + Pinky Up.
        // Love (ILY) has Thumb Up. Rock usually has Thumb tucked (or across).
        if (indexUp && pinkyUp && !middleUp && !ringUp) {
            if (thumbUp) return "LOVE"; // ILY
            return "ROCK";
        }

        return null;
    }
}
