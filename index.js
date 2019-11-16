const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
