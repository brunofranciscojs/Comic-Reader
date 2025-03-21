import React, { useState, useEffect } from "react";
import ComicReader from "./components/ComicReader";
import JSZip from "jszip";
import ComicBook from './components/ComicBook'

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
  const [saved, setSaved] = useState({})
  const [hoverIndex, setHoverIndex] = useState(null);
  const [comic, setComic] = useState(false)
  const [infos, setInfos] = useState(null)

  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id, name, description)&key=${apiKey}`;
  const listIcon = `<svg width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 6h8m-8 6h10M9 18h8M5 3v18" color="currentColor"/></svg>`
  const columnIcon = `<svg width="2rem" height="2rem" viewBox="0 0 24 24"><path fill="currentColor" d="M16 5v13h5V5M4 18h5V5H4m6 13h5V5h-5z"/></svg>`
  const saveIcon = `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#eeeeee" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"></path></svg>`
  
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

  const getOpacity = (index) => {
    if (hoverIndex === null) return 1; 
    const diff = Math.abs(hoverIndex - index);
    if (diff === 0) return 1; 
    if (diff <= 4) return (1 - diff * 0.2).toFixed(2);
    return 0.1;
  };

  const fetchAllFiles = async () => {
    setLoading(true);
    setError(null);
    let allFiles = [];
    let nextPageToken = null;

    do {
      let apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=nextPageToken,files(id, name, description)&key=${apiKey}&pageSize=100`;

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
    setCurrentFile({ fileName, images: [], progress: "loading..." });
    setOverlay(true);
    
    fetch(fileUrl)
      .then((response) => response.blob())
      .then((arrayBuffer) => processComic(arrayBuffer, fileName));
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
    setCurrentFile({ fileName, images: imageFiles, progress: "Loaded!" });
  };

  
  function extractInfoFromTitle(title) {
    const regex = /^(.*?)\s(\d{3})\s\((\d{4})\)/;
    const match = title.match(regex);

    if (!match) return { titulo: "unknown", edicao: "?", ano: "?" };

    return {
      titulo: match[1],
      edicao: match[2],
      ano: match[3],
    };
  }

  const arquivosFiltrados = files
  .filter((buscaItem) => {
    const { edicao } = extractInfoFromTitle(buscaItem.name);
    return (
      buscaItem.name.toLowerCase().includes(busca.toLowerCase()) ||
      edicao.includes(busca)
    );
  })
  .sort((a, b) => {
    const edicaoA = parseInt(extractInfoFromTitle(a.name).edicao, 10) || 0;
    const edicaoB = parseInt(extractInfoFromTitle(b.name).edicao, 10) || 0;
    return edicaoA - edicaoB;
  });

  const toggleSaved = (id) => { setSaved(prevSaved => ({ ...prevSaved, [id]: !prevSaved[id]  })); };
  const eraseSearch = (e) => { setBusca(''); e.target.nextElementSibling.value = '' }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex justify-between items-center py-4 px-12 flex-wrap mb-12 gap-5">
        <img src="/assets/logo.webp" width={120} />
        <div className="relative w-full lg:min-w-[unset] grow lg:order-[unset] order-3 lg:grow-0 lg:w-1/2">
          {busca.length > 0 && <button className="bg-white/20 text-white text-sm rounded-full w-5 h-5 absolute top-2 right-4 border-0 z-10 leading-[0]" onClick={eraseSearch}>x</button>}
          <input type="text" placeholder="Seek by issue..." onInput={(e) => setBusca(e.target.value)} className="w-full px-5 p-2 text-gray-300  bg-white/10 rounded-xl" />
        </div>
        <button dangerouslySetInnerHTML={{__html:saveIcon}} className="h-12 w-auto left-2"></button>
        <button dangerouslySetInnerHTML={{ __html: list ? columnIcon : listIcon }} onClick={() => setList(prv => !prv)}></button>
      </div>

      {loading && <div className="text-center">reading folder...</div>}
      {error && <div className="text-center text-red-500">Error: {error.message}</div>}

        <>
          {!loading && !error && (
            <>
              {arquivosFiltrados.length > 0 ? (

                <ul className={`flex ${list ? 
                               'flex-col gap-3 px-8 ' : 
                               'px-8 lg:px-4 gap-x-1 gap-y-7  '} 
                                flex-wrap items-center ${busca.length > 1 ? 'justify-start' : 'justify-around'} ${comic ? 'pointer-events-none' : ''}`}>

                  <li className="absolute pointer-events-none"></li>

                  {arquivosFiltrados.map((file, index) => {
                    const info = extractInfoFromTitle(file.name);
                    return (
                      <li style={{ "--bg": `url(/../assets/${info.edicao < 100 ? parseInt(info.edicao, 10) : info.edicao}.jpg)`, backgroundSize:'100%', filter: `opacity(${getOpacity(index)}) saturate(${getOpacity(index + 5)})`,}} 
                          key={file.id}
                          data-year={info.ano}
                          onMouseEnter={() => { setHoverIndex(index); setInfos({ fileName: file.name, id: file.id, description: file.description }) }}
                          onMouseLeave={() => setHoverIndex(null)}

                        className={`!bg-center rounded-md relative hover:!bg-[length:110%] hover:!grayscale-0 duration-700 transition-all grow lg:grow-0 cursor-pointer after:duration-200 after:content-[""] after:absolute 
                                  ${list ? 'h-auto w-full' : 'bg-gray-700 h-96 aspect-[.65/1] overflow-hidden [background:var(--bg)]'}
                                 ${list ?
                            'hover:after:opacity-100 after:opacity-0 after:!bg-center after:!bg-contain after:[background:--bg] after:h-0 after:-top-20 after:w-56 hover:after:h-80 after:right-0 after:rounded-xl after:z-40' :
                            'after:opacity-75 after:bottom-0 after:w-full after:bg-[linear-gradient(to_top,black_0%,transparent_100%)] after:h-full'}`
                        }>
                        
                        <div className={`relative flex z-20  ${list ? 'flex-row z-20 py-0 px-3 items-center' : 'p-4 flex-col justify-end h-full'}`}>
                          <div className="absolute top-0 left-0 w-full h-[85%] z-50" onClick={() => setComic(true)}></div>
                          <h3 className={`${list ? 'text-sm order-1' : 'text-lg'} font-semibold`}>
                            {list ? file.name : (info.titulo, <span className="text-gray-200">#{info.edicao}</span>)}
                          </h3>
                          <span className={`text-[#f4ed24] bg-[#303539] absolute top-0 right-3 text-lg px-[.6rem] py-[.2rem] font-bold ${list ? 'hidden' : ''}`}>{info.ano}</span>

                          <div className="flex items-center justify-between">
                            <button onClick={() => openComicFromDrive(file.id, file.name)} 
                                    className={`bg-[#f4ed24] hover:bg-[#00bcf0] text-[#303539] rounded transition z-20 
                                    ${list ? 'mr-4 py-1 px-2 order-0' : 'py-2 px-4 w-auto'}`}>
                              Read
                            </button>
                            <button dangerouslySetInnerHTML={{__html:saveIcon}} className={`h-12 w-auto ${list ? 'mr-8' : ''} ${!saved ? '[&_path]:fill-[#c8412d]' : '[&_path]:fill-[#eeeeee]'}`} onClick={() => toggleSaved(info.edicao)}></button>
                          </div>
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
      {currentFile && <ComicReader file={currentFile} overlay={overlay} setOverlay={setOverlay} setComic={setComic}/>}
      {comic && <ComicBook file={infos} setComic={setComic} openComicFromDrive={openComicFromDrive}/>}

      <footer className="flex justify-center gap-4 text-xs text-gray-300 pt-32 pb-12">
        <a href="https://github.com/brunofranciscojs/Comic-Reader" target="_blank">see on github</a>
        <a href="https://brunofrancisco.com.br" target="_blank">webiste</a>
      </footer>
    </div>
  );

}
