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