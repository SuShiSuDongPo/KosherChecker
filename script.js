const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  addMessage(question, 'user');
  userInput.value = '';

  // Temporary "thinking" message
  const botMsgDiv = document.createElement('div');
  botMsgDiv.classList.add('message', 'bot');
  botMsgDiv.innerHTML = '<p><em>Checking...</em></p>';
  chatBox.appendChild(botMsgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) throw new Error('Server error');

    const data = await response.json();
    botMsgDiv.remove();
    addMessage(data.answer, 'bot');
  } catch (err) {
    botMsgDiv.remove();
    addMessage('Sorry, something went wrong. Please try again.', 'bot');
    console.error(err);
  }
});
