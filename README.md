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




