import React, { useState, useEffect, useRef, useContext } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause, Rewind, FastForward } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { SelectedItemDataContext } from "./workspace"; // Import the context

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

  const { selectedItemData } = useContext(SelectedItemDataContext); // Access the context
  const [jsonData, setJsonData] = useState(null);
  const [isDataFetching, setIsDataFetching] = useState(false); // Add a flag to track fetching

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
    let controller = new AbortController(); // Create a new AbortController

    const fetchData = async () => {
      if (selectedItemData && selectedItemData.url) {
        setIsDataFetching(true);
        console.log(selectedItemData)
        console.log(selectedItemData.url)
        const apiUrl = `https://didactic-capybara-5gq45pwqpg6q27jvp-5000.app.github.dev/info/${encodeURIComponent(selectedItemData.url)}`;

        try {
          const response = await fetch(apiUrl, { signal: controller.signal }); // Pass the signal
          const data = await response.json();
          setJsonData(data);
        } catch (error) {
          // Check if the error is due to aborting the fetch
          if (error.name === 'AbortError') {
            console.log('Fetch aborted');
          } else {
            console.error("Error fetching JSON data:", error);
            // Handle other errors 
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={transition}
      className={`flex relative transition-colors duration-300 w-full min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      {/* Main content area */}
      <div className="p-8 pl-8 w-full md:w-3/5 pr-0 md:pr-2">
        <h2 className="text-2xl font-medium mb-4 transition-colors duration-300">
          Case Title
        </h2>
        <p className="transition-colors duration-300 mb-8">
          Displays summarized info about the case details through various modes
          of presentation.
        </p>
        {/* ... other content for the main area ... */}

        {/* Display the JSON data (you might need to adjust this based on your data structure) */}
        {jsonData && (
          <div>
            <h3 className="text-xl font-medium mb-2">JSON Data:</h3>
            <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        )}

      </div>

      {/* Audio player on the right */}
      <div
        className={clsx(
          "fixed right-0 top-12 bottom-0 w-full md:w-2/5 p-6 flex flex-col",
          isDarkMode
            ? "bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 text-gray-100"
            : "bg-gradient-to-b from-gray-50 to-gray-100 border-gray-200 text-gray-800"
        )}
      >
        <audio ref={audioRef} src="/placeholder.mp3" />
        <div className="space-y-4 mb-6">
          <h2
            className={clsx(
              "text-2xl font-semibold",
              isDarkMode ? "text-gray-100" : "text-gray-700"
            )}
          >
            Audio Summary
          </h2>
        </div>
        <div className="flex-grow flex flex-col space-y-6">
          <Card
            className={clsx(
              "flex-grow shadow-md rounded-lg overflow-hidden",
              isDarkMode ? "bg-gray-700" : "bg-white"
            )}
          >
            <CardContent className="p-6 h-full">
              {showSubtitles ? (
                <SubtitlesDisplay
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-5xl text-gray-800">🎧</span> 
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card
            className={clsx(
              "shadow-md rounded-lg",
              isDarkMode ? "bg-gray-700" : "bg-white"
            )}
          >
            <CardContent className="p-6 space-y-4"> 
              <div className="flex items-center justify-between text-gray-400 text-sm"> 
                <span className="text-sm">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleProgressChange}
                  className="w-[60%]"
                />
                <span className="text-sm">{formatTime(duration)}</span>
              </div>
              <div className="flex justify-center space-x-6"> 
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => skipTime(-10)}
                  aria-label="Rewind 10 seconds"
                  className={clsx(
                    isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100" 
                  )}
                >
                  <Rewind className="h-5 w-5" /> 
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className={clsx(
                    isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  )}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => skipTime(10)}
                  aria-label="Forward 10 seconds"
                  className={clsx(
                    isDarkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100" 
                  )}
                >
                  <FastForward className="h-5 w-5" /> 
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationPage;