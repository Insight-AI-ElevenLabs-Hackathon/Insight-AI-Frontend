import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./Sidebar";
import ProfilePopup from "./ProfilePopup";
import FooterPopup from "./FooterPopup";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  Scale,
  Calendar,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConversationPage from "./ConversationPage";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
import InputArea from "./InputArea"; // Import the InputArea component

// Create a context to store the selected bill/law/amendment data
export const SelectedItemDataContext = createContext(null);

const WorkspaceContent = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showFooterPopup, setShowFooterPopup] = useState(false);
  const [footerPopupContent, setFooterPopupContent] = useState("");
  const [selectedItemData, setSelectedItemData] = useState(null); // State for selected item data
  const profilePopupRef = useRef(null);
  const footerPopupRef = useRef(null);
  const location = useLocation();

  const toggleProfilePopup = useCallback(() => {
    setShowProfilePopup((prevState) => !prevState);
  }, []);

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
        profilePopupRef.current &&
        !profilePopupRef.current.contains(event.target)
      ) {
        setShowProfilePopup(false);
      }
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
          <SignedIn>
            <Sidebar
              isDarkMode={isDarkMode}
              toggleProfilePopup={toggleProfilePopup}
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
          </SignedIn>
          <SignedOut>
            <SignOutContent />
          </SignedOut>
        </main>

        <SignedIn>
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
        </SignedIn>

        {showProfilePopup && (
          <div ref={profilePopupRef}>
            <ProfilePopup
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              toggleProfilePopup={toggleProfilePopup}
              showProfilePopup={showProfilePopup}
            />
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
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      >
        <WorkspaceContent />
      </ClerkProvider>
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
  const { setSelectedItemData } = useContext(SelectedItemDataContext); // Access the context

  const handleSubmit = useCallback(
    (inputValue, uploadedFiles) => {
      const conversationId = uuidv4();
      navigate(`/conversation/${conversationId}`);
    },
    [navigate]
  );

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

  const InfoCard = ({
    title,
    content,
    icon: Icon,
    isDarkMode,
    data, // Pass the entire data object for the bill/law/amendment
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
      onClick={() => {
        setSelectedItemData(data); // Set the selected item data in the context
        navigate(`/conversation/${uuidv4()}`);
      }}
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
          <InputArea isDarkMode={isDarkMode} onSubmit={handleSubmit} />
        </div>
      </div>

      {/* Recent Bills Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold grow text-center pt-8">
            Recent Bills
          </h2>
          <div>
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
          <div className="flex space-x-6">
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
                    data={bill} // Pass the entire bill object
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
          <div>
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
          <div className="flex space-x-6">
            {lawsData.map(
              (law, index) =>
                visibleLaws.includes(index) && (
                  <InfoCard
                    key={index}
                    title={law.title}
                    content={{
                      Congress: `${law.congress}th`,
                      "Bill Number": law.number,
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

      {/* Recent Amendments Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold grow text-center">
            Recent Amendments
          </h2>
          <div>
            <button
              className={`mr-4 ${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleAmendmentNavigation(-1)}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleAmendmentNavigation(1)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
        <div className="relative px-4">
          <div className="flex space-x-6">
            {amendmentsData.map(
              (amendment, index) =>
                visibleAmendments.includes(index) && (
                  <InfoCard
                    key={index}
                    title={amendment.title}
                    content={{
                      Type: "Amendment",
                      Number: amendment.number || "N/A",
                      "Affected Bill": amendment.affectedBill || "N/A",
                      "Proposed Date": amendment.proposedDate || "N/A",
                    }}
                    icon={FileText}
                    isDarkMode={isDarkMode}
                    data={amendment} // Pass the entire amendment object
                  />
                )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const SignOutContent = () => (
  <div className="flex-grow p-8 flex flex-col items-center justify-center">
    <h1 className="text-4xl font-medium mb-4">Welcome to Insight AI</h1>
    <p className="text-gray-600 mb-8">Please sign in or sign up to continue.</p>
    <div className="space-x-4">
      <SignInButton />
      <SignUpButton />
    </div>
  </div>
);

export default Workspace;