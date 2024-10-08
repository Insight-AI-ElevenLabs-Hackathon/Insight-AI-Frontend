import React, { useState, useEffect, useRef, useContext } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause, Rewind, FastForward, Building2, Calendar, Users, FileText, Globe, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { SelectedItemDataContext } from "./workspace"; 
import ReactMarkdown from 'react-markdown'; 

// Dummy subtitles data 
const subtitles = [
  { start: 0, end: 5, text: "Welcome to our podcast about React development." },
  { start: 5, end: 10, text: "Today, we're discussing the latest features in React 18." },
  { start: 10, end: 15, text: "Let's start by talking about the new concurrent rendering capabilities." },
  // Add more subtitle entries as needed
];

function SubtitlesDisplay({ currentTime, isPlaying }) {
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const subtitleRef = useRef(null);

  useEffect(() => {
    const subtitle = subtitles.find((s) => currentTime >= s.start && currentTime < s.end);
    setCurrentSubtitle(subtitle ? subtitle.text : "");
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying && subtitleRef.current) {
      subtitleRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSubtitle, isPlaying]);

  return (
    <div className="h-full overflow-hidden flex items-center justify-center">
      <div ref={subtitleRef} className="text-center text-lg font-medium transition-all duration-300 px-4 text-gray-700">
        {currentSubtitle}
      </div>
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

  const { selectedItemData } = useContext(SelectedItemDataContext); 
  const [jsonData, setJsonData] = useState(null);
  const [isDataFetching, setIsDataFetching] = useState(false); 

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
        const apiUrl = `https://wh10lx31-5000.inc1.devtunnels.ms/info/${encodeURIComponent(selectedItemData.url)}`;

        try {
          const response = await fetch(apiUrl, { signal: controller.signal }); 
          const data = await response.json();
          setJsonData(data);
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Fetch aborted');
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoCard icon={<Calendar />} title="Introduced Date" content={data.introduced_date} />
      <InfoCard icon={<Building2 />} title="Origin Chamber" content={data.origin_chamber} />
      <InfoCard icon={<Users />} title="Sponsor" content={`${data.sponsor} (${data.sponsor_party}-${data.sponsor_state})`} />
      <InfoCard icon={<FileText />} title="Policy Area" content={data.policy_area} />
      <div className="md:col-span-2">
        <InfoCard icon={<Globe />} title="Summary" content={data.summary} fullWidth />
      </div>
    </div>
  );

  const renderLawContent = (data) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoCard icon={<Calendar />} title="Date Issued" content={data.dateIssued} />
      <InfoCard icon={<Building2 />} title="Law Type" content={data.law_type} />
      <InfoCard icon={<FileText />} title="Policy Area" content={data.policy_area} />
      <div className="md:col-span-2">
        <InfoCard icon={<Globe />} title="Summary" content={data.summary} fullWidth />
      </div>
    </div>
  );

  const InfoCard = ({ icon, title, content, fullWidth = false }) => (
    <Card className={clsx(
      "overflow-hidden",
      isDarkMode ? "bg-gray-700" : "bg-white",
      fullWidth && "md:col-span-2"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          {React.cloneElement(icon, { className: "w-5 h-5 mr-2" })}
          <h4 className="font-medium text-lg">{title}</h4>
        </div>
        <ReactMarkdown className={clsx(
          "text-sm",
          isDarkMode ? "text-gray-300" : "text-gray-600",
        )}>
          {content} 
        </ReactMarkdown>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={transition}
      className={`flex lg:flex-row relative transition-colors duration-300 w-full min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Main content area */}
      <div className="lg:w-2/3 p-4 pt-4 overflow-y-auto">
        {/* Bill/Law/Amendment Details */}
        <Card className={`mb-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold mr-2">{selectedItemData.title}</h2>
              <span className="px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                {selectedItemData.type}.{selectedItemData.number}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <span className="text-base font-semibold">
                <Building2 className="w-4 h-4 inline-block mr-2" />
                {selectedItemData.congress}th Congress
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 text-sm font-medium">
                Last Updated: {selectedItemData.updateDate}
              </span>
            </div>

            {isDataFetching ? (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2">Fetching data...</p>
              </div>
            ) : jsonData ? (
              <div>
                {jsonData.json_type === "bill" ? renderBillContent(jsonData) : renderLawContent(jsonData)}
              </div>
            ) : (
              <div className="text-center p-4">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <p>No data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audio player on the right - Full Height */}
      <div
        className={clsx(
          "lg:w-1/3 lg:sticky lg:top-0 p-4 pt-4 flex flex-col",
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800",
          "max-h-[calc(100vh-20px)]" // Apply the calculated max height
        )}
      >
        <audio ref={audioRef} src="/placeholder.mp3" />
        <Card className={`flex-grow flex flex-col mb-6 overflow-y-auto ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <CardContent className="p-6 flex flex-col h-full">
            <h2 className={clsx(
              "text-3xl font-bold mb-4", 
              isDarkMode ? "text-gray-100" : "text-gray-700"
            )}>
              Audio Summary
            </h2>
            
            <div className="flex-grow flex items-center justify-center">
              {showSubtitles ? (
                <SubtitlesDisplay
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                />
              ) : (
                <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-6xl">🎧</span>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleProgressChange}
                  className="w-[60%]"
                />
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex justify-center space-x-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skipTime(-10)}
                  aria-label="Rewind 10 seconds"
                  className={clsx(
                    "transition-colors duration-200",
                    isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  )}
                >
                  <Rewind className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className={clsx(
                    "transition-colors duration-200",
                    isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skipTime(10)}
                  aria-label="Forward 10 seconds"
                  className={clsx(
                    "transition-colors duration-200",
                    isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  )}
                >
                  <FastForward className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                {volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-[120px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ConversationPage;