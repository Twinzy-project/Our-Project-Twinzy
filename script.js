async function handleSignIn() {
    const username = document.querySelector('.input-box[type="text"]').value;
    const password = document.querySelector('.input-box[type="password"]').value;

    if (username === "" || password === "") {
        alert("Please fill in both fields.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Login successful! Welcome, ${data.username}`);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

document.querySelector('.signin-btn').addEventListener('click', handleSignIn);