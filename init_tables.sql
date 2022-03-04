DROP TABLE IF EXISTS behaviour;
DROP TABLE IF EXISTS notes;


CREATE TABLE notes (
id SERIAL PRIMARY KEY,
date_time TEXT,
photo_url TEXT,
flock_size INTEGER,
vocalization TEXT,
habitat TEXT
);

CREATE TABLE behaviour (
  id SERIAL PRIMARY KEY,
  actions TEXT,
  notes_id INTEGER REFERENCES notes(id)
);

INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/1024/300/200','30','vocalization value','habitat value');
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/224/300/200','30','vocalization value','habitat value');
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/269/300/200','30','vocalization value','habitat value');
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/275/300/200','30','vocalization value','habitat value');

INSERT INTO behaviour (actions,notes_id) VALUES ('drinking','1'),('drinking','2'),('drinking','3'),('drinking','4'),('eating','1'),('eating','3'),('eating','4'),('bathing','2'),('drinking','3'),('drinking','4');