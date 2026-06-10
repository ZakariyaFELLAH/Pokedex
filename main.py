from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from database.db import get_connection
from pydantic import BaseModel
from typing import Optional, List
import json
import os
import shutil

class PokemonCreate(BaseModel):
    id: int
    name: str
    types: List[str]
    total: int
    hp: int
    attack: int
    defense: int
    attack_special: int
    defense_special: int
    speed: int
    evolution_id: Optional[int] = None
    image_url: Optional[str] = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return FileResponse("static/index.html")

@app.get("/pokemons")
def get_pokemons():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM pokemon")
    pokemons = cursor.fetchall()
    cursor.close()
    conn.close()
    return pokemons

@app.post("/pokemons")
async def create_pokemon(
    file: UploadFile = File(...),
    data: str = Form(...)
):
    pokemon = PokemonCreate(**json.loads(data))

    filename = f"{str(pokemon.id).zfill(3)}.png"
    filepath = f"static/images/{filename}"
    os.makedirs("static/images", exist_ok=True)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pokemon.image_url = f"/static/images/{filename}"

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO pokemon
            (id, name, types, total, hp, attack, defense, attack_special, defense_special, speed, evolution_id, image_url)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            pokemon.id, pokemon.name, json.dumps(pokemon.types),
            pokemon.total, pokemon.hp, pokemon.attack, pokemon.defense,
            pokemon.attack_special, pokemon.defense_special,
            pokemon.speed, pokemon.evolution_id, pokemon.image_url
        ))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    return {"message": "Pokemon créé", "image_url": pokemon.image_url}