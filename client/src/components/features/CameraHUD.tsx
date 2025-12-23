import { useRef, useEffect, useState } from "react";
import { postureDetector, type Pose } from "@/lib/ai/vision";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CameraHUDProps {
    onFeedback?: (feedback: string) => void;
}

export default function CameraHUD({ onFeedback }: CameraHUDProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [active, setActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [fps, setFps] = useState(0);
    const requestRef = useRef<number>();

    useEffect(() => {
        // Initialize detector on mount
        postureDetector.initialize().catch(err => console.error("Detector Init Failed", err));
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setActive(true);
                    detectLoop();
                };
            }
        } catch (err: any) {
            console.error("Camera Error:", err);
            setCameraError("Camera access denied or unavailable.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setActive(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    const detectLoop = async () => {
        if (!videoRef.current || !canvasRef.current || !active) return;

        // Performance measurement could go here
        const poses = await postureDetector.estimatePoses(videoRef.current);
        drawCanvas(poses);

        requestRef.current = requestAnimationFrame(detectLoop);
    };

    const drawCanvas = (poses: Pose[]) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx || !videoRef.current) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw Keypoints
        poses.forEach(pose => {
            pose.keypoints.forEach(kp => {
                if ((kp.score || 0) > 0.3) {
                    ctx.beginPath();
                    ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = "#00ff00";
                    ctx.fill();
                }
            });
        });
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <Card className="relative overflow-hidden rounded-xl bg-black border-none h-[400px] w-full flex items-center justify-center">
            {!active && !cameraError && (
                <div className="absolute z-10 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <Button size="lg" onClick={startCamera} className="bg-primary-main hover:bg-primary-hover text-black font-bold">
                            <Camera className="mr-2 h-5 w-5" />
                            Enable Smart Camera
                        </Button>
                        <p className="text-gray-400 mt-4 text-sm">Allow camera access for AI analysis</p>
                    </motion.div>
                </div>
            )}

            {cameraError && (
                <div className="absolute z-10 text-center text-red-500">
                    <p>{cameraError}</p>
                    <Button variant="ghost" className="mt-2" onClick={() => setCameraError(null)}>Retry</Button>
                </div>
            )}

            <video
                ref={videoRef}
                className="absolute w-full h-full object-cover"
                style={{ transform: "scaleX(-1)", opacity: active ? 1 : 0 }}
                playsInline
                muted
            />
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute w-full h-full pointer-events-none"
                style={{ transform: "scaleX(-1)" }}
            />

            {active && (
                <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-xs text-green-400 font-mono">
                    AI ACTIVE
                </div>
            )}
        </Card>
    );
}
