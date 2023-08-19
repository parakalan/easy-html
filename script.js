let currentHtmlContent = "";
let isTextEditorOpen = false;
let isSideWindowMinimized = false;
// Reference to the toggle button
const toggleButton = document.getElementById('toggleButton');

// Reference to the chat container
const chatWindow = document.querySelector('.MessageFrame');
const messageFrame = document.querySelector('.MessageFrame');
const chatInput = document.getElementById('inputArea');
const sendButton = document.querySelector('.sendButton');
const editor = ace.edit("editor");
// editor.setOption('showLineNumbers', false);
editor.renderer.setShowGutter(false);
var htmlMode = ace.require("ace/mode/html").Mode;
editor.session.setMode(new htmlMode());

const editorDiv = document.getElementById('editor');
const messageBubbles = document.querySelector('.MessageBubbles');

let editor_options = {
  "indent":"auto",
  "indent-spaces":2,
  "wrap":80,
  "markup":true,
  "output-xml":false,
  "numeric-entities":true,
  "quote-marks":true,
  "quote-nbsp":false,
  "show-body-only":true,
  "quote-ampersand":false,
  "break-before-br":true,
  "uppercase-tags":false,
  "uppercase-attributes":false,
  "drop-font-tags":true,
  "tidy-mark":false
}

let chatHistory = [{
    role: 'system',
    content: 'You are a HTML assistant. You write HTML pages for people. Follow the instructions'
  }];

function displayHTMLInIframe(htmlString) {
    const iframe = document.getElementById('htmlPreviewIframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlString);
    iframeDoc.close();
}

/* Edit Chat Input size based on input */
document.addEventListener("input", function(event) {
  if (event.target.tagName.toLowerCase() === "textarea") {
      autoResize(event.target);   
  }
});

function autoResize(textarea) {
  textarea.style.height = "auto";                // Reset the height
  textarea.style.height = textarea.scrollHeight + "px";   // Set it to its scroll height
}

document.addEventListener("DOMContentLoaded", function() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(autoResize);
});

function resetSendButton() {
 const elements = document.querySelectorAll('.sendButton');
  elements.forEach(element => {
      element.style.backgroundColor = '';
  });
}

function showLoading() {
    document.getElementsByClassName('loader')[0].style.display = 'block';
    messageBubbles.scrollTo(0, messageBubbles.scrollHeight);

}

function unShowLoading() {
document.getElementsByClassName('loader')[0].style.display = 'none';
}

unShowLoading();
addNewMessage("Hi! I'm Janet. I'm here to write HTML for you. Just ask me something and I will get to building it for you.", "assistant")



// Add an input event listener to the textarea
chatInput.addEventListener('input', function() {
  // Check if the textarea has content
  if (chatInput.value.trim()) {
      const elements = document.querySelectorAll('.sendButton');
      elements.forEach(element => {
          element.style.backgroundColor = 'purple';
      });
  } else {
      resetSendButton();
  }
});

/* Special case for shift + enter */
chatInput.addEventListener('keydown', function(event) {
  // If the key pressed is "Enter"
  if (event.key === "Enter") {
      // If the "Shift" key is also being held down
      if (event.shiftKey) {
          // Simply insert a new line (default behavior)
          return;
      } else {
          // If only "Enter" was pressed, prevent the new line and send the message
          event.preventDefault();  // Prevent the default action (inserting a new line)
          const message = chatInput.value.trim();

          if (message) { 
              sendButtonClick();
          }
      }
  }
});


function addNewMessage(message, type) {
  // Create the TextFrame div
  const newTextFrame = document.createElement('div');
  newTextFrame.className = 'TextFrame ' + type + "Message"; 
  newTextFrame.style.width = '96%';
  newTextFrame.style.position = 'relative';
  // newTextFrame.style.background = '#1D1D1F';
  newTextFrame.style.borderRadius = '10px';
  newTextFrame.style.overflow = 'hidden';
  newTextFrame.style.padding = '10px';  // Added for spacing within each message
  newTextFrame.style.marginTop = '20px';  // spacing between each TextFrame

  // Create the chat bubble div
  const chatBubble = document.createElement('div');
  chatBubble.style.textAlign = 'left';
  chatBubble.style.color = 'white';
  chatBubble.style.fontSize = '1em';
  chatBubble.style.fontWeight = '400';
  chatBubble.style.wordWrap = 'break-word';
  
  // Set the message
  chatBubble.innerText = message;

  // Append chat bubble to TextFrame
  newTextFrame.appendChild(chatBubble);
  
  // Append the new TextFrame to the MessageFrame
  // messageFrame.insertBefore(newTextFrame, messageFrame.querySelector('.Footer'));
  messageBubbles.insertBefore(newTextFrame, messageBubbles.querySelector('.loader'));

}

function sendButtonClick() {
const textarea = document.getElementById('inputArea');
  const message = textarea.value.trim();

  if (message) { // check if the message is not just whitespace
      addNewMessage(message, 'user');
      sendMessageToAI(message);
      showLoading();
      textarea.value = '';  // Clear the input after sending the message
      autoResize(textarea);
      resetSendButton();
  }
}

