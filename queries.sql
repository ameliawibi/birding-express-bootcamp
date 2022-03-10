SELECT * from users WHERE user_email='example@email.com';

SELECT notes.id,notes.date_time,notes.flock_size,species.species_name FROM notes INNER JOIN species ON notes.species_id = species.id;

SELECT * FROM notes INNER JOIN notes_behaviour ON notes.id = notes_behaviour.notes_id INNER JOIN behaviour ON behaviour.id = notes_behaviour.behaviour_id INNER JOIN species ON notes.species_id = species.id WHERE notes.id=1;

SELECT * FROM comments WHERE notes_id=1;