const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const imageInput = document.getElementById("imageInput");
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

function addImagePreview(file) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = "Uploaded image";
    img.style.maxWidth = "220px";
    img.style.borderRadius = "12px";
    img.style.display = "block";
    img.style.margin = "8px 0";
    chatArea.appendChild(img);
}

chatForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const text = userInput.value.trim();
    const file = imageInput.files[0];

    if (!text && !file) return;

    if (file && !file.type.startsWith("image/")) {
        addMessage("Please select an image file.", "assistant");
        return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
        addMessage("Image must be smaller than 5 MB.", "assistant");
        return;
    }

    if (text) addMessage(text, "user");
    if (file) addImagePreview(file);

    userInput.value = "";
    imageInput.value = "";

    const loadingMessage = addMessage(
        "JIRO AI is thinking...",
        "assistant"
    );

    try {
        let image = null;

        if (file) {
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(
                    new Error("Image could not be read.")
                );
                reader.readAsDataURL(file);
            });

            image = {
                mimeType: file.type,
                data: dataUrl.split(",")[1]
            };
        }

        const response = await fetch("/.netlify/functions/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                image: image
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        loadingMessage.textContent =
            data.reply || "No response received.";

    } catch (error) {
    loadingMessage.textContent =
        "Sorry! JIRO AI is temporarily unavailable.";
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
