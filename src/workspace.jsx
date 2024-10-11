import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import Sidebar from "./Sidebar";
import FooterPopup from "./FooterPopup";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  Scale,
  Calendar,
  Building2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConversationPage from "./ConversationPage";

// Create a context to store the selected bill/law/amendment data
export const SelectedItemDataContext = createContext(null);

const WorkspaceContent = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [showFooterPopup, setShowFooterPopup] = useState(false);
  const [footerPopupContent, setFooterPopupContent] = useState("");
  const [selectedItemData, setSelectedItemData] = useState(null); // State for selected item data
  const footerPopupRef = useRef(null);
  const location = useLocation();

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode) => !prevMode);
  }, []);

  const openFooterPopup = useCallback((content) => {
    setFooterPopupContent(content);
    setShowFooterPopup(true);
  }, []);

  const closeFooterPopup = useCallback(() => {
    setShowFooterPopup(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        footerPopupRef.current &&
        !footerPopupRef.current.contains(event.target)
      ) {
        setShowFooterPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isHomePage = location.pathname === "/";

  return (
    <SelectedItemDataContext.Provider value={{ selectedItemData, setSelectedItemData }}>
      <div
        className={`flex flex-col h-screen transition-colors duration-300 
        ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
            : "bg-gradient-to-br from-gray-100 via-white to-gray-100 text-gray-800"
        }`}
      >
        <Header isDarkMode={isDarkMode} />
        <main className="flex-grow flex overflow-hidden mt-12 pl-[60px]">
          <Sidebar
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          <div className="flex-grow overflow-y-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route
                  path="/"
                  element={<HomePage isDarkMode={isDarkMode} />}
                />
                <Route
                  path="/conversation/:id"
                  element={<ConversationPage isDarkMode={isDarkMode} />}
                />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        {isHomePage && (
          <div
            className={`mt-auto p-2 text-center text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {["FAQ", "Terms", "AI Policy", "Privacy", "Insight AI →"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className={`mx-2 hover:underline cursor-pointer ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => openFooterPopup(link)}
                >
                  {link}
                </a>
              )
            )}
          </div>
        )}

        {showFooterPopup && (
          <div ref={footerPopupRef}>
            <FooterPopup
              isDarkMode={isDarkMode}
              title={footerPopupContent}
              onClose={closeFooterPopup}
            >
              <p>
                This is the content for the {footerPopupContent} popup. More
                detailed information will be added here soon.
              </p>
            </FooterPopup>
          </div>
        )}
      </div>
    </SelectedItemDataContext.Provider>
  );
};

const Workspace = () => {
  return (
    <Router>
      <WorkspaceContent /> 
    </Router>
  );
};

const Header = React.memo(({ isDarkMode }) => (
  <header
    className={`flex justify-between items-center px-4 py-2 border-b fixed top-0 left-0 right-0 z-50 ${
      isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
    }`}
  >
    <div className="text-2xl font-semibold">Insight AI</div>
    <div
      className={`text-sm px-2 py-1 rounded-full ${
        isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
      }`}
    >
      ElevenLabs AI Audio Hackathon
    </div>
  </header>
));

