/* Improvements to implement:
1. right only one face is detected. Add support for multiple faces
*/



/*Importing external libraries, hooks, components, and styles*/
import ParticlesBg from 'particles-bg';
import { useState, useRef, useEffect } from 'react';

import Navigation from './components/Navigation/Navigation.jsx';
import Logo from './components/Logo/Logo.jsx';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.jsx';
import Rank from './components/Rank/Rank.jsx';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.jsx';
import SignIn from './components/SignIn/SignIn.jsx';
import Register from './components/Register/Register.jsx';

import './App.css'

/*Peparing the API request from Clarifai*/
/*
  We are sending a POST requesr to send data to the Clarifai face-detection endpoint (method: 'Post')
  In headers, we we specify what kinf of data we send and include the API key (Authorization)
  body: rwa is the actual data we are sending. 
  Raw is created with a JSON.stringify(), which turn a JavaScript Object into a JSON string -> that JSON describes: who we are (user_id, app_id) and what image Clarifai should analyze.
*/

const buildClarifaiRequestOptions = (imageURL) => {
  const PAT = import.meta.env.VITE_API_PAT;
  const USER_ID = import.meta.env.VITE_API_USER_ID;
  const APP_ID = import.meta.env.VITE_API_APP_ID;
  const IMAGE_URL = imageURL;

  const raw = JSON.stringify({
    "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
    },
    "inputs": [
        {
            "data": {
                "image": {
                    "url": IMAGE_URL
                }
            }
        }
    ]
  });

  const requestOptions = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
  };

  return requestOptions;
}

const App = () => {
  /* --- State hooks --- */
  /*
    1. React Hooks:
    - useState: lets you declare state variables (e.g. input, user, box).
    - useRef: stores a mutable reference to a DOM element or value that persists across renders without triggering re-renders.
    - useEffect: runs side effects (e.g., API calls) after the component renders.
    
    2. State variables:
    - input: stores the current value of the image URL input field.
    - imageURL: stores the URL of the image to be processed/displayed.
    - box: stores the coordinates of the detected face bounding box.
    - route: tracks the current page/view (signIn, register, home).
    - user: stores user information (id, email, name, entries, joined).
    - message: stores error or status messages to display to the user.
  
    3. Refs:
    - imageRef: a reference to the actual <img> element in the DOM.
    - lastClarifaiData: stores the last response from the Clarifai API.
  */
  const [input, setInput] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [box, setBox] = useState({});
  const [route, setRoute] = useState('signIn');
  const [user, setUser] = useState({
      id: '', 
      email: '', 
      name: '',
      entries: 0,
      joined: ''
    });
  const [message, setMessage] = useState('');

  const imageRef = useRef(null);
  const lastClarifaiData = useRef(null); // Hooks (useRef) always return a ref object

  /* --- useEffect to check backend server connection on component mount --- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/');
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          return; // need to check if this works!!
        }
        const data = await response.json(); // parse JSON
        console.log(data); // do something with data
      } catch (err) {
        console.error('Error connecting to backend server:', err);
      }
    };
    fetchData(); // call the async function
  }, []); // empty dependency array => runs only once (componentDidMount)
  

  /*---Functions---*/
  /*-Utility/Helper functions-*/

  const calculateFaceLocation = (data) => {
    if (!data.outputs || data.outputs.length === 0) {
      console.warn("No face detected or invalid response:", data); // Verify again because right now the error message is not even shown!
      return null;
    }

    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = imageRef.current;
    const width = Number(image.width);
    const height = Number(image.height);
    
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  const setFaceBox = (box) => setBox(box);


  /*-Event Handlers-*/

  // Load user data after sign in or register
  const handleSignIn = (data) => {
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      entries: data.entries,
      joined: data.joined
    });
  }

  // Reset state on sign out. 
  const handleSignOut = () => {
    lastClarifaiData.current = null;
    setUser({ 
      id: '', 
      email: '', 
      name: '', 
      entries: 0,
      joined: '' });
    setInput('');
    setImageURL('');
    setBox({});
  }; 

  const handleRouteChange = (newRoute) => {
    if (newRoute === 'signOut') {
      handleSignOut();
      setRoute('signIn');
    } else if (newRoute === 'home') {
      setRoute('home');
    } else {
      setRoute(newRoute);
    }
  }; 
  
  const handleInputChange = (event) => setInput(event.target.value);

  const handleImageLoad = () => {
    if (lastClarifaiData.current) {
      const box = calculateFaceLocation(lastClarifaiData.current);
      if (box) setFaceBox(box);
    }
  }

  const handleImageSubmit = async () => {
    setMessage(''); // clear previous messages
    setImageURL(''); // clear image
    setBox({}); // clear box

    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

    try {
      // await fetch() pauses until the HTTP request comes back
      // we first hit Clarifai's face-detection endpoint and then with buildClarifaiRequestOptions we tell fetch what kind of request we are making
      const response = await fetch(
        `/api/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
        buildClarifaiRequestOptions(input)
      );

      // the response contains the server's answer, which is raw text. it then gets converted into a JavaScript Object (json).
      // .json() converts the raw text response into a JavaScript object so we can access data.outputs[0].data.regions.
      const data = await response.json();
      lastClarifaiData.current = data; // save API response 

      // Check if there are any faces
      const regions = data.outputs?.[0]?.data?.regions;
      if (!regions || regions.length === 0) {
        setMessage('No face detected in the image.');
        return; // stop further processing
      }

      setImageURL(input); // show image only if face detected. Sets the imageURL state, which triggers rendering the image

      // Update user entries
      // PUT request to the backend to update user information. 
      // body: JSON.stringify({ id: user.id }) means you’re sending your user’s ID as JSON.
      // Your backend then increments the entries count for that user and replies with the new number.
      const countResponse = await fetch('http://localhost:3000/image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id })
      });
      const count = await countResponse.json();
      setUser(prevUser => ({ ...prevUser, entries: count }));

    } catch (err) {
      console.error("Error fetching Clarifai data:", err);
      setMessage('Error processing the image.');
    }
  };


  /*-Render logic-*/
  let page;

  if (route === 'signIn') {
    // You’re passing the handleSignIn function defined in App.jsx...
    // ...to the SignIn component, where it can be used as props.loadUser.
    // Left side of = → the name of the prop inside the child component.
    // Right side of = → the variable/function you’re passing from the parent.
    page = <SignIn handleSignIn={handleSignIn} handleRouteChange={handleRouteChange} />;
  } else if (route === 'register') {
    page = <Register handleSignIn={handleSignIn} handleRouteChange={handleRouteChange} />;
  } else if (route === 'home') {
    page = (
      <>
        <Rank name={user.name} entries={user.entries}/>
        <ImageLinkForm 
          handleInputChange={handleInputChange} 
          handleImageSubmit={handleImageSubmit}
        />
        {message && <div className="f6 red mv3">{message}</div>} {/* Display error/status message */}
        <FaceRecognition
          box={box}
          imageURL={imageURL}
          handleImageLoad={handleImageLoad}
          imageRef={imageRef} 
        />
      </>
    );
  }

  return (
    // this is short for <React.Fragment>...</React.Fragment>
    <>
      <ParticlesBg type="cobweb" bg={true} />
      <div className="App">
        <Navigation route={route} handleRouteChange={handleRouteChange} />
        <Logo />
        {page}
      </div>
    </>
  );
}

export default App
