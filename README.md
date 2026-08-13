# Arabic Voice Assistant Chatbot

A web-based Arabic voice chatbot that allows users to speak through their microphone, converts speech to text, sends the message to Google Gemini, displays the response, and reads the response aloud.

## Website

https://speechtotextt.liveblog365.com/

## Features

- Speech recognition using the browser microphone
- Converts Arabic speech into text
- Chat-style conversation interface
- Google Gemini AI responses
- Arabic text-to-speech
- Responsive web interface
- Hosted using ProFreeHost
- Gemini API handled through a PHP backend

## Technologies

- HTML
- CSS
- JavaScript
- PHP
- Google Gemini API
- Google Apps Script
- ProFreeHost
- Web Speech API

## Project Structure

User speaks

↓

Web Speech API

↓

app.js

↓

POST request

↓

gemini.php

↓

Google Gemini API

↓

Gemini response

↓

gemini.php

↓

app.js

↓

Chat response

↓

Text-to-Speech

↓

Voice response

## Debugging

During development, the chatbot initially had several problems.

The microphone worked, but the chatbot could not communicate correctly with Gemini.

The chatbot returned errors such as:

403 Forbidden

and:
htdocs

The PHP backend was placed in the correct website directory so that app.js could communicate with it using a POST request.

No SQL database was required for the final chatbot because the application does not need to store user accounts or messages.

## Speech Recognition

The chatbot uses the Web Speech API to recognize the user's voice.

The recognition language is:

ar-SA

This allows the chatbot to recognize Arabic speech through the browser microphone.

## Text-to-Speech

The chatbot uses the browser's Speech Synthesis API to read Gemini's responses aloud.

The speech language is also configured as:

ar-SA

The response is automatically spoken after Gemini responds.

## Browser Compatibility

The speech recognition feature works best on browsers that support the Web Speech API.

Chrome and Edge are recommended.

The user must also allow microphone access for the website.

## API Key Security

The Gemini API key is handled by the PHP backend instead of being placed directly inside app.js.

This prevents the API key from being exposed through the frontend JavaScript.

API keys should never be uploaded publicly to GitHub.

If an API key is accidentally exposed, it should be revoked and replaced.

## Deployment

The final project was uploaded to ProFreeHost.

The frontend files and PHP backend were placed inside htdocs.

The website is available online through the public website URL.

## Final Result

The final chatbot can:

- Listen to Arabic speech
- Convert speech to text
- Display the user's message
- Send the message to Google Gemini
- Receive an AI-generated response
- Display the response in the chat
- Read the response aloud
- Run online through ProFreeHost

## Project Status

Completed and working successfully.

## Author

Sarah Althagafi

## Links

### Website

https://speechtotextt.liveblog365.com/

### GitHub

https://github.com/sarahalthagafi1-cyber/
