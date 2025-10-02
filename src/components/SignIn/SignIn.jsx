import { useState } from 'react';
import { BACKEND_URL } from '../../config.js';


const SignIn = ({ handleRouteChange, handleSignIn, handleTwoFactorRequired }) => {
	// useState hooks for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault(); // prevent page refresh to keep React state intact
    setIsLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password
      })
      });
    
      const data = await response.json();
      // Check if the HTTP request was successful (= server received my request and processed it successfully)
      if (response.ok) {
        // Check if 2FA is required
        if (data.requiresTwoFactor) {
          handleTwoFactorRequired(data.userID);
          return;
        }
      
        // Sign in successful - we should have valid user data. Not including entries data check here because it can be 0 (e.g. for new users), which would mean "false" in JavaScript
        if (data.id && data.name && data.email) {
          handleSignIn(data);
          handleRouteChange('home');
        } else {
          // This could happen in case of unexpected backend response structure or missing fields, e.g., if the database schema changed but the backend code wasn't updated. E.g., if the ID cannot be retrieved or the name
          console.error('Sign in succeeded but invalid user data received:', data);
          alert('Sign in error. Please try again.');
        }
      } else {
        // Sign in failed - show generic error message (don't reveal if user exists)
        console.error('Sign in failed:', data);
        alert('Invalid email or password. Please try again.');
      }
      } catch (err) {
        // Handles network or other unexpected errors that prevent the fetch from completing
        console.error("Error signing in:", err);
        alert('Sign in error. Please check your connection and try again.');
      }
      setIsLoading(false);
  };

  return (
    <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
      <main className="pa4 black-80">
        <div className="measure">
          <form onSubmit={handleSubmit}>
            <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
              <legend className="f1 fw6 ph0 mh0">Sign In</legend>
              <div className="mt3">
                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                <input
                  className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="email"
                  name="email-address"
                  id="email-address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update email state in real-time as user types
                  required
                />
              </div>
              <div className="mv3">
                <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                <input
                  className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </fieldset>
            <div className="">
              <button
                type="submit"
                className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="lh-copy mt3">
            <p
              onClick={() => handleRouteChange('register')}
              className="f6 link dim black db pointer"
            >
              Register
            </p>
          </div>
        </div>
      </main>
    </article>
  );
}

export default SignIn;
