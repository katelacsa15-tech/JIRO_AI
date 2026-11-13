const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatArea = document.getElementById("chatArea");
const newChat = document.getElementById("newChat");

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;
  message.textContent = text;
  chatArea.appendChild(message);
  chatArea.scrollTop = chatArea.scrollHeight;
  return message;
}

chatForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const text = userInput.value.trim();
  if (text === "") return;

  addMessage(text, "user");
  userInput.value = "";

  const loadingMessage = addMessage("JIRO AI is thinking...", "assistant");

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    loadingMessage.textContent = data.reply || "No response received.";

  } catch (error) {
    loadingMessage.textContent = "Sorry! JIRO AI is temporarily unavailable.";
    console.error(error);
  }
});

newChat.addEventListener("click", function() {
  chatArea.innerHTML = `
    <div class="welcome">
      <h1>JIRO AI</h1>
      <p>How can I help you today?</p>
    </div>
  `;
});
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js")
            .then(() => console.log("JIRO AI Service Worker registered!"))
            .catch(error => console.error("Service Worker error:", error));
    });
}