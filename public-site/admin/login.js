
const API_URL = "https://sakthi-dental-clinic-api.onrender.com//api/auth/login";

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

if (sessionStorage.getItem("adminToken")) {
  window.location.replace("index.html");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginButton.disabled = true;
  loginMessage.style.color = "#637386";
  loginMessage.textContent = "Signing in...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Login failed.");
    }

    sessionStorage.setItem("adminToken", result.token);
    window.location.replace("index.html");
  } catch (error) {
    loginMessage.style.color = "red";
    loginMessage.textContent =
      error.message || "Could not connect to the backend.";
  } finally {
    loginButton.disabled = false;
  }
});