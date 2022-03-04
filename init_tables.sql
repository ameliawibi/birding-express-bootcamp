DROP TABLE IF EXISTS notes;

CREATE TABLE notes (
id SERIAL PRIMARY KEY,
date_time TEXT,
photo_url TEXT,
flock_size INTEGER,
vocalization TEXT,
habitat TEXT,
behaviour VARCHAR
);

INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat,behaviour) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/1024/300/200','30','vocalization value','habitat value', ARRAY[ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]);
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat,behaviour) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/224/300/200','30','vocalization value','habitat value', ARRAY[ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]);
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat,behaviour) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/269/300/200','30','vocalization value','habitat value', ARRAY[ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]);
INSERT INTO notes (date_time,photo_url,flock_size,vocalization,habitat,behaviour) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/275/300/200','30','vocalization value','habitat value', ARRAY[ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]);