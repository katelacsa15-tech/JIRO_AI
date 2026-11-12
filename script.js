const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatArea = document.getElementById("chatArea");
const newChat = document.getElementById("newChat");

function addMessage(text, sender) {
    const message = document.createElement("div");

    message.className = "message " + sender;
    message.textContent = text;

    chatArea.appendChild(message);
    chatArea.scrollTop = chatArea.scrollHeight;
}

chatForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = userInput.value.trim();

    if (text === "") return;

    addMessage(text, "user");

    userInput.value = "";

    setTimeout(function() {
        addMessage(
            "Hello! I'm JIRO AI. My AI connection is not set up yet. Soon, I'll be able to answer your questions!",
            "assistant"
        );
    }, 500);
});

newChat.addEventListener("click", function() {
    chatArea.innerHTML = `
        <div class="welcome">
            <h1>JIRO AI</h1>
            <p>How can I help you today?</p>
        </div>
    `;
});