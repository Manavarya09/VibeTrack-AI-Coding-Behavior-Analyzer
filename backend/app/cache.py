from typing import Dict, Any, Optional
import time
import hashlib
import json


class Cache:
    def __init__(self, ttl: int = 300):
        self.cache: Dict[str, tuple] = {}
        self.ttl = ttl

    def _make_key(self, prefix: str, *args, **kwargs) -> str:
        key_data = f"{prefix}:{args}:{sorted(kwargs.items())}"
        return hashlib.md5(key_data.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            value, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return value
            del self.cache[key]
        return None

    def set(self, key: str, value: Any) -> None:
        self.cache[key] = (value, time.time())

    def delete(self, key: str) -> None:
        if key in self.cache:
            del self.cache[key]

    def clear(self) -> None:
        self.cache.clear()

    def cached(self, prefix: str):
        def decorator(func):
            async def wrapper(*args, **kwargs):
                cache_key = self._make_key(prefix, *args, **kwargs)
                cached_value = self.get(cache_key)

                if cached_value is not None:
                    return cached_value

                result = await func(*args, **kwargs)
                self.set(cache_key, result)
                return result

            return wrapper

        return decorator


cache = Cache(ttl=300)
