import React, { useState, useEffect } from "react";
import ComicReader from "./components/ComicReader";
import JSZip from "jszip";

const apiKey = import.meta.env.VITE_API_KEY;
const folderId = import.meta.env.VITE_FOLDER_ID;

export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [overlay, setOverlay] = useState(false)
  const [list, setList] = useState(false)
  const [busca, setBusca] = useState("");

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
      <div className="flex justify-between items-center py-4 px-12 flex-wrap mb-12 gap-5">
        <img src="/assets/logo.webp" width={120} />
        <input type="text" placeholder="Seek edition..." onInput={(e) => setBusca(e.target.value)} className="w-full lg:min-w-[unset] grow lg:order-[unset] order-3 lg:grow-0 px-5 p-2 text-gray-300 lg:w-1/2 bg-white/10 rounded-xl"/>
        <button dangerouslySetInnerHTML={{__html: list ? listIcon : columnIcon}} onClick={() =>setList(prvLst => !prvLst)}></button>
      </div>

      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-center text-red-500">Error: {error.message}</div>}
  
      {!loading && !error && (
        <>
        {!loading && !error && (
        <>
        {arquivosFiltrados.length > 0 ? (

           <ul className={`px-8 lg:px-0 flex ${list ? 'flex-col gap-3' : ''} flex-wrap gap-x-1 gap-y-7 items-center justify-around [&:has(li:not(:hover))_li:hover]:opacity-100 [&:has(li:hover)_li]:opacity-[.3] ${busca.length > 1 ? 'min-h-dvh' : 'min-h-[unset]'}`}>
            <li className="absolute pointer-events-none"></li>
            {arquivosFiltrados.map((file) => {
              const info = extractInfoFromTitle(file.name);
              return (
                <li key={file.id} style={{"--bg":`url(/../assets/${info.edicao < 100 ? parseInt(info.edicao, 10) : info.edicao}.jpg)`}} data-year={info.ano} 

                    className={`[background:var(--bg)] !bg-center aspect-[.65/1] overflow-hidden bg-gray-700 rounded-md relative h-96 duration-200 !bg-cover grow lg:grow-0 cursor-pointer
                                ${list ? 
                                'after:duration-200 after:content-[""] hover:after:opacity-100 after:opacity-0 after:!bg-center after:!bg-contain after:[background:--bg] after:h-0 after:absolute after:-top-20 after:w-56 hover:after:h-80 after:right-0 after:rounded-xl after:z-40' :
                                'after:opacity-75 after:content-[""] after:absolute after:bottom-0 after:w-full after:bg-[linear-gradient(to_top,black_0%,transparent_100%)] after:h-full'}`
                                }>
  
                  <div className={`relative p-4 flex z-20  ${list ? 'flex-row z-20' : 'flex-col justify-end h-full'}`}>
                    <h3 className={`${list ? 'text-base' : 'text-lg'} font-semibold`}>
                      {info.titulo} <span className="text-gray-400">#{info.edicao}</span>
                    </h3>
                    <span className="text-[#f4ed24] bg-[#303539] absolute top-0 right-3 text-lg px-[.6rem] py-[.2rem] font-bold">{info.ano}</span>

                    <button onClick={() => openComicFromDrive(file.id, file.name)} className={`mt-2 bg-[#f4ed24] hover:bg-[#00bcf0] text-[#303539] rounded transition z-20 ${list ? 'ml-12 py-1 px-2' : 'py-2 px-4'}`}
                    >
                      Read
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

        ) : (
          <p className="text-center">Issue not found.</p>
        )}
      </>
      )}
      </>
      )}

      {currentFile && <ComicReader file={currentFile} overlay={overlay} setOverlay={setOverlay}/>}
    </div>
  );
  
}