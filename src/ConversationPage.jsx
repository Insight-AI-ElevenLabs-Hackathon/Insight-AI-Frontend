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
  AlertTriangle,
  Captions,
  CaptionsOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { SelectedItemDataContext } from "./workspace";
import ReactMarkdown from "react-markdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Helper functions outside the component scope
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
        subtitles.push({
          start: convertTimeToSeconds(startTime),
          end: convertTimeToSeconds(endTime),
          text: text,
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

  const { selectedItemData } = useContext(SelectedItemDataContext);
  const [jsonData, setJsonData] = useState(null);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(true);

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
        const apiUrl = `https://wh10lx31-5000.inc1.devtunnels.ms/info/${encodeURIComponent(
          selectedItemData.url
        )}`;

        try {
          const response = await fetch(apiUrl, { signal: controller.signal });
          const data = await response.json();
          setJsonData(data);

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
      setShowSubtitles(true); // Show subtitles when play starts
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
      // setShowSubtitles(true); // You can optionally hide subtitles on pause
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        icon={<Users className="text-purple-500" />}
        title="Sponsor"
        content={`${data.sponsor} (${data.sponsor_party}-${data.sponsor_state})`}
      >
        {/* Sponsor ID Tag with Link */}
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(data.sponsor)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200"
        >
          {data.sponsor_id}
        </a>
      </InfoCard>
      <InfoCard
        icon={<FileText className="text-orange-500" />}
        title="Policy Area"
        content={data.policy_area}
      />
      <div className="md:col-span-2">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        icon={<FileText className="text-orange-500" />}
        title="Policy Area"
        content={data.policy_area}
      />
      <div className="md:col-span-2">
        <InfoCard
          icon={<Globe className="text-teal-500" />}
          title="Summary"
          content={data.summary}
          fullWidth
        />
      </div>
    </div>
  );

  const InfoCard = ({ icon, title, content, children, fullWidth = false }) => (
    <Card
      className={clsx(
        "overflow-hidden transition-all duration-300 hover:shadow-lg",
        isDarkMode ? "bg-gray-800" : "bg-white ",
        fullWidth && "md:col-span-2"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center mb-3">
          {React.cloneElement(icon, { className: "w-6 h-6 mr-3" })}
          <h4 className="font-semibold text-xl flex items-center"> 
            {title}
            {children}
          </h4>
        </div>
        {content ? (
          <ReactMarkdown
            className={clsx(
              "text-base",
              isDarkMode ? "text-gray-300" : "text-gray-600"
            )}
          >
            {content}
          </ReactMarkdown>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleSubmitFeedback = () => {
    // TODO: Implement logic to send feedback to backend or store it
    console.log("Feedback:", feedback);
    console.log("Rating:", rating);
    // Reset form after submission
    setFeedback("");
    setRating(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={transition}
      className={clsx(
        "flex lg:flex-row relative transition-colors duration-300 w-full min-h-screen",
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      )}
    >
      {/* Main content area */}
      <div className="lg:w-2/3 p-6 pt-8 overflow-y-auto">
        {/* Bill/Law/Amendment Details */}
        <Card className={clsx(
          "mb-8 overflow-hidden transition-all duration-300",
          isDarkMode ? "bg-gray-800" : "bg-white"
        )}>
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <h2 className="text-4xl font-bold mr-4">{selectedItemData.title}</h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {selectedItemData.type}.{selectedItemData.number}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-gray-600 mb-8">
              <span className="text-lg font-semibold flex items-center">
                <Building2 className="w-5 h-5 inline-block mr-2 text-blue-500" />
                {selectedItemData.congress}th Congress
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-sm font-medium">
                Last Updated: {selectedItemData.updateDate}
              </span>
            </div>

            {isDataFetching ? ( // Loading screen for main info card
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
                  <p className="text-lg text-gray-700 dark:text-gray-300">Fetching data...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Analysis running for the first time may take up to a minute to load
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audio player on the right - Fixed Position with two cards */}
      <div
        className={clsx(
          "lg:w-1/3 lg:fixed lg:top-12 lg:right-0 lg:bottom-0 p-6 pt-8 flex flex-col overflow-y-auto",
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        )}
      >
        <audio ref={audioRef} src="/placeholder.mp3" />

        {/* Card for title and subtitles */}
        <Card
          className={clsx(
            "flex-grow flex flex-col mb-6 overflow-hidden  transition-all duration-300",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}
          style={{ height: "70%" }}
        >
          <CardContent className="p-8 flex flex-col h-full relative">
            <h2
              className={clsx(
                "text-3xl font-bold mb-6",
                isDarkMode ? "text-gray-100" : "text-gray-800"
              )}
            >
              Audio Summary
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Auto Generated by ElevenLabs
            </p>
            <div className="flex-grow flex items-center justify-center">
              {isAudioLoading ? ( // Loading screen for audio player
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
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
                    background: 'radial-gradient(circle at 50% 50%, rgba(135, 206, 250, 0.8), rgba(255, 255, 255, 0))'
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                </motion.div>
            )}
          </div>

            {/* Subtitle toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSubtitles(!showSubtitles)}
              aria-label={showSubtitles ? "Disable Subtitles" : "Enable Subtitles"}
              className={clsx(
                "absolute bottom-6 right-6 transition-colors duration-200",
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

        {/* Card for player controls */}
        <Card
          className={clsx(
            "flex flex-col overflow-hidden transition-all duration-300",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}
          style={{ height: "30%" }}
        >
          <CardContent className="p-8 flex flex-col h-full">
            {isAudioLoading ? ( // Loading screen for player controls
              <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
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
                <div className="flex items-center justify-between"> {/* Use justify-between to align items at both ends */}
                  <div className="flex items-center space-x-4">
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
                      disabled={isAudioLoading} // Disable while loading
                    />
                  </div>

                  {/* Language Select */}
                  <Select onValueChange={setSelectedLanguage} value={selectedLanguage} disabled={isAudioLoading}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {["English", "Hindi", "Portuguese", "Chinese", "Spanish", "French", "German", "Japanese", "Arabic", "Russian", "Korean", "Indonesian", "Italian", "Dutch", "Turkish", "Polish", "Swedish", "Norwegian", "Filipino", "Malay", "Romanian", "Hungarian", "Ukrainian", "Greek", "Czech", "Danish", "Finnish", "Bulgarian", "Croatian", "Slovak", "Tamil", "Vietnamese"].map((language) => (
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