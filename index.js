const mongoose = require('mongoose');
const express = require('express')
const app = express()
const port = 3000

mongoose.connect(
  'mongodb://localhost:27017/BlendyAPI', {
    useNewUrlParser: true
});

app.get('/example', (res, req, next) => {
  return req.status(200).send({
    test: true
  });
});

app.listen(port, () => {
  console.log(`Blendy API listening on port ${port}!`);
});