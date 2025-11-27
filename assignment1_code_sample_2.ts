import * as readline from "readline";
import * as mysql from "mysql";
import { exec } from "child_process";
import * as http from "http";

/* 
ISSUE: The database password is hardcoded directly in the source code.
RISK: It's an A05:2021 Security Misconfiguration risk.
*/
const dbConfig = {
  host: "mydatabase.com",
  user: "admin",
  password: "secret123",
  database: "mydb",
};

function getUserInput(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter your name: ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/*
ISSUE: Input variables are passed directly into a shell command executed by `exec`.
RISK: This can lead to OS Command Injection (A03:2021 - Injection).
*/
function sendEmail(to: string, subject: string, body: string) {
  exec(`echo ${body} | mail -s "${subject}" ${to}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error sending email: ${error}`);
    }
  });
}

/*
ISSUE: Input variables are passed directly into a shell command executed by `exec`.
RISK: This can lead to OS Command Injection (A03:2021 - Injection).
*/
function getData(): Promise<string> {
  return new Promise((resolve, reject) => {
    http
      .get("http://insecure-api.com/get-data", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

/*
ISSUE: The SQL query is constructed using unsafe string interpolation with user-controllable data.
RISK: It is an A03:2021 - Injection risk.
*/
function saveToDb(data: string) {
  const connection = mysql.createConnection(dbConfig);
  //
  const query = `INSERT INTO mytable (column1, column2) VALUES ('${data}', 'Another Value')`;

  connection.connect();
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
    } else {
      console.log("Data saved");
    }
    connection.end();
  });
}

(async () => {
  const userInput = await getUserInput();
  const data = await getData();
  saveToDb(data);
  sendEmail("admin@example.com", "User Input", userInput);
})();

/*
ISSUE: Data from an external source is used without validation.
RISK: The integrity of the data is not verified, creating a Software and Data Integrity Failure (A08:2021).
FIX: Always validate or sanitize data from external sources before processing or storing it.
*/

