
const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "12345678-1234-1234-1234-1234567890ac";

const statusEl = document.getElementById("status");
const distanceEl = document.getElementById("distance");
const consoleEl = document.getElementById("console");

document.getElementById("connect").onclick = async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }]
    });

    statusEl.textContent = "Connecting...";
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    const characteristic =
      await service.getCharacteristic(CHARACTERISTIC_UUID);

    await characteristic.startNotifications();

    const decoder = new TextDecoder();
    let buffer = "";

    characteristic.addEventListener(
      "characteristicvaluechanged",
      event => {
        buffer += decoder.decode(event.target.value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;

          consoleEl.textContent += line + "\n";
          consoleEl.scrollTop = consoleEl.scrollHeight;

          const match = line.match(/Distance:\s*([\d.]+)\s*cm/i);
          if (match) distanceEl.textContent = `${match[1]} cm`;
        }
      }
    );

    device.addEventListener("gattserverdisconnected", () => {
      statusEl.textContent = "Disconnected";
    });

    statusEl.textContent = "Connected to " + device.name;
  } catch (error) {
    statusEl.textContent = "Connection failed: " + error.message;
  }
};

document.getElementById("clear").onclick = () => {
  consoleEl.textContent = "";
};
