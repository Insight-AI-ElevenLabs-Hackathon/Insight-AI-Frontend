import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Rewind,
  FastForward,
  Building2,
  Calendar,
  Users,
  FileText,
  Globe,
  Shield,
  Captions,
  CaptionsOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { SelectedItemDataContext } from "./workspace";
import ReactMarkdown from "react-markdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function convertTimeToSeconds(time) {
  const [hours, minutes, secondsAndMilliseconds] = time.split(":");
  const [seconds, milliseconds] = secondsAndMilliseconds.split(",");
  return (
    parseFloat(hours) * 3600 +
    parseFloat(minutes) * 60 +
    parseFloat(seconds) +
    parseFloat(milliseconds) / 1000
  );
}

function parseSRT(srtString) {
  const subtitles = [];
  const lines = srtString.trim().split("\n\n");

  lines.forEach((line) => {
    const parts = line.split("\n");
    if (parts.length >= 3) {
      const [startTime, endTime] = parts[1].split(" --> ");
      if (startTime && endTime) {
        const text = parts.slice(2).join("\n");

        const decodedText = decodeURIComponent(escape(text));

        subtitles.push({
          start: convertTimeToSeconds(startTime),
          end: convertTimeToSeconds(endTime),
          text: decodedText,
        });
      }
    }
  });

  return subtitles;
}

const VISIBLE_SUBTITLES = 5;

