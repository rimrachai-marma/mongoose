const mongoose = require('mongoose');

const User = require('./models/user');

//DB Config
mongoose
  .connect('mongodb://localhost:27017/testDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((conn) => {
    console.log(
      `Mongodb Connected to: ${conn.connection.host}, ${conn.connection.name} on PORT ${conn.connection.port} `
    );
  })
  .catch((err) => {
    console.log('Failed to connect to MongoDB,\nError: ', err);
  });

run();
async function run() {
  try {
    // const user = new User({ name: 'Rimrachai Marma', age: 23 });
    // await user.save();

    // const user = await User.create({
    //   lName: 'John',
    //   fName: 'Doe',
    //   email: 'john@gmail.com',
    //   password: '12345678',
    //   age: 26,
    //   hobbies: ['playing cricket', 'Listening music'],
    //   address: {
    //     street: 'Main St'
    //   }
    // });

    // const user = await User.where('age')
    //   .gt(12)
    //   .where('fname')
    //   .equals('John')
    //   .select('name age'); //.select('-name -age');

    const user = await User.find({}).select('-password -tokens');

    console.log(user);
  } catch (error) {
    console.log(error.message);
  }
}
