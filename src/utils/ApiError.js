class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    error = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.error = error;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor); //this is ApiError instance when object is created
    }
  }
}

/* 
It tells V8 to capture the stack trace starting from the caller of the constructor, so that ApiError itself doesn't appear in the stack.
if we want to store the instance then we can use this.constructor

class Animal {
  constructor(name) {
    this.name = name;
  }

  clone() {
    return new this.constructor(this.name);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  clone() {
    return new this.constructor(this.name, this.breed);
  }
}

const rex = new Dog("Rex", "Labrador");
const rexClone = rex.clone(); // new Dog("Rex", "Labrador")

console.log(rexClone instanceof Dog); // true
*/
