const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const port = 3000;

const mysql = require("mysql2");

app.set("view engine", "ejs");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rootroot",
  database: "express_db",
});

app.use(express.static(path.join(__dirname, "assets")));

app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', function(req, res) {
  con.connect(function(err) {
    if (err) throw err;
    console.log('Connected');

    const selectedValue = req.query.sort;
    let sql = "SELECT * FROM personas";

    if (selectedValue === '2') {
      sql += " ORDER BY rating DESC";
    }

    if (selectedValue === '3') {
      sql += " ORDER BY rating ASC";
    }

    con.query(sql, function (err, result, fields) {
      if (err) console.error(err);
      // console.log(result);

      // 評価が高い順で並び替え
      if (selectedValue === '2') {
        result.sort(function(a, b) {
          return b.rating - a.rating;
        });
      }

      // 評価が高い順で並び替え
      if (selectedValue === '3') {
        result.sort(function(a, b) {
          return a.rating - b.rating;
        });
      }

      res.render('index', { personas: result }); // 結果をテンプレートに渡す
    });
  });
});



app.get("/", (req, res) => {
  const sql = "select * from personas";
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.render("index", { personas: result }); 
  });
});

app.get('/create', (req, res) =>
  res.sendFile(path.join(__dirname, 'html/form.html')));


  app.post("/", (req, res) => {
    const sql = "INSERT INTO personas (username, age, rating, reason) VALUES (?, ?, ?, ?)";
    con.query(sql, [req.body.username, req.body.age, req.body.review, req.body.reason], function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.redirect("/");
    });
  });

app.get('/edit/:id', (req, res) => {
  const sql = "SELECT * FROM personas WHERE id = ?";
  con.query(sql, [req.params.id], function (err, result, fields) {
    if (err) throw err;
    res.render('edit', {
      personas: result
    });
  });
});

app.post('/update/:id', (req, res) => {
  console.log(req.params.id);
  const sql = "UPDATE personas SET ? WHERE id = " + req.params.id;
  con.query(sql, req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect('/');
  });
});

app.get('/delete/:id', (req, res) => {
  const sql = "DELETE FROM personas WHERE id = ?";
  con.query(
    sql, [req.params.id],
    function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.redirect('/');
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
