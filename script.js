const PROXY_URL = "https://script.google.com/macros/s/AKfycbytCi6tWRtNRxQyxVFVSoeb7L2DgOv4P8s9BaFLKXtN6vwjXzLF7eDrFYdt5KsBV1dnZQ/exec"; 

let txtRows = [];

document.getElementById("startBtn").addEventListener("click", async () => {
  const files = document.getElementById("imageFiles").files;
  const resultsDiv = document.getElementById("results");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");

  resultsDiv.textContent = "";
  txtRows = [];

  if (!files.length) {
    alert("Please select images first!");
    return;
  }

  let completed = 0;
  progressBar.style.width = "0%";
  progressText.textContent = `0 / ${files.length}`;

  const promises = Array.from(files).map(async (file) => {
    try {
      resultsDiv.textContent += `Processing: ${file.name}\n`;
      const base64 = await toBase64(file);

      const formData = new FormData();
      formData.append("fileName", file.name);
      formData.append("mimeType", file.type);
      formData.append("fileBase64", base64.split(",")[1]);

      const resp = await fetch(PROXY_URL, { method: "POST", body: formData });
      const data = await resp.json();

      let description = "";
      if (data.descriptions && data.descriptions.length > 0) {
        description = data.descriptions[0].text;
      } else {
        description = JSON.stringify(data);
      }

      resultsDiv.textContent += `${description}\n\n`;
      txtRows.push(description);
    } catch (err) {
      resultsDiv.textContent += `[ERROR] ${file.name}: ${err.message}\n\n`;
    } finally {
      completed++;
      const percent = Math.round((completed / files.length) * 100);
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `${completed} / ${files.length}`;
    }
  });

  await Promise.all(promises);

  document.getElementById("downloadTxtBtn").disabled = false;
});

document.getElementById("downloadTxtBtn").addEventListener("click", () => {
  const txtContent = txtRows.join("\r\n\r\n");
  const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ideogram_prompts.txt";
  a.click();
  URL.revokeObjectURL(url);
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
