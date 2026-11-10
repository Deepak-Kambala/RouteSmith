import json
import os
from typing import List, Dict, Any
from app.docs.flagsmith_docs import FLAGS_DOCS

CUSTOM_DOCS_FILE = os.path.join(os.path.dirname(__file__), "custom_docs.json")

class DocumentManager:
    def __init__(self):
        self.docs: List[Dict[str, Any]] = []
        self.load_docs()

    def load_docs(self):
        if os.path.exists(CUSTOM_DOCS_FILE):
            try:
                with open(CUSTOM_DOCS_FILE, "r", encoding="utf-8") as f:
                    self.docs = json.load(f)
                    return
            except Exception:
                pass
        self.docs = list(FLAGS_DOCS)

    def save_docs(self):
        try:
            with open(CUSTOM_DOCS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.docs, f, indent=2)
        except Exception:
            pass

    def get_all(self) -> List[Dict[str, Any]]:
        return self.docs

    def add_doc(self, title: str, content: str, category: str = "Custom Data") -> Dict[str, Any]:
        doc_id = f"custom_doc_{len(self.docs) + 1:03d}"
        new_doc = {
            "id": doc_id,
            "title": title,
            "category": category,
            "content": content
        }
        self.docs.insert(0, new_doc)
        self.save_docs()
        return new_doc

    def reset_to_defaults(self):
        self.docs = list(FLAGS_DOCS)
        if os.path.exists(CUSTOM_DOCS_FILE):
            os.remove(CUSTOM_DOCS_FILE)
        return self.docs

doc_manager = DocumentManager()
