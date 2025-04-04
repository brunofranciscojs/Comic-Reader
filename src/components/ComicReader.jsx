import React, { useState, useEffect } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import LoadingIcon from "./loadingIcon";
import ImageZoom from 'react-image-zooom'

export default function ComicReader({ file, setOverlay, overlay, setComic, updateProgress, readProgress, extractIssueNumber }) {
  const [slider, setSlider] = useState(false);
  const [bg, setBg] = useState(null);
  const [startPage, setStartPage] = useState(0);

  useEffect(() => {
    if (file && file.fileName) {
      setBg(extractIssueNumber(file.fileName))
  
      if (file.images.length > 0) {
        setSlider(true);
  
        const savedProgress = localStorage.getItem(`progress-${file.fileName}`) || 1;
        console.log("Loading progress for:", file.fileName, "Saved progress:", savedProgress);
  
        if (savedProgress) {
          setStartPage(parseInt(savedProgress, 10) - 1);
        } else {
          setStartPage(0); 
        }
      }
    }
  }, [file]); 

  const closeSlider = () => {
    setSlider(false);
    setOverlay(false);
    setBg(null);
    setComic(false);
    document.body.style.overflow = 'visible'
    document.body.style.cssText = ''
  }

  const handleSlideChange = async (splide) => {
    const currentIndex = splide.index + 1;
    updateProgress(file.fileName, currentIndex, file.images.length);
    localStorage.setItem(`progress-${file.fileName}`, currentIndex);
  };
  const fileProgress = readProgress[file.fileName];

  if (!file || !file.images) {
    return <p>no file.</p>;
  }

  return (
     (overlay &&
      <div className="fixed backdrop-blur-md top-0 left-0 w-full h-dvh flex justify-center items-center [background:var(--bg)_#000d] bg-blend-multiply !bg-center !bg-[length:200px] z-[9999]" style={{"--bg":`url(/../assets/${bg}.jpg)`}}>
        {fileProgress && (
            <progress value={fileProgress.page / fileProgress.total} max="1"
                      className={`!absolute top-0 w-full left-0 ${fileProgress.page === fileProgress.total ? '[&::-webkit-progress-value]:bg-[#00bcf0] [&::-moz-progress-bar]:bg-[#00bcf0]' : '[&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-white' } after:border-white relative h-[1px] [WebkitAppearance:none] [appearance:none]`}
            ></progress>
          )}
        <button className="bg-black text-white rounded-full w-5 h-5 absolute top-4 right-4 z-10" onClick={closeSlider}>X</button>

        <div className="flex justify-start gap-6 absolute left-1/2 -translate-x-1/2 top-0 w-full px-12 py-5 z-[2]">
            <img src="/assets/logo.webp" width={120} />
            <span className="text-[#f4ed24] text-3xl font-['impact']">
              ISSUE: #{file.fileName.split('Invincible')[1].split('(')[0] < 100 ? 
                parseInt(file.fileName.split('Invincible')[1].split('(')[0], 10) : 
                file.fileName.split('Invincible')[1].split('(')[0] 
                }
            </span>
        </div>

          {slider ? (<Splide options={{ perPage: 1, arrows: true, pagination:false, start: startPage, wheel: true, direction:'ttb', height:'100%' }} onMove={handleSlideChange} className="[&>#splide01-track]:h-dvh flex h-dvh z-[4]">
            {file.images.map((image, index) => (
              <SplideSlide key={index}>
                <ImageZoom src={image.url} className="!block max-w-full object-contain w-full rounded shadow-lg h-full [scale:.98] [&>img]:h-full [&>img]:w-auto [&>img]:object-contain [&>img]:mx-auto [&>img]:block ![background-color:transparent]" data-splide-lazy={image.url} zoom="200" fullWidth={true} />
              </SplideSlide>
            ))}
          </Splide>) : (
            <div className="flex justify-center items-center gap-5 flex-col">
              <span className="animate-spin brightness-[20] w-12 h-12 block">{<LoadingIcon/>}</span>
              <span className="text-sm text-white block mx-auto">Unpacking .cbz file, please wait... </span>
            </div>
          )}
      </div>
    )
  )
}