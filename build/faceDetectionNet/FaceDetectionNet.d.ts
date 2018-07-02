import * as tf from '@tensorflow/tfjs-core';
import { NetInput } from '../NetInput';
import { TNetInput } from '../types';
import { FaceDetection } from './FaceDetection';
export declare class FaceDetectionNet {
    private _params;
    load(weightsOrUrl?: Float32Array | string): Promise<void>;
    extractWeights(weights: Float32Array): void;
    forwardInput(input: NetInput): {
        boxes: tf.Tensor<tf.Rank.R2>[];
        scores: tf.Tensor<tf.Rank.R1>[];
    };
    forward(input: TNetInput): Promise<{
        boxes: tf.Tensor<tf.Rank.R2>[];
        scores: tf.Tensor<tf.Rank.R1>[];
    }>;
    locateFaces(input: TNetInput, minConfidence?: number, maxResults?: number): Promise<FaceDetection[]>;
}
