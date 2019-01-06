## Blendy API Project for @BlendyCat
This is a simple API project for @BlendyCat to work on developing. Take note of the installed libraries `express`, `mongoose` and `passport` which should be all that is needed for this project.

The overall goal of this project is to create a simple local user authentication system that has the user email, password, customizable username and coin count. The API should have endpoints for the account, updating and reading the gold values.

#### Endpoints
- Account Login
- Account Register
- Get Profile (including coins)
- Post Profile (can contain coins but doesn't have to)

These endpoints should be implemented to read and return JSON data only. This project has no web frontend it is only API. Don't worry about `/` just the endpoints that are required. Take a look at `index.js` for an example route.

#### Documentation
You are responsible for maintaining updated documentation for each endpoint. You can do this pretty easily with Postman if you want to do it that way. Please make sure to provide documentation for all endpoints. You should also make sure that all your code is well documenented and up to modern JS standards. It's very important to document everything you write, you don't have to go into extreme detail but at least make sure each function and endpoint function is documented.

#### Next Steps
1. Read [owasp password storage cheatsheet](https://www.owasp.org/index.php/Password_Storage_Cheat_Sheet)
2. Implement proper hashing using a Node library (see "Leverage an adaptive one-way function") of cheet sheet
3. Implement password checks like owasp cheat sheet
4. Install [Marked](https://marked.js.org/#/README.md#README.md) library
5. Create `/` route to serve a markdown document (see [StackOverflow](https://stackoverflow.com/a/27971978))
6. Fill in the markdown document to show public routes and how to use them (like Postman doc)
7. Make sure the markdown document has a link to the repository
8. Add way to allow user to change email address (endpoint, can be same endpoint as step 9)
9. Add way to allow user to change password (endpoint, can be same endpoint as step 8)
10. Add password reset "forgot password" functionality.