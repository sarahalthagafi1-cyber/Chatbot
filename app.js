const micBtn = document.getElementById("micBtn");
const micIcon = document.getElementById("micIcon");
const chatLog = document.getElementById("chatLog");
const statusText = document.getElementById("statusText");

const LANG = "ar-SA";

let isListening = false;


// ============================================================
// Speech Recognition
// ============================================================

const SpeechRecognitionAPI =
window.SpeechRecognition ||
window.webkitSpeechRecognition;


if (!SpeechRecognitionAPI) {

statusText.textContent =
"متصفحك لا يدعم التعرف على الصوت. جرّب Chrome أو Edge.";

micBtn.disabled = true;

} else {

const recognition = new SpeechRecognitionAPI();

recognition.lang = LANG;
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.continuous = false;


// ========================================================
// Microphone Button
// ========================================================

micBtn.addEventListener("click", () => {

if (isListening) {
recognition.stop();
return;
}

try {

recognition.start();

} catch (error) {

console.error(
"MIC START ERROR:",
error
);

}

});


// ========================================================
// Recognition Started
// ========================================================

recognition.onstart = () => {

isListening = true;

micBtn.classList.add("listening");

micIcon.textContent = "⏹️";

statusText.textContent =
"أستمع الآن... تحدث بحرية";

};


// ========================================================
// Recognition Ended
// ========================================================

recognition.onend = () => {

isListening = false;

micBtn.classList.remove("listening");

micIcon.textContent = "🎤";

statusText.textContent =
"اضغط على الميكروفون وابدئ الحديث";

};


// ========================================================
// Recognition Error
// ========================================================

recognition.onerror = (event) => {

console.error(
"SPEECH ERROR:",
event.error
);

isListening = false;

micBtn.classList.remove("listening");

micIcon.textContent = "🎤";


if (event.error === "not-allowed") {

statusText.textContent =
"اسمح للمتصفح باستخدام الميكروفون.";

} else if (event.error === "no-speech") {

statusText.textContent =
"لم أسمع كلامًا. حاول مرة أخرى.";

} else {

statusText.textContent =
"حدث خطأ في التعرف على الصوت.";

}

};


// ========================================================
// Speech Result
// ========================================================

recognition.onresult = async (event) => {

const userText =
event.results[0][0].transcript.trim();


if (!userText) {
return;
}


console.log(
"USER TEXT:",
userText
);


// Show user message

addMessage(
"user",
userText
);


// Show thinking message

const thinkingEl =
addMessage(
"bot",
"... يفكر",
{
thinking: true
}
);


statusText.textContent =
"جاري الاتصال بالخادم...";


try {

const reply =
await askGemini(userText);


thinkingEl.remove();


addMessage(
"bot",
reply
);


speak(reply);


statusText.textContent =
"اضغط على الميكروفون وابدئ الحديث";


} catch (error) {

console.error(
"FINAL CHAT ERROR:",
error
);


thinkingEl.remove();




addMessage(
"bot",
"❌ خطأ التشخيص:\n\n" +
error.message
);


statusText.textContent =
"حدث خطأ. راجع رسالة التشخيص.";

}

};

}


// ============================================================
// Gemini / PHP Diagnostic Function
// ============================================================

