This folder includes:

server.js -- provide connection between website and database, and backend functions to interact with database.

HTML files for web pages.
JS files to support corresponding HTML functionalities.

To Run: first make sure you have node.js installed (both in your pc and the code file folder), if you don't have it in your folder:

npm install express --save

and then

npm install pg --save

and

npm install path --save

and in your terminal,type:

node server.js

then go to your browser and type http://localhost:3000/ in the url.
DO NOT use https, or http://0.0.0.0:3000/, these will not work.
