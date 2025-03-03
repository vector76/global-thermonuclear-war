from pydantic import BaseModel, Field, computed_field
from datetime import datetime
from typing import Optional

class ApiKeyBase(BaseModel):
    name: str

class ApiKeyCreate(ApiKeyBase):
    pass

class ApiKey(ApiKeyBase):
    id: int
    key: str
    user_id: int
    created_at: datetime
    last_used_at: Optional[datetime] = None
    is_revoked: bool

    class Config:
        from_attributes = True

class ApiKeyResponse(ApiKeyBase):
    id: int
    user_id: int
    created_at: datetime
    last_used_at: Optional[datetime] = None
    is_revoked: bool
    key: str

    @computed_field
    def truncated_key(self) -> str:
        """Return only the first 8 characters of the key followed by ..."""
        return self.key[:8] + "..."

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "name": "My API Key",
                "user_id": 1,
                "created_at": "2024-03-03T12:00:00Z",
                "last_used_at": None,
                "is_revoked": False,
                "truncated_key": "abcd1234..."
            }
        }
    }

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        # Replace the full key with the truncated version in the output
        if 'key' in data:
            data['key'] = self.truncated_key
        return data

class ApiKeyPublicResponse(BaseModel):
    """Public view of an API key that excludes the full key."""
    id: int
    name: str
    user_id: int
    created_at: datetime
    last_used_at: Optional[datetime] = None
    is_revoked: bool
    truncated_key: str

    @classmethod
    def from_api_key(cls, api_key: ApiKeyResponse) -> "ApiKeyPublicResponse":
        """Create a public response from an ApiKeyResponse instance."""
        return cls(
            id=api_key.id,
            name=api_key.name,
            user_id=api_key.user_id,
            created_at=api_key.created_at,
            last_used_at=api_key.last_used_at,
            is_revoked=api_key.is_revoked,
            truncated_key=api_key.truncated_key
        )

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": 1,
                "name": "My API Key",
                "user_id": 1,
                "created_at": "2024-03-03T12:00:00Z",
                "last_used_at": None,
                "is_revoked": False,
                "truncated_key": "abcd1234..."
            }
        }
    } 