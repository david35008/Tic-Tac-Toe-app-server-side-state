const express = require('express');
const fs = require('fs').promises;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', express.static('../client/build'));

app.get("/api/records", async (req, res) => {
    const content = await fs.readFile('./records.json')
    const json = JSON.parse(content);
    res.send(json);
});

app.post("/api/records",async (req, res) => {
    const content = await fs.readFile('./records.json')
    let json = JSON.parse(content);
    json.push(req.body)
    let message = JSON.stringify(json)
   await fs.writeFile('./records.json', message)
    res.send(json);
    
});

app.delete("/api/records", async (req,res) => {
    await fs.writeFile('./records.json', '[]')
    res.send("deleteed")
})

app.get('/', (req, res) => {
    res.send('hello');
});




app.listen(8080);