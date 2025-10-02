import { useState } from 'react';
import { BACKEND_URL } from '../../config.js';

const Register = ({ handleRouteChange, handleSignIn }) => {
	// useState hooks for form fields
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

	// Password validation function (matching your backend logic)
	const validatePassword = (password) => {
		const rules = {
			minLength: password.length >= 8,
			hasUppercase: /[A-Z]/.test(password),
			hasLowercase: /[a-z]/.test(password),
			hasNumber: /\d/.test(password),
			hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
		};

		const errors = [];
		if (!rules.minLength) errors.push('at least 8 characters');
		if (!rules.hasUppercase) errors.push('at least one uppercase letter');
		if (!rules.hasLowercase) errors.push('at least one lowercase letter');
		if (!rules.hasNumber) errors.push('at least one number');
		if (!rules.hasSpecialChar) errors.push('at least one special character (!@#$%^&*(),.?":{}|<>)');

		return {
			isValid: errors.length === 0,
			errors: errors,
			rules: rules
		};
	};

	// Get current password validation status
	const passwordValidation = validatePassword(password);

	const handleSubmit = async (event) => {
		event.preventDefault(); // prevent page refresh
	  
		// Check password validation before submitting
		if (!passwordValidation.isValid) {
			alert('Password must contain ' + passwordValidation.errors.join(', '));
			return;
		}

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
				// Registration failed - show the specific error message from backend
				console.error('Registration failed:', data);
				alert(data.message || 'Registration failed. Please check your information and try again.');
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
								onFocus={() => setShowPasswordRequirements(true)}
								onBlur={() => setShowPasswordRequirements(false)}
								required
							/>
							{/* Password requirements display */}
							{(showPasswordRequirements || password.length > 0) && (
								<div className="mt2 f6">
									<p className="ma0 mb1 gray">Password must contain:</p>
									<ul className="ma0 pl3 list">
										<li className={passwordValidation.rules.minLength ? 'green' : 'red'}>
											{passwordValidation.rules.minLength ? '✓' : '✗'} At least 8 characters
										</li>
										<li className={passwordValidation.rules.hasUppercase ? 'green' : 'red'}>
											{passwordValidation.rules.hasUppercase ? '✓' : '✗'} One uppercase letter (A-Z)
										</li>
										<li className={passwordValidation.rules.hasLowercase ? 'green' : 'red'}>
											{passwordValidation.rules.hasLowercase ? '✓' : '✗'} One lowercase letter (a-z)
										</li>
										<li className={passwordValidation.rules.hasNumber ? 'green' : 'red'}>
											{passwordValidation.rules.hasNumber ? '✓' : '✗'} One number (0-9)
										</li>
										<li className={passwordValidation.rules.hasSpecialChar ? 'green' : 'red'}>
											{passwordValidation.rules.hasSpecialChar ? '✓' : '✗'} One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
										</li>
									</ul>
								</div>
							)}
						</div>
						</fieldset>
						<div className="">
						<button
							type="submit"
							className={`b ph3 pv2 input-reset ba b--black grow pointer f6 dib ${
								!passwordValidation.isValid || !name || !email 
									? 'bg-transparent gray cursor-not-allowed' 
									: 'bg-transparent hover-bg-black hover-white'
							}`}
							disabled={!passwordValidation.isValid || !name || !email}
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