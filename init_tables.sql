DROP TABLE IF EXISTS notes_behaviour CASCADE;
DROP TABLE IF EXISTS behaviour CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS species CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  user_password TEXT
);

CREATE TABLE species (
  id SERIAL PRIMARY KEY,
  species_name TEXT,
  scientific_name TEXT
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  date_time TEXT,
  photo_url TEXT,
  flock_size INTEGER,
  species_id INTEGER,
  user_id INTEGER,
  CONSTRAINT fk_notes_species_id
  FOREIGN KEY (species_id)
  REFERENCES species(id)
  ON DELETE CASCADE
  ,
  CONSTRAINT fk_notes_user_id
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
  );

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  comment TEXT,
  notes_id INTEGER,
  user_id INTEGER,
  CONSTRAINT fk_comments_notes_id
  FOREIGN KEY (notes_id)
  REFERENCES notes(id)
  ON DELETE CASCADE
  ,
  CONSTRAINT fk_comments_user_id
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
  );

CREATE TABLE behaviour (
  id SERIAL PRIMARY KEY,
  actions TEXT
);

CREATE TABLE notes_behaviour (
  id SERIAL PRIMARY KEY,
  notes_id INTEGER,
  behaviour_id INTEGER,
  CONSTRAINT fk_notesbeh_notes_id
  FOREIGN KEY (notes_id)
  REFERENCES notes(id)
  ON DELETE CASCADE,
  CONSTRAINT fk_notesbeh_behaviour_id
  FOREIGN KEY (behaviour_id)
  REFERENCES behaviour(id)
  ON DELETE CASCADE
);


INSERT INTO users (user_email,user_password) VALUES ('example@email.com','password');

INSERT INTO species (species_name,scientific_name) VALUES ('King Quail','Excalfactoria chinensis'),('Red Junglefowl','Gallus gallus'),('Wandering Whistling Duck','Dendrocygna arcuata'),('Lesser Whistling Duck','Dendrocygna javanica'),('Cotton Pygmy Goose','Nettapus coromandelianus'),('Garganey','Spatula querquedula'),('Northern Shoveler','Spatula clypeata'),('Gadwall','Mareca strepera'),('Eurasian Wigeon','Mareca penelope'),('Northern Pintail','Anas acuta'),('Tufted Duck','Aythya fuligula');

INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/1024/300/200','30',11,1);
INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ('03/04/2022 12:00 PM','https://images.unsplash.com/photo-1560813487-803cbe32d18b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1422&q=80','30',10,1);
INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/269/300/200','30',5,1);
INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/275/300/200','30',3,1);

INSERT INTO comments (comment,notes_id,user_id) VALUES ('Sample comment for note1',1,1),('Sample comment for note2',2,1),('Sample comment for note3',3,1),('Sample comment for note4',4,1);

INSERT INTO behaviour (actions) VALUES ('walking'),('resting'),('bathing'),('flying'),('drinking'),('pecking'),('climbing tree'),('hunting');

INSERT INTO notes_behaviour (notes_id,behaviour_id) VALUES ('1','8'),('1','6'),('3','7'),('4','4'),('1','3'),('3','1'),('4','8'),('2','2'),('3','3'),('4','6');