const HomePage = React.memo(({ isDarkMode }) => {
  const navigate = useNavigate();
  const { setSelectedItemData } = useContext(SelectedItemDataContext);

  // State to manage the visible cards and data for each section
  const [visibleBills, setVisibleBills] = useState([0, 1, 2, 3]);
  const [visibleLaws, setVisibleLaws] = useState([0, 1, 2, 3]);
  const [visibleAmendments, setVisibleAmendments] = useState([0, 1, 2, 3]);
  const [billsData, setBillsData] = useState([]);
  const [lawsData, setLawsData] = useState([]);
  const [amendmentsData, setAmendmentsData] = useState([]);

  const handleBillNavigation = (direction) => {
    setVisibleBills((prevVisible) => {
      const newVisible = prevVisible.map(
        (index) => (index + direction * 4 + 10) % 10
      );
      return newVisible.sort((a, b) => a - b);
    });
  };

  const handleLawNavigation = (direction) => {
    setVisibleLaws((prevVisible) => {
      const newVisible = prevVisible.map(
        (index) => (index + direction * 4 + 10) % 10
      );
      return newVisible.sort((a, b) => a - b);
    });
  };

  const handleAmendmentNavigation = (direction) => {
    setVisibleAmendments((prevVisible) => {
      const newVisible = prevVisible.map(
        (index) => (index + direction * 4 + 10) % 10
      );
      return newVisible.sort((a, b) => a - b);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://pub-59da4baaff6649e2a2a64e188046405b.r2.dev/data.json"
        );
        const data = await response.json();
        setBillsData(data.top_bills);
        setLawsData(data.top_laws);
        setAmendmentsData(data.top_amendments || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Modified InfoCard onClick handler
  const handleInfoCardClick = async (data) => {
    try {
      const response = await fetch('https://uid-generator.insight-ai.workers.dev/', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url }),
      });

      if (response.ok) {
        const { uid } = await response.json();
        localStorage.setItem("selectedItemData", JSON.stringify(data));
        setSelectedItemData(data);
        navigate(`/conversation/${uid}`);
      } else {
        console.error('Error generating UID:', response.status);
      }
    } catch (error) {
      console.error('Error generating UID:', error);
      // Handle error appropriately
    }
  };

  const InfoCard = ({
    title,
    content,
    icon: Icon,
    isDarkMode,
    data,
  }) => (
    <motion.div
      className={`w-80 h-56 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      } rounded-lg p-6 shadow-lg border ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      } flex flex-col justify-between`}
      whileHover={{
        scale: 1.03,
        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ duration: 0.2 }}
      onClick={() => handleInfoCardClick(data)} // Use the modified handler
      style={{ cursor: "pointer" }}
    >
      <div>
        <div className="flex items-center mb-4">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(content).map(([key, value]) => (
            <p
              key={key}
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              } flex items-center`}
            >
              {key === "Congress" && <Building2 className="mr-2" size={16} />}
              {key === "Bill Number" && <Hash className="mr-2" size={16} />}
              {key === "Law Number" && <Hash className="mr-2" size={16} />}
              {key === "Origin House" && <Scale className="mr-2" size={16} />}
              {key === "Last Updated" && (
                <Calendar className="mr-2" size={16} />
              )}
              <span className="font-medium mr-2">{key}:</span> {value}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex-grow p-8"
    >
      <div className="flex flex-col items-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-4 pt-8"
        >
          Access to Governance for Everyone
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-8`}
        >
          Understand complex legislation effortlessly with audio summaries in
          multiple languages.
        </motion.p>
        <div className="w-full max-w-2xl">
          <InputArea isDarkMode={isDarkMode} /> 
        </div>
      </div>

      {/* Recent Bills Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold grow text-center pt-8">
            Recent Bills
          </h2>
          <div className="flex items-center">
            <button
              className={`mr-4 ${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleBillNavigation(-1)}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleBillNavigation(1)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        <div className="relative px-4">
          <div className="flex justify-center space-x-6">
            {billsData.map(
              (bill, index) =>
                visibleBills.includes(index) && (
                  <InfoCard
                    key={index}
                    title={bill.title}
                    content={{
                      Congress: `${bill.congress}th`,
                      "Bill Number": bill.number,
                      "Origin House": bill.type === "S" ? "Senate" : "House",
                      "Last Updated": bill.updateDate,
                    }}
                    icon={FileText}
                    isDarkMode={isDarkMode}
                    data={bill} 
                  />
                )
            )}
          </div>
        </div>
      </div>

      {/* Recent Laws Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold grow text-center">
            Recent Laws
          </h2>
          <div className="flex items-center">
            <button
              className={`mr-4 ${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleLawNavigation(-1)}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleLawNavigation(1)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        <div className="relative px-4">
          <div className="flex justify-center space-x-6">
            {lawsData.map(
              (law, index) =>
                visibleLaws.includes(index) && (
                  <InfoCard
                    key={index}
                    title={law.title}
                    content={{
                      Congress: `${law.congress}th`,
                      "Law Number": law.number,
                      "Origin House": law.type === "S" ? "Senate" : "House",
                      "Last Updated": law.updateDate,
                    }}
                    icon={FileText}
                    isDarkMode={isDarkMode}
                    data={law} // Pass the entire law object
                  />
                )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// InputArea Component
const InputArea = ({ isDarkMode }) => {
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
  const { setSelectedItemData } = useContext(SelectedItemDataContext);

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

    try {
      // 1. Generate a UID for the conversation first
      const uidResponse = await fetch('https://uid-generator.insight-ai.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: result.resultLink }),
      });

      if (uidResponse.ok) {
        const { uid } = await uidResponse.json();

        // 2. Parse the search result into the InfoCard format
        const parsedResult = {
          title: result.title,
          congress: result.packageId.split('-')[1].slice(0, 3), // Extract congress from packageId (e.g., "118" from "BILLS-118hr9773ih")
          number: result.packageId.split('-').pop().replace(/[^0-9]/g, ''), // Extract number from packageId (e.g., "9773" from "BILLS-118hr9773ih")
          type: result.origin === "House" ? "HR" : "S", // Assuming "origin" field maps to "type"
          updateDate: result.lastModified.split('T')[0], // Extract date from lastModified
          url: result.resultLink,
        };

        // 3. Set selected item data using the parsed result
        setSelectedItemData(parsedResult);

        // 4. Navigate to the conversation page
        navigate(`/conversation/${uid}`);

        // 5. Fetch additional data in ConversationPage (as before)
      } else {
        console.error('Error generating UID:', uidResponse.status);
        // Handle error appropriately
      }
    } catch (error) {
      console.error('Error handling search result click:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false); // Stop loading
      setShowPopup(false);
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
                  onClick={async () => { // Use async function here
                    console.log("Result passed to onClick:", result);
                    await handleResultClick(result); // Await handleResultClick
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
                ></button>
                <button>
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  export default Workspace; 