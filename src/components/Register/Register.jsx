import { useState } from 'react';

const Register = ({ handleRouteChange, handleSignIn }) => {
	// useState hooks for form fields
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault(); // prevent page refresh
	  
		try {
			const response = await fetch(`${BACKEND_URL}/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
				name,
				email,
				password
				})
			});
	  
			const data = await response.json();
	  
			// Check if the HTTP response was successful
			if (response.ok) {
				// Registration successful - we should have valid user data
				if (data.id && data.name && data.email) {
					handleSignIn(data);
					handleRouteChange('home');
				} else {
					console.error('Registration succeeded but invalid user data received:', data);
					alert('Registration error. Please try again.');
				}
			} else {
				// Registration failed - show generic error message (don't reveal if user exists)
				console.error('Registration failed:', data);
				alert('Registration failed. Please check your information and try again.');
			}
		} catch (err) {
		  console.error("Error registering:", err);
		  alert('Registration error. Please check your connection and try again.');
		}
	  };

	return (
		<article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
			<main className="pa4 black-80">
				<div className="measure">
					<form onSubmit={handleSubmit}>
						<fieldset id="sign_up" className="ba b--transparent ph0 mh0">
						<legend className="f1 fw6 ph0 mh0">Register</legend>
						<div className="mt3">
							<label className="db fw6 lh-copy f6" htmlFor="name">Name</label>
							<input 
								className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
								type="text" 
								name="name"  
								id="name" 
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="mt3">
							<label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
							<input 
								className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
								type="email" 
								name="email-address"  
								id="email-address" 
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
							Register
						</button>
						</div>
					</form>
					<div className="lh-copy mt3">
					<p 
						onClick={() => handleRouteChange('signIn')} 
						className="f6 link dim black db pointer"
						>
							Sign in
						</p>
					</div>
				</div>
			</main>
		</article>
	);
}

export default Register;