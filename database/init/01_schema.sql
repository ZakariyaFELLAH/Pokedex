CREATE TABLE pokemon (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    types JSON,
    total INT,
    hp INT,
    attack INT,
    defense INT,
    attack_special INT,
    defense_special INT,
    speed INT,
    evolution_id INT,
    image_url VARCHAR(255)
);