var sqlite3 = require("sqlite3").verbose();
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// readline (buffer) controls
let mainrl = true;
let addrl = false;
//helper method
const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

const HELPMSG = `to add to your phonebook: add
to show all the users: showall
to show a specific user: show
to clear the screen: clear
to show this help msg: *press enter*
to stop the application: exit`;
// this creates the database file and connects to it
const initializeDB = () => {
  var db = new sqlite3.Database("./ContactsDB.db", (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to ContextsDB SQlite database.");
  });
  db.serialize(() => {
    //create the tables
    db.run(
      "CREATE TABLE IF NOT EXISTS contact (id INTEGER PRIMARY KEY,name TEXT NOT NULL)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS number (id INTEGER PRIMARY KEY,number TEXT NOT NULL,contact_id INTEGER NOT NULL REFERENCES contact(id))"
    );
  });
  return db;
};
// inserting a contact into the database, needs the database object, a name, and a numbers array
const insertContact = (db, contact, numbers) => {
  db.serialize(() => {
    db.run("INSERT INTO contact (name) VALUES (?);", contact);
    for (const number of numbers) {
      db.run(
        "INSERT INTO number (number,contact_id) VALUES(?,(SELECT id from contact where name = ?));",
        number,
        contact
      );
    }
  });
};
//getting a single contact
const getContact = (db, contact) => {
  db.serialize(() => {
    db.all(
      "SELECT name, number from contact join number on contact_id=contact.id where name = ?",
      contact,
      (err, res) => {
        if (res.length == 0) {
          console.log(
            "didn't find the contact, maybe add it by entering 'add'"
          );
        }
        for (const row of res) {
          console.log(row);
        }
      }
    );
  });
};
//getting all the contacts
const getAll = (db) => {
  db.serialize(() => {
    db.all("SELECT name FROM contact", (err, res) => {
      if (res.length == 0) {
        console.log("it's empty, start adding by entering 'add'");
      }
      for (const row of res) {
        console.log(row);
      }
    });
  });
};
// adding a contact this is a the logic for the application that does it all
const addContact = async () => {
  let values = [];
  let output = undefined;
  rl.setPrompt(`Please enter your contact's name:\n`);
  rl.prompt();
  rl.on("line", (number) => {
    //controlling the buffers
    if (addrl) {
      if (number == "q") {
        addrl = false;
        output = { contact: values.splice(0, 1), numbers: values };
        return;
      }
      rl.setPrompt(``);
      values.push(number);
      console.log(
        "Enter their number: (you can enter one or more, enter q when you are done)"
      );
    }
  });
  rl.prompt();
  //weird workaround to keep this function from returning the values before
  //allowing the user to enter them.
  while (!output) await sleep(100);
  return output;
};
// the main entry point of the program
async function main() {
  const db = initializeDB();
  console.log(`Welcome to your PhoneBook\n
${HELPMSG}`);
  //main loop
  rl.prompt();
  // listening to the enter button press.
  rl.on("line", async (input) => {
    if (main) {
      switch (input) {
        case "exit":
          rl.close();
          console.log("Thank you for trying my simple application :)");
          break;
        case "add":
          //controlling buffers
          mainrl = false;
          addrl = true;
          const { contact, numbers } = await addContact();
          console.log(`successfully added ${contact}`);
          mainrl = true;
          insertContact(db, contact, numbers);
          break;
        case "clear":
          //clears the screen (weird way but it's the standard :/)
          console.log(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`);
          break;
        case "showall":
          //get all contacts
          getAll(db);
          break;
        case "show":
          //controlling buffers
          mainrl = false;
          rl.question(`who would you like to see\n`, (contact) => {
            getContact(db, contact);
            mainrl = true;
          });

          break;
        default:
          // if we are in the main buffer any other unknown command will result in this
          if (mainrl) {
            console.log(`This command is not supported\n`);
            console.log(HELPMSG);
          }
          break;
      }
    }
    rl.setPrompt(``);
  });
  rl.prompt();
  // closing the database once the application stops (either naturally or by force)
  rl.on("close", () => {
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Close the database connection.");
    });
  });
}

if (require.main === module) {
  main();
}
