// to change colors i edited face-api script

const video = document.getElementById("video");

// function that starts displaying webcam video in html
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(error => console.error(error));
}

// after loading all models, start displaying video.
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

// once video starts playing, start rendering information about face(s)
video.addEventListener("play", () => {
    // create and append canvas to the body
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    // make canvas the same size as video
    const displaySize = { width: video.width, height: video.height};
    faceapi.matchDimensions(canvas, displaySize);

    // start interval of updating face information on the canvas
    setInterval(async () => {
        // detect where faces, face landmarks and expression points are
        const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

        // resize face detection results to the display(video element and canvas) size
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // clear canvas before each render so there are no multiple boxes
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        // draw different parts of face detection on the canvas
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, 150);
});
