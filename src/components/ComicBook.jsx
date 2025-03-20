import { useState, useEffect } from "react"

export default function ComicBook({file, setComic, openComicFromDrive}){
      const [bg, setBg] = useState(null)
      const loading = `<svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.5 12.5C4.5 16.9183 8.08172 20.5 12.5 20.5C16.9183 20.5 20.5 16.9183 20.5 12.5C20.5 8.08172 16.9183 4.5 12.5 4.5" stroke="#121923" stroke-width="1.2"></path> </g></svg>`

      useEffect(() => {
        setBg(file.fileName.split('(')[0].split('e ')[1] < 100 ? parseInt(file.fileName.split('(')[0].split('e ')[1], 10) : file.fileName.split('(')[0].split('e ')[1].trim())
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
         
        <div className="flex justify-between flex-col lg:flex-row gap-8 p-12 
             after:content-[''] after:absolute after:left-0 after:top-0 after:w-full after:h-full after:[background:var(--bg)] after:bg-[length:200px] after:brightness-40 after:z-0
            after:!bg-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[90dvh] max-w-[80%] w-full rounded-2xl z-[999]" style={{"--bg":`url(/../assets/${bg}.jpg)`}}>
            <button className="bg-black text-white rounded-full w-5 h-5 absolute top-4 right-4 z-10" onClick={() => setComic(false)}>X</button>
            <div className="z-10 relative">
                <h3 className="text-3xl"><span className="font-['impact'] text-[#f4ed24] text-3xl">Comic:</span> {info.title}</h3>
                <h3 className="text-3xl"><span className="font-['impact'] text-[#f4ed24] text-3xl">Edition:</span> {info.issue}</h3>
                <h3 className="text-3xl"><span className="font-['impact'] text-[#f4ed24] text-3xl">Year:</span> {info.year}</h3> <br />
                <span className="text-gray-200 lg:text-2xl text-base block my-4 max-w-[85%]">{info.description}</span>
                <button onClick={() => openComicFromDrive(file.id, file.fileName)} className="mt-2 bg-[#f4ed24] hover:bg-[#00bcf0] text-[#303539] py-2 px-4 rounded transition z-20">
                    Read
                </button>
            </div>
            <img src={`/assets/${bg}.jpg`} className="object-contain w-auto h-[90%] self-center z-10 relative rounded-lg"/>
        </div>
        
    )
}
