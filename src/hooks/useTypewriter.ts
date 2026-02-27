import { useState, useEffect } from "react";

type Phase = "typing" | "waiting" | "deleting";

export function useTypewriter(phrases: string[], typeSpeed = 50, deleteSpeed = 30, pauseDuration = 1200) {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [phase, setPhase] = useState<Phase>("typing");

    useEffect(() => {
        if (phrases.length === 0) return;

        let timeoutId: NodeJS.Timeout;
        const currentFullText = phrases[currentPhraseIndex];

        switch (phase) {
            case "typing": {
                if (currentText.length < currentFullText.length) {
                    timeoutId = setTimeout(() => {
                        setCurrentText(currentFullText.slice(0, currentText.length + 1));
                    }, typeSpeed);
                } else {
                    // Immediately enter waiting phase when finished typing
                    timeoutId = setTimeout(() => {
                        setPhase("waiting");
                    }, 0);
                }
                break;
            }
            case "waiting": {
                const dotCount = currentText.length - currentFullText.length;
                if (dotCount < 3) {
                    // Append a dot every quarter of the pause duration
                    timeoutId = setTimeout(() => {
                        setCurrentText(currentFullText + ".".repeat(dotCount + 1));
                    }, pauseDuration / 4);
                } else {
                    // After 3 dots, wait one last quarter then begin deleting
                    timeoutId = setTimeout(() => {
                        setPhase("deleting");
                    }, pauseDuration / 4);
                }
                break;
            }
            case "deleting": {
                if (currentText.length > 0) {
                    timeoutId = setTimeout(() => {
                        setCurrentText((prev) => prev.slice(0, -1)); // Safely slice off the dots and text
                    }, deleteSpeed);
                } else {
                    // Immediately skip to typing next phrase once empty
                    setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
                    setPhase("typing");
                }
                break;
            }
        }

        return () => clearTimeout(timeoutId);
    }, [currentText, phase, currentPhraseIndex, phrases, typeSpeed, deleteSpeed, pauseDuration]);

    return currentText;
}
