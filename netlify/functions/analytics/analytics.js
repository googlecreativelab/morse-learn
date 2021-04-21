// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
// get the client
const mysql = require("mysql2");

// create the connection to database
const connection = mysql.createConnection({
  host: "localhost:8889",
  user: "root",
  database: "morse_learn",
  password: "root"
});

const handler = async (event) => {
  try {
    const response = await new Promise((res, rej) => {
      connection.query("SELECT ?", [1], function(err, results, fields) {
        if(err) return rej(err) // results contains rows returned by server
        res([results, fields])
      }); 
    }) 

    console.log(response)

    const subject = event.queryStringParameters.name || "World";
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Hello ${subject}` }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
