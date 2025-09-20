/*Importing components, hooks, and styles*/
import './App.css'
import Navigation from './components/Navigation/Navigation.jsx';
import Logo from './components/Logo/Logo.jsx';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.jsx';
import Rank from './components/Rank/Rank.jsx';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.jsx';
import SignIn from './components/SignIn/SignIn.jsx';
import Register from './components/Register/Register.jsx';
import ParticlesBg from 'particles-bg';
import { useState, useRef, useEffect } from 'react';

/*Peparing the API request from Clarifai*/
const returnClarifaiRequestOptions = (imageURL) => {
  // Your PAT (Personal Access Token) can be found in the Account's Security section
  const PAT = import.meta.env.VITE_API_PAT;
  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = import.meta.env.VITE_API_USER_ID;
  const APP_ID = import.meta.env.VITE_API_APP_ID;
  // Change these to whatever model and image URL you want to use
  // const MODEL_ID = 'face-detection';
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
    // --- State hooks ---
  const [input, setInput] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [box, setBox] = useState({});
  const [route, setRoute] = useState('signIn');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState({
      id: '', 
      email: '', 
      name: '',
      entries: 0,
      joined: ''
    });

  const imageRef = useRef(null);
  const lastClarifaiData = useRef(null); // Hooks (useRef) always return a ref object

  // --- Functions ---
  /* --- useEffect to check backend server connection on component mount ---
  useEffect(() => {
    // define an async function inside useEffect
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // parse JSON
        console.log(data); // do something with data
      } catch (err) {
        console.error('Error connecting to backend server:', err);
      }
    };
    fetchData(); // call the async function
  }, []); // empty dependency array => runs only once (componentDidMount)
  */

  const loadUser = (data) => {
    setUser({
      id: data.id,
      email: data.email,
      name: data.name,
      entries: data.entries,
      joined: data.joined
    });
  }

  const onInputChange = (event) => setInput(event.target.value);

  const onImageLoad = () => {
    if (lastClarifaiData.current) {
      const box = calculateFaceLocation(lastClarifaiData.current);
      if (box) displayFaceBox(box);
    }
  }

  const calculateFaceLocation = (data) => {
    if (!data.outputs || data.outputs.length === 0) {
      console.warn("No face detected or invalid response:", data);
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

  const displayFaceBox = (box) => setBox(box);

  const onImageSubmit = async () => {
    setImageURL(input);
    const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';
  
    try {
      const response = await fetch(
        `/api/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
        returnClarifaiRequestOptions(input)
      );

      const data = await response.json();
      lastClarifaiData.current = data; // save API response
      console.log("Clarifai Response:", data);
      
      if (data) {
        // Update user entries in backend
        const countResponse = await fetch('http://localhost:3000/image', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id
          })
        });

      const count = await countResponse.json();

        // Update user state correctly
        setUser(prevUser => ({ ...prevUser, entries: count }));
      }

      const box = calculateFaceLocation(data);
      if (box) displayFaceBox(box);

      // if (data) {
      //   const updateRes = await fetch("/api/image", {
      //     method: "PUT",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       id: this.state.user.id
      //     })
      //   });

      //   const count = await updateRes.json();
      //   this.setState(Object.assign(this.state.user, { entries: count }));
      // }

      } catch (err) {
      console.error("Error fetching Clarifai data:", err);
    }
  };

  const onRouteChange = (newRoute) => {
    if (newRoute === 'signOut') {
      setIsSignedIn(false);
      setRoute('signIn');
    } else if (newRoute === 'home') {
      setIsSignedIn(true);
      setRoute('home');
    } else {
      setRoute(newRoute);
    }
  };  
  
  let page;

  if (route === 'signIn') {
    page = <SignIn loadUser={loadUser} onRouteChange={onRouteChange} />;
  } else if (route === 'register') {
    page = <Register loadUser={loadUser} onRouteChange={onRouteChange} />;
  } else if (route === 'home') {
    page = (
      <>
        <Rank name={user.name} entries={user.entries}/>
        <ImageLinkForm 
          onInputChange={onInputChange} 
          onImageSubmit={onImageSubmit}
        />
        <FaceRecognition
          box={box}
          imageURL={imageURL}
          onImageLoad={onImageLoad}
          imageRef={imageRef} 
        />
      </>
    );
  }

  return (
    <>
      <ParticlesBg type="cobweb" bg={true} />
      <div className="App">
        <Navigation route={route} onRouteChange={onRouteChange} />
        <Logo />
        {page}
      </div>
    </>
  );
}

export default App