async function askGemini(prompt) {

console.log(
"===================================="
);

console.log(
"STARTING GEMINI REQUEST"
);

console.log(
"Prompt:",
prompt
);

console.log(
"PHP URL:",
window.location.origin +
"/gemini.php"
);


const phpURL =
"./gemini.php";


try {

// ----------------------------------------------------
// Step 1 — Send request
// ----------------------------------------------------

console.log(
"STEP 1: Sending POST request to gemini.php..."
);


let response;


try {

response =
await fetch(
phpURL,
{
method: "POST",

headers: {
"Content-Type":
"application/json"
},

body: JSON.stringify({
prompt: prompt
})
}
);

} catch (networkError) {

console.error(
"STEP 1 FAILED:",
networkError
);


throw new Error(
"🚨 PROFREEHOST / CONNECTION ERROR\n\n" +
"JavaScript could not connect to gemini.php.\n\n" +
"Browser error:\n" +
networkError.message +
"\n\n" +
"This means the request did NOT successfully reach PHP."
);

}


console.log(
"STEP 1 SUCCESS"
);


console.log(
"HTTP STATUS:",
response.status
);


console.log(
"HTTP STATUS TEXT:",
response.statusText
);


console.log(
"RESPONSE URL:",
response.url
);


// ----------------------------------------------------
// Step 2 — Read response
// ----------------------------------------------------

console.log(
"STEP 2: Reading PHP response..."
);


let responseText;


try {

responseText =
await response.text();

} catch (readError) {

console.error(
"STEP 2 FAILED:",
readError
);


throw new Error(
"🚨 PHP RESPONSE ERROR\n\n" +
"The request reached the server, " +
"but the browser could not read the response.\n\n" +
"Error:\n" +
readError.message
);

}


console.log(
"RAW PHP RESPONSE:"
);

console.log(
responseText
);


// ----------------------------------------------------
// Step 3 — Check HTTP status
// ----------------------------------------------------

if (!response.ok) {

throw new Error(
"🚨 PHP / SERVER ERROR\n\n" +
"HTTP Status: " +
response.status +
"\n\n" +
"Server response:\n" +
responseText
);

}


// ----------------------------------------------------
// Step 4 — Parse JSON
// ----------------------------------------------------

console.log(
"STEP 3: Parsing JSON..."
);


let data;


try {

data =
JSON.parse(responseText);

} catch (jsonError) {

console.error(
"JSON ERROR:",
jsonError
);


throw new Error(
"🚨 GEMINI.PHP RETURNED INVALID JSON\n\n" +
"The PHP file responded, but its response " +
"was not valid JSON.\n\n" +
"Raw response:\n" +
responseText
);

}


console.log(
"PARSED PHP DATA:",
data
);


// ----------------------------------------------------
// Step 5 — Check PHP success
// ----------------------------------------------------

if (data.success !== true) {

let details = "";

if (data.details) {

try {

details =
"\n\nDetails:\n" +
JSON.stringify(
data.details,
null,
2
);

} catch (e) {

details =
"\n\nDetails:\n" +
data.details;

}

}


throw new Error(
"🚨 GEMINI / PHP ERROR\n\n" +
"PHP successfully responded, " +
"but Gemini returned an error.\n\n" +
"Error:\n" +
(data.error ||
"Unknown Gemini error") +
details
);

}


// ----------------------------------------------------
// Step 6 — Check reply
// ----------------------------------------------------

if (!data.reply) {

throw new Error(
"🚨 GEMINI RESPONSE ERROR\n\n" +
"PHP worked, but Gemini did not return a reply.\n\n" +
"Full response:\n" +
JSON.stringify(
data,
null,
2
)
);

}


console.log(
"SUCCESS! GEMINI REPLIED:"
);

console.log(
data.reply
);


console.log(
"===================================="
);


return data.reply.trim();


} catch (error) {

console.error(
"ASK GEMINI FINAL ERROR:",
error
);


/*
* Do NOT replace this with "Load failed".
* We need the real error.
*/

throw error;

}

}


// ============================================================
// Text To Speech
// ============================================================

function speak(text) {

if (!("speechSynthesis" in window)) {
return;
}


window.speechSynthesis.cancel();


const utterance =
new SpeechSynthesisUtterance(text);


utterance.lang = LANG;

utterance.rate = 1;

utterance.pitch = 1;


window.speechSynthesis.speak(
utterance
);

}


// ============================================================
// Add Message
// ============================================================

function addMessage(
role,
text,
opts = {}
) {

const el =
document.createElement("div");


el.className =
`message ${role}${
opts.thinking
? " thinking"
: ""
}`;


const p =
document.createElement("p");


p.textContent = text;


el.appendChild(p);


chatLog.appendChild(el);


chatLog.scrollTop =
chatLog.scrollHeight;


return el;
