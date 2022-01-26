const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})


app.get("/video", (req, res) => {
    const range = req.headers.range;
    if(!range) {
        res.status(400).send("Require Range Header")
    }

    const videopath = __dirname + "/content/file2.mp4"
    const size = fs.statSync(videopath).size;

    const CHUNK = Math.round(5 ** 8.2); // 0.5mb
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK, size -1)

    const contentLenght = end-start + 1;
    const header = {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLenght,
        "Content-Type": "video/mp4",
    }

    res.writeHead(206, header);
    const stream = fs.createReadStream(videopath, {start, end});

    stream.pipe(res);
})

app.listen(8000, () => {
    console.log("listening on port 8000!")
})