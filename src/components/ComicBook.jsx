import { useState, useEffect } from "react"

export default function ComicBook({file, setComic, openComicFromDrive}){
      const [bg, setBg] = useState(null)

      useEffect(() => {
        setBg(file.split('(')[0].split('e ')[1] < 100 ? parseInt(file.split('(')[0].split('e ')[1], 10) : file.split('(')[0].split('e ')[1].trim())
      }, [file]); 



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
      const info = extractInfoFromTitle(file)
      
      if (!file) {
        return <p>no file.</p>;
      }

    return(
         
        <div className="flex justify-between p-12 [background:var(--bg)_#000d] bg-blend-multiply !bg-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[90dvh] max-w-[80%] w-full rounded-2xl z-[999]" style={{"--bg":`url(/../assets/${bg}.jpg)`}}>
            <button className="bg-black text-white rounded-full w-5 h-5 absolute top-4 right-4 z-10" onClick={() => setComic(false)}>X</button>
            <div>
                <h3 className="text-3xl"><span className="font-['impact'] text-[#f4ed24] text-3xl">Comic:</span> {info.titulo}</h3>
                <h3 className="text-3xl"><span className="font-['impact'] text-[#f4ed24] text-3xl">Edition:</span> {info.edicao}</h3>
                <h3 className="text-3xl"><span className="font-['impact'] text-[#f4ed24] text-3xl">Year:</span> {info.ano}</h3> <br />
                <button onClick={() => openComicFromDrive(file.id, file)} className="mt-2 bg-[#f4ed24] hover:bg-[#00bcf0] text-[#303539] py-2 px-4 rounded transition z-20">
                    Read
                </button>
            </div>
            <img src={`/assets/${bg}.jpg`} className="object-contain w-auto h-[90%] self-center rounded-lg"/>
        </div>
        
    )
}