sendButton.addEventListener('click', function() {
  sendButtonClick();
});

function hideEverythingElseChatWindow() {
    // Check if both elements are present in the DOM
    if (messageFrame && toggleButton) {
        // Loop over all child elements of the parent container
        for (let child of messageFrame.children) {
            // Hide the child element
            child.style.display = 'none';
        }

        for (let child of toggleButton.parentElement.children) {
            // Hide the child element
            child.style.display = 'none';
        }

        // Show the button and its direct parent
        toggleButton.style.display = 'block';
        toggleButton.parentElement.style.display = 'flex';  // This assumes the button is a direct child of the parent container
    }
}
function showMessageBubbles() {
    messageBubbles.style.display = 'none';
}

function hideMessageBubbles() {
    messageBubbles.style.display = 'block';
}

function showEverythingElseChatWindow() {
    // Loop over all child elements of the parent container
    for (let child of messageFrame.children) {
        // Hide the child element
        if(child.className == "MessageBubbles") {
        child.style.display = 'block';
        }
        else {
        child.style.display = 'flex';
        }
    }

    for (let child of toggleButton.parentElement.children) {
        // Hide the child element
        child.style.display = '';
    }
}

function downloadHTMLFile() {
    filename = "export.html";
    content = currentHtmlContent;
    const blob = new Blob([content], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);  
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

function sendMessageToAI(userMessage) {
  // Add the user's message to chat history
  chatHistory.push({
      'role': 'system',
      'content': 'The user has the following query. Give HTML code and user response for the following JSON format. You have to make it look nice, make it look good not like shit.\n{\n"user_response": <Response to show to user>, "html_code": <HTML Code, if any>\n}. You cannot link external sheets, only single page HTMLs. Do not add newlines to indent please. Stick to the format, no other format is acceptable. Do not add semicolon, your HTML is displayed in preview window. ONLY RETURN A JSON AND NOTHING ELSE'
  })
  chatHistory.push({
      role: 'user',
      content: 'User query: ' + userMessage
  });

  // API call
  fetch('https://api.sudhar.xyz/complete', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          model: 'gpt-3.5-turbo-16k',
          messages: chatHistory,
          temperature: 1,
          max_tokens: 6997,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
      })
  })
  .then(response => response.json())
  .then(data => {
    console.log(data)
      let aiMessage = data.choices[0].message.content;
      aiMessage = aiMessage.replaceAll('\n', '');
      console.log(aiMessage);
      jsonResponseFromAi = JSON.parse(aiMessage);
      console.log(jsonResponseFromAi);

      let responseForUser = jsonResponseFromAi.user_response;
      let htmlResponse = jsonResponseFromAi.html_code;
      currentHtmlContent = htmlResponse;
      if(htmlResponse) {
        htmlResponse = htmlResponse.replaceAll('\n', '');
      }
      console.log(htmlResponse);


      // Push AI's response to chat history
      chatHistory.push({
          role: 'assistant',
          content: aiMessage
      });

      // Display the AI's response in the chat UI
      // For instance, if you have a function named 'displayMessage':

      addNewMessage(responseForUser, 'assistant');
      displayHTMLInIframe(htmlResponse);
      console.log(chatHistory);
      unShowLoading()
  })
  .catch(error => {
      console.error("Error sending message:", error);
  });
}

// Add the event listener to the toggle button
toggleButton.addEventListener('click', function() {
  // if (chatWindow.style.width !== '3%')
  if (!isSideWindowMinimized) {
      // If it's not minimized, minimize it.
      chatWindow.style.width = '3%';
      chatWindow.style.marginLeft = '97%';
      chatWindow.style.overflow = 'hidden'; // Hide content when minimized
      toggleButton.style.transform = 'rotate(-180deg)'
      hideEverythingElseChatWindow();
      document.getElementById('previewFrame').style.width = '97%';
      isSideWindowMinimized = true;
      
  } else {
      // If it is minimized, maximize it.
      chatWindow.style.width = '35%';
      chatWindow.style.marginLeft = '64%';
      chatWindow.style.overflow = 'visible'; // Show content when maximized
      toggleButton.style.transform = '';
      showEverythingElseChatWindow();
      if(isTextEditorOpen) {
        showEditor();
      } else {
        unShowEditor();
      }
      document.getElementById('previewFrame').style.width = '65%';
      isSideWindowMinimized = false;
  }
});

document.getElementById('downloadButton').addEventListener('click', function() {
  downloadHTMLFile();
});

function showEditor() {
    editorDiv.style.display = 'block';
    editor.setValue(tidy_html5(currentHtmlContent, editor_options));
    isTextEditorOpen = true;
}

function hideFooter() {
    document.getElementsByClassName('Footer')[0].style.display = 'none';
}

function showFooter() {
    document.getElementsByClassName('Footer')[0].style.display = 'flex';
}

function unShowEditor() {
    editorDiv.style.display = 'none';
}
document.getElementById('textEditorButton').addEventListener('click', function() {
    if(isTextEditorOpen) {
        showFooter();
        unShowEditor();
        isTextEditorOpen = false;
    } else {
        hideFooter();
        showEditor();
        isTextEditorOpen = true;
    }
  });


unShowEditor();