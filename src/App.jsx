/*Importing external libraries, hooks, components, and styles*/
import ParticlesBg from 'particles-bg';
import { useState, useRef, useEffect } from 'react';

import Register from './components/Register/Register.jsx';
import SignIn from './components/SignIn/SignIn.jsx';
import TwoFactorVerify from './components/TwoFactorAuth/TwoFactorVerify.jsx';
import Navigation from './components/Navigation/Navigation.jsx';
import Logo from './components/Logo/Logo.jsx';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.jsx';
import Rank from './components/Rank/Rank.jsx';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.jsx';
import Settings from './components/Settings/Settings.jsx';
import TwoFactorSetup from './components/TwoFactorAuth/TwoFactorSetup.jsx';

import './App.css'
import { BACKEND_URL } from './config.js';

const App = () => {
  /*--------------State hooks, References and Side Effects--------------*/
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
    - isLoading: indicates if an API call is in progress to manage UI state (e.g., disable buttons).
  
    3. Refs:
    - imageRef: a reference to the actual <img> element in the DOM.
    - lastClarifaiData: stores the last response from the Clarifai API.
  */
  const [inputURL, setInputURL] = useState('');
  const [image, setImage] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [route, setRoute] = useState('signIn');
  const [user, setUser] = useState({
      id: '', 
      email: '', 
      name: '',
      entries: 0,
      joined: '',
      two_factor_enabled: false
    });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA states
  const [pendingUserId, setPendingUserId] = useState(null);

  // useRef ('use' is hook naming convention). Reference is like a pointer or address that points to a location in memory where the data is stored.
  const imageRef = useRef(null);
  // Here, `lastValidationResult` will store the most recent face detection validation result (regions + faceCount). 
  // Unlike useState, changing `.current` does NOT trigger a re-render, which makes it efficient for caching data between renders 
  // (e.g., holding Clarifai's API response for later use in `handleImageLoad`).
  const lastValidationResult = useRef(null);

  /*--- Side Effects (e.g., API calls to fetch data from servers) ---*/
  // useEffect to check backend server connection on component mount - after initial render
  // useEffect runs once when the component mount (empty dependency array [])
  useEffect(() => {
    // fetchData is an async function that tries to connect to the backend server
    const fetchData = async () => {
      try {
        // making a GET request to the backend root URL to check if it's reachable
        const response = await fetch(`${BACKEND_URL}/`);
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          return; // need to check if this works!!
        }
      } catch (err) {
        console.error('Error connecting to backend server:', err);
      }
    };
    fetchData(); // call the async function
  }, []); // empty dependency array => runs only once (componentDidMount equivalent)


  /*--------------Functions--------------*/
  /*--------------Utility/Helper functions--------------*/

  // Helper function to update user entries
  // PUT request to the backend to update user information. 
  // body: JSON.stringify({ id: user.id }) means you’re sending your user’s ID as JSON.
  // Your backend then increments the entries count for that user and replies with the new number.
  // Helper function to update user entries
  const updateUserEntries = async (faceCount = 1) => {
    const countResponse = await fetch(`${BACKEND_URL}/image`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, faceCount }) 
    });

    const count = await countResponse.json();
    // setting the user state with the updated entries count. prevUser() is the previous state and we use the spread operator (...) 
    // to copy all existing user properties and overwrite only the 'entries' property with the new count
    // Why do it this way? Because React state updates need to create a new object reference to trigger re-renders. You cannot just mutate the existing user object directly.
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
      return { regions, faceCount: regions.length }; // Return both regions array and count
    }
    
    return null;
  };

  const calculateFaceLocations = (regions) => {
    if (!regions || regions.length === 0) {
      return [];
    }

    const image = imageRef.current; // Getting the contents here of the ref object that points to the actual <img> element. Storing the the DOM element in a variable for easier access.
    const width = Number(image.width);
    const height = Number(image.height);
    
    // Map over each region to calculate bounding box coordinates
    // 'regions' is an array of detected face regions from Clarifai API response
    // 'region' = data for one specific face
    // 'index' = current index in the array (0, 1, 2, ...)
    return regions.map((region, index) => {
      const boundingBox = region.region_info.bounding_box; // Bounding box contains the relative coordinates (percentages) of the face within the image
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
          body: JSON.stringify({ url: URL }),
        });
        
        // in case of HTTP error response from backend
        if (!response.ok) {
          const errorText = await response.text(); // Get error details from server. Convert the response body to text
          throw new Error(`Backend error: ${response.status} - ${errorText}`); // E.g., "Backend error: 500 - Internal Server Error"
        }
        const data = await response.json();
        return data;
    } catch (err) {
      // in case of network error or server down
        console.error("Error calling Clarifai API:", err); // Log the error here
        throw err; // Re-throw so 'handleImageSubmit' (the caller) also catches it
    }
  };

  const clearUIState = () => {
    // Only update state if there's actually something to clear
    if (message) setMessage('');
    if (image) setImage('');
    if (boxes.length > 0) setBoxes([]);
    if (isLoading) setIsLoading(false);
  };


  /*--------------Event Handlers--------------*/
  const handleSignIn = (data) => {
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      entries: data.entries,
      joined: data.joined,
      two_factor_enabled: data.two_factor_enabled
    });
  }

  const handleTwoFactorRequired = (userId) => {
    setPendingUserId(userId);
    handleRouteChange('2fa-verify');
  }

  const handleTwoFactorVerificationSuccess = (userData) => {
    handleSignIn(userData);
    setPendingUserId(null);
    handleRouteChange('home');
  }

  const handleTwoFactorVerificationCancel = () => {
    setPendingUserId(null);
    handleRouteChange('signIn');
  }

  const handleTwoFactorSetupComplete = () => {
    // Update user state to set 2FA as enabled
    setUser(prev => ({
      ...prev,
      two_factor_enabled: true
    }));
    alert('2FA has been successfully enabled for your account!');
    handleRouteChange('home');
  }

  const handleSignOut = () => {
    lastValidationResult.current = null;
    setUser({ 
      id: '', 
      email: '', 
      name: '', 
      entries: 0,
      joined: '',
      two_factor_enabled: false
    });
    clearUIState();
    if (inputURL) setInputURL('');
  }

  const handleRouteChange = (newRoute) => {
    // Clear 2FA state when navigating away from 2FA verification during Sign in 
    if (route === '2fa-verify' && newRoute !== '2fa-verify') {
      setPendingUserId(null);
    }
    
    if (newRoute === 'signOut') {
      handleSignOut();
      setRoute('signIn');
    } else if (newRoute === 'home') {
      setRoute('home');
    } else if (newRoute === 'settings') {
      setRoute('settings');
    } else if (newRoute === '2fa-setup') {
      setRoute('2fa-setup');
    } else if (newRoute === '2fa-verify') {
      setRoute('2fa-verify');
    } else {
      setRoute(newRoute);
    }
  }; 
  
  const handleInputChange = (event) => setInputURL(event.target.value.trim());

  const handleImageLoad = () => {
    if (lastValidationResult.current) {
      const boxes = calculateFaceLocations(lastValidationResult.current.regions);
      if (boxes.length > 0) {
        setFaceBoxes(boxes);
      }
    }
  }

  const handleImageSubmit = async () => {
    if (message || image || boxes.length > 0) { // removed isLoading check ( || isLoading )
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
      lastValidationResult.current = validationResult; // '.current' holds the actual value

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

  /*--------------Render logic--------------*/
  let page;

  if (route === 'signIn') {
    page = <SignIn 
      handleSignIn={handleSignIn} 
      handleRouteChange={handleRouteChange}
      handleTwoFactorRequired={handleTwoFactorRequired}
    />;
  } else if (route === 'register') {
    page = <Register handleSignIn={handleSignIn} handleRouteChange={handleRouteChange} />;
  } else if (route === 'settings') {
    page = <Settings 
      handleRouteChangeHome={() => handleRouteChange('home')}
      handleRouteChange2FASetup={() => handleRouteChange('2fa-setup')}
      user2FAEnabled={user.two_factor_enabled}
    />;
  } else if (route === '2fa-setup') {
    page = <TwoFactorSetup
        user={user}
        handleTwoFactorSetupComplete={handleTwoFactorSetupComplete}
        handleRouteChangeSettings={() => handleRouteChange('settings')}
      />;
  } else if (route === '2fa-verify') {
    page = <TwoFactorVerify
      pendingUserId={pendingUserId}
      onVerificationSuccess={handleTwoFactorVerificationSuccess}
      onCancel={handleTwoFactorVerificationCancel}
    />;
  }
  else if (route === 'home') {
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



/*--- Notes ---*/

/*
// Timeline:
1. User submits URL                    // ← handleImageSubmit runs
2. Call Clarifai API                   // ← Get face data
3. Validate face data                  // ← Process the data  
4. Store validation result             // ← This line saves it
5. Set image URL                       // ← setImage(inputURL)
6. Image starts loading in browser     // ← <img src={image} />
7. Image finishes loading              // ← handleImageLoad runs
8. Draw face boxes                     // ← Use stored data
*/

/*
// The face detection workflow:
1. Submit URL                    // User action
2. Call API                      // Network request  
3. Store result in ref           // ← No re-render (good!)
4. Set image URL                 // ← Triggers re-render (needed!)
5. Image loads                   // DOM event
6. Use ref data to draw boxes    // ← Access stored data
*/

/* useRef explained:
const myRef = useRef("initial");

console.log(myRef);         // { current: "initial" }
console.log(myRef.current); // "initial"

----

console.log(imageRef.current);  
// Output: <img src="https://example.com/photo.jpg" width="500" height="300">

const image = imageRef.current;
console.log(image.width);       // 500
console.log(image.height);      // 300
console.log(image.src);         // "https://example.com/photo.jpg"
*/