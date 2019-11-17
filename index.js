const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors')

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
app.use(bodyParser.json());
app.use(customLogger);

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Dan Abramov',
    number: '040-345678',
    id: 2
  },
  {
    name: 'Random Guy',
    number: '040-987654',
    id: 3
  }
];

const generateId = max => Math.floor(Math.random() * Math.floor(max));
const isAlreadyListed = name => !!persons.find(person => person.name === name);

app.post('/api/persons', (request, response) => {
  const {
    body: { name, number }
  } = request;

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

  if (isAlreadyListed(name)) {
    return response.status(400).json({
      error: 'name must be unique'
    });
  }

  const person = {
    name,
    number,
    id: generateId(10000)
  };

  persons = persons.concat(person);

  response.json(person);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);

  const person = persons.find(person => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }

  res.json(person);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(person => person.id !== id);

  res.status(204).end();
});

app.get('/info', (req, res) => {
  const status = `
  Phonebook has info for ${persons.length} people
  ${new Date()}
  `;
  res.send(status);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
