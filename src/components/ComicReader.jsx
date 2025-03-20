import React, { useState, useEffect } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';


export default function ComicReader({ file, setOverlay, overlay, setComic }) {
  const [slider, setSlider] = useState(false);
  const loading = `<svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4.5 12.5C4.5 16.9183 8.08172 20.5 12.5 20.5C16.9183 20.5 20.5 16.9183 20.5 12.5C20.5 8.08172 16.9183 4.5 12.5 4.5" stroke="#121923" stroke-width="1.2"></path> </g></svg>`
  const [bg, setBg] = useState(null)

  useEffect(() => {
    setBg(file.fileName.split('(')[0].split('e ')[1] < 100 ? parseInt(file.fileName.split('(')[0].split('e ')[1], 10) : file.fileName.split('(')[0].split('e ')[1].trim())
    if (file && file.images.length > 0) {
      setSlider(true)
    }
  }, [file]); 


  const closeSlider = () => {
    setSlider(false);
    setOverlay(false)
    setBg(null)
    setComic(false)
  }

  if (!file || !file.images) {
    return <p>no file.</p>;
  }
  
  return (
     (overlay &&
      <div className="fixed backdrop-blur-md top-0 left-0 w-full h-dvh flex justify-center items-center [background:var(--bg)_#000d] bg-blend-multiply !bg-center !bg-[length:200px] z-[9999]" style={{"--bg":`url(/../assets/${bg}.jpg)`}}>
        <button className="bg-black text-white rounded-full w-5 h-5 absolute top-4 right-4 z-10" onClick={closeSlider}>X</button>

        <div className="flex justify-start absolute left-1/2 -translate-x-1/2 top-0 w-full px-12 py-5 backdrop-blur-md bg-black/40 z-[1] gap-5">
         <img src="/assets/logo.webp" width={120} />
         <span className="text-[#f4ed24] text-3xl font-['impact']">
          #{file.fileName.split('Invincible')[1].split('(')[0] < 100 ? parseInt(file.fileName.split('Invincible')[1].split('(')[0], 10) : file.fileName.split('Invincible')[1].split('(')[0] }
          </span>
        </div>

          {slider ? (<Splide options={{ perPage: 1, arrows: true, pagination:true }} className="[&>#splide01-track]:h-dvh flex h-dvh z-[1]">
            {file.images.map((image, index) => (
              <SplideSlide key={index}>
                <img src={image.url} className="max-w-full object-contain w-full rounded shadow-lg h-full [scale:.9] translate-y-8"/>
                <span className="text-gray-300 absolute top-[1.6rem] left-[18rem] z-20">p. {index + 1}</span>
              </SplideSlide>
            ))}
          </Splide>) : (
            <div className="flex justify-center items-center gap-5 flex-col">
              <span className="animate-spin brightness-[20] w-12 h-12 block" 
                    dangerouslySetInnerHTML={{__html:loading}} ></span>
              <span className="text-sm text-white block mx-auto">Unpacking .cbz file, please wait... </span>
            </div>
          )}
      </div>
    )
  )
}
