import { useState, useEffect } from "react"
import SaveIcon from "./saveIcon";
import ImageZoom from 'react-image-zooom'

export default function ComicBook({ file, openComicFromDrive, toggleSaved, saved }) {
  const [bg, setBg] = useState(null)

  useEffect(() => {
    if (!file || file.id === 'N/A') return;
    const bgFile = file.fileName.split('(')[0].split('e ')[1] < 100 ? parseInt(file.fileName.split('(')[0].split('e ')[1], 10) : file.fileName.split('(')[0].split('e ')[1].trim()
    setBg(bgFile)
  }, [file]);

  function extractInfoFromTitle(title) {
    const regex = /^(.*?)\s(\d{3})\s\((\d{4})\)\s?(.*)?$/;
    const match = title.match(regex);

    if (!match) return { title: "unknown", issue: "?", year: "?" };

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

  if (!file || file.id === 'N/A') {
    return <p>no file.</p>;
  }
  return (

    <article {... { popover: '' }} id={file.id} style={{ "--bg": file.color }}
      className="[border:2px_solid_var(--bg)] [&:popover-open]:flex overflow-hidden bg-[color-mix(in_srgb,var(--bg)_50%,black_50%)] backdrop:bg-black/50 max-w-[90%] w-full justify-start flex-col rounded-2xl z-[999] gap-8 p-8 fixed 
                top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 inset-[unset] h-[90dvh] lg:justify-between lg:flex-row lg:p-12 lg:max-w-[80%] 
                ">

      <button className="text-white absolute top-2 right-4 z-10" popoverTarget={file.id}>X</button>
      <div className="z-10 relative">
        <h3 className="lg:text-3xl text-xl text-white"><span className="font-['impact'] text-[#f4ed24]">Comic:</span> {info.title}</h3>
        <h3 className="lg:text-3xl text-xl text-white"><span className="font-['impact'] text-[#f4ed24]">Issue:</span> {info.issue < 100 ? parseInt(info.issue, 10) : info.issue}</h3>
        <h3 className="lg:text-3xl text-xl text-white"><span className="font-['impact'] text-[#f4ed24]">Year:</span> {info.year}</h3> <br />
        <span className="text-gray-200 lg:text-2xl text-base block my-4 max-w-[85%]">{info.description}</span>

        <div className="flex items-center gap-3">
          <button onClick={() => openComicFromDrive(file.id, file.fileName)} popoverTarget={`issue-${info.issue < 100 ? parseInt(info.issue, 10) : info.issue}`}
            className="outline-none mt-2 bg-[#f4ed24] hover:bg-[#00bcf0] text-[#303539] py-2 px-4 rounded transition z-20">
            Read
          </button>

          <button className={`[scale:1.4] outline-none h-4 w-auto ${saved[file.id] ? '[&_path]:fill-[#f4ed24]' : '[&_path]:fill-none [&_path]:stroke-[#f4ed24]'}`}
            onClick={() => toggleSaved(file.id, file.fileName)}>
            <SaveIcon />
          </button>
        </div>

      </div>
      <ImageZoom src={`/assets/${bg}.jpg`} className="object-contain w-auto lg:h-[90%] h-[65%] self-center z-10 relative [&>img]:rounded-lg [&>img]:h-full [&>img]:w-[800px] [&>img]:object-contain !bg-transparent" zoom="200" />
      <img src={`/assets/${bg}.jpg`} className="opacity-20 absolute inset-0 z-0 w-full h-full object-cover brightness-50 pointer-events-none" />
    </article>

  )
}
