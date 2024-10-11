import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Calendar, FileText, Building2, Scale } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const InputArea = ({ isDarkMode, onSubmit }) => {
  const [inputValue, setInputValue] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [originHouse, setOriginHouse] = useState("");
  const [docType, setDocType] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true); // Set isLoading to true when submitting

      try {
        const response = await fetch(
          "https://search.insight-ai.workers.dev/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: inputValue,
              time_range: timeRange,
              origin: originHouse,
              doc_type: docType,
              bill_number: billNumber,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        } else {
          console.error("Error fetching search results:", response.status);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
        setShowPopup(true);
      }
    },
    [inputValue, timeRange, billNumber, originHouse, docType]
  );

  const handleResultClick = async (result) => {
    setIsLoading(true); // Start loading

    if (result.resultLink) {
      try {
        console.log("Encoded URL:", encodeURIComponent(result.resultLink)); // Log encoded URL
        const response = await fetch(
          `https://wh10lx31-5000.inc1.devtunnels.ms/info/${encodeURIComponent(result.resultLink)}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("API Response Data:", data); // Log the API response data
          navigate(`/conversation/${data.uid}`); 
        } else {
          console.error("Error fetching UID:", response.status);
        }
      } catch (error) {
        console.error("Error fetching UID:", error);
      } finally {
        setIsLoading(false); // Stop loading
        setShowPopup(false);
      }
    } else {
      console.error("Result URL is undefined:", result);
      setIsLoading(false);
    }
  };

  const handleFocus = () => {
    setShowFilters(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowFilters(false);
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl relative"> 
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
            disabled={isLoading} 
          >
            {isLoading ? ( 
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Loading..." : "Search"} 
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
                    <option value="1m">1 Month</option>
                    <option value="3m">3 Months</option>
                    <option value="6m">6 Months</option>
                    <option value="12m">12 Months</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="billNumber"
                    className={`flex items-center text-sm font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Number:
                  </label>
                  <input
                    type="text"
                    id="billNumber"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className={`flex-grow px-3 py-2 text-sm rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-600 text-gray-300 border-gray-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                    placeholder="Bill/Law number"
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
                    <option value="House">House</option>
                    <option value="Senate">Senate</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="docType"
                    className={`flex items-center text-sm font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <Scale className="w-4 h-4 mr-1" />
                    Type:
                  </label>
                  <select
                    id="docType"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className={`flex-grow px-3 py-2 text-sm rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-600 text-gray-300 border-gray-500"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    <option value="">Select Type</option>
                    <option value="Bill">Bill</option>
                    <option value="Law">Law</option>
                    {/* Add more document types as needed */}
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
              className={`w-full max-w-3xl p-8 rounded-lg shadow-lg bg-white overflow-y-auto max-h-[80vh] ${ 
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <h2
                className={`text-2xl font-semibold mb-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-800"
                }`}
              >
                Search Results
              </h2>
              {isLoading && (
                <div className="flex justify-center items-center h-full"> 
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div> 
                </div>
              )}
              {!isLoading && searchResults.map((result) => (
                <motion.div
                  key={result.packageId}
                  whileHover={{ scale: 1.02 }}
                  className={`px-6 py-4 cursor-pointer border-b group ${ 
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                  onClick={() => {
                    console.log("Result passed to onClick:", result);
                    handleResultClick(result);
                    setShowPopup(false);
                  }}
                >
                  <h3
                    className={`text-xl font-medium mb-2 transition-colors group-hover:text-blue-500 ${ 
                      isDarkMode ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    {result.title}
                  </h3>
                  <p
                    className={`text-base ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {result.dateIssued && (
                      <span>
                        <strong>Date Issued:</strong> {result.dateIssued}
                      </span>
                    )}
                  </p>
                  {result.origin && (
                    <span className="block text-sm text-gray-500 mt-1">
                      <strong>Origin:</strong> {result.origin}
                    </span>
                  )}
                  {result.docType && (
                    <span className="block text-sm text-gray-500 mt-1">
                      <strong>Type:</strong> {result.docType}
                    </span>
                  )}
                </motion.div>
              ))}
              <button
                className={`mt-6 px-6 py-3 rounded-md text-base font-medium ${
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