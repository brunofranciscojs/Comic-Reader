import React, { useState, useEffect } from "react";
import ComicReader from "./components/ComicReader";
import JSZip from "jszip";
import ComicBook from './components/ComicBook'
import ListIcon from "./components/listIcon";
import ColumnIcon from "./components/columnIcon";
import SaveIcon from "./components/saveIcon";
import LoadingIcon from "./components/loadingIcon";

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
  const [hoverIndex, setHoverIndex] = useState(null);
  const [comic, setComic] = useState(false);
  const [infos, setInfos] = useState(null);
  const [readProgress, setReadProgress] = useState({});
  const [openFav, setOpenFav] = useState(false)

  const [saved, setSaved] = useState(() => {
    const favorited = localStorage.getItem("favorites");
    return favorited ? JSON.parse(favorited) : {};
  });

  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=files(id, name, description)&key=${apiKey}`;
  
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

  useEffect(() => {
    const fetchAllFiles = async () => {
      setLoading(true);
      setError(null);
      let allFiles = [];
      let nextPageToken = null;

      try {
        do {
          let apiUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&fields=nextPageToken,files(id, name, description)&key=${apiKey}&pageSize=100`;

          if (nextPageToken) apiUrl += `&pageToken=${nextPageToken}`;

          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error("Failed to fetch file list.");

          const data = await response.json();
          allFiles = [...allFiles, ...data.files];
          nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        setFiles(allFiles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFiles();

    const storedProgress = localStorage.getItem("readingProgress");
    if (storedProgress) {
      setReadProgress(JSON.parse(storedProgress));
    }

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
    const fileEntries = Object.keys(zip.files).sort();
    for (const fileName of fileEntries) {
      if (imageExtensions.test(fileName)) {
        const fileData = await zip.files[fileName].async("blob");
        const url = URL.createObjectURL(fileData);
        imageFiles.push({ url, filename: fileName });
      }
    }
    setCurrentFile({ fileName, images: imageFiles, progress: "Loaded!", totalPages: imageFiles.length });
  };
  
  const updateReadingProgress = (fileName, currentPage, totalPages) => {
    const updatedProgress = {
      ...readProgress,
      [fileName]: {
        page: currentPage,
        total: totalPages,
      },
    };
  
    setReadProgress(updatedProgress);
    localStorage.setItem("readingProgress", JSON.stringify(updatedProgress));
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

  const arquivosFiltrados = files.filter((buscaItem) => {
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

  const toggleSaved = (id, fileName) => {
    setSaved((prevSaved) => {
      let updatedSaved = { ...prevSaved };
  
      if (updatedSaved[id]) {
        delete updatedSaved[id];
      } else {
        updatedSaved[id] = { id, fileName };
      }
  
      localStorage.setItem("favorites", JSON.stringify(updatedSaved));
      return updatedSaved;
    });
  };

  const eraseSearch = (e) => { setBusca(''); e.target.nextElementSibling.value = '' }

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      <div className="flex justify-between items-center py-4 px-12 flex-wrap mb-12 gap-5 fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-gray-950/45">
        <img src="/assets/logo.webp" width={120} />
        <div className="relative w-full lg:min-w-[unset] grow lg:order-[unset] order-3 lg:grow-0 lg:w-1/2">
          {busca.length > 0 && <button className="bg-white/20 text-white text-sm rounded-full w-5 h-5 absolute top-2 right-4 border-0 z-10 leading-[0]" onClick={eraseSearch}>x</button>}
          <input type="text" placeholder="Seek by issue..." onInput={(e) => setBusca(e.target.value)} className="w-full px-5 p-2 text-gray-300  bg-white/10 rounded-xl  outline-none" />
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setList(prv => !prv)}>{list ? <ColumnIcon /> : <ListIcon />}</button>
          <button className="h-12 w-auto left-2" onClick={() => setOpenFav(prv => !prv)}><SaveIcon/></button>

          {openFav && <div className="bg-gray-800 absolute top-16 right-12 w-auto max-h-64 overflow-y-auto rounded-xl shadow-2xl p-7 text-sm flex flex-col gap-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-[#f4ed24]">

              {Object.values(saved).map((file,index) => (
                 <div className="flex gap-2 items-center" key={index}>

                  <button className={`bg-[#f4ed24] hover:bg-[#00bcf0] text-[#303539] rounded transition z-20 py-0.5 px-2 w-auto`}
                          onClick={() => openComicFromDrive(file.id, file.fileName)} >
                    Read
                  </button>

                  <span className="truncate">{
                              file.fileName
                                .replace(/\(.*\)/, '')
                                .replace(/\b00(\d)\b/, '#0$1') 
                                .replace(/\b0(\d{2})\b/, '#$1')
                                .replace(/\b(\d{3})\b/, '#$1')
                                .replace('.cbz','')
                          }
                  </span>
                </div>
              ))}
          </div>}
        </div>
      </div>

      {loading && <div className="text-center">reading folder...</div>}
      {error && <div className="text-center text-red-500">Error: {error.message}</div>}

        <>
          {!loading && !error && (
            <>
              {arquivosFiltrados.length > 0 ? (

                <ul className={`flex py-36 ${list ? 
                               'flex-col gap-3 px-8 ' : 
                               'px-8 lg:px-4 gap-x-1 gap-y-7  '} 
                                flex-wrap items-center ${busca.length > 1 ? 'justify-start' : 'justify-around'} ${comic ? 'pointer-events-none' : ''}`}>

                  <li className="absolute pointer-events-none"></li>

                  {arquivosFiltrados.map((file, index) => {
                    const info = extractInfoFromTitle(file.name);
                    const fileProgress = readProgress[file.name];

                    return (
                      <li key={file.id} style={{"--bg": `url(/../assets/${info.edicao < 100 ? parseInt(info.edicao, 10) : info.edicao}.jpg)`, backgroundSize: '100%',filter: `opacity(${getOpacity(index)}) saturate(${getOpacity(index + 5)})`, }}
                          onMouseEnter={() => { setHoverIndex(index); setInfos({ fileName: file.name, id: file.id, description: file.description }) }}
                          onMouseLeave={() => setHoverIndex(null)}
                          className={`!bg-center rounded-md relative hover:!bg-[length:110%] hover:!grayscale-0 duration-300 transition-all grow lg:grow-0 cursor-pointer after:duration-200 after:content-[""] after:absolute 
                                    ${list ? 'h-auto w-full' : 'bg-gray-700 h-96 aspect-[.65/1] overflow-hidden [background:var(--bg)]'}
                                    ${list ? 'hover:after:opacity-100 after:opacity-0 after:!bg-center after:!bg-contain after:[background:--bg] after:h-0 after:-top-20 after:w-56 hover:after:h-80 after:right-0 after:rounded-xl after:z-40' :
                                    'after:opacity-75 after:bottom-0 after:w-full after:bg-[linear-gradient(to_top,black_0%,transparent_100%)] after:h-full'}`}>

                        <div className={`relative flex z-20  ${list ? 'flex-row z-20 py-0 px-3 items-center' : 'p-4 flex-col justify-end h-full'}`}>

                          <div className="absolute top-0 left-0 w-full h-[85%] z-50" onClick={() => setComic(true)}></div>
                          <h3 className={`${list ? 'text-sm order-1' : 'text-lg'} font-semibold`}>
                            {list ? file.name : (info.titulo, <span className="text-gray-200">#{info.edicao}</span>)}
                          </h3>
                          
                          <span className={`text-[#f4ed24] bg-[#303539] absolute top-0 right-3 text-lg px-[.6rem] py-[.2rem] font-bold ${list ? 'hidden' : ''}`}>{info.ano}</span>

                          <div className="flex items-center justify-between mb-2">
                            <button onClick={() => openComicFromDrive(file.id, file.name)} className={`bg-[#f4ed24] hover:bg-[#00bcf0] text-[#303539] rounded transition z-20 ${list ? 'mr-4 py-1 px-2 order-0' : 'py-2 px-4 w-auto'}`}>
                              {fileProgress && fileProgress.page > 1 ? 'Continue' : 'Read'}
                            </button>

                            <button className={`h-12 w-auto ${list ? 'mr-8' : ''} ${saved[file.id] ? '[&_path]:fill-[#f4ed24]' : '[&_path]:fill-none [&_path]:stroke-[#f4ed24]'}`} 
                                    onClick={() => toggleSaved(file.id, file.name)}>
                              <SaveIcon />
                            </button>
                          </div>

                          {!list && fileProgress && (
                            <progress value={fileProgress.page / fileProgress.total} max="1"
                                      className={`w-full ${fileProgress.page === fileProgress.total ? '[&::-webkit-progress-value]:bg-[#00bcf0] [&::-moz-progress-bar]:bg-[#00bcf0]' : '[&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-white' } after:border-white relative h-[1px] [WebkitAppearance:none] [appearance:none]`}
                            ></progress>
                          )}
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
      {currentFile && <ComicReader file={currentFile} overlay={overlay} setOverlay={setOverlay} setComic={setComic} updateProgress={updateReadingProgress}/>}
      {comic && <ComicBook file={infos} setComic={setComic} openComicFromDrive={openComicFromDrive} toggleSaved={toggleSaved} saved={saved}/>}

      <footer className="flex justify-center gap-4 text-xs text-gray-300 pt-32 pb-12">
        <a href="https://github.com/brunofranciscojs/Comic-Reader" target="_blank">see on github</a>
        <a href="https://brunofrancisco.com.br" target="_blank">webiste</a>
      </footer>
    </div>
  );

}
