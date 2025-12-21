
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function PanicPanel() {
    const costOfInaction = "R$ 340,00";
    const hoursSaved = 4;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full"
        >
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="ml-2">
                    <AlertTitle className="text-red-400 font-bold flex items-center gap-2">
                        CUSTO DA INAÇÃO DETECTADO
                        <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full animate-pulse border border-red-500/30">
                            URGENTE
                        </span>
                    </AlertTitle>
                    <AlertDescription className="text-red-200/80 mt-1 text-sm font-medium">
                        <p>
                            Sua automação economizou <span className="text-white font-bold">{hoursSaved}h</span> hoje.
                            Se você pausar a streak agora, a projeção de perda é de <span className="text-white font-bold underline decoration-red-500 underline-offset-4">{costOfInaction}</span> para este ciclo.
                        </p>
                    </AlertDescription>
                </div>
            </Alert>
        </motion.div>
    );
}
