//! Method how to connect sql in CURD Operation
/\*
Todo connect with Database
? 1.Create a Data base in sql and check the connection string is work or not try{}
? 2.Write similar to the global object
! getTodoHandler method: -

-           when you fetch all todo data there is no global object so,
               fetch that data from data base but how?
               we create a function in index.js call getTodoHandler and in that function, we call another function  getTodo which method is written in data base file
  ? getTodo method: -
  we have 3 inbuilt method communicate with sql
  ? client.connect();
  use this method to connect with data base
  ? client.query(`select * from "todo`);
  use this method write sql in there
  ? client.end();
  use end to terminate from sql database
  ! postTodoHandler
  every data take from request body and call data base function with this arguments
  ? insertTodo method: -
  i. Create a unique id 1st just like global object
  ii. write the sql and pass the argument in client.query(`INSERT INTO todo (id, title, description) VALUES (${id}, ${title}, ${description})`)
  ! putTodoHandler: -
  i. take all new data from request.body
  ii. send it in the updateTodo method as a argument
  ? updateTodo method: -
  iii.`UPDATE todo SET title = ${title}, description = ${description} WHERE id = ${id};`;
  _/
  //? Connected to data base
  /_
  const express = require("express");
  const app = express();
  const port = 3000;

const { Client } = require("pg");
const connectionString =
"postgres://nifdtwpk:tDvRBf5sUvFympRdoISWInShx2r7ZXQd@kala.db.elephantsql.com/nifdtwpk";

const client = new Client({ connectionString });
? in Db file we don't need the connect method every function call individuals connection method
client
.connect()
.then(() => {
console.log("Connected to ElephantDB");
})
.catch((error) => {
console.error("Error connecting to ElephantDB:", error);
});

app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});

\*/
