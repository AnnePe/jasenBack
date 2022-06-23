const express = require('express');
const app = express();

// Tietoturvakirjasto
var helmet = require('helmet');
//app.use(helmet());

app.use(helmet( { crossOriginResourcePolicy: false } ));

// Käyttää oletuksena JSON muotoista dataa
app.use(express.json());  

// Asetus, jotta kuvia voidaan ladata
app.use(express.urlencoded({limit: '5mb', extended: true}));

const cors = require('cors');
app.use(cors());

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('jasendata.db');

// back kuuntelee porttia 8080
app.listen(8080, () => {
    console.log('Node toimii localhost:8080');
});

// Reititys on pelkkä / esim. localhost:8080/katsotaan että toimii
app.get('/', (req, res, next) => {
    return res.status(200).json({ error: false, message: 'Toimii' })
});

// Reititys on /jasen/all esim. localhost:8080/jasen/all sereveri komento
// Kaikkien rivin haku kannasta selectillä kysely kantaan
app.get('/jasen/all', (req, res, next) => {
	db.all("SELECT * FROM jasen", (error, results) => {
    if (error) throw error;

    return res.status(200).json(results); //status=200 operaatio onnistui
  });
});

// Yhden tietyn rivin haku kannasta
app.get('/jasen/one/:id', (req, res, next) => {
    let id = req.params.id;
    db.get('SELECT * FROM jasen where id=?', [id], (error, result) => {
        if (error) throw error;

        // Jos haku ei tuottanut yhtään riviä
        if (typeof(result) == 'undefined')  {
          return res.status(200).json({});
        }

        return res.status(200).json(result);
    });
});


// Kuvan lataaminen palvelimen hakemistoon
const multer = require('multer');
//const upload = multer({ dest: './images' })  // Kansio, johon kuvat laitetaan alkuperäisellä nimellä

const storage = multer.diskStorage({
    destination:  (req, file, callback) => {
      callback(null, './images')
    },
    filename: (req, file, callback) => {
      callback(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })
//lataa kuva palvelimelta
  app.get('/download/:nimi', (req, res, next) => {
    var file = './images/'+ req.params.nimi;
    res.download(file);//haetaan annetun niminen tiedosto
    });

// Kantaan lisääminen ja kuvan vienti images kansioon
app.post('/jasen/addall', upload.single('picture'),  (req, res, next) => {
   // Lomakkeelta tulleet tiedot
    let tap = req.body;
    let kuvaNimi = null; // Jos kuvaa ei ole

    // Jos tuli tiedosto
    if (req.file) {
      kuvaNimi = req.file.originalname; // Kantaan laitettavan kuvan nimi on sama kuin alkuperäisen kuvan nimi
    }

    db.run('INSERT INTO jasen  ( etunimi, sukunimi, osoite, pono, puhelin, email, yhdistysid, jasenyysid,picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [tap.etunimi, tap.sukunimi, tap.osoite, tap.pono,tap.puhelin, tap.email, tap.yhdistysid, tap.jasenyysid, kuvaNimi], (error, result) => {
        if (error) throw error;

        return res.status(200).json( {count: 1} );
    })
})

// Kantaan lisääminen ilman kuvaa
app.post('/jasen/add',  (req, res, next) => {
    // Lomakkeelta tulleet tiedot
     let tap = req.body;
         
     db.run('INSERT INTO jasen  ( etunimi, sukunimi, osoite, pono, puhelin, email, yhdistysid, jasenyysid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
     [tap.etunimi, tap.sukunimi, tap.osoite, tap.pono,tap.puhelin, tap.email, tap.yhdistysid, tap.jasenyysid], (error, result) => {
         if (error) throw error;
 
         return res.status(200).json( {count: 1} );
     })

})
// Rivin poistaminen kannasta
app.delete('/jasen/delete/:id', (req, res, next) => {
    // Otetaan parametrina tulleen elainn id
    let id = req.params.id;

    // Kuvan poistamienen puuttuu ratkaisusta -> vaatii tiedostojen hallintaa -> ei kuulu tälle opintojaksolle
    db.run('DELETE FROM jasen WHERE id = ?', [id],  function (error, result) {
        if (error) throw error;

        return res.status(200).json( {count: this.changes} );
    });
 
});

//yhden jäsenen osoitteen ja emailin muutos
app.patch("/jasen/editO/:id", (req, res, next) => {
    let tap = req.body;
    id =req.params.id
    db.run(
        `UPDATE jasen set 
           osoite = ?
           WHERE id = ?`,
        [tap.osoite, id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                changes: this.changes
            })
    });
})
//yhden jäsenen osoitteen ja emailin muutos
app.patch("/jasen/edit/:id", (req, res, next) => {
    let tap = req.body;
    id =req.params.id
    db.run(
        `UPDATE jasen set 
           osoite = ?,pono = ?,puhelin = ?,email = ?
           WHERE id = ?`,
        [tap.osoite,tap.pono,tap.puhelin,tap.email, id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                changes: this.changes
            })
    });
})



// Jos mikään aiempi reititys on sopinut, silloin suoritetaan tämä
app.get('*', (req, res, next) => {
    return res.status(404).send({ error: true, message: 'Ei pyydettyä palvelua' })
});
