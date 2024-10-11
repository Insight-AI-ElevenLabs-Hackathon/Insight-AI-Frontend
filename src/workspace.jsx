import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link
} from "react-router-dom";
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
  History,
  Flag,
  Moon,
  Sun,
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
        <main className="flex-grow flex overflow-hidden mt-10 pl-[56px]"> 
          <Sidebar
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          <div className="flex-grow overflow-y-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage isDarkMode={isDarkMode} />} />
                <Route
                  path="/conversation/:id"
                  element={<ConversationPage isDarkMode={isDarkMode} />}
                />
                <Route
                  path="/history"
                  element={<HistoryPage isDarkMode={isDarkMode} />}
                />
                <Route
                  path="/feedback"
                  element={<FeedbackPage isDarkMode={isDarkMode} />}
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

// Header component with Link to homepage
const Header = React.memo(({ isDarkMode }) => (
  <header
    className={`flex justify-between items-center px-3 py-1.5 border-b fixed top-0 left-0 right-0 z-50 ${
      isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
    }`}
  >
    <Link to="/" className="text-2xl font-semibold"> 
      Insight AI
    </Link>
    <div
      className={`text-sm px-1.5 py-0.5 rounded-full ${
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

  // Modified InfoCard onClick handler to add conversation to history
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

        // Add the new conversation to the history:
        const newConversation = {
          id: uid,
          title: data.title,
          date: new Date(), 
        };
        updateConversationHistory(newConversation);

        navigate(`/conversation/${uid}`); 
      } else {
        console.error('Error generating UID:', response.status);
      }
    } catch (error) {
      console.error('Error generating UID:', error);
    }
  };

  // Function to update the conversation history in localStorage
  const updateConversationHistory = (newConversation) => {
    const storedConversations = localStorage.getItem('conversations');
    let conversations = [];
    if (storedConversations) {
      conversations = JSON.parse(storedConversations);
    }
    conversations.push(newConversation);
    localStorage.setItem('conversations', JSON.stringify(conversations));
  };


  const InfoCard = ({
    title,
    content,
    icon: Icon,
    isDarkMode,
    data,
  }) => (
    <motion.div
      className={`w-64 h-48 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      } rounded-lg p-4 shadow-md border ${
        isDarkMode ? "border-gray-700" : "border-gray-200"
      } flex flex-col justify-between`}
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", 
      }}
      transition={{ duration: 0.2 }}
      onClick={() => handleInfoCardClick(data)}
      style={{ cursor: "pointer" }}
    >
      <div>
        <div className="flex items-center mb-2">
          <h3 className="font-semibold text-base line-clamp-2">{title}</h3> 
        </div>
        <div className="space-y-1"> 
          {Object.entries(content).map(([key, value]) => (
            <p
              key={key}
              className={`text-xs ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              } flex items-center`}
            >
              {key === "Congress" && <Building2 className="mr-1" size={14} />} 
              {key === "Bill Number" && <Hash className="mr-1" size={14} />} 
              {key === "Law Number" && <Hash className="mr-1" size={14} />}
              {key === "Origin House" && <Scale className="mr-1" size={14} />} 
              {key === "Last Updated" && (
                <Calendar className="mr-1" size={14} /> 
              )}
              <span className="font-medium mr-1">{key}:</span> {value}
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
      className="flex-grow p-6" 
    >
      <div className="flex flex-col items-center mb-8"> 
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-3 pt-6" 
        >
          Access to Governance for Everyone
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-6`} 
        >
          Understand complex legislation effortlessly with audio summaries in
          multiple languages.
        </motion.p>
        <div className="w-full max-w-2xl">
          <InputArea isDarkMode={isDarkMode} /> 
        </div>
      </div>

      {/* Recent Bills Section */}
      <div className="mb-12"> 
        <div className="flex items-center justify-between mb-4"> 
          <h2 className="text-xl font-semibold grow text-center pt-6">
            Recent Bills
          </h2>
          <div className="flex items-center">
            <button
              className={`mr-3 ${ 
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleBillNavigation(-1)}
            >
              <ChevronLeft size={20} /> 
            </button>
            <button
              className={`${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleBillNavigation(1)}
            >
              <ChevronRight size={20} /> 
            </button>
          </div>
        </div>
        <div className="relative px-3"> 
          <div className="flex justify-center space-x-4"> 
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
      <div className="mb-12"> 
        <div className="flex items-center justify-between mb-4"> 
          <h2 className="text-xl font-semibold grow text-center">
            Recent Laws
          </h2>
          <div className="flex items-center">
            <button
              className={`mr-3 ${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleLawNavigation(-1)}
            >
              <ChevronLeft size={20} /> 
            </button>
            <button
              className={`${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleLawNavigation(1)}
            >
              <ChevronRight size={20} /> 
            </button>
          </div>
        </div>
        <div className="relative px-3"> 
          <div className="flex justify-center space-x-4"> 
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
                    data={law} 
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

        // Add the new conversation to the history:
        const newConversation = {
          id: uid,
          title: result.title,
          date: new Date(),
        };
        updateConversationHistory(newConversation); 

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

  // Function to update the conversation history in localStorage (same as in HomePage)
  const updateConversationHistory = (newConversation) => {
    const storedConversations = localStorage.getItem('conversations');
    let conversations = [];
    if (storedConversations) {
      conversations = JSON.parse(storedConversations);
    }
    conversations.push(newConversation);
    localStorage.setItem('conversations', JSON.stringify(conversations));
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
          className={`flex items-center p-3 rounded-t-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <input
            type="text"
            placeholder="Full Text Search..."
            className={`flex-grow focus:outline-none px-2 py-1.5 ${
              isDarkMode
                ? "text-gray-300 bg-gray-800"
                : "text-gray-700 bg-white"
            } text-sm`} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`ml-3 px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
              isDarkMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1"></div>
            ) : (
              <Search className="w-3 h-3 mr-1" /> 
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
              className={`p-3 overflow-hidden rounded-b-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white" 
              }`}
            >
              <div className="grid grid-cols-2 gap-3 py-1"> 
                {/* Row 1 */}
                <div className="flex items-center space-x-2"> 
                  <label
                    htmlFor="timeRange"
                    className={`flex items-center text-xs font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-200" : "text-gray-700" 
                    }`}
                  >
                    <Calendar className="w-3 h-3 mr-1" /> 
                    Time :
                  </label>
                  <select
                    id="timeRange"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className={`flex-grow px-2 py-1 text-xs rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-200 border-gray-600" 
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    <option value="">Select Time Range</option>
                    <option value="1m">1 Month</option>
                    <option value="3m">3 Months</option>
                    <option value="6m">6 Months</option>
                    <option value="12m">12 Months</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2"> 
                  <label
                    htmlFor="billNumber"
                    className={`flex items-center text-xs font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-200" : "text-gray-700" 
                    }`}
                  >
                    <FileText className="w-3 h-3 mr-1" /> 
                    Number:
                  </label>
                  <input
                    type="text"
                    id="billNumber"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className={`flex-grow px-2 py-1 text-xs rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-200 border-gray-600" 
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                    placeholder="Bill/Law number"
                  />
                </div>

                {/* Row 2 */}
                <div className="flex items-center space-x-2"> 
                  <label
                    htmlFor="originHouse"
                    className={`flex items-center text-xs font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-200" : "text-gray-700" 
                    }`}
                  >
                    <Building2 className="w-3 h-3 mr-1" /> 
                    Origin:
                  </label>
                  <select
                    id="originHouse"
                    value={originHouse}
                    onChange={(e) => setOriginHouse(e.target.value)}
                    className={`flex-grow px-2 py-1 text-xs rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-200 border-gray-600" 
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    <option value="">Select Origin</option>
                    <option value="House">House</option>
                    <option value="Senate">Senate</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2"> 
                  <label
                    htmlFor="docType"
                    className={`flex items-center text-xs font-medium whitespace-nowrap ${
                      isDarkMode ? "text-gray-200" : "text-gray-700" 
                    }`}
                  >
                    <Scale className="w-3 h-3 mr-1" /> 
                    Type:
                  </label>
                  <select
                    id="docType"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className={`flex-grow px-2 py-1 text-xs rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-200 border-gray-600" 
                        : "bg-gray-100 text-gray-700 border-gray-300"
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
              className={`w-full max-w-2xl p-6 rounded-lg shadow-lg overflow-y-auto max-h-[80vh] ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-300" 
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center mb-4"> 
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  Search Results
                </h2>
                <button 
                  onClick={() => setShowPopup(false)}
                  className={`p-1.5 rounded-full hover:bg-gray-200 ${isDarkMode ? "hover:bg-gray-700" : ""}`} 
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-5 h-5" 
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M6 18L18 6M6 6l12 12" 
                    />
                  </svg>
                </button>
              </div>

              {isLoading && (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
                </div>
              )}

              {!isLoading && searchResults.length === 0 && (
                <p className="text-center text-gray-500">No results found.</p> 
              )}

              {!isLoading && searchResults.length > 0 && (
                <ul className="space-y-3"> 
                  {searchResults.map((result) => (
                    <motion.li
                      key={result.packageId}
                      whileHover={{ 
                        scale: 1.02, 
                        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" 
                      }}
                      className={`px-4 py-3 cursor-pointer border-b group rounded-md ${
                        isDarkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                      onClick={async () => {
                        console.log("Result passed to onClick:", result);
                        await handleResultClick(result);
                        setShowPopup(false);
                      }}
                    >
                      <h3
                        className={`text-base font-medium mb-1 transition-colors group-hover:text-blue-500 ${
                          isDarkMode ? "text-gray-300" : "text-gray-800"
                        }`}
                      >
                        {result.title}</h3>
                      <p
                        className={`text-sm ${
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
                        <span className={`block text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}> 
                          <strong>Origin:</strong> {result.origin}
                        </span>
                      )}
                      {result.docType && (
                        <span className={`block text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                          <strong>Type:</strong> {result.docType}
                        </span>
                      )}
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sidebar component with History navigation
const Sidebar = ({ isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();

  const icons = [
    { 
      Icon: History, 
      tooltip: "History", 
      onClick: () => navigate('/history') 
    },
    { 
      Icon: Flag, 
      tooltip: "Feedback", 
      onClick: () => navigate('/feedback') // Navigate to /feedback 
    },
  ];

  return (
    <aside
      className={`w-14 border-r flex flex-col ${
        isDarkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
      } h-full fixed top-10 left-0 z-40`} 
    >
      <div className="space-y-4 flex flex-col items-center py-4"> 
        {icons.map(({ Icon, tooltip, onClick }, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-lg transition-colors duration-200 relative group ${
              isDarkMode
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
            }`}
            onClick={onClick} 
          >
            <Icon size={20} /> 
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap top-1/2 -translate-y-1/2 pointer-events-none">
              {tooltip}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Light/Dark Mode Switch */}
      <div className="absolute bottom-10 flex flex-col items-center left-0 w-full p-2"> 
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-lg transition-colors duration-200 relative group ${
            isDarkMode
              ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
              : "hover:bg-gray-200 text-gray-600 hover:text-gray-800"
          }`}
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />} 
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap top-1/2 -translate-y-1/2 pointer-events-none">
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </span>
        </motion.button>
      </div>
    </aside>
  );
};

// HistoryPage component
const HistoryPage = ({ isDarkMode }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const storedConversations = localStorage.getItem('conversations');
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('conversations');
    setConversations([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex-grow p-6" 
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">History</h1>
        <button
          onClick={clearHistory}
          className={`p-1.5 rounded-full hover:bg-gray-200 ${isDarkMode ? "hover:bg-gray-700" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <ul className="space-y-3"> 
          {conversations.map((conversation) => (
            // Use conversation.id as the key:
            <li key={conversation.id} className={`p-3 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}> 
              <p>
                <strong>{conversation.title}</strong> 
                {' '} - {new Date(conversation.date).toLocaleDateString()}
              </p>
              <p className="text-gray-500 text-xs">{conversation.id}</p> 
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

// Improved FeedbackPage component with slider for rating and centered layout
const FeedbackPage = ({ isDarkMode }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(3); // Initial rating value
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your server or API
    console.log("Feedback submitted:", { name, email, feedback, rating });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex-grow p-6 flex items-center justify-center" 
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Thank You!</h1> 
          <p>Your feedback has been submitted. We appreciate you taking the time to share your thoughts.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex-grow p-6 flex items-center justify-center" 
    >
      <div className="w-full max-w-md space-y-6"> 
        <h1 className="text-2xl font-bold text-center">Feedback</h1> 
        <form onSubmit={handleSubmit} className="space-y-4"> 
          <div>
            <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Name</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 px-3 py-2 w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"}`} 
              required 
            />
          </div>
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 px-3 py-2 w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"}`} 
              required 
            />
          </div>

          {/* Rating Slider */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Rating: {rating}</label> 
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={rating} 
              onChange={(e) => setRating(parseInt(e.target.value, 10))} 
              className={`w-full ${isDarkMode ? "accent-blue-500" : "accent-blue-600"}`} 
            />
          </div>

          <div>
            <label htmlFor="feedback" className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback here..."
              className={`mt-1 px-3 py-2 w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white border-gray-300"}`}
              rows="4" 
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full px-5 py-2.5 rounded-lg text-white font-medium ${
              isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </motion.div>
  );
};


export default Workspace;