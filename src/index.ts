import { createWorker } from "tesseract.js";

const CANVAS_INSTANCE = window.document.createElement("canvas");
const IMAGE_ELEMENT = window.document.createElement("img");
const VIDEO_ELEMENT = window.document.querySelector(
  "video"
) as HTMLVideoElement;
const CARD_NUMBER_INPUT = window.document.createElement("input");

const PERMISSION_STATUS = {
  DENIED: "DENIED",
  ALLOWED: "ALLOWED",
};

function checkPermissions(devices: MediaDeviceInfo[]) {
  const status = devices.some((device) => {
    return !!device.label;
  });

  return status ? PERMISSION_STATUS.ALLOWED : PERMISSION_STATUS.DENIED;
}

async function getVideoDevicesOnly() {
  try {
    const kind = "videoinput";
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === kind);
  } catch (err) {
    throw new Error("Unable to get video devices only");
  }
}
// TODO доделать выключение стрима :)
// function appendButtonStopStream(videoElem: HTMLVideoElement) {
//   const mediaSource = new MediaStream(videoElem.srcObject);
//   const tracks = mediaSource.getTracks();
//
//   tracks.forEach((track) => {
//     track.stop();
//   });
//
//   videoElem = null;
// }
//
// function stopStreamVideo() {}

async function setStream(deviceId: string) {
  try {
    VIDEO_ELEMENT.srcObject = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId,
      },
      audio: false,
    });
    await VIDEO_ELEMENT.play();
  } catch (err) {
    return err;
  }
}

async function choicesDevice(devices: MediaDeviceInfo[]) {
  const buttons = devices.map((device) => {
    const button: HTMLButtonElement = window.document.createElement("button");
    button.name = device.label;
    button.value = device.label;
    button.innerHTML = device.label;
    button.onclick = function () {
      setStream(device.deviceId);
      appendButtonCameraToMakePhoto();
    };
    return button;
  });

  window.document.body.append(...buttons);
}

function appendButtonCameraToMakePhoto() {
  if (window.document.querySelector(".btn_camera")) {
    return;
  }
  const button: HTMLButtonElement = window.document.createElement("button");
  button.classList.add("btn_camera");

  button.name = "take_photo";
  button.value = "take_photo";
  button.innerHTML = "Сделать фото";
  button.onclick = function () {
    takePhoto();
  };

  window.document.body.append(button);
}

async function getTextFromPhoto() {
  const worker = await createWorker("rus");
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789",
  });
  const ret = await worker.recognize(IMAGE_ELEMENT);
  CARD_NUMBER_INPUT.type = "text";
  CARD_NUMBER_INPUT.value = ret.data.text;
  CARD_NUMBER_INPUT.classList.add("input_card");
  await worker.terminate();
  document.body.append(CARD_NUMBER_INPUT);
}

function takePhoto() {
  const context = CANVAS_INSTANCE.getContext("2d") as CanvasRenderingContext2D;
  CANVAS_INSTANCE.width = 1000;
  CANVAS_INSTANCE.height = 1000;
  context.drawImage(VIDEO_ELEMENT, 0, 0, 1000, 1000);

  const data = CANVAS_INSTANCE.toDataURL("image/png");
  IMAGE_ELEMENT.style.filter = "contrast(5.0)";
  IMAGE_ELEMENT.style.display = "none";
  IMAGE_ELEMENT.setAttribute("src", data);
  IMAGE_ELEMENT.setAttribute("alt", "just photo");

  document.body.append(IMAGE_ELEMENT);

  getTextFromPhoto();
}

(function () {
  (async function () {
    const items = await getVideoDevicesOnly();
    const hasPermission = checkPermissions(items);

    switch (hasPermission) {
      case PERMISSION_STATUS.ALLOWED: {
        if (items.length > 1) {
          choicesDevice(items);
        } else {
          setStream(items[0].deviceId);
          appendButtonCameraToMakePhoto();
        }
        break;
      }
      case PERMISSION_STATUS.DENIED: {
        alert("Pleas change permission for app");
        break;
      }
      default: {
        alert("Reload pleas app");
      }
    }
  })();
})();
