# React with express Backend and python interface for people counting

## ***Steps to run the project :***

1. Git clone the repository from ```https://github.com/PeopleCounter/React_Backend.git```  

2. Go to ```React_Backend/Daashboard_2.0/Dashboard``` and run the command
```npm install``` to install all the dependencies.
3. Go to ```React_Backend/Backend``` and run ```npm install``` to install all the dependencies
4. Go to ```React_Backend/Backend/index.mjs``` and type ```nodemon index.mjs``` to get the ```express server``` up and running on port ```3000```. The ```web socket``` server is present on port ```4001```
5. The fron end (using ```React``` and ```Vite```) runs on port ```5137```
6. Go to ```React_Backend/Backend/Python``` and run ```PeopleCounter.py``` to start people counting
7. For python use ```pip install opencv-python``` to download the latest version of opencv python
<br>
<br>
<br>

## ***List of Dependencies :***

<br><br>

<p align="center">
<a href="https://nodejs.org/en"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Node.js_logo_2015.svg/1280px-Node.js_logo_2015.svg.png" height="70"/></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href=""><img src = "https://repository-images.githubusercontent.com/958314/195c4a80-7da7-11e9-9a33-54d9fffac84f" height="70"/></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://react.dev/"><img src="https://repository-images.githubusercontent.com/410214337/070f2aba-d9d6-4699-b887-9a0f29015b1b" height="70"/></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://www.python.org/"><img src="https://www.python.org/static/img/python-logo.png" height="70"/></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://opencv.org/"><img src="https://upload.wikimedia.org/wikipedia/commons/3/32/OpenCV_Logo_with_text_svg_version.svg" height="70"/></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://socket.io/"><img src="https://avatars.githubusercontent.com/u/10566080?s=200&v=4" height="70"/></a><a href="https://socket.io/"><img src="https://mongoosejs.com/docs/images/mongoose5_62x30_transparent.png" height="70"/></a>
</p>

<br>
<br>
<br>

## ***How does our web application work ? :***

1. On opening the front end using ```vite```, a login page opens up. The user has to login before the main dashboard can be accessed.

2. For the login we have used Mongo DB as our database with ```mongoose``` as our database driver. 


3. For safety of our resources from ```Cross Origin Requests``` we have used ```express's CORS``` library to which URLs are allowed to access our backend
4. For the parsig of responses we use the ```express.json``` middleware. We send and receive data in the json format. A custom form handler is used to extract essential details from the form and send it in ```json``` format to the server
5. The server validates the credentials in the form and after validating the credentials it stores users ```csrf token``` in the session and sends a copy of the token to the user. For any further post request client has to send the csrf token where it is matched against the csrf token in the server. If they are same, the POST request is accepted else it is rejected
6. For the real time people counting, we have used ```opencv```. We have made a small optimization for conservation of the number of POST request made.
7. Every 5 seconds a function is run that checks if the total number of people comming in and going out is same as the number of people comming in and going out in the previous 5 seconds. If they are same don't make a POST request to the server
8. In case they are not same a POST request is made to the server and the new count is stored in the mongo DB database. The server is connected to the client via ```Web Socket```. As a result the new counts are immediately reflected on the web browser resulting in less time delay between updating and showing the update to the user
9. We have also used ```multi threading``` in the people counting code. The code to send POST request run on a different thread than the one used for counting. Thus counting isn't affected by the POST request made every 5 seconds
10. On the client side we have made use of ```useEffect hook``` to connect to the websocket running on port 4001. We have made use of the ```useState hook``` to update the count displayed in the browser 


