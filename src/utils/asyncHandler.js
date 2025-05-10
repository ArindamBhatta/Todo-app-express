const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next); // after URL we need to pass the function
    } catch (error) {
      next(error);
    }
  };
};
export { asyncHandler };

/* 
1. Express doesn't catch async errors automatically
If you use an async function directly in an Express route, and it throws an error (or a rejected promise), Express won't catch it unless you manually pass it to next(err).

2. Avoids repetitive try/catch blocks
Instead of writing try/catch in every route handler, you wrap them with asyncHandler, which centralizes error catching.


app.get("/user", async (req, res, next) => {
  try {
    const user = await getUserFromDB();
    res.json(user);
  } catch (err) {
    next(err);
  }
});


app.get("/user", asyncHandler(async (req, res) => {
  const user = await getUserFromDB();
  res.json(user);
}));

const multiply = function(a) {
    return (b) =>{
        return a*b;
    }
}

const double = multiply(2);

console.log(double);

(b) =>{
        return a*b;
    }

console.log(double(5))

*/
