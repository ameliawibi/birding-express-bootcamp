DROP TABLE IF EXISTS notes;

CREATE TABLE notes (
id SERIAL PRIMARY KEY,
date_time TEXT,
appearance TEXT,
vocalization TEXT,
habitat TEXT,
behaviour VARCHAR
);

INSERT INTO notes (date_time,appearance,vocalization,habitat,behaviour) VALUES ('03/04/2022 12:00 PM','appearance value','vocalization value','habitat value', ARRAY[ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]);
INSERT INTO notes (date_time,appearance,vocalization,habitat,behaviour) VALUES ('03/04/2022 12:00 PM','appearance value','vocalization value','habitat value', ARRAY[ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]);
INSERT INTO notes (date_time,appearance,vocalization,habitat,behaviour) VALUES ('03/04/2022 12:00 PM','appearance value','vocalization value','habitat value', ARRAY[ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]);
INSERT INTO notes (date_time,appearance,vocalization,habitat,behaviour) VALUES ('03/04/2022 12:00 PM','appearance value','vocalization value','habitat value', ARRAY[ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]);