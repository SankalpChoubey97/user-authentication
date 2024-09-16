# user-authentication
creating a simple user authentication setup, which can be used as started for any application. 

To start with this code, on your system, copy the codes inside a folder. Now from terminal, go to your folder and use npm i, to extract all modules.

example: PS E:\D\node js\user authentication> npm i

Note: install npm before using above command.

Changes to env file
1) Change DB_URL to your system's mongodb localhost.
2) JWT_SECRET can be modified but its optional. 

Getting started with the project 
On terminal, go to the folder/directory where server.js is present. Type node server.js, to start the backend. 

example: PS E:\D\node js\user authentication> node server.js

On browser, go to below path to veiw the web application.

http://localhost:3200/api/users/signIn

From here you can navigate signup, signin, signout, change password while signed in and reset password. 
