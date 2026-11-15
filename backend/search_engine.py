"""
SearchForge Search Engine
Implements BM25Okapi Lexical Search, TruncatedSVD Dense Semantic Search,
and Reciprocal Rank Fusion (RRF) with sub-5ms local CPU execution.
"""

import re
import time
import numpy as np
from typing import List, Dict, Any, Tuple
from rank_bm25 import BM25Okapi
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD

from corpus import DOCUMENTS

class SearchEngine:
    def __init__(self):
        self.documents = DOCUMENTS
        self._init_bm25()
        self._init_dense_semantic()

    def _tokenize(self, text: str) -> List[str]:
        """Preserves code symbols, underscores, and words for developer search."""
        return re.findall(r"[A-Za-z0-9_]+|[\.\(\)\[\]\-\>:]+", text.lower())

    def _init_bm25(self):
        """Initializes BM25Okapi inverted index over the 40-doc developer corpus."""
        corpus_texts = [
            f"{doc['title']} {doc['text']} {doc['snippet']} {' '.join(doc['tags'])}"
            for doc in self.documents
        ]
        self.tokenized_corpus = [self._tokenize(text) for text in corpus_texts]
        self.bm25 = BM25Okapi(self.tokenized_corpus)

    def _init_dense_semantic(self):
        """
        Fits TF-IDF (1,2 n-grams) + TruncatedSVD (32 components) with L2 normalization.
        Enables sub-2ms dense cosine similarity on CPU without external model weights.
        """
        corpus_texts = [
            f"{doc['title']} {doc['text']} {doc['snippet']} {' '.join(doc['tags'])}"
            for doc in self.documents
        ]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=1000)
        tfidf_matrix = self.vectorizer.fit_transform(corpus_texts)

        # 32-component latent semantic representation
        self.svd = TruncatedSVD(n_components=32, random_state=42)
        dense_raw = self.svd.fit_transform(tfidf_matrix)

        # L2 unit normalization for direct dot-product cosine similarity
        norms = np.linalg.norm(dense_raw, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        self.doc_embeddings = dense_raw / norms

    def _detect_code_intent(self, query: str) -> bool:
        """Detects if query contains code syntax, method calls, or snake_case."""
        return bool(re.search(r"[_().:\[\]\->']", query)) or any(
            token in query.lower() for token in ["get_", "set_", "api", "key", "def", "import", "class"]
        )

    def search(
        self,
        query: str,
        variant: str = "hybrid_rrf",
        alpha: float = 0.45,
        rrf_k: int = 60,
        code_boost: float = 1.35,
        simulate_latency: bool = False
    ) -> Dict[str, Any]:
        """
        Executes query retrieval through the selected algorithm variant
        and calculates rank fusion diffs across BM25 and Dense pipelines.
        """
        t0 = time.perf_counter()

        if simulate_latency:
            time.sleep(0.085)  # Simulate 85ms synthetic latency spike

        tokenized_query = self._tokenize(query)
        if not tokenized_query:
            tokenized_query = ["search"]

        # 1. Lexical BM25 Ranking
        bm25_scores = self.bm25.get_scores(tokenized_query)
        bm25_ranked_indices = np.argsort(bm25_scores)[::-1]
        
        # Map doc_id -> 1-based rank
        bm25_ranks: Dict[int, int] = {}
        for rank, idx in enumerate(bm25_ranked_indices, start=1):
            bm25_ranks[idx] = rank

        # 2. Dense Semantic Ranking
        query_tfidf = self.vectorizer.transform([query])
        query_dense = self.svd.transform(query_tfidf)
        q_norm = np.linalg.norm(query_dense)
        if q_norm > 0:
            query_dense = query_dense / q_norm

        dense_scores = np.dot(self.doc_embeddings, query_dense.T).flatten()
        dense_ranked_indices = np.argsort(dense_scores)[::-1]

        dense_ranks: Dict[int, int] = {}
        for rank, idx in enumerate(dense_ranked_indices, start=1):
            dense_ranks[idx] = rank

        # 3. Reciprocal Rank Fusion (RRF) Calculation
        has_code = self._detect_code_intent(query)
        effective_code_boost = code_boost if has_code else 1.0

        rrf_scores = []
        doc_details = []

        for idx, doc in enumerate(self.documents):
            r_bm25 = bm25_ranks[idx]
            r_dense = dense_ranks[idx]

            lex_contrib = alpha / (rrf_k + r_bm25)
            dense_contrib = ((1.0 - alpha) * effective_code_boost) / (rrf_k + r_dense)
            total_rrf = lex_contrib + dense_contrib

            # Percent contributions
            denom = lex_contrib + dense_contrib
            lex_pct = int(round((lex_contrib / denom) * 100)) if denom > 0 else 50
            dense_pct = 100 - lex_pct

            rrf_scores.append((total_rrf, idx, r_bm25, r_dense, lex_pct, dense_pct))

        # Sort according to active variant
        if variant == "lexical_bm25":
            ordered_indices = [(bm25_scores[idx], idx) for idx in bm25_ranked_indices]
        elif variant == "semantic_dense":
            ordered_indices = [(dense_scores[idx], idx) for idx in dense_ranked_indices]
        else:  # hybrid_rrf
            rrf_sorted = sorted(rrf_scores, key=lambda x: x[0], reverse=True)
            ordered_indices = [(item[0], item[1]) for item in rrf_sorted]

        # Build top 3 results
        top_results = []
        for rrf_rank, (score, doc_idx) in enumerate(ordered_indices[:3], start=1):
            doc = self.documents[doc_idx]
            r_bm25 = bm25_ranks[doc_idx]
            r_dense = dense_ranks[doc_idx]
            
            # Find precomputed contribution percentages
            matched_rrf = next((item for item in rrf_scores if item[1] == doc_idx), None)
            lex_pct = matched_rrf[4] if matched_rrf else 50
            dense_pct = matched_rrf[5] if matched_rrf else 50

            top_results.append({
                "id": doc["id"],
                "title": doc["title"],
                "category": doc["category"],
                "snippet": doc["snippet"],
                "text": doc["text"],
                "tags": doc["tags"],
                "bm25_rank": r_bm25,
                "dense_rank": r_dense,
                "final_rank": rrf_rank,
                "score": round(float(score), 4),
                "lexical_pct": lex_pct,
                "dense_pct": dense_pct
            })

        elapsed_ms = round((time.perf_counter() - t0) * 1000.0, 2)

        return {
            "query": query,
            "variant": variant,
            "has_code_tokens": has_code,
            "latency_ms": elapsed_ms,
            "results": top_results
        }

search_engine = SearchEngine()
