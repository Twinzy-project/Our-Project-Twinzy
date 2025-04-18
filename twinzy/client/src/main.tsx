import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import CSS for Font Awesome
const linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
document.head.appendChild(linkElement);

// Import Google Fonts
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
document.head.appendChild(fontLink);

// Add title
const titleElement = document.createElement("title");
titleElement.textContent = "Twinzy - Goal Tracker";
document.head.appendChild(titleElement);

createRoot(document.getElementById("root")!).render(<App />);
