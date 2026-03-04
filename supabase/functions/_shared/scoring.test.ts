import { scoreBlueprint, ScoringInput } from "./scoring";

console.log("Stress Testing `scoring.ts` under Node.js runtime...");

try {
    const malformedInput = {
        discovery: null,
        design: "not an object",
        deliver: [],
        references_count: -5,
        dream_intent: null,
        first_name: undefined,
        last_name: null,
        user_email: 12345,
        business_name: NaN
    } as unknown as ScoringInput;

    const result = scoreBlueprint(malformedInput);

    if (typeof result.complexity_score !== "number" || typeof result.integrity_score !== "number") {
        throw new Error("Invalid output types!");
    }

    console.log("✅ Stress test passed! Result:", result);
} catch (err) {
    console.error("❌ Scoring engine crashed under stress test:", err);
    process.exit(1);
}

try {
    const partialInput = {
        discovery: { brandVoice: null },
        design: {},
        deliver: { pages: "10" },
        references_count: NaN,
        dream_intent: "",
        first_name: "John",
        last_name: "Doe",
        user_email: "test@example.com",
        business_name: null
    } as unknown as ScoringInput;

    const result = scoreBlueprint(partialInput);
    if (Number.isNaN(result.complexity_score) || Number.isNaN(result.integrity_score)) {
        throw new Error("Output yielded NaN!");
    }
    console.log("✅ Partial data test passed! Result:", result);
} catch (err) {
    console.error("❌ Partial data test crashed:", err);
    process.exit(1);
}
