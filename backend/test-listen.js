import express from 'express';
const app = express();
app.listen(3000, () => {
  console.log("Listening on 3000");
}).on('error', (err) => console.log(err.message));
