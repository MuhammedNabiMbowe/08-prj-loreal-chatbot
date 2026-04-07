const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

const API_ENDPOINT = window.API_ENDPOINT || "";

const messages = [
  {
    role: "system",
    content:
      "You are a L'Oréal beauty assistant. Only answer questions about L'Oréal products, makeup, skincare, haircare, fragrances, routines, ingredients, and beauty recommendations. If the user asks about anything else, politely refuse and redirect them back to L'Oréal beauty help. Keep replies concise, helpful, and friendly.",
  },
];

function showMessage(text, role) {
  const messageElement = document.createElement("div");
  messageElement.className = `msg ${role}`;
  messageElement.textContent = text;
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  userInput.disabled = isLoading;
  sendBtn.innerHTML = isLoading
    ? '<span class="material-icons">hourglass_top</span>'
    : '<span class="material-icons">send</span><span class="visually-hidden">Send</span>';
}

showMessage(
  "Hello. Ask me about a L'Oréal product, routine, or recommendation.",
  "ai",
);

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return;
  }

  if (!API_ENDPOINT) {
    showMessage(
      "Please add your Cloudflare Worker URL to secrets.js before testing the chat.",
      "ai",
    );
    return;
  }

  messages.push({ role: "user", content: userMessage });
  showMessage(userMessage, "user");
  userInput.value = "";
  setLoading(true);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData?.error?.message || errorData?.error || "Request failed.";
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const assistantMessage =
      data?.choices?.[0]?.message?.content || "Sorry, I could not get a reply.";

    messages.push({ role: "assistant", content: assistantMessage });
    showMessage(assistantMessage, "ai");
  } catch (error) {
    showMessage(`Sorry, something went wrong: ${error.message}`, "ai");
  } finally {
    setLoading(false);
    userInput.focus();
  }
});
