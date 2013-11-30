Mongo-G
======

#### Responsive web based MongoDB management interface for Node.JS
<img src="http://georgeholmesii.com/mongog1.png" title="screenshot" />

Overview
-----------
Mongo-G is a standalone Node.JS app built with Express and EJS. It's a GUI wrapper that abstracts common MongoDB functions. Users can manage databases, collections, and documents.

Setup
-----------
**Download or clone repo.**

**In the terminal navigate to the directory of Mongo-G:**
    
    cd /PATH_TO_MONGOG/mongog-master

**Install dependencies with npm:**
    
    npm install

**Edit mongo-config.js in the config folder to set the port and hostname of MongoDB. Optionally, edit app.js to change the port that you want to run Mongo-G on.**

**Run Mongo-G with:**
    
    node app


Capabilities
-----------

* Create and drop databases
* View database stats
* View all collections and documents in databases
* Create and drop collections
* Insert and modify documents
* View the MongoDB log
* Admin restricted access

Notes
-----------
* To get started in Mongo-G, you login as an admin, so ensure you have a user with an administrative role in the admin database
* Currently, user authentication for individual databases is not possible
* To modify and delete a document, it must have an _id field


**Mongo-G is a work in progress and is intended for development use**.
