import React, { useState, useEffect } from "react";
import ComicReader from "./components/ComicReader";
import JSZip from "jszip";

export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [overlay, setOverlay] = useState(false)
  const [progress, setProgress] = useState(0);
  const apiKey = `AIzaSyCdZ6Hf2m-ZixTGJp13ql9hnyz9vP4bBtE`;
  const folderId = `1zaD8dt1UzVO_oiaNb4nc5NrdAIS90yiq`;
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'%20in%20parents&key=${apiKey}`;

  useEffect(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch file list.");
        }
        return response.json();
      })
      .then((data) => setFiles(data.files || []))
      .finally(() => setLoading(false));
      
  }, []);

  const openComicFromDrive = (fileId, fileName) => {
    if (!fileName.toLowerCase().endsWith(".cbz")) {
      console.error("O arquivo não é um CBZ.");
      return;
    }
    
    const fileUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    setCurrentFile({ fileName, images: [], progress: "Carregando..." });
    setOverlay(true); 
    setProgress(0);

    fetch(fileUrl)
      .then((response) => response.blob())
      .then((arrayBuffer) => processComic(arrayBuffer, fileName))
  };
  
  const processComic = async (arrayBuffer, fileName) => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const imageFiles = [];
    const imageExtensions = /\.(jpg|jpeg|png)$/i;
    const fileEntries = Object.keys(zip.files);
    const totalFiles = fileEntries.length; 
    let extracted = 0; 

    for (const fileName of fileEntries) {
      if (imageExtensions.test(fileName)) {
        const fileData = await zip.files[fileName].async("blob");
        const url = URL.createObjectURL(fileData);

        imageFiles.push({ url, filename: fileName });

        extracted++;
        setProgress(Math.round((extracted / totalFiles) * 100)); 
      }
    }

    setCurrentFile({ fileName, images: imageFiles, progress: "Finalizado!" });
  };

  function extractInfoFromTitle(title) {
    const regex = /^(.*?)\s(\d{3})\s\((\d{4})\)/;
    const match = title.match(regex);
  
    if (!match) return { titulo: "Desconhecido", edicao: "?", ano: "?" };
  
    return {
      titulo: match[1],
      edicao: match[2],
      ano: match[3],
    };
  }
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl mb-4">./Google Drive Files/Invincible</h1>
  
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-center text-red-500">Error: {error.message}</div>}
  
      {!loading && !error && (
        <>
          {files.length > 0 ? (
            <ul className="flex flex-wrap gap-0 justify-center">
              {files.map((file) => {
                const info = extractInfoFromTitle(file.name);
                return (
                  <li key={file.id} className="aspect-[.65/1] group overflow-hidden bg-gray-700 rounded-md relative h-96 after:content-[''] after:absolute after:bottom-0 after:w-full after:bg-[linear-gradient(to_top,black_0%,transparent_100%)] after:h-full" data-year={info.ano}>
                    <img src={`/assets/${info.edicao < 100 ? parseInt(info.edicao, 10) : info.edicao}.jpg`} className="absolute w-full h-full object-cover left-0 top-0 z-0 duration-150 group-hover:[scale:1.06] object-center"/>

                    <div className="relative p-4  flex flex-col z-20 justify-end h-full">
                      <h3 className="text-lg font-semibold">{info.titulo} <span className="text-gray-400">#{info.edicao}</span></h3>
                      <span className="text-gray-200 bg-black absolute top-0 right-3 text-lg px-[.6rem] py-[.2rem] font-bold">{info.ano}</span>

                      <button
                      onClick={() => openComicFromDrive(file.id, file.name)}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                    >
                      Ler
                    </button>
                    </div>
  

                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center">Nenhum arquivo encontrado.</p>
          )}
        </>
      )}
  
      {currentFile && <ComicReader file={currentFile} overlay={overlay} setOverlay={setOverlay} progress={progress}/>}
    </div>
  );
  
}