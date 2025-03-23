import { useState, useEffect } from "react"
import SaveIcon from "./saveIcon";
import ImageZoom from 'react-image-zooom'

export default function ComicBook({file, setComic, openComicFromDrive, toggleSaved, saved, color}){
      const [bg, setBg] = useState(null)

      useEffect(() => {
        const bgFile = file.fileName.split('(')[0].split('e ')[1] < 100 ? parseInt(file.fileName.split('(')[0].split('e ')[1], 10) : file.fileName.split('(')[0].split('e ')[1].trim()
        setBg(bgFile)
      }, [file]);

      function extractInfoFromTitle(title) {
        const regex = /^(.*?)\s(\d{3})\s\((\d{4})\)\s?(.*)?$/;
        const match = title.match(regex);
      
        if (!match) return { title: "Desconhecido", issue: "?", year: "?" };
      
        return {
          title: match[1],
          issue: match[2],
          year: match[3],
        };
      }
      const info = {
        ...extractInfoFromTitle(file.fileName),
        description: file.description || "...",
    };
      
      if (!file) {
        return <p>no file.</p>;
      }
      return(
         
     <div style={{"--bg": color}} className="[border:2px_solid_var(--bg)] flex overflow-hidden lg:justify-between justify-start flex-col lg:flex-row gap-8 lg:p-12 p-8 after:content-[''] after:absolute after:left-0 after:top-0 after:w-full after:h-full after:[background:--bg] after:saturate-200 after:brightness-50 after:backdrop-blur-2xl after:z-0 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[90dvh] lg:max-w-[80%] max-w-[90%] w-full rounded-2xl z-[999]">
        <button className="text-white absolute top-2 right-4 z-10" onClick={() => setComic(false)}>X</button>
        <div className="z-10 relative">
            <h3 className="lg:text-3xl text-xl"><span className="font-['impact'] text-[#f4ed24]">Comic:</span> {info.title}</h3>
            <h3 className="lg:text-3xl text-xl"><span className="font-['impact'] text-[#f4ed24]">Issue:</span> {info.issue < 100 ? parseInt(info.issue,10) : info.issue}</h3>
            <h3 className="lg:text-3xl text-xl"><span className="font-['impact'] text-[#f4ed24]">Year:</span> {info.year}</h3> <br />
            <span className="text-gray-200 lg:text-2xl text-base block my-4 max-w-[85%]">{info.description}</span>
            
            <div className="flex items-center gap-3">
              <button onClick={() => openComicFromDrive(file.id, file.fileName)} className="mt-2 bg-[#f4ed24] hover:bg-[#00bcf0] text-[#303539] py-2 px-4 rounded transition z-20">
                  Read
              </button>
  
              <button className={`[scale:1.4] h-4 w-auto ${saved[file.id] ? '[&_path]:fill-[#f4ed24]' : '[&_path]:fill-none [&_path]:stroke-[#f4ed24]'}`} 
                      onClick={() => toggleSaved(file.id, file.fileName)}>
                <SaveIcon />
              </button>
            </div>

        </div>
        <ImageZoom src={`/assets/${bg}.jpg`} className="object-contain w-auto lg:h-[90%] h-[65%] self-center z-10 relative [&>img]:rounded-lg [&>img]:h-full [&>img]:w-[800px] [&>img]:object-contain !bg-transparent" zoom="200"/>
    </div>
        
    )
}
