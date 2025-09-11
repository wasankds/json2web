import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// socket io
import { createServer } from 'node:http';
import { Server } from 'socket.io';


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const port = 83;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => { req.io = io; next(); }); //  แนบ io ไปกับ req


app.get("/", (req, res) => {
  // console.log(`---------${req.originalUrl}---------`);
  // console.log('getTimestamp() ==> ', getTimestamp());

  res.render("index", {
    title: 'esp32',
    time: getTimestamp(), // Pass UTC to the template
  });
});

//========== 
app.post("/e001", (req, res) => {
  const { key } = req.body;
  if (key !== '7127000') {
    return res.status(403).send({ msg: 'Invalid key' });
  } else {
    delete req.body.key;
    const dataAck = req.body;
    dataAck.timestamp = getTimestamp();

    req.io.emit('esp32_test', {
      timestamp: getTimestamp(),
      body: JSON.stringify(dataAck),
      data: dataAck,
    });

    res.send({
      msg: 'I have got your data',
      data: dataAck,
    });
  }
});

server.listen(port, () => {
  console.log(`----------------------`);
  console.log(`Server is running on http://localhost:${port}`);
});

//==========================================
export function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

