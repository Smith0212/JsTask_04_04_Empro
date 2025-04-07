// signup.js

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('.signup-form');

    // Handle form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Collect form data
        const formData = new FormData(signupForm);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
        };

        try {
            // Make API call to signup endpoint
            const response = await axios.post('http://localhost:3000/v1/user/signup', JSON.stringify(userData), {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
                    "accept-language": "en",
                },
            });

            console.log('Response:', response.data);

            // Handle success response
            if (response.data.code == '1') {
                alert('Signup successful!');
                // Redirect to login page
                window.location.href = '/login.html';
            }
            else {
                alert(`Signup failed: ${response.data.message}`);
            }
        } catch (error) {
            // Handle error response
            console.error('Error during signup:', error.response?.data || error.message);
            alert('Signup failed. Please try again.');
        }
    });
});