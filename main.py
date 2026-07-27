from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from database.db import get_connection
from pydantic import BaseModel
from typing import Optional, List
from fastapi.responses import RedirectResponse
import json
import os
import shutil
import boto3

# Configuration S3
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

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
    return RedirectResponse(url="/static/index.html")

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
    s3_key = f"images/{filename}"

    # Upload direct vers S3 (plus besoin de sauvegarder en local)
    s3_client.upload_fileobj(
        file.file,
        S3_BUCKET_NAME,
        s3_key,
        ExtraArgs={"ContentType": "image/png"}
    )

    # Génère l'URL S3 publique
    pokemon.image_url = f"https://{S3_BUCKET_NAME}.s3.{os.getenv('AWS_REGION')}.amazonaws.com/{s3_key}"

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