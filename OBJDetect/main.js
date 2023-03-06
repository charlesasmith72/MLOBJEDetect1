 //console.log('Loaded TensorFlow.js - version: ' + tf.version.tfjs);
 const video = document.getElementById('webcam');
 const liveView = document.getElementById('liveView');
 const demosSection = document.getElementById('demos');
 const enableWebcamButton = document.getElementById('webcamButton');
 var model = true;
 var children = [];
 
 // Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment 
// to get everything needed to run.
 (async function (){
    //set COCO SSD Model Object
    model = await cocoSsd.load();
   
      // Show demo section now model is ready to use.
      demosSection.classList.remove('invisible');
 })();
 
 
 // Check if webcam access is supported.
function getUserMediaSupported() {
    //The navigator.mediaDevices object allows web developers to access the user's media devices and stream audio or video data in real-time.
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will 
// define in the next step.
if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
   // Placeholder function for next step. Paste over this in the next step.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading. var model= false
  if (!model) {
    return;
  }

    // Hide the button once clicked.
   event.target.classList.add('removed');

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
  
}

 
 

async function predictWebcam() {
 
   // The detect() function takes a video argument, which is a reference to a HTML video element or a canvas element. The detect() function then analyzes the video stream in real-time and returns a Promise that resolves with an array of detected objects.
   var predictions = await model.detect(video);
    
    // Remove any highlighting we did previous frame.
    for (let childCount = 0; childCount < children.length; childCount++) {
        liveView.removeChild(children[childCount]);
      }
      children.splice(0);

      // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
        // If we are over 66% sure we are sure we classified it right, draw it!
        if (predictions[n].score > 0.60) {

          const nameTag = document.createElement('p');
           var predictedClass = predictions[n].class;
           var predictionPercent = Math.round(parseFloat(predictions[n].score) * 100)+"%" ;
                nameTag.innerText =  predictedClass +' ('+predictionPercent+')';
             /*The bbox property is an array that contains four elements: [x, y, width, height]. 
             The first two elements (x and y) specify the coordinates of the top-left corner of the bounding box,
              relative to the top-left corner of the video frame. The last two elements (width and height) specify the size of the bounding box in pixels.*/

                nameTag.style = 'margin-left: ' + predictions[n].bbox[0] +'px;'+
                                'margin-top: '+ (predictions[n].bbox[1] - 10) + 'px;'+
                                'width: '+ (predictions[n].bbox[2] - 10) + `px;
                                 top: 0; 
                                 left: 0;`;

          const highlighter = document.createElement('div');
          highlighter.setAttribute('class', 'highlighter');
          highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
              + predictions[n].bbox[1] + 'px; width: ' 
              + predictions[n].bbox[2] + 'px; height: '
              + predictions[n].bbox[3] +'px;' 
  
           liveView.appendChild(highlighter);
           liveView.appendChild(nameTag);
           children.push(highlighter);
           children.push(nameTag);
        }
      }
      
     // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);



}