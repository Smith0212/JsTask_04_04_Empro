const loginForm = document.querySelector(".login-form");


loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const userData = {
        email: formData.get('email'),
        password: formData.get('password'),
    };

    try {
        const response = await axios.post('http://localhost:3000/v1/user/login', JSON.stringify(userData),{
            headers: {
                "Content-Type": "application/json",
                "api-key": "D1QVGGm2cjGad0GgFnxS9Q==",
                "accept-language": "en",
            },
        });

        // Handle success response
        if (response.data.code == '1') {
            alert('login successful!');
            // Redirect to login page
            window.location.href = '/main.html';
        }
        else {
            alert(`login failed: ${response.data.message}`);
        }

    } catch (error) {
        if (error.response) {
            formAlert.textContent = error.response.data.message || "Login failed. Please try again.";
        } else {
            formAlert.textContent = "An error occurred. Please try again.";
        }
        formAlert.style.display = "block";
    }
});
