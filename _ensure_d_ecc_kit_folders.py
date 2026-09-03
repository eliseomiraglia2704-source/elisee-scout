# -*- coding: utf-8 -*-
"""Crea le cartelle kit 2D mancanti per tutte le squadre del catalogo."""
from _kit_folders import ensure_kit_folders_from_catalog

if __name__ == "__main__":
    stats = ensure_kit_folders_from_catalog()
    print("created", stats["created"], "already", stats["skipped"])
