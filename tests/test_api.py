from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_pokemons():
    response = client.get("/pokemons")
    assert response.status_code == 200