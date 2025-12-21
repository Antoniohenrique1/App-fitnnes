
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MatrixLoaderProps {
    onComplete?: () => void;
    messages?: string[];
}

export function MatrixLoader({ onComplete, messages }: MatrixLoaderProps) {
    const defaultMessages = [
        "Conectando ao córtex neural...",
        "Analisando biometria do aluno...",
        "Acessando banco de hipertrofia avançada (RIR-Based)...",
        "Detectando fadiga muscular nos check-ins recentes...",
        "Otimizando descanso para evitar catabolismo...",
        "PLANO GERADO COM SUCESSO."
    ];

    const finalMessages = messages || defaultMessages;
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < finalMessages.length) {
            if (navigator.vibrate) navigator.vibrate(10); // Haptic feedback subtle
            const timeout = setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 800 + Math.random() * 1000); // Random delay between 0.8s and 1.8s
            return () => clearTimeout(timeout);
        } else {
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Success pattern
            setTimeout(() => {
                onComplete?.();
            }, 1000);
        }
    }, [currentIndex, finalMessages, onComplete]);

    return (
        <div className="fixed inset-0 z-50 bg-black font-mono text-green-500 p-8 flex flex-col justify-end pb-20 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />
            <div className="z-10 max-w-2xl mx-auto w-full">
                {finalMessages.slice(0, currentIndex + 1).map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-2 text-sm md:text-base"
                    >
                        <span className="mr-2 text-green-700">{">"}</span>
                        {msg}
                        {i === currentIndex && i < finalMessages.length - 1 && (
                            <span className="animate-pulse ml-1">_</span>
                        )}
                    </motion.div>
                ))}
                {currentIndex >= finalMessages.length && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className="mt-4 text-green-400 font-bold"
                    >
                        SISTEMA PRONTO. ACESSANDO...
                    </motion.div>
                )}
            </div>
        </div>
    );
}
