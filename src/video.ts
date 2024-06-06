export const video_player = document.createElement("video");

export default function () {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(function (stream) {
      console.log(stream);
      debugger;
      video_player.srcObject = stream;
      video_player.play();
      document.body.appendChild(video_player);
      debugger;
    })
    .catch(function (err) {
      console.log("An error occurred: " + err);
    });
}
