require('dotenv').config();
const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const [password, name, number] = process.argv.slice(2);

const url = process.env.DB_URI;

mongoose.connect(url, { useNewUrlParser: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

if (password && name && number) {
  const person = new Person({ name, number });

  person.save().then(response => {
    const { name, number } = response;
    console.log(`Added ${name} number ${number} to phonebook.`);
    mongoose.connection.close();
  });
} else if (password) {
  Person.find({}).then(result => {
    console.log('Phonebook:');
    result.forEach(person => {
      const { name, number } = person;
      console.log(`${name} ${number}`);
    });
    mongoose.connection.close();
  });
}
