import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

export interface Keypoint {
    x: number;
    y: number;
    score?: number;
    name?: string;
}

export interface Pose {
    keypoints: Keypoint[];
    score: number;
}

export class PostureDetector {
    detector: poseDetection.PoseDetector | null = null;
    isReady = false;

    async initialize() {
        try {
            await tf.ready();
            await tf.setBackend('webgl');

            const model = poseDetection.SupportedModels.MoveNet;
            // Use Lightning for speed on mobile/web
            const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
            this.detector = await poseDetection.createDetector(model, detectorConfig);
            this.isReady = true;
            console.log("MoveNet initialized successfully");
        } catch (error) {
            console.error("Failed to initialize MoveNet:", error);
            throw error;
        }
    }

    async estimatePoses(video: HTMLVideoElement): Promise<Pose[]> {
        if (!this.detector || !this.isReady) return [];

        try {
            const poses = await this.detector.estimatePoses(video, {
                maxPoses: 1,
                flipHorizontal: false
            });
            return poses as unknown as Pose[];
        } catch (error) {
            console.error("Pose detection error:", error);
            return [];
        }
    }

    calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
        if (!p1 || !p2 || !p3) return 0;

        const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) -
            Math.atan2(p1.y - p2.y, p1.x - p2.x);

        let angle = Math.abs(radians * 180.0 / Math.PI);

        if (angle > 180.0) {
            angle = 360 - angle;
        }

        return angle;
    }
}

export const postureDetector = new PostureDetector();
