import express from "express";
import path from "path";

const port = process.env.PORT || 3000;

const server = express();

server.set('views', path.join(__dirname, 'src/views'));
server.set('view engine', 'pug');
server.use(express.static('dist'));

server.listen(port, () => {
  console.log("The server is up and running!");
});