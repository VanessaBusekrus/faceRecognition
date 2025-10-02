import { useState } from 'react';
import { BACKEND_URL } from '../../config.js';

const TwoFactorVerify = ({ pendingUserId, onVerificationSuccess, onCancel }) => {
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTwoFactorSubmit = async () => {
        if (!twoFactorCode || twoFactorCode.length !== 6) {
            alert('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userID: pendingUserId,
                    code: twoFactorCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                // 2FA verification successful
                onVerificationSuccess(data.user);
            } else {
                alert(data.message || 'Invalid 2FA code. Please try again.');
                setTwoFactorCode(''); // Clear the code for retry
            }
        } catch (err) {
            console.error("Error verifying 2FA:", err);
            alert('Error verifying 2FA. Please try again.');
        }
        setIsLoading(false);
    };

    const handleCancel = () => {
        setTwoFactorCode('');
        onCancel();
    };

    const onSubmit = (e) => {
        e.preventDefault(); // prevent page reload
        if (twoFactorCode.length === 6) {
            handleTwoFactorSubmit();
        }
    };
    
    return (
        <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
            <main className="pa4 black-80">
            <div className="measure">
                <h2 className="f3 f2-m f1-l fw6 ph0 mh0">Two-Factor Authentication</h2>
                <p className="f6 gray">
                Enter the 6-digit code from your authenticator app
                </p>
                
                <form onSubmit={onSubmit}>
                    <div className="mt3">
                        <label className="db fw6 lh-copy f6" htmlFor="two-factor-code">
                            Authentication Code
                        </label>
                        <input
                        className="pa2 input-reset ba bg-transparent hover-bg-black hover-white tc f3"
                        type="text"
                        id="two-factor-code"
                        maxLength="6"
                        placeholder="000000"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                        autoFocus // focus input on render
                        style={{ width: "9ch" }} // space for 6 digits + little padding
                        />
                    </div>
                    
                    <div className="mt3">
                        <button
                            onClick={handleTwoFactorSubmit}
                            disabled={twoFactorCode.length !== 6 || isLoading}
                            className={`b ph3 pv2 input-reset ba b--black grow pointer f6 dib mr2 
                                ${twoFactorCode.length === 6 && !isLoading ? 'bg-transparent hover-bg-black hover-white' : 'bg-transparent gray cursor-not-allowed'}`}
                            >
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="ph3 pv2 input-reset ba b--gray bg-transparent grow pointer f6 dib"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            </main>
        </article>
    );
};

export default TwoFactorVerify;
