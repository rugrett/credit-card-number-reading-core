async function getVideoDevicesOnly() {
  try {
    const kind = "videoinput";
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices.filter((device) => {
      return device.kind === kind && device;
    });
  } catch (err) {
    throw new Error("Unable to get video devices only");
  }
}

async function setStream(deviceId: string) {
  const video = window.document.querySelector("video") as HTMLVideoElement;
  video.srcObject = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId,
    },
    audio: false,
  });
  video.play();
}

async function choicesDevice(devices: MediaDeviceInfo[]) {
  const buttons = devices.map((device) => {
    const button: HTMLButtonElement = window.document.createElement("button");
    button.name = device.label;
    button.value = device.label;
    button.innerHTML = device.label;
    button.onclick = function () {
      setStream(device.deviceId);
    };
    return button;
  });

  window.document.body.append(...buttons);
}

(function () {
  (async function () {
    const items = await getVideoDevicesOnly();

    if ((typeof items) in Error || items.length === 0) {
      console.log("What is getVideoDevicesOnly return?");
    }

    choicesDevice(items);
  })();
})();
