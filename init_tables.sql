DROP TABLE IF EXISTS notes_behaviour;
DROP TABLE IF EXISTS behaviour;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_email TEXT,
  user_password TEXT
);

CREATE TABLE notes (
id SERIAL PRIMARY KEY,
date_time TEXT,
photo_url TEXT,
flock_size INTEGER,
vocalization TEXT,
habitat TEXT,
user_id INTEGER REFERENCES users(id)
);

CREATE TABLE behaviour (
  id SERIAL PRIMARY KEY,
  actions TEXT
);

CREATE TABLE notes_behaviour (
  id SERIAL PRIMARY KEY,
  notes_id INTEGER REFERENCES notes(id),
  behaviour_id INTEGER REFERENCES behaviour(id)
);

INSERT INTO users (user_email,user_password) VALUES ('example@email.com','password');

INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/1024/300/200','30','vocalization value','habitat value',1);
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/224/300/200','30','vocalization value','habitat value',1);
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/269/300/200','30','vocalization value','habitat value',1);
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/275/300/200','30','vocalization value','habitat value',1);

INSERT INTO behaviour (actions) VALUES ('walking'),('resting'),('bathing'),('flying'),('drinking'),('pecking'),('climbing tree'),('hunting');

INSERT INTO notes_behaviour (notes_id,behaviour_id) VALUES ('1','8'),('1','6'),('3','7'),('4','4'),('1','3'),('3','1'),('4','8'),('2','2'),('3','3'),('4','6');

