from __future__ import annotations

from abc import ABC, abstractmethod
from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Dict, List, Optional
from uuid import uuid4

from backend.database.firebase import get_firestore_client


class Repository(ABC):
    @abstractmethod
    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def get(self, collection: str, document_id: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    async def set(self, collection: str, document_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def list(
        self,
        collection: str,
        limit: int = 50,
        order_by: str = "timestamp",
        descending: bool = True,
    ) -> List[Dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    async def find_one(self, collection: str, field: str, value: Any) -> Optional[Dict[str, Any]]:
        raise NotImplementedError


class InMemoryRepository(Repository):
    def __init__(self) -> None:
        self._store: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._lock = Lock()

    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        document_id = data.get("id") or str(uuid4())
        document = {**data, "id": document_id}
        with self._lock:
            self._store.setdefault(collection, {})[document_id] = deepcopy(document)
        return deepcopy(document)

    async def get(self, collection: str, document_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            document = self._store.get(collection, {}).get(document_id)
            return deepcopy(document) if document else None

    async def set(self, collection: str, document_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        document = {**data, "id": document_id}
        with self._lock:
            self._store.setdefault(collection, {})[document_id] = deepcopy(document)
        return deepcopy(document)

    async def list(
        self,
        collection: str,
        limit: int = 50,
        order_by: str = "timestamp",
        descending: bool = True,
    ) -> List[Dict[str, Any]]:
        with self._lock:
            values = list(self._store.get(collection, {}).values())

        def sort_key(item: Dict[str, Any]) -> Any:
            return item.get(order_by) or datetime.min.replace(tzinfo=timezone.utc)

        values.sort(key=sort_key, reverse=descending)
        return deepcopy(values[:limit])

    async def find_one(self, collection: str, field: str, value: Any) -> Optional[Dict[str, Any]]:
        with self._lock:
            for document in self._store.get(collection, {}).values():
                if document.get(field) == value:
                    return deepcopy(document)
        return None


class FirestoreRepository(Repository):
    def __init__(self) -> None:
        client = get_firestore_client()
        if client is None:
            raise RuntimeError("Firestore credentials are not configured.")
        self._client = client

    async def create(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
        document_id = data.get("id") or str(uuid4())
        document = {**data, "id": document_id}
        self._client.collection(collection).document(document_id).set(document)
        return document

    async def get(self, collection: str, document_id: str) -> Optional[Dict[str, Any]]:
        snapshot = self._client.collection(collection).document(document_id).get()
        return snapshot.to_dict() if snapshot.exists else None

    async def set(self, collection: str, document_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        document = {**data, "id": document_id}
        self._client.collection(collection).document(document_id).set(document, merge=True)
        return document

    async def list(
        self,
        collection: str,
        limit: int = 50,
        order_by: str = "timestamp",
        descending: bool = True,
    ) -> List[Dict[str, Any]]:
        direction = "DESCENDING" if descending else "ASCENDING"
        snapshots = (
            self._client.collection(collection)
            .order_by(order_by, direction=direction)
            .limit(limit)
            .stream()
        )
        return [snapshot.to_dict() for snapshot in snapshots]

    async def find_one(self, collection: str, field: str, value: Any) -> Optional[Dict[str, Any]]:
        snapshots = self._client.collection(collection).where(field, "==", value).limit(1).stream()
        for snapshot in snapshots:
            return snapshot.to_dict()
        return None


_repository: Optional[Repository] = None


def get_repository() -> Repository:
    global _repository
    if _repository is not None:
        return _repository

    if get_firestore_client() is not None:
        _repository = FirestoreRepository()
    else:
        _repository = InMemoryRepository()
    return _repository

