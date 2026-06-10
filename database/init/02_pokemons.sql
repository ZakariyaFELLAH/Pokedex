INSERT INTO pokemon (id, name, types, total,hp, attack, defense,attack_special, defense_special,speed, evolution_id, image_url)

VALUES 
(1,'Bulbasaur','["Grass","Poison"]',318,45,49,49,65,65,45,2,'/static/images/1.png'),
(2,'Ivysaur','["Grass","Poison"]',405,60,62,63,80,80,60,3,'/static/images/2.png'),
(3,'Venusaur','["Grass","Poison"]',525,80,82,83,100,100,80,NULL,'/static/images/3.png'),
(4,'Charmander','["Fire"]',309,39,52,43,60,50,65,5,'/static/images/4.png'),
(5,'Charmeleon','["Fire"]',405,58,64,58,80,65,80,6,'/static/images/5.png'),
(6,'Charizard','["Fire","Flying"]',534,78,84,78,109,85,100,NULL,'/static/images/6.png'),
(7,'Squirtle','["Water"]',314,44,48,65,50,64,43,8,'/static/images/7.png'),
(8,'Wartortle','["Water"]',405,59,63,80,65,80,58,9,'/static/images/8.png'),
(9,'Blastoise','["Water"]',530,79,83,100,85,105,78,NULL,'/static/images/9.png'),
(10,'Caterpie','["Bug"]',195,45,30,35,20,20,45,11,'/static/images/10.png'),
(11,'Metapod','["Bug"]',205,50,20,55,25,25,30,12,'/static/images/11.png'),
(12,'Butterfree','["Bug","Flying"]',395,60,45,50,90,80,70,NULL,'/static/images/12.png'),
(13,'Weedle','["Bug","Poison"]',195,40,35,30,20,20,50,14,'/static/images/13.png'),
(14,'Kakuna','["Bug","Poison"]',205,45,25,50,25,25,35,15,'/static/images/14.png'),
(15,'Beedrill','["Bug","Poison"]',395,65,90,40,45,80,75,NULL,'/static/images/15.png');