function SubtitlesDisplay({ currentTime, isPlaying, subtitles }) {
  const [visibleSubtitles, setVisibleSubtitles] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const updateVisibleSubtitles = useCallback((currentIndex) => {
    const start = Math.max(0, currentIndex - Math.floor(VISIBLE_SUBTITLES / 2));
    const end = Math.min(subtitles.length, start + VISIBLE_SUBTITLES);
    setVisibleSubtitles(subtitles.slice(start, end));
    setActiveIndex(currentIndex - start);
  }, [subtitles]);

  useEffect(() => {
    const adjustedTime = Math.max(0, currentTime + 1.5);
    const newActiveIndex = subtitles.findIndex(
      (s) => adjustedTime >= s.start && adjustedTime < s.end
    );
    if (newActiveIndex !== -1) {
      updateVisibleSubtitles(newActiveIndex);
    }
  }, [currentTime, subtitles, updateVisibleSubtitles]);

  return (
    <div className="h-80 w-full overflow-hidden relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
      {subtitles.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          No subtitles available
        </div>
      ) : visibleSubtitles.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">
          Loading subtitles...
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {visibleSubtitles.map((subtitle, index) => (
            <motion.div
              key={subtitle.start}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: (index - activeIndex) * 50,
                scale: index === activeIndex ? 1 : 0.9,
              }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`absolute w-full text-center px-8 py-3 ${
                index === activeIndex
                  ? "text-gray-900 dark:text-white font-medium text-lg"
                  : "text-gray-500 dark:text-gray-400 text-base"
              }`}
            >
              {subtitle.text}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

const ConversationPage = ({ isDarkMode, transition }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const audioRef = useRef(null);
  const [subtitles, setSubtitles] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [dubbingInProgress, setDubbingInProgress] = useState(false);
  const [dubbedAudioUrl, setDubbedAudioUrl] = useState(null);

  const { selectedItemData } = useContext(SelectedItemDataContext);
  const [jsonData, setJsonData] = useState(null);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(true);

  const languageCodes = {
    English: "en", Chinese: "zh",Spanish: "es",Hindi: "hi",Portuguese: "pt",French: "fr",German: "de",Japanese: "ja",
    Arabic: "ar",Russian: "ru",Korean: "ko",Indonesian: "id",Italian: "it",Dutch: "nl",Turkish: "tr",Polish: "pl",Swedish: "sv",
    Filipino: "fil",Malay: "ms",Romanian: "ro",Ukrainian: "uk",Greek: "el",Czech: "cs",Danish: "da",Finnish: "fi",Bulgarian: "bg",
    Croatian: "hr",Slovak: "sk",Tamil: "ta",
  };

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    return () => {
      document.body.classList.remove("dark");
    };
  }, [isDarkMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      setIsAudioLoading(false);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
    };
  }, []);

  useEffect(() => {
    let controller = new AbortController();

    const fetchData = async () => {
      if (selectedItemData && selectedItemData.url) {
        setIsDataFetching(true);
        const apiUrl = `https://randy-instantly-boundaries-performance.trycloudflare.com/info/${encodeURIComponent(
          selectedItemData.url
        )}`;

        try {
          const response = await fetch(apiUrl, { signal: controller.signal });
          const data = await response.json();
          setJsonData(data);
          console.log(data);

          if (data.audio_path) {
            audioRef.current.src = `https://pub-59da4baaff6649e2a2a64e188046405b.r2.dev/${data.audio_path}`;
          }
          if (data.srt_path) {
            const srtResponse = await fetch(
              `https://pub-59da4baaff6649e2a2a64e188046405b.r2.dev/${data.srt_path}`
            );
            const srtText = await srtResponse.text();
            setSubtitles(parseSRT(srtText));
          } else {
            console.log("No SRT File Found!");
          }
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("Fetch aborted");
          } else {
            console.error("Error fetching JSON data:", error);
          }
        } finally {
          setIsDataFetching(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [selectedItemData]);

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPlaying(true);
      setShowSubtitles(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (newValue) => {
    const [value] = newValue;
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (newValue) => {
    const [value] = newValue;
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const skipTime = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderBillContent = (data) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <InfoCard
        icon={<Calendar className="text-blue-500" />}
        title="Introduced Date"
        content={data.introduced_date}
      />
      <InfoCard
        icon={<Building2 className="text-green-500" />}
        title="Origin Chamber"
        content={data.origin_chamber}
      />
      <InfoCard
        icon={<Shield className="text-red-500" />}
        title="Official Texts"
        pdf_link={data.pdf_link}
        htm_link={data.htm_link}
        colSpan={1}
        rowSpan={2}
      />
      <InfoCard
        icon={<FileText className="text-orange-500" />}
        title="Policy Area"
        content={data.policy_area}
      />
      <InfoCard
        icon={<Users className="text-purple-500" />}
        title="Sponsor  "
        content={`${data.sponsor} (${data.sponsor_party}-${data.sponsor_state})`}
      >
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(
            data.sponsor
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200"
        >
          {data.sponsor_id}
        </a>
      </InfoCard>
      <div className="md:col-span-3 md:row-span-1"> 
        <InfoCard
          icon={<Globe className="text-teal-500" />}
          title="Summary"
          content={data.summary}
          fullWidth
        />
      </div>
    </div>
  );

  const renderLawContent = (data) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <InfoCard
        icon={<Calendar className="text-blue-500" />}
        title="Date Issued"
        content={data.dateIssued}
      />
      <InfoCard
        icon={<Building2 className="text-green-500" />}
        title="Law Type"
        content={data.law_type}
      />
      <InfoCard
        icon={<Shield className="text-red-500" />}
        title="Official Texts"
        pdf_link={data.pdf_link}
        htm_link={data.htm_link}
        colSpan={1}
        rowSpan={1}
      />
      <div className="md:col-span-3 md:row-span-2">
        <InfoCard
          icon={<Globe className="text-teal-500" />}
          title="Summary"
          content={data.summary}
          fullWidth
        />
      </div>
    </div>
  );

  const InfoCard = ({
    icon,
    title,
    content,
    children,
    fullWidth = false,
    colSpan, 
    rowSpan,
    pdf_link,
    htm_link,
  }) => {
    const handleOpenPdf = () => {
      if (pdf_link) {
        window.open(pdf_link, "_blank");
      }
    };

    const handleOpenHtm = () => {
      if (htm_link) {
        window.open(htm_link, "_blank");
      }
    };

    return (
      <Card
        className={clsx(
          "overflow-hidden transition-all duration-300 hover:shadow-md",
          isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200",
          fullWidth && "md:col-span-3",
          colSpan && `md:col-span-${colSpan}`,
          rowSpan && `md:row-span-${rowSpan}`
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-center mb-2">
            {React.cloneElement(icon, { className: "w-5 h-5 mr-2" })}
            <h4 className="font-semibold text-lg flex items-center mr-3">
              {title}
              {children}
            </h4>
          </div>
          {(pdf_link || htm_link) && (
            <div className="mt-4 flex space-x-2"> 
              {pdf_link && (
                <Button variant="outline" onClick={handleOpenPdf}>
                  Open PDF
                </Button>
              )}
              {htm_link && (
                <Button variant="outline" onClick={handleOpenHtm}>
                  Open HTML
                </Button>
              )}
            </div>
          )}
          {(pdf_link || htm_link) && (
            <p className="mt-2 pt-4 text-sm text-center text-gray-500 dark:text-gray-400">
              The links are extracted from api.govinfo.gov, for more detailed information, please visit{" "}
              <a
                href="https://www.govinfo.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline" 
              >
                govinfo.gov
              </a>
            </p>
          )}
          {content && (
            <ReactMarkdown
              className={clsx(
                "text-sm",
                isDarkMode ? "text-gray-300" : "text-gray-600"
              )}
            >
              {content}
            </ReactMarkdown>
          )}
        </CardContent>
      </Card>
    );
  };


  const handleLanguageChange = async (newLanguage) => {
    setSelectedLanguage(newLanguage);
    setIsAudioLoading(true);

    let newAudioSrc = null;

    if (newLanguage !== "English" && jsonData && jsonData.audio_path) {
      setDubbingInProgress(true);

      const audioName = jsonData.audio_path.split("_")[0];
      const audioUrl = `https://pub-59da4baaff6649e2a2a64e188046405b.r2.dev/${jsonData.audio_path}`;

      try {
        const response = await fetch(
          "https://randy-instantly-boundaries-performance.trycloudflare.com/dub",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file_url: audioUrl,
              name: audioName,
              target_lang: languageCodes[newLanguage],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === "ok") {
            const dubbedAudioPath = `${audioName}_${languageCodes[newLanguage]}.mp3`;
            const dubbedSrtPath = `${audioName}_${languageCodes[newLanguage]}.srt`;
            newAudioSrc = `https://pub-59da4baaff6649e2a2a64e188046405b.r2.dev/${dubbedAudioPath}`;
            const dubbedSrtUrl = `https://pub-59da4baaff6649e2a2a64e188046405b.r2.dev/${dubbedSrtPath}`;

            const srtResponse = await fetch(dubbedSrtUrl, {
              headers: {
                "Accept-Charset": "utf-8",
              },
            });
            if (srtResponse.ok) {
              const srtText = await srtResponse.text();
              setSubtitles(parseSRT(srtText));
            } else {
              console.error(
                "Error fetching dubbed SRT file:",
                srtResponse.statusText
              );
              setSubtitles([]);
            }
          } else {
            console.error("Dubbing API returned an error:", data);
          }
        } else {
          console.error("Error dubbing audio:", response.statusText);
        }
      } catch (error) {
        console.error("Error dubbing audio:", error);
      } finally {
        setDubbingInProgress(false);
        setIsAudioLoading(false);
      }
    } else if (newLanguage === "English" && jsonData && jsonData.srt_path) {

      newAudioSrc = `https://pub-59da4baaff6649e2a2a64e188046405b.r2.dev/${jsonData.audio_path}`; // English audio URL

      const englishSrtUrl = `https://pub-59da4baaff6649e2a2a64e188046405b.r2.dev/${jsonData.srt_path}`;

      try {
        const srtResponse = await fetch(englishSrtUrl, {
          headers: {
            "Accept-Charset": "utf-8",
          },
        });
        if (srtResponse.ok) {
          const srtText = await srtResponse.text();
          setSubtitles(parseSRT(srtText));
        } else {
          console.error(
            "Error fetching English SRT file:",
            srtResponse.statusText
          );
          setSubtitles([]);
        }
      } catch (error) {
        console.error("Error fetching English SRT file:", error);
        setSubtitles([]);
      } finally {
        setIsAudioLoading(false);
      }
    } else {
      setSubtitles([]);
    }

    if (newAudioSrc) {
      audioRef.current.src = newAudioSrc;
      audioRef.current.load();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={transition}
      className={clsx(
        "flex lg:flex-row relative transition-colors duration-300 w-full min-h-screen",
        isDarkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
      )}
    >
      <div className="lg:w-2/3 p-5 pt-7 overflow-y-auto"> 
        <Card
          className={clsx(
            "mb-7 overflow-hidden transition-all duration-300", 
            isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
          )}
        >
          <CardContent className="p-7"> 
            <div className="flex items-center mb-5"> 
              <h2 className="text-3xl font-bold mr-3"> 
                {selectedItemData.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"> 
                {selectedItemData.type}.{selectedItemData.number}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600 mb-7"> 
              <span className="text-base font-semibold flex items-center">
                <Building2 className="w-4 h-4 inline-block mr-1 text-blue-500" /> 
                {selectedItemData.congress}th Congress
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 text-xs font-medium"> 
                Last Updated: {selectedItemData.updateDate}
              </span>
            </div>

            {isDataFetching ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-lg">Fetching data...</p>
              </div>
            ) : jsonData ? (
              <div>
                {jsonData.json_type === "bill"
                  ? renderBillContent(jsonData)
                  : renderLawContent(jsonData)}
              </div>
            ) : (
              <div className="text-center p-8 flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm"> 
                <div className="flex items-center space-x-2 mb-4"> 
                  <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce animation-delay-150"></div>
                  <div className="w-4 h-4 rounded-full bg-blue-500 animate-bounce animation-delay-300"></div>
                </div>

                <div className="space-y-8">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Fetching data...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Analysis running for the first time may take up to a minute
                    to load
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div
        className={clsx(
          "lg:w-1/3 lg:fixed lg:top-10 lg:right-0 lg:bottom-0 p-5 pt-7 flex flex-col overflow-y-auto", 
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        )}
      >
        <audio ref={audioRef} src="/placeholder.mp3" /> 

        <Card
          className={clsx(
            "flex-grow flex flex-col mb-5 overflow-hidden  transition-all duration-300", 
            isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
          )}
          style={{ height: "70%" }}
        >
          <CardContent className="p-7 flex flex-col h-full relative"> 
            <h2
              className={clsx(
                "text-2xl font-bold mb-5", 
                isDarkMode ? "text-gray-100" : "text-gray-800"
              )}
            >
              Audio Summary
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3"> 
              Auto Generated by ElevenLabs
            </p>
            <div className="flex-grow flex items-center justify-center">
              {isAudioLoading || dubbingInProgress ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                  {dubbingInProgress && ( 
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                      Dubbing audio for the first time might take 1-2 minutes, you can refresh the page in between
                    </p>
                  )}
                  {!dubbingInProgress && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Loading audio...
                    </p>
                  )}
                </div>
              ) : isPlaying && showSubtitles ? (
                <SubtitlesDisplay
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  subtitles={subtitles}
                />
              ) : (
                <motion.div
                  className="w-56 h-56 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(135, 206, 250, 0.4), rgba(255, 255, 255, 0))",
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                ></motion.div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSubtitles(!showSubtitles)}
              aria-label={
                showSubtitles ? "Disable Subtitles" : "Enable Subtitles"
              }
              className={clsx(
                "absolute bottom-1.5 right-1.5 transition-colors duration-200", 
                isDarkMode
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              )}
            >
              {showSubtitles ? (
                <Captions className="h-6 w-6" />
              ) : (
                <CaptionsOff className="h-6 w-6" />
              )}
            </Button>
          </CardContent>
        </Card>

        <Card
          className={clsx(
            "flex flex-col overflow-hidden transition-all duration-300", 
            isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
          )}
          style={{ height: "30%" }}
        >
          <CardContent className="p-7 flex flex-col h-full"> 
            {isAudioLoading ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div> 
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Loading audio...</p>
              </div>
            ) : (
              <div className="mt-auto space-y-6"> 
                <div className="flex items-center justify-between text-base">
                  <span className="font-medium">{formatTime(currentTime)}</span>
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={1}
                    onValueChange={handleProgressChange}
                    className="w-[60%]"
                  />
                  <span className="font-medium">{formatTime(duration)}</span>
                </div>
                <div className="flex justify-center space-x-8 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skipTime(-10)}
                    aria-label="Rewind 10 seconds"
                    className={clsx(
                      "transition-colors duration-200", 
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                    )}
                    disabled={isAudioLoading}
                  >
                    <Rewind className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="default"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className={clsx(
                      "transition-colors duration-200 rounded-full", 
                      isDarkMode
                        ? "text-gray-200 hover:text-white bg-gray-700 hover:bg-gray-600"
                        : "text-gray-800 hover:text-black bg-gray-200 hover:bg-gray-300"
                    )}
                    style={{ width: "56px", height: "56px" }}
                    disabled={isAudioLoading}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => skipTime(10)}
                    aria-label="Forward 10 seconds"
                    className={clsx(
                      "transition-colors duration-200", 
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                    )}
                    disabled={isAudioLoading}
                  >
                    <FastForward className="h-8 w-8" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3"> 
                    {volume === 0 ? (
                      <VolumeX className="h-6 w-6" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-[140px]"
                      disabled={isAudioLoading}
                    />
                  </div>

                  {/* Language Select */}
                  <Select
                    onValueChange={handleLanguageChange}
                    value={selectedLanguage}
                    disabled={isAudioLoading}
                  >
                    <SelectTrigger className="w-[120px]"> 
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "English","Chinese","Spanish","Hindi","Portuguese","French","German","Japanese","Arabic","Russian",
                        "Korean","Indonesian","Italian","Dutch","Turkish","Polish","Swedish","Filipino","Malay","Romanian",
                        "Ukrainian","Greek","Czech","Danish","Finnish","Bulgarian","Croatian","Slovak",
                        "Tamil",
                      ].map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ConversationPage;