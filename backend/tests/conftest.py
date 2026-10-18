import os

os.environ["LLM_PROVIDER"] = "mock"  # must be set before the app is imported

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)
