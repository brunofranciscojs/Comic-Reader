self.onmessage = async function (e) {
    const { arrayBuffer } = e.data;
    const JSZip = require("jszip");
    const zip = await JSZip.loadAsync(arrayBuffer);
    const imageFiles = [];
    const imageExtensions = /\.(jpg|jpeg|png)$/i;
  
    zip.forEach(async (relativePath, zipEntry) => {
      if (imageExtensions.test(relativePath)) {
        const fileData = await zipEntry.async("blob");
        const imageUrl = URL.createObjectURL(fileData);
        imageFiles.push({ url: imageUrl, name: relativePath });
      }
    });
  
    self.postMessage(imageFiles);
  };
  
