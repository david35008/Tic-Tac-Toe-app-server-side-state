const express = require('express');
const fs = require('fs').promises;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', express.static('../client/build'));

let historyMoves = {
    "boardHistory": [
        {
            "squares": [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ]
        }
    ],
    "stepNumber": 0,
    "xIsNext": true
};

let seconds = {seconds: 0};

app.get("/api/v1/history", (req, res)=> {
    res.send(historyMoves);
});

app.post("/api/v1/history", (req, res)=> {
    historyMoves = req.body
    res.send(historyMoves);
});

app.put("/api/v1/history", (req, res)=> {
    seconds = req.body;
    res.send(seconds);
});

app.get("/api/v1/records", async (req, res) => {
    const content = await fs.readFile('./records.json')
    const json = JSON.parse(content);
    res.send(json);
});

app.post("/api/v1/records",async (req, res) => {
    const content = await fs.readFile('./records.json')
    let json = JSON.parse(content);
    if(json[0].winnerName == "no body")
    json = [];
    json.push(req.body)
    let message = JSON.stringify(json)
   await fs.writeFile('./records.json', message)
    res.send(json);
    
});

app.delete("/api/v1/records", async (req,res) => {
    await fs.writeFile('./records.json', '[{"id":"1","winnerName":"no body","date":"never","gameDuration":"0"}]')
    res.send("deleteed")
})

app.get('/', (req, res) => {
    res.send('hello');
});

app.listen(8080);