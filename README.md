NGOs Project using Express.js and Integrated Treblle for API security and monitring purpose.

To setup the project, Firstly clone the project
```shell
git clone https://github.com/ishan-18/Ctrl-Shift-Hack.git
```
Then cd into that folder
```shell
cd [folder_name]
```

Then you have to run the following command:
``` shell
npm i .
```
The above command will install the dependencies

Then after the dependencies are installed, you have to start your Redis-server by typing the following command:
```shell
redis-server
```


Now you have to setup a .env file into the `config` directory.
You can cd into config, by typing the following command
```shell
cd config
```
You can create a .env file using touch command
```shell
touch .env
```
Now refer the `.env.example` file, and fill the fields according to that
```shell
PORT=4000
MONGO_URI=mongodb://localhost:27017/ctrlshifthack11
NODE_ENV=development
JWT_SECRET=
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
TREBLLE_API_KEY=
TREBLLE_PROJECT_ID=
GEOCODER_PROVIDER=mapquest
GEOCODER_API_KEY=
```
So this are the fields for JWT_SECRET, you can type anything into that for example
```shell
JWT_SECRET=sjadkjsdfjksdfjlkfjsdkjlkfjioerjiojrefi
```

For TREBLLE_API_KEY and TREBLLE_PROJECT_ID, you have to insert your key and id into that

For GEOCODER_API_KEY, You have to open you account on [Developer_MapQuest](https://developer.mapquest.com/)
Go in Profile > Manage Keys > You will found your key here.


I am running the https server, so you have to install openssl for the same.
[Install_OpenSSl](https://itslinuxfoss.com/install-openssl-ubuntu-22-04/)
The above link will help you in installation steps of Openssl.

Then create a folder cert in the same project directory using
```shell
mkdir cert
```

Then `cd cert` to go into that directory, Now type in following commands one by one
```shell
# command 1
openssl genrsa -out key.pem
```
```shell
# command 2
openssl req -new -key key.pem -out csr.pem
```
```shell
# command 3
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
```

Now the `key.pem` and `cert.pem` has been created add this files path in server.js while creating https.createServer

```shell
const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app)
```

Once Redis server has been started and doing all the above configurations, You can now run 
```shell
npm run dev
```
The above command will start the server in development mode and will automatically restart the server
Or if you want to start the server in production mode, then you can type the following command
```shell
npm run start
```

You server will run on PORT 4000.

If you are using Postman for sending the api request, then disable the following setting
Postman > Settings > General > SSL Certificate Verification > Off

--------------------------------------------------------------------------------------------------------------------
Explaining The API Details now
There are 3 modules
1) Auth
2) NGO
3) Animal

The conventions I used for API is:
```shell
app.use('/api/v1/auth', require('./routes/auth.route'))
app.use('/api/v1/ngos', require('./routes/ngo.route'))
app.use('/api/v1/animals', require('./routes/animal.route'))
```
You can access this routes by `https://127.0.0.1:4000/api/v1/auth` For Auth module. For other Modules it's same.

For Auth Module:


For Auth Register: `https://127.0.0.1:4000/api/v1/auth/register`
The Body you are going to put is
```shell
{
    "name": "John Doe",
    "email": "johndoe1@gmail.com",
    "password": "johndoe@123",
}
```
So after hitting the Post Route you will get response token.
Take that token set header in postman `Authorization: Bearer {token}` to accessing private routes.
By Default the user will be "user" but to change the role you can specify role field like
```shell
{
    "name": "John Doe",
    "email": "johndoe1@gmail.com",
    "password": "johndoe@123",
    "role": "ngouser"
}
```


For Auth Login: `https://127.0.0.1:4000/api/v1/auth/login`
The Body you are going to put is
```shell
{
    "email": "johndoe1@gmail.com",
    "password": "johndoe@123",
}
```
So after hitting the Post Route you will get response token.
Take that token set header in postman `Authorization: Bearer {token}` to accessing private routes.


For Auth Logout: `https://127.0.0.1:4000/api/v1/auth/logout`
No Body is required as it is `GET` route.
The Cookies will be set to none.


For Auth me: `https://127.0.0.1:4000/api/v1/auth/login`
No Body is required as it is `GET` route.
Just set the `Authorization: Bearer {token}` in headers as it is Private route.


Now for NGO Module
You can access this routes by `https://127.0.0.1:4000/api/v1/ngos` For NGO module.


For Getting all NGOs: `https://127.0.0.1:4000/api/v1/ngos/`
As this is GET request, No Body is required.
This is a `Private` route so set header in postman `Authorization: Bearer {token}`


For Getting a NGO By Id: `https://127.0.0.1:4000/api/v1/ngos/${id}`
As this is GET request, No Body is required.
This is a `Private` route so set header in postman `Authorization: Bearer {token}`


For Creating a NGO: `https://127.0.0.1:4000/api/v1/ngos/`
This is a `Private` route so set header in postman `Authorization: Bearer {token}
For creating a NGO, you need to be a `ngouser` . If you are logged in via `user` then you are getting an error.
As this is a Post request, Type this in the body
```shell
{
    "name": "NGO1",
    "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut, dolore fugiat non odit nisi reprehenderit alias culpa rem quisquam nihil qui. A molestiae earum quod sapiente ratione corporis dolores ad!",
    "website": "https://ngo3.com",
    "phone": "(333) 333-3333",
    "email": "ngo3@gmail.com",
    "address": "233 Bay State Rd Boston MA 02215"
}
```
The NGO will be get created.


For Updating a NGO: `https://127.0.0.1:4000/api/v1/ngos/${id}`
This is a `Private` route so set header in postman `Authorization: Bearer {token}`
For updating a NGO, you need to be a `ngouser`. If you are logged in via `user` then you are getting an error.
NGO will be get updated only if you are the owner of that NGO.
As this is a PUT request, Type this in the body
```shell
{
    "name": "NGO5"
    // you can put any field but the field should match the field in schema def.
}
```


For Deleting the NGO: `https://127.0.0.1:4000/api/v1/ngos/${id}`
This is a `Private` route so set header in postman `Authorization: Bearer {token}`
For Deleting a NGO, you need to be a `ngouser`. If you are logged in via `user` then you are getting an error.
NGO will be get deleted only if you are the owner of that NGO.


For Getting the NGO: `https://127.0.0.1:4000/api/v1/ngos/radius/:zipcode/:distance`
This is a `Private` route so set header in postman `Authorization: Bearer {token}`
In `distance: 5` any number will work.


Now For Animal Module:
You can access this routes by `https://127.0.0.1:4000/api/v1/animals` For Animal module.


For Getting all The Animals: `https://127.0.0.1:4000/api/v1/animals`
As this is GET request, No Body is required.
This is a `Private` route so set header in postman `Authorization: Bearer {token}`


For Getting a Animal By Id: `https://127.0.0.1:4000/api/v1/animals/${id}`
As this is GET request, No Body is required.
This is a `Private` route so set header in postman `Authorization: Bearer {token}`


For Posting the details of a Animal: `https://127.0.0.1:4000/api/v1/animals/`
This is a `Private` route so set header in postman `Authorization: Bearer {token}`
For posting the details of a Animal, you need to be a `user`. If you are logged in via `ngouser` then you are getting an error.
As this is a Post request, Type this in the body
```shell
{
    "animal_species": "Dog",
    "description": "XYZ",
    "address": "233 Bay State Rd Boston MA 02215",
    "rescue_priority": "Medium"
}
```


For Updating the Details of Animals: `https://127.0.0.1:4000/api/v1/animals/${id}`
This is a `Private` route so set header in postman `Authorization: Bearer {token}`
For Updating the Details of Animals, you need to be a `user`. If you are logged in via `ngouser` then you are getting an error.
Animals details will be get updated only if you are the one who posted that details.
As this is a PUT request, Type this in the body
```shell
{
    "animal_species": "Dog1",
    // you can put any field but the field should match the field in schema def.
}
```


For Deleting the Details of Animals: `https://127.0.0.1:4000/api/v1/animals/${id}`
This is a `Private` route so set header in postman `Authorization: Bearer {token}`
For Deleting the Details of Animals, you need to be a `user`. If you are logged in via `ngouser` then you are getting an error.
Animals details will be get deleted only if you are the one who posted that details.


For Getting the nearby Animals: `https://127.0.0.1:4000/api/v1/animals/radius/:zipcode/:distance`
This is a `Private` route so set header in postman `Authorization: Bearer {token}`
In `distance: 5` any number will work.


For Allowing The NGOs to rescue the Animals: `https://127.0.0.1:4000/api/v1/animals/ngo/${ngoId}`
This is a `Private` route so set header in postman `Authorization: Bearer {token}`
For Deleting the Details of Animals, you need to be a `ngouser`. If you are logged in via `user` then you are getting an error.
As this a PUT request, You are going to type this in body
```shell
{
    "animalid": "73b6f76c-dd1a-4204-8dc1-da1270e825f5"
}
```

I have used NGINX for reverse_proxy and gzip compression, but I was not able to integrate with docker, but locally I am able to do it. 


