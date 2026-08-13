<?php

header("Content-Type: application/json; charset=UTF-8");


// ============================================================
// GEMINI API KEY
// ============================================================

$apiKey = "1234";


// ============================================================
// Get request
// ============================================================

$input = json_decode(
file_get_contents("php://input"),
true
);


$prompt = isset($input["prompt"])
? trim($input["prompt"])
: "";


if ($prompt === "") {

echo json_encode([
"success" => false,
"error" => "No prompt received."
], JSON_UNESCAPED_UNICODE);

exit;
}


// ============================================================
// STEP 1
// Ask Google which models are available for this API key
// ============================================================

$modelsUrl =
"https://generativelanguage.googleapis.com/v1beta/models?key="
. urlencode($apiKey);


$ch = curl_init($modelsUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_TIMEOUT, 30);

curl_setopt($ch, CURLOPT_HTTPHEADER, [
"Accept: application/json"
]);


$modelsResponse =
curl_exec($ch);


$modelsHttpCode =
curl_getinfo($ch, CURLINFO_HTTP_CODE);


$modelsCurlError =
curl_error($ch);


curl_close($ch);


// ============================================================
// Check connection
// ============================================================

if ($modelsResponse === false) {

echo json_encode([
"success" => false,
"error" => "Could not connect to Google Gemini.",
"details" => $modelsCurlError
], JSON_UNESCAPED_UNICODE);

exit;
}


// ============================================================
// Parse models response
// ============================================================

$modelsData =
json_decode(
$modelsResponse,
true
);


if (!is_array($modelsData)) {

echo json_encode([
"success" => false,
"error" => "Google returned invalid JSON.",
"http_code" => $modelsHttpCode,
"raw_response" => $modelsResponse
], JSON_UNESCAPED_UNICODE);

exit;
}


// ============================================================
// Check Google API error
// ============================================================

if (
isset($modelsData["error"])
) {

echo json_encode([
"success" => false,
"error" => "Gemini Models API Error",
"details" => $modelsData["error"]
], JSON_UNESCAPED_UNICODE);

exit;
}


// ============================================================
// Find models that support generateContent
// ============================================================

$availableModels = [];

$preferredModels = [
"gemini-3.6-flash",
"gemini-3.5-flash",
"gemini-3.5-flash-lite",
"gemini-3.1-flash-lite",
"gemini-2.5-flash"
];


if (
isset($modelsData["models"]) &&
is_array($modelsData["models"])
) {

foreach (
$modelsData["models"]
as $model
) {

if (
!isset($model["name"])
) {
continue;
}


$supportsGenerate =
false;


if (
isset(
$model["supportedGenerationMethods"]
)
&&
is_array(
$model["supportedGenerationMethods"]
)
) {

$supportsGenerate =
in_array(
"generateContent",
$model["supportedGenerationMethods"]
);

}


if ($supportsGenerate) {

$availableModels[] =
$model["name"];

}

}

}


// ============================================================
// Select model
// ============================================================

$selectedModel = null;


// First try preferred models

foreach (
$preferredModels
as $preferred
) {

$fullName =
"models/" . $preferred;


if (
in_array(
$fullName,
$availableModels
)
) {

$selectedModel =
$preferred;

break;

}

}


// If none of the preferred models are available,
// use the first model Google says supports generateContent.

if (
$selectedModel === null &&
count($availableModels) > 0
) {

$selectedModel =
preg_replace(
"/^models\//",
"",
$availableModels[0]
);

}


// ============================================================
// No usable model
// ============================================================

if ($selectedModel === null) {

echo json_encode([
"success" => false,
"error" => "No Gemini model available for this API key.",
"available_models" => $availableModels,
"all_models_response" => $modelsData
], JSON_UNESCAPED_UNICODE);

exit;
}


// ============================================================
// STEP 2
// Send prompt to selected model
// ============================================================

$generateUrl =
"https://generativelanguage.googleapis.com/v1beta/models/"
. $selectedModel
. ":generateContent?key="
. urlencode($apiKey);


$requestBody = [

"contents" => [

[

"role" => "user",

"parts" => [

[

"text" =>
"أنت مساعد صوتي عربي. "
. "أجب باللغة العربية بشكل واضح "
. "ومفيد ومختصر.\n\n"
. $prompt

]

]

]

]

];


$ch = curl_init($generateUrl);


curl_setopt(
$ch,
CURLOPT_POST,
true
);


curl_setopt(
$ch,
CURLOPT_RETURNTRANSFER,
true
);


curl_setopt(
$ch,
CURLOPT_TIMEOUT,
60
);


curl_setopt(
$ch,
CURLOPT_HTTPHEADER,
[
"Content-Type: application/json",
"Accept: application/json"
]
);


curl_setopt(
$ch,
CURLOPT_POSTFIELDS,
json_encode(
$requestBody,
JSON_UNESCAPED_UNICODE
)
);


$response =
curl_exec($ch);


$httpCode =
curl_getinfo(
$ch,
CURLINFO_HTTP_CODE
);


$curlError =
curl_error($ch);


curl_close($ch);


// ============================================================
// Connection error
// ============================================================

if ($response === false) {

echo json_encode([
"success" => false,
"error" => "Gemini connection failed.",
"details" => $curlError,
"selected_model" => $selectedModel
], JSON_UNESCAPED_UNICODE);

exit;
}


// ============================================================
// Parse Gemini response
// ============================================================

$data =
json_decode(
$response,
true
);


// ============================================================
// Gemini API error
// ============================================================

if (
$httpCode < 200 ||
$httpCode >= 300
) {

echo json_encode([
"success" => false,
"error" => "Gemini API Error",
"http_code" => $httpCode,
"selected_model" => $selectedModel,
"details" => $data
], JSON_UNESCAPED_UNICODE);

exit;
}


// ============================================================
// Extract reply
// ============================================================

$reply = null;


if (
isset(
$data["candidates"][0]["content"]["parts"][0]["text"]
)
) {

$reply =
$data["candidates"][0]["content"]["parts"][0]["text"];

}


// ============================================================
// No reply
// ============================================================

if (
$reply === null ||
trim($reply) === ""
) {

echo json_encode([
"success" => false,
"error" => "Gemini returned no text.",
"selected_model" => $selectedModel,
"gemini_response" => $data
], JSON_UNESCAPED_UNICODE);

exit;
}


// ============================================================
// SUCCESS 🎉
// ============================================================

echo json_encode([

"success" => true,

"reply" => trim($reply),

"model" => $selectedModel

], JSON_UNESCAPED_UNICODE);

?>