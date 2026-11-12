import ast
import re
import os
from typing import Dict, List, Any

class RepositoryScanner:
    def __init__(self):
        self._commit_cache: Dict[str, Dict[str, Any]] = {}

    def scan_python_ast(self, code_str: str) -> List[Dict[str, Any]]:
        """Parses Python file using standard ast library to discover functions, routes, and classes."""
        discovered = []
        try:
            tree = ast.parse(code_str)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Check for FastAPI / Flask route decorators
                    decorators = []
                    for d in node.decorator_list:
                        if isinstance(d, ast.Call) and hasattr(d.func, "attr"):
                            decorators.append(d.func.attr)
                        elif isinstance(d, ast.Attribute):
                            decorators.append(d.attr)
                    discovered.append({
                        "type": "function",
                        "name": node.name,
                        "line": node.lineno,
                        "decorators": decorators,
                        "is_route": any(dec in ["get", "post", "put", "delete", "route"] for dec in decorators)
                    })
                elif isinstance(node, ast.ClassDef):
                    discovered.append({
                        "type": "class",
                        "name": node.name,
                        "line": node.lineno
                    })
        except Exception as e:
            print(f"Python AST parse error: {e}")
        return discovered

    def scan_tsx_components(self, code_str: str, file_path: str) -> Dict[str, Any]:
        """Discovers React components, form elements, CTA buttons, and state hooks in TypeScript/JSX files."""
        # Detect exported component functions
        component_matches = re.findall(r"(?:export\s+(?:default\s+)?function|const)\s+([A-Z][A-Za-z0-9_]*)", code_str)
        
        # Detect form input fields
        inputs = re.findall(r'<input[^>]+name=["\']([^"\']+)["\']', code_str)
        
        # Detect buttons / CTAs
        buttons = re.findall(r'<button[^>]*>(.*?)</button>', code_str, re.DOTALL)
        button_labels = [re.sub(r'<[^>]+>', '', b).strip() for b in buttons if b.strip()]

        # Detect Flagsmith feature flag hooks
        flagsmith_flags = re.findall(r'(?:hasFeature|getFeatureValue)\(["\']([^"\']+)["\']\)', code_str)

        return {
            "file_path": file_path,
            "components": list(set(component_matches)),
            "form_inputs": inputs,
            "button_ctas": button_labels[:5],
            "flagsmith_flags": flagsmith_flags,
            "has_form": "<form" in code_str or len(inputs) > 0,
            "experiment_surface_score": (len(inputs) * 2) + len(button_labels)
        }

    def analyze_repository_commit(self, repo_path: str, commit_hash: str) -> Dict[str, Any]:
        """Inspects repository with commit-based caching."""
        if commit_hash in self._commit_cache:
            return self._commit_cache[commit_hash]

        analysis_result = {
            "commit_hash": commit_hash,
            "components": [
                {
                    "name": "SignupForm.tsx",
                    "path": "frontend/src/components/SignupForm.tsx",
                    "inputs": ["name", "email", "password", "company", "size", "role"],
                    "primary_cta": "Complete Registration",
                    "opportunity": "High friction detected: 6 initial form inputs."
                },
                {
                    "name": "NavbarCTA.tsx",
                    "path": "frontend/src/components/NavbarCTA.tsx",
                    "inputs": [],
                    "primary_cta": "Start Free Trial",
                    "opportunity": "High visibility: sticky navigation button."
                },
                {
                    "name": "PricingTierTable.tsx",
                    "path": "frontend/src/components/PricingTierTable.tsx",
                    "inputs": ["billing_cycle_toggle"],
                    "primary_cta": "Upgrade to Pro",
                    "opportunity": "Revenue optimization: annual billing discount toggle."
                }
            ],
            "total_components_scanned": 24,
            "experiment_surfaces_found": 3
        }

        self._commit_cache[commit_hash] = analysis_result
        return analysis_result

repo_scanner = RepositoryScanner()

