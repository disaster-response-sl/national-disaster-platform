/**
 * eSignet OAuth2 Callback Handler
 * Handles the redirect from eSignet after authentication
 * Redirects user to the mobile dashboard page
 */

const express = require('express');
const router = express.Router();

/**
 * eSignet OAuth2 callback endpoint
 * This is where eSignet redirects after user authentication
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state, error, error_description } = req.query;
        
        // Handle authentication error
        if (error) {
            console.error('eSignet authentication error:', error, error_description);
            return res.redirect(`http://localhost:8081/auth-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(error_description || '')}`);
        }
        
        // Validate that we received an authorization code
        if (!code) {
            console.error('No authorization code received from eSignet');
            return res.redirect('http://localhost:8081/auth-error?error=no_code&description=No authorization code received');
        }
        
        console.log('eSignet callback received:', { code: code.substring(0, 10) + '...', state });
        
        // For now, we'll redirect to dashboard with the code
        // The mobile app will handle token exchange
        const dashboardUrl = `http://localhost:8081/dashboard?auth_code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
        
        // Add success message
        console.log('Redirecting to dashboard:', dashboardUrl);
        
        // Create a simple success page that will redirect to the mobile app
        const successPageHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Authentication Successful</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .container {
                    text-align: center;
                    padding: 2rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                .checkmark {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    animation: checkmark 0.6s ease-in-out;
                }
                @keyframes checkmark {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                h1 {
                    margin-bottom: 1rem;
                    font-size: 1.5rem;
                }
                p {
                    margin-bottom: 1.5rem;
                    opacity: 0.9;
                }
                .loading {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="checkmark">✓</div>
                <h1>Authentication Successful!</h1>
                <p>Redirecting to dashboard...</p>
                <div class="loading"></div>
            </div>
            
            <script>
                // Try multiple redirect methods for better mobile compatibility
                function redirectToDashboard() {
                    const authCode = '${code}';
                    const state = '${state || ''}';
                    
                    // Try deep link first (for mobile app)
                    const deepLink = 'ndp://dashboard?auth_code=' + encodeURIComponent(authCode) + '&state=' + encodeURIComponent(state);
                    
                    // Try opening deep link
                    window.location.href = deepLink;
                    
                    // Fallback to web dashboard after 2 seconds
                    setTimeout(() => {
                        const webUrl = 'http://localhost:8081/dashboard?auth_code=' + encodeURIComponent(authCode) + '&state=' + encodeURIComponent(state);
                        window.location.href = webUrl;
                    }, 2000);
                }
                
                // Start redirect after 1.5 seconds
                setTimeout(redirectToDashboard, 1500);
            </script>
        </body>
        </html>
        `;
        
        res.send(successPageHtml);
        
    } catch (error) {
        console.error('eSignet callback error:', error);
        res.redirect(`http://localhost:8081/auth-error?error=server_error&description=${encodeURIComponent(error.message)}`);
    }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'eSignet Callback Handler',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
