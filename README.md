# Phonebook

This project is a small application does using javascript and sqlite and docker

the features that this application contains are the following:

- Add a name and associate it with either one number or more than one.

- Show a list of names.

- Show a name with numbers associated with it.

to install the application locally (after cloning the files) do the following:

```
npm install
node app.js
```

that's it for running it locally, the application will create a ContactsDB.db file for you to use anywhere you like

to try the application in a dockeized format do the following:

```
docker pull ahmedalamoudi192/phonebook:1.0
docker run -it ahmedalamoudi192/phonebook:1.0
```
