require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

const customLogger = morgan((tokens, req, res) => {
  const tinyLog = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms'
  ].join(' ');

  return req.method === 'POST' ? `${tinyLog} ${JSON.stringify(req.body)}` : tinyLog;
});

app.use(cors());
app.use(express.static('build'));
app.use(bodyParser.json());
app.use(customLogger);

// const generateId = max => Math.floor(Math.random() * Math.floor(max));
// const isAlreadyListed = name => !!persons.find(person => person.name === name);

// Persons routes
app.post('/api/persons', (req, res) => {
  const {
    body: { name, number }
  } = req;
  const body = req.body;

  if (!name) {
    return response.status(400).json({
      error: 'name missing'
    });
  }

  if (!number) {
    return response.status(400).json({
      error: 'number missing'
    });
  }

  const person = new Person({ name, number });

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON());
  });
});

// app.post('/api/persons', (request, response) => {
//   const {
//     body: { name, number }
//   } = request;

//   if (!name) {
//     return response.status(400).json({
//       error: 'name missing'
//     });
//   }

//   if (!number) {
//     return response.status(400).json({
//       error: 'number missing'
//     });
//   }

//   if (isAlreadyListed(name)) {
//     return response.status(400).json({
//       error: 'name must be unique'
//     });
//   }

//   const person = {
//     name,
//     number,
//     id: generateId(10000)
//   };

//   persons = persons.concat(person);

//   response.json(person);
// });

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});
// app.get('/api/persons', (req, res) => {
//   res.json(persons);
// });

app.get('/api/persons/:id', (req, res) => {
  Note.findById(req.params.id).then(person => {
    if (person) {
      res.json(person.toJSON());
    } else {
      res.status(404).end();
    }
  });
});
// app.get('/api/persons/:id', (req, res) => {
//   const id = Number(req.params.id);

//   const person = persons.find(person => person.id === id);

//   if (person) {
//     res.json(person);
//   } else {
//     res.status(404).end();
//   }

//   res.json(person);
// });

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);

  res.status(204).end();
});

// Info route
app.get('/info', (req, res) => {
  const status = `
  Phonebook has info for ${persons.length} people
  ${new Date()}
  `;
  res.send(status);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
