import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Calendar, FileText, Building2, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const InputArea = ({ isDarkMode, onSubmit }) => {
  const [inputValue, setInputValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState("");
  const [Number, setNumber] = useState(""); // Renamed to avoid conflict with built-in Number
  const [originHouse, setOriginHouse] = useState("");
  const [type, setType] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showPopup, setShowPopup] = useState(false); // State for popup visibility
  const formRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      // Simulate API call to fetch search results
      const results = await fetchSearchResults(
        inputValue,
        timeRange,
        Number,
        originHouse,
        type,
      );
      setSearchResults(results);
      setShowPopup(true); // Show popup instead of inline results
    },
    [inputValue, timeRange, Number, originHouse, type],
  );

  const fetchSearchResults = async (
    query,
    timeRange,
    number,
    originHouse,
    type,
  ) => {
    // Replace with your actual API call
    // This is a placeholder that returns dummy data
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
    return [
      {
        id: 1,
        title: "Bill 123 - Infrastructure Investment",
        content: "This bill focuses on...",
      },
      {
        id: 2,
        title: "Law 456 - Tax Reform Act",
        content: "This law implements changes...",
      },
      {
        id: 3,
        title: "Amendment 789 - Education Funding",
        content: "This amendment proposes...",
      },
    ];
  };

  const handleResultClick = (resultId) => {
    // Navigate to the conversation page (replace '/conversation/:id' with your actual route)
    navigate(`/conversation/${resultId}`);
    setShowPopup(false); // Close popup on result click
  };

  const handleFocus = () => {
    setShowFilters(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowFilters(false);
        setShowPopup(false); // Hide popup when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl relative">
      <motion.form
        ref={formRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        onSubmit={handleSubmit}
        className={`rounded-lg shadow-lg border overflow-hidden ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-300"
        }`}
      >
        <div
          className={`flex items-center p-4 rounded-t-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <input
            type="text"
            placeholder="Full Text Search..."
            className={`flex-grow focus:outline-none px-3 py-2 ${
              isDarkMode
                ? "text-gray-300 bg-gray-800"
                : "text-gray-700 bg-white"
            } text-base`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`ml-4 px-4 py-2 rounded-md text-sm font-medium flex items-center ${
              isDarkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              key="filterSection"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`p-4 overflow-hidden rounded-b-lg ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div className="grid grid-cols-2 gap-4 py-2">
                {/* Row 1 */}
                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="timeRange"
                    className={`flex items-center text-sm font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Time :
                  </label>
                  <select
                    id="timeRange"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className={`flex-grow px-3 py-2 text-sm rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-600 text-gray-300 border-gray-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    <option value="">Select Time Range</option>
                    <option value="1month">1 Month</option>
                    <option value="3months">3 Months</option>
                    <option value="6months">6 Months</option>
                    <option value="12months">12 Months</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="Number"
                    className={`flex items-center text-sm font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Number:
                  </label>
                  <input
                    type="text"
                    id="Number"
                    value={Number}
                    onChange={(e) => setNumber(e.target.value)}
                    className={`flex-grow px-3 py-2 text-sm rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-600 text-gray-300 border-gray-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                    placeholder="Bill/Law/Amendment number"
                  />
                </div>

                {/* Row 2 */}
                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="originHouse"
                    className={`flex items-center text-sm font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <Building2 className="w-4 h-4 mr-1" />
                    Origin:
                  </label>
                  <select
                    id="originHouse"
                    value={originHouse}
                    onChange={(e) => setOriginHouse(e.target.value)}
                    className={`flex-grow px-3 py-2 text-sm rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-600 text-gray-300 border-gray-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    <option value="">Select Origin</option>
                    <option value="senate">Senate</option>
                    <option value="house">House</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="type"
                    className={`flex items-center text-sm font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <Scale className="w-4 h-4 mr-1" />
                    Type:
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`flex-grow px-3 py-2 text-sm rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-600 text-gray-300 border-gray-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    <option value="">Select Type</option>
                    <option value="bill">Bill</option>
                    <option value="law">Law</option>
                    <option value="amendment">Amendment</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="searchPopup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-md p-6 rounded-lg shadow-lg bg-white ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                Search Results
              </h2>
              {searchResults.map((result) => (
                <motion.div
                  key={result.id}
                  whileHover={{ scale: 1.02 }}
                  className={`px-4 py-3 cursor-pointer border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                  onClick={() => {
                    handleResultClick(result.id);
                    setShowPopup(false);
                  }}
                >
                  <h3
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    {result.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {result.content}
                  </p>
                </motion.div>
              ))}
              <button
                className={`mt-4 px-4 py-2 rounded-md text-sm font-medium ${
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InputArea;
