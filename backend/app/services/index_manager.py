"""
FAISS Index Manager - handles building and querying the search index.
"""
import os
import pickle
import numpy as np
import faiss
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from loguru import logger

from app.config import get_settings

settings = get_settings()


class FAISSIndexManager:
    """Manage FAISS index operations - build, update, and search."""

    def __init__(
        self,
        index_path: str = None,
        metadata_path: str = None,
        features_dir: str = None,
    ):
        self.index_path = index_path or settings.INDEX_DIR + "/index.faiss"
        self.metadata_path = metadata_path or settings.INDEX_DIR + "/metadata.pkl"
        self.features_dir = features_dir or settings.FEATURES_DIR

        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        os.makedirs(self.features_dir, exist_ok=True)

        self._index = None
        self._metadata = None

    def _ensure_dir(self, path: str):
        os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)

    def load_index(self) -> faiss.Index:
        """Load FAISS index from disk."""
        if self._index is None:
            if not os.path.exists(self.index_path):
                raise FileNotFoundError(f"Index not found: {self.index_path}")
            self._index = faiss.read_index(self.index_path)
            logger.info(f"Loaded FAISS index with {self._index.ntotal} vectors")
        return self._index

    def load_metadata(self) -> List[Dict]:
        """Load metadata from disk."""
        if self._metadata is None:
            if not os.path.exists(self.metadata_path):
                raise FileNotFoundError(f"Metadata not found: {self.metadata_path}")
            with open(self.metadata_path, "rb") as f:
                self._metadata = pickle.load(f)
            logger.info(f"Loaded metadata with {len(self._metadata)} entries")
        return self._metadata

    def build_index(self, features_dir: str = None) -> Dict[str, Any]:
        """
        Build FAISS index from all .npy feature files.

        Returns:
            Statistics about the built index
        """
        features_dir = features_dir or self.features_dir

        all_features = []
        metadata = []

        npy_files = [
            f
            for f in os.listdir(features_dir)
            if f.endswith(".npy") and not f.startswith("._")
        ]

        if not npy_files:
            raise ValueError(f"No .npy files found in {features_dir}")

        logger.info(f"Building index from {len(npy_files)} feature files...")

        for fname in npy_files:
            video_id = fname.replace(".npy", "")
            feats = np.load(os.path.join(features_dir, fname))

            if feats.ndim == 1:
                feats = feats.reshape(1, -1)

            for i, feat in enumerate(feats):
                all_features.append(feat)
                metadata.append(
                    {
                        "video_id": video_id,
                        "frame_index": i,
                        "frame_name": f"frame_{i:06d}.jpg",
                    }
                )

        if not all_features:
            raise ValueError("No features loaded!")

        all_features = np.array(all_features, dtype=np.float32)
        dim = all_features.shape[1]

        logger.info(
            f"Building FAISS index with {len(all_features)} vectors (dim={dim})..."
        )

        # Use IndexFlatIP for cosine similarity (vectors are normalized)
        index = faiss.IndexFlatIP(dim)
        index.add(all_features)

        self._ensure_dir(self.index_path)
        faiss.write_index(index, self.index_path)

        with open(self.metadata_path, "wb") as f:
            pickle.dump(metadata, f)

        self._index = index
        self._metadata = metadata

        stats = {
            "total_vectors": index.ntotal,
            "total_videos": len(npy_files),
            "feature_dim": dim,
            "index_file": self.index_path,
            "metadata_file": self.metadata_path,
        }

        logger.info(f"Index built: {stats}")
        return stats

    def add_video_features(self, youtube_id: str, features_file: str) -> int:
        """
        Add a single video's features to the existing index.

        Returns:
            Number of vectors added
        """
        if not os.path.exists(features_file):
            raise FileNotFoundError(f"Features file not found: {features_file}")

        feats = np.load(features_file)
        if feats.ndim == 1:
            feats = feats.reshape(1, -1)

        index = self.load_index()
        metadata = self.load_metadata()

        start_idx = len(metadata)
        for i, feat in enumerate(feats):
            metadata.append(
                {
                    "video_id": youtube_id,
                    "frame_index": i,
                    "frame_name": f"frame_{i:06d}.jpg",
                }
            )

        index.add(feats)
        faiss.write_index(index, self.index_path)

        with open(self.metadata_path, "wb") as f:
            pickle.dump(metadata, f)

        self._metadata = metadata

        logger.info(f"Added {len(feats)} vectors for {youtube_id}")
        return len(feats)

    def search(
        self,
        query_features: np.ndarray,
        top_k: int = None,
        threshold: float = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar videos.

        Args:
            query_features: Query feature vectors (n x dim)
            top_k: Number of results per query frame
            threshold: Minimum similarity threshold

        Returns:
            Aggregated results by video
        """
        top_k = top_k or settings.TOP_K_RESULTS
        threshold = threshold or settings.SIMILARITY_THRESHOLD

        index = self.load_index()
        metadata = self.load_metadata()

        if query_features.ndim == 1:
            query_features = query_features.reshape(1, -1)

        results = {}
        for i, qf in enumerate(query_features):
            D, I = index.search(qf.reshape(1, -1), top_k)

            for sim, idx in zip(D[0], I[0]):
                if idx >= 0 and sim >= threshold:
                    meta = metadata[idx]
                    video_id = meta["video_id"]

                    if video_id not in results:
                        results[video_id] = []

                    results[video_id].append(
                        {
                            "query_frame": i,
                            "match_frame": meta["frame_index"],
                            "similarity": float(sim),
                        }
                    )

        # Aggregate by video
        aggregated = []
        for video_id, matches in results.items():
            avg_sim = np.mean([m["similarity"] for m in matches])
            max_sim = max(m["similarity"] for m in matches)
            aggregated.append(
                {
                    "video_id": video_id,
                    "num_matches": len(matches),
                    "avg_similarity": float(avg_sim),
                    "max_similarity": float(max_sim),
                    "frame_matches": matches[:20],  # Limit detailed matches
                }
            )

        # Sort by match count, then similarity
        aggregated.sort(
            key=lambda x: (x["num_matches"], x["avg_similarity"]),
            reverse=True,
        )

        return aggregated

    def get_index_stats(self) -> Dict[str, Any]:
        """Get current index statistics."""
        if self._index is None:
            try:
                self.load_index()
            except FileNotFoundError:
                return {"exists": False}

        return {
            "exists": True,
            "total_vectors": self._index.ntotal,
            "feature_dim": self._index.d,
            "metadata_entries": len(self.load_metadata()),
            "index_file": self.index_path,
            "file_size_mb": os.path.getsize(self.index_path) / (1024 * 1024)
            if os.path.exists(self.index_path)
            else 0,
        }

    def reset_index(self):
        """Delete and reset the index."""
        for path in [self.index_path, self.metadata_path]:
            if os.path.exists(path):
                os.remove(path)
        self._index = None
        self._metadata = None
        logger.info("Index reset")
