const express = require("express");

const port = 4000;

const db = [];

const app = express();
app.use(express.json());

app.post("/save", (req, res) => {
    console.log(req.body);

    db.push(req.body);

    res.status(200).send("OK");
});

app.get("/load", (req, res) => {
    res.status(200).json(db);
});

app.listen(port, () => {
    console.log(`listening at port ${port}`);
});