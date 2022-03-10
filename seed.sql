INSERT INTO users (user_email,user_password) VALUES ('example@email.com','b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86');

INSERT INTO species (species_name,scientific_name) VALUES ('King Quail','Excalfactoria chinensis'),('Red Junglefowl','Gallus gallus'),('Wandering Whistling Duck','Dendrocygna arcuata'),('Lesser Whistling Duck','Dendrocygna javanica'),('Cotton Pygmy Goose','Nettapus coromandelianus'),('Garganey','Spatula querquedula'),('Northern Shoveler','Spatula clypeata'),('Gadwall','Mareca strepera'),('Eurasian Wigeon','Mareca penelope'),('Northern Pintail','Anas acuta'),('Tufted Duck','Aythya fuligula');

INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/1024/300/200','30',11,1);
INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ('03/04/2022 12:00 PM','https://images.unsplash.com/photo-1560813487-803cbe32d18b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1422&q=80','30',10,1);
INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/269/300/200','30',5,1);
INSERT INTO notes (date_time,photo_url,flock_size,species_id,user_id) VALUES ('03/04/2022 12:00 PM','https://picsum.photos/id/275/300/200','30',3,1);

INSERT INTO comments (comment,notes_id,user_id) VALUES ('Sample comment for note1',1,1),('Sample comment for note2',2,1),('Sample comment for note3',3,1),('Sample comment for note4',4,1);

INSERT INTO behaviour (actions) VALUES ('walking'),('resting'),('bathing'),('flying'),('drinking'),('pecking'),('climbing tree'),('hunting');

INSERT INTO notes_behaviour (notes_id,behaviour_id) VALUES ('1','8'),('1','6'),('3','7'),('4','4'),('1','3'),('3','1'),('4','8'),('2','2'),('3','3'),('4','6');