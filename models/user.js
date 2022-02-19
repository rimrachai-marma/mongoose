const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String
});

const userSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      required: true,
      trim: true
    },
    lName: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      min: 1,
      validate: {
        validator: (value) => value % 2 === 0,
        message: '{VALUE} is not an even number'
        // message: (props) => `${props.value} is not an even number!`
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain  as "password"');
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    gender: {
      type: String,
      trim: true,
      enum: {
        values: ['Male', 'Female', 'Custom'],
        message: '{VALUE} is not supported'
      },
      default: 'Custom'
    },
    bestFriend: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    },
    hobbies: [String],
    // address: {
    //   street: String,
    //   city: String
    // },
    address: addressSchema
    // createdAt: {
    //   type: Date,
    //   immutable: true,
    //   default: () => Date.now()
    // },
    // updatedAt: {
    //   type: Date,
    //   default: () => Date.now()
    // }
  },
  {
    timestamps: true
  }
);

//comparing passwoed with static methods
userSchema.statics.findByCredentials = async (email, enteredPassword) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(enteredPassword, user.password);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return user;
};

//generate auth token with instance method
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, 'seCret kEy');

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//hash and salting password with middleware "Pre Hook"
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// middleware "post Hook"
userSchema.post('save', function (error, doc, next) {
  console.log(error);
  if (error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});

// Create a virtual property `fullName`.
userSchema.virtual('fullName').get(function () {
  return `${this.fName} $(this.lName}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
