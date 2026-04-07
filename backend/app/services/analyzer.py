"""
Video analysis service - frame extraction, encoding, and AI detection.
"""
import os
import cv2
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms
from pathlib import Path
from typing import List, Tuple, Optional, Dict, Any
from tqdm import tqdm
from loguru import logger

from app.config import get_settings

settings = get_settings()


class FrameExtractor:
    """Extract frames from video files."""

    @staticmethod
    def extract(
        video_path: str,
        output_dir: str,
        frame_interval: int = None,
    ) -> int:
        """
        Extract frames from a video at regular intervals.

        Args:
            video_path: Path to video file
            output_dir: Directory to save frames
            frame_interval: Extract every N frames (default from settings)

        Returns:
            Number of frames extracted
        """
        frame_interval = frame_interval or settings.FRAME_INTERVAL
        os.makedirs(output_dir, exist_ok=True)

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        count = 0
        saved = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if count % frame_interval == 0:
                out_path = os.path.join(output_dir, f"frame_{saved:06d}.jpg")
                cv2.imwrite(out_path, frame)
                saved += 1
            count += 1

        cap.release()
        logger.info(f"Extracted {saved} frames from {video_path}")
        return saved


class FeatureEncoder:
    """Encode image frames to feature vectors using ResNet50."""

    def __init__(self):
        self._model = None
        self._feature_extractor = None
        self._preprocess = None

    def _load_model(self):
        """Lazy load the model."""
        if self._model is not None:
            return

        logger.info("Loading ResNet50 model...")
        self._model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
        self._feature_extractor = nn.Sequential(*list(self._model.children())[:-1])
        self._feature_extractor.eval()

        self._preprocess = transforms.Compose(
            [
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )
        logger.info("ResNet50 model loaded")

    def encode_image(self, image_path: str) -> np.ndarray:
        """Encode a single image to a feature vector."""
        self._load_model()

        image = Image.open(image_path).convert("RGB")
        input_tensor = self._preprocess(image).unsqueeze(0)

        with torch.no_grad():
            features = self._feature_extractor(input_tensor)
            features = features.squeeze()
            features = features / features.norm(p=2)

        return features.numpy()

    def encode_frames(
        self,
        frames_dir: str,
        output_npy: str,
    ) -> Tuple[np.ndarray, int]:
        """
        Encode all frames in a directory to a numpy array.

        Returns:
            (features_array, frame_count)
        """
        self._load_model()

        features = []
        frame_files = sorted(
            [
                f
                for f in os.listdir(frames_dir)
                if f.endswith((".jpg", ".jpeg", ".png")) and not f.startswith("._")
            ]
        )

        logger.info(f"Encoding {len(frame_files)} frames...")
        for fname in tqdm(frame_files, desc="Encoding frames"):
            path = os.path.join(frames_dir, fname)
            try:
                feat = self.encode_image(path)
                features.append(feat)
            except Exception as e:
                logger.warning(f"Could not encode {fname}: {e}")

        if not features:
            raise ValueError("No features extracted!")

        features_array = np.array(features, dtype=np.float32)
        os.makedirs(os.path.dirname(output_npy), exist_ok=True)
        np.save(output_npy, features_array)

        logger.info(
            f"Saved {len(features)} feature vectors ({features_array.shape}) to {output_npy}"
        )
        return features_array, len(features)


class AIDetector:
    """Heuristic AI/CGI detection for videos."""

    @staticmethod
    def analyze_video(video_path: str, sample_rate: int = 30) -> Dict[str, Any]:
        """
        Analyze video for AI/CGI indicators.

        Returns:
            Dictionary with detection results
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)

        # Sample frames
        sample_frames = []
        count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if count % sample_rate == 0:
                sample_frames.append(frame)
            count += 1
        cap.release()

        if not sample_frames:
            return {"error": "No frames sampled", "ai_probability": 0.0}

        # Analyze each frame
        results = []
        for i, frame in enumerate(sample_frames):
            analysis = AIDetector._analyze_frame(frame)
            results.append(analysis)

        # Aggregate
        avg_color_entropy = np.mean([r["color_entropy"] for r in results])
        avg_edge_density = np.mean([r["edge_density"] for r in results])
        avg_frequency_energy = np.mean([r["frequency_energy"] for r in results])

        # Heuristic scoring
        ai_score = AIDetector._compute_ai_score(
            avg_color_entropy, avg_edge_density, avg_frequency_energy
        )

        return {
            "ai_probability": ai_score,
            "is_likely_ai": ai_score > 0.7,
            "frames_analyzed": len(sample_frames),
            "total_frames": total_frames,
            "fps": fps,
            "metrics": {
                "avg_color_entropy": float(avg_color_entropy),
                "avg_edge_density": float(avg_edge_density),
                "avg_frequency_energy": float(avg_frequency_energy),
            },
            "interpretation": AIDetector._interpret_score(ai_score),
        }

    @staticmethod
    def _analyze_frame(frame: np.ndarray) -> Dict[str, float]:
        """Analyze a single frame for AI indicators."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Color entropy
        color_entropy = AIDetector._compute_color_entropy(frame)

        # Edge density
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])

        # Frequency analysis (DCT)
        frequency_energy = AIDetector._compute_frequency_energy(gray)

        return {
            "color_entropy": color_entropy,
            "edge_density": edge_density,
            "frequency_energy": frequency_energy,
        }

    @staticmethod
    def _compute_color_entropy(frame: np.ndarray) -> float:
        """Compute color distribution entropy."""
        hist = cv2.calcHist([frame], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        hist = hist.flatten()
        hist = hist / (hist.sum() + 1e-7)
        entropy = -np.sum(hist * np.log2(hist + 1e-7))
        return float(entropy)

    @staticmethod
    def _compute_frequency_energy(gray: np.ndarray) -> float:
        """Compute frequency domain energy (for GAN artifact detection)."""
        dct = cv2.dct(np.float32(gray))
        # Ignore DC component
        energy = np.sum(np.abs(dct[1:, 1:]) ** 2)
        return float(energy)

    @staticmethod
    def _compute_ai_score(
        color_entropy: float,
        edge_density: float,
        frequency_energy: float,
    ) -> float:
        """
        Compute AI probability score from frame metrics.
        Returns 0.0 to 1.0.
        """
        # Heuristic thresholds (tuned on known AI vs real videos)
        score = 0.0

        # AI videos often have unnaturally smooth color distributions
        if color_entropy < 5.0:
            score += 0.3

        # AI videos may have unusual edge patterns
        if edge_density < 0.05 or edge_density > 0.4:
            score += 0.3

        # GAN artifacts in frequency domain
        if frequency_energy < 1e6:
            score += 0.4

        return min(score, 1.0)

    @staticmethod
    def _interpret_score(score: float) -> str:
        """Interpret AI probability score."""
        if score > 0.8:
            return "Very likely AI-generated"
        elif score > 0.6:
            return "Likely AI-generated"
        elif score > 0.4:
            return "Uncertain - may contain AI/CGI elements"
        elif score > 0.2:
            return "Likely real footage"
        else:
            return "Very likely real footage"


class VideoAnalyzer:
    """Main service orchestrating video analysis."""

    def __init__(self):
        self.frame_extractor = FrameExtractor()
        self.feature_encoder = FeatureEncoder()
        self.ai_detector = AIDetector()

    def analyze_video_full(
        self,
        video_path: str,
        youtube_id: str,
        frames_dir: str = None,
        features_dir: str = None,
        frame_interval: int = None,
    ) -> Dict[str, Any]:
        """
        Complete video analysis pipeline.

        Returns:
            Dictionary with all analysis results
        """
        frames_dir = frames_dir or os.path.join(settings.FRAMES_DIR, youtube_id)
        features_file = os.path.join(settings.FEATURES_DIR, f"{youtube_id}.npy")

        results = {
            "youtube_id": youtube_id,
            "frame_extraction": {},
            "feature_encoding": {},
            "ai_detection": {},
        }

        # Step 1: Extract frames
        logger.info(f"Extracting frames from {youtube_id}...")
        frame_count = self.frame_extractor.extract(
            video_path, frames_dir, frame_interval
        )
        results["frame_extraction"] = {
            "frames_extracted": frame_count,
            "frames_dir": frames_dir,
        }

        # Step 2: Encode frames
        logger.info(f"Encoding frames for {youtube_id}...")
        features_array, feat_count = self.feature_encoder.encode_frames(
            frames_dir, features_file
        )
        results["feature_encoding"] = {
            "features_count": feat_count,
            "feature_shape": list(features_array.shape),
            "features_file": features_file,
        }

        # Step 3: AI detection
        logger.info(f"Running AI detection on {youtube_id}...")
        ai_results = self.ai_detector.analyze_video(video_path)
        results["ai_detection"] = ai_results

        return results
