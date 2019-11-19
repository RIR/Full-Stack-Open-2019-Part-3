require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

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

app.use(express.static('build'));
app.use(bodyParser.json());
app.use(customLogger);

const NAME_MISSING = { error: 'name missing' };
const NUMBER_MISSING = { error: 'number missing' };
const PERSON_NOT_FOUND = { error: 'person not found' };
// ### Routes

// Persons routes
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON());
      } else {
        next(PERSON_NOT_FOUND);
      }
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const {
    body: { name, number }
  } = req;

  const person = new Person({ name, number });

  person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(personAsJSON => res.json(personAsJSON))
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const {
    body: { name, number },
    params: { id }
  } = req;

  if (!name) {
    next(NAME_MISSING);
  } else if (!number) {
    next(NUMBER_MISSING);
  } else {
    const person = { name, number };

    Person.findByIdAndUpdate(id, person, { new: true })
      .then(updatedPerson => updatedPerson.toJSON())
      .then(personAsJSON => res.json(personAsJSON))
      .catch(error => next(error));
  }
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

// Info route
app.get('/info', (req, res, next) => {
  Person.count({})
    .then(result => {
      const status = `
      Phonebook has info for ${result} people
      ${new Date()}
      `;
      res.send(status);
    })
    .catch(error => next(error));
});

// ###

// ### Error handlers
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  const { message, name, kind } = error;
  console.error(message);

  if (name === 'CastError' && kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (name === 'ValidationError') {
    return res.status(400).json({ error: message });
  } else if (error === NAME_MISSING || error === NUMBER_MISSING) {
    return res.status(400).json(error);
  } else if (error === PERSON_NOT_FOUND) {
    return res.status(404).end();
  } else next(error);
};

app.use(errorHandler);

// ###

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
