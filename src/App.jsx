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

const App = () => {
  /* --- State hooks --- */
  /*
    1. React Hooks:
    - useState: lets you declare state variables (e.g. input, user, box).
    - useRef: stores a mutable reference to a DOM element or value that persists across renders without triggering re-renders.
    - useEffect: runs side effects (e.g., API calls) after the component renders.
    
    2. State variables:
    - inputURL: stores the current value of the image URL input field.
    - image: stores the URL of the image to be processed/displayed.
    - box: stores the coordinates of the detected face bounding box.
    - route: tracks the current page/view (signIn, register, home).
    - user: stores user information (id, email, name, entries, joined).
    - message: stores error or status messages to display to the user.
  
    3. Refs:
    - imageRef: a reference to the actual <img> element in the DOM.
    - lastClarifaiData: stores the last response from the Clarifai API.
  */
  const [inputURL, setInputURL] = useState('');
  const [image, setImage] = useState('');
  const [boxes, setBoxes] = useState([]); // Changed from single box to array of boxes
  const [route, setRoute] = useState('signIn');
  const [user, setUser] = useState({
      id: '', 
      email: '', 
      name: '',
      entries: 0,
      joined: ''
    });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const imageRef = useRef(null);
  const lastValidationResult = useRef(null); // Store processed validation result instead of raw data

  const BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000';

  /* --- useEffect to check backend server connection on component mount --- 
   The arrow function () => { ... } is the callback that runs after the component mounts.
   fetchData is an async function defined inside the useEffect to perform the fetch operation.

  1. React calls your useEffect callback when component mounts
  2. Your useEffect callback creates the fetchData function
  3. Your useEffect callback then calls fetchData()
  4. fetchData executes and makes the fetch request

  - useEffect callback: () => { const fetchData = ...; fetchData(); }
  - fetchData: Just a regular function you created inside that callback
  */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/`);
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          return; // need to check if this works!!
        }
        const data = await response.json(); // parse JSON
      } catch (err) {
        console.error('Error connecting to backend server:', err);
      }
    };
    fetchData(); // call the async function
  }, []); // empty dependency array => runs only once (componentDidMount)

  /*---Functions---*/
  /*-Utility/Helper functions-*/

  // Helper function to update user entries
  // PUT request to the backend to update user information. 
  // body: JSON.stringify({ id: user.id }) means you’re sending your user’s ID as JSON.
  // Your backend then increments the entries count for that user and replies with the new number.
  // Helper function to update user entries
  const updateUserEntries = async (faceCount = 1) => {
    const countResponse = await fetch(`${BACKEND_URL}/image`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, faceCount }) // Send face count to backend
    });

    const count = await countResponse.json();
    setUser(prevUser => ({ ...prevUser, entries: count }));
  };

  // Helper function to get regions from Clarifai response
  const getRegionsFromData = (data) => {
    console.log('Clarifai API response data:', data); // Debug log
    if (!data.outputs || data.outputs.length === 0) {
      return null;
    }

    // Check if data exists before accessing regions
    if (data.outputs[0].data) {
      const regions = data.outputs[0].data.regions;
      if (regions && regions.length > 0) {
        return regions;
      }
    }

    return null;
  };

  // Helper function to validate face detection response
  const validateFaceDetection = (data) => {
    const regions = getRegionsFromData(data);
    
    // Check if we have valid regions with detected faces
    if (regions) {
      return { regions, faceCount: regions.length }; // Return both regions and count
    }
    
    return null;
  };

  const calculateFaceLocations = (regions) => {
    if (!regions || regions.length === 0) {
      return [];
    }

    const image = imageRef.current;
    const width = Number(image.width);
    const height = Number(image.height);
    
    return regions.map((region, index) => {
      const boundingBox = region.region_info.bounding_box;
      return {
        id: index, // Add unique identifier for each face
        leftCol: boundingBox.left_col * width,
        topRow: boundingBox.top_row * height,
        rightCol: width - (boundingBox.right_col * width),
        bottomRow: height - (boundingBox.bottom_row * height)
      };
    });
  }

  const setFaceBoxes = setBoxes;

  // Calling Clarifai API
  const callClarifaiAPI = async (URL) => {
    try {
        const response = await fetch(`${BACKEND_URL}/clarifaiAPI`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: URL }), // Changed from URL to url (lowercase)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          throw new Error(`Backend error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error calling Clarifai API:", err);
        throw err; // re-throw to handle it in the caller
    }
  };

  const clearUIState = () => {
    // Only update state if there's actually something to clear
    if (message) setMessage('');
    if (image) setImage('');
    if (boxes.length > 0) setBoxes([]);
    if (isLoading) setIsLoading(false);
  };


  /*-Event Handlers-*/
  const handleSignIn = (data) => {
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      entries: data.entries,
      joined: data.joined
    });
  }

  const handleSignOut = () => {
    lastValidationResult.current = null;
    setUser({ 
      id: '', 
      email: '', 
      name: '', 
      entries: 0,
      joined: '' });
    clearUIState();
    setInputURL('');
  }

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
  
  const handleInputChange = (event) => setInputURL(event.target.value);

  const handleImageLoad = () => {
    if (lastValidationResult.current) {
      const boxes = calculateFaceLocations(lastValidationResult.current.regions);
      if (boxes.length > 0) {
        setFaceBoxes(boxes);
      }
    }
  }

  const handleImageSubmit = async () => {
    if (message || image || boxes.length > 0 || isLoading) {
      clearUIState();
    }
    setIsLoading(true);
    setMessage('🔍 Analyzing image...');    
    
    try {
      const data = await callClarifaiAPI(inputURL);

      // Validate face detection once and store the result
      const validationResult = validateFaceDetection(data);
      if (!validationResult) {
        setMessage('No faces detected. Verify the URL and try again.');
        setIsLoading(false);
        return;
      }

      // Store the validation result for later use in handleImageLoad
      lastValidationResult.current = validationResult;

      const { faceCount } = validationResult;
      setMessage(`Number of faces detected: ${faceCount}`);
      setImage(inputURL);

      updateUserEntries(faceCount);
      setInputURL(''); 
      setIsLoading(false);

    } catch (err) {
      console.error("Error fetching Clarifai data:", err);
      setMessage('Error processing the image.');
      setIsLoading(false);
    }
  };

  /*-Render logic-*/
  let page;

  if (route === 'signIn') {
    page = <SignIn handleSignIn={handleSignIn} handleRouteChange={handleRouteChange} />;
  } else if (route === 'register') {
    page = <Register handleSignIn={handleSignIn} handleRouteChange={handleRouteChange} />;
  } else if (route === 'home') {
    let messageColor = 'red';
    if (isLoading) {
      messageColor = 'blue';
    }

    page = (
      <>
        <Rank name={user.name} entries={user.entries}/>
        <ImageLinkForm 
          handleInputChange={handleInputChange} 
          handleImageSubmit={handleImageSubmit}
          isLoading={isLoading}
          input={inputURL}
        />
        {message && (
          <div className={`f6 mv3 ${messageColor}`}>
            {message}
          </div>
        )}
        <FaceRecognition
          boxes={boxes}
          image={image}
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
