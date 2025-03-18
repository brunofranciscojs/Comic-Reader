import React, { useState, useEffect } from "react";
import ComicReader from "./components/ComicReader";
import JSZip from "jszip";

export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [overlay, setOverlay] = useState(false)
  const [list, setList] = useState(false)
  const [busca, setBusca] = useState("");

  const apiKey = `AIzaSyCdZ6Hf2m-ZixTGJp13ql9hnyz9vP4bBtE`;
  const folderId = `1zaD8dt1UzVO_oiaNb4nc5NrdAIS90yiq`;
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'%20in%20parents&key=${apiKey}`;
  const listIcon = `<svg width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 6h8m-8 6h10M9 18h8M5 3v18" color="currentColor"/></svg>`
  const columnIcon = `<svg width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="currentColor" d="M16 5v13h5V5M4 18h5V5H4m6 13h5V5h-5z"/></svg>`

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
  const fetchAllFiles = async () => {
    setLoading(true);
    setError(null);
    let allFiles = [];
    let nextPageToken = null;
  
    do {
      let apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&key=${apiKey}&pageSize=100`;
      
      if (nextPageToken) {
        apiUrl += `&pageToken=${nextPageToken}`;
      }
  
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch file list.");
        }
  
        const data = await response.json();
        allFiles = [...allFiles, ...data.files];
        nextPageToken = data.nextPageToken; 
      } catch (err) {
        setError(err);
        break;
      }
    } while (nextPageToken);
  
    setFiles(allFiles);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchAllFiles();
  }, []);

  const openComicFromDrive = (fileId, fileName) => {
    if (!fileName.toLowerCase().endsWith(".cbz")) {
      console.error("O arquivo não é um CBZ.");
      return;
    }
    
    const fileUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    setCurrentFile({ fileName, images: [], progress: "Carregando..." });
    setOverlay(true); 

    fetch(fileUrl)
      .then((response) => response.blob())
      .then((arrayBuffer) => processComic(arrayBuffer, fileName))
  };
  
  
  const processComic = async (arrayBuffer, fileName) => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const imageFiles = [];
    const imageExtensions = /\.(jpg|jpeg|png)$/i;
    const fileEntries = Object.keys(zip.files);

    for (const fileName of fileEntries) {
      if (imageExtensions.test(fileName)) {
        const fileData = await zip.files[fileName].async("blob");
        const url = URL.createObjectURL(fileData);
        imageFiles.push({ url, filename: fileName });
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

  const arquivosFiltrados = files.filter((buscaItem) => {
    const edition = extractInfoFromTitle(buscaItem.name).edicao;
    return (
      buscaItem.name.toLowerCase().includes(busca.toLowerCase()) ||
      edition.includes(busca)
    );
  });

  
  

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex justify-between items-center py-4 px-12">
        <span className="text-2xl mb-4">./Google Drive Files/Invincible</span>
        <input type="text" placeholder="Buscar edição..." pattern="numeric" onInput={(e) => setBusca(e.target.value)} className="px-5 p-2 text-gray-300 w-1/2 bg-white/10 rounded-xl"/>
        <button dangerouslySetInnerHTML={{__html: list ? listIcon : columnIcon}} onClick={() =>setList(prvLst => !prvLst)}></button>
      </div>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-center text-red-500">Error: {error.message}</div>}
  
      {!loading && !error && (
        <>
        {arquivosFiltrados.length > 0 ? (
          <ul className="flex flex-wrap gap-0 items-center justify-around [&:has(li:not(:hover))_li:hover]:opacity-100 [&:has(li:hover)_li]:opacity-40" style={{minHeight: busca.length > 1 ? '100dvh' : 'auto'}}>
            {arquivosFiltrados.map((file) => {
              const info = extractInfoFromTitle(file.name);
              return (
                <li key={file.id} style={{"--bg":`url(/../assets/${info.edicao < 100 ? parseInt(info.edicao, 10) : info.edicao}.jpg)`}} data-year={info.ano}
                  className="[background:var(--bg)] !bg-center aspect-[.65/1] overflow-hidden bg-gray-700 rounded-md relative h-96 duration-200 !bg-cover
                              after:opacity-75 
                              after:content-[''] 
                              after:absolute 
                              after:bottom-0 
                              after:w-full 
                              after:bg-[linear-gradient(to_top,black_0%,transparent_100%)] 
                              after:h-full">
  
                  <div className="relative p-4  flex flex-col z-20 justify-end h-full">
                    <h3 className="text-lg font-semibold">
                      {info.titulo} <span className="text-gray-400">#{info.edicao}</span>
                    </h3>
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
  
      {currentFile && <ComicReader file={currentFile} overlay={overlay} setOverlay={setOverlay}/>}
    </div>
  );
  
}