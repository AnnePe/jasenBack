const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('jasendata.db');

db.serialize( () => {

  let sql = 'CREATE TABLE jasen (' +
	   'id integer PRIMARY KEY NOT NULL, ' +
	   'etunimi text NOT NULL, ' +
       'sukunimi text NOT NULL, ' +
       'osoite text, ' +
	   'pono text, ' +
     'puhelin text , ' +
     'email text NOT NULL, ' +
     'yhdistysid text NOT NULL, ' +
     'jasenyysid text NOT NULL, ' +
	   'picture text) ' ;

  db.run(sql, (err) => {
    if (err) {
      return console.log(err.message);
    }
    console.log("Taulu tehtiin");
  })
  sql = "INSERT INTO jasen (id, etunimi, sukunimi, osoite, pono, puhelin, email, yhdistysid, jasenyysid, picture) "+
  " VALUES (1, 'Matti', 'Kissanen', 'osoite1','00590', '09123456','matti.kissanen@email.fi','HELSINKI','JASEN','Sissi.jpg')";
  db.run(sql, (err) => {
    if (err) {
      return console.log(err.message);
    }
    console.log("Rivi lisättiin");
  });

  sql = "INSERT INTO jasen (id, etunimi, sukunimi, osoite, pono, puhelin, email, yhdistysid, jasenyysid,picture) "+
  " VALUES (2, 'Maija', 'Kissanen', 'osoite1','00590', '09123457','maija.kissanen@email.fi','HELSINKI','JASEN','Sissi.jpg')";
  db.run(sql, (err) => {
    if (err) {
      return console.log(err.message);
    }
    console.log("Rivi lisättiin");
  });
  sql = "INSERT INTO jasen (id, etunimi, sukunimi, osoite, pono, puhelin, email, yhdistysid, jasenyysid, picture) "+
  " VALUES (3, 'Mikko', 'Kissanen', 'osoite1','00590', '09123459','mikko.kissanen@email.fi','HELSINKI','NUORISO','Sissi.jpg')";
  db.run(sql, (err) => {
    if (err) {
      return console.log(err.message);
    }
    console.log("Rivi lisättiin");
  });
  db.each("SELECT id, etunimi FROM jasen", (err, row) => {
  if (err) {
    return console.log(err.message);
  }
  console.log(row.id + ", " + row.etunimi);

});

db.close();
})

