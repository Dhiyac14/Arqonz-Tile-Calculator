import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import ProductCard from './ProductCard';

const STEP_LABELS = [
  'Tile Type',
  'Area Input',
  'Tile Size',
  'Calculation & Result',
  'Suggestions'
];

const TILE_SIZE_OPTIONS = [
  '1200x600 MM (7.75 sq.ft)',
  '600x300 MM (1.94 sq.ft)',
  '600x600 MM (3.87 sq.ft)',
  '450x300 MM (1.45 sq.ft)',
  '1600x800 MM (13.78 sq.ft)',
  '300x300 MM (0.97 sq.ft)',
  '1800x1200 MM (23.23 sq.ft)',
  '2400x800 MM (20.67 sq.ft)',
  '400x400 MM (1.72 sq.ft)',
  '800x800 MM (6.89 sq.ft)',
  '2400x1200 MM (31.15 sq.ft)',
  '605x605 MM (3.94 sq.ft)',
  '1214x193 MM (2.52 sq.ft)',
  '1200x1200 MM (15.5 sq.ft)',
  '1200x200 MM (2.58 sq.ft)',
  '1000x200 MM (2.15 sq.ft)',
  '1200x195 MM (2.52 sq.ft)',
  '3100x1400 MM (46.69 sq.ft)',
  '600x99 MM (0.64 sq.ft)',
  '1214x141 MM (1.84 sq.ft)',
  '800x130 MM (1.12 sq.ft)',
  '1200x196 MM (2.53 sq.ft)',
  '600x150 MM (0.97 sq.ft)',
  '914x147 MM (1.45 sq.ft)',
  '300x200 MM (0.65 sq.ft)',
  '1219x225 MM (2.96 sq.ft)',
  '1000x1000 MM (10.76 sq.ft)',
  '600x145 MM (0.94 sq.ft)',
  '395x395 MM (1.68 sq.ft)',
  '300x100 MM (0.32 sq.ft)',
  '600x1200 MM (7.75 sq.ft)'
];

function Chatbot({ products }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [quickReplies, setQuickReplies] = useState([]);
  const [isTyping, setIsTyping] = useState(false); 
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1-based step
  const chatBoxRef = useRef(null);
  const pdfRef = useRef(null); // For PDF download
  const [selectedTileSize, setSelectedTileSize] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [userBudget, setUserBudget] = useState(null);
  const [step5Answered, setStep5Answered] = useState(false);
  const [awaitingBudget, setAwaitingBudget] = useState(false);
  const [tileType, setTileType] = useState('');
  const [awaitingType, setAwaitingType] = useState(false); // NEW: ask for type
  const [userArea, setUserArea] = useState(null); // NEW: store user area
  const [areaVal, setAreaVal] = useState(null); // NEW: store area from dropdown
  const [listening, setListening] = useState(false); // For voice input
  const recognitionRef = useRef(null); // For Web Speech API

  // Scroll to bottom of chat box whenever messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to add a message to the chat
  const addMessage = (sender, text, isUser = false) => {
    setMessages((prevMessages) => [...prevMessages, { sender, text, isUser }]);
  };

  // Function to show typing indicator
  const showTypingIndicator = () => {
    setIsTyping(true);
  };

  // Function to remove typing indicator
  const removeTypingIndicator = () => {
    setIsTyping(false);
  };

  // Function to process user input and send to backend
  const processUserInput = async (message) => {
    addMessage('You', message, true);
    setUserInput(''); // Clear input immediately
    setQuickReplies([]); // Clear quick replies after user sends message

    // If awaiting budget, capture it and skip backend call
    if (awaitingBudget) {
      const budgetValue = Number(message.replace(/[^\d.]/g, ''));
      if (!isNaN(budgetValue) && budgetValue > 0) {
        setUserBudget(budgetValue);
        setAwaitingBudget(false);
        addMessage('Bot', `Great! I'll recommend tiles within ₹${budgetValue} per tile.`);
        setCurrentStep(4); // Stay on step 4 until type is entered
        setShowRecommendations(false);
        setStep5Answered(false);
        // Prompt for tile type if not set
        if (!tileType) {
          setAwaitingType(true);
          setTimeout(() => addMessage('Bot', 'What tile type do you prefer? (e.g., Glossy, Matte, GVT, Double Charged)'), 400);
        }
      } else {
        addMessage('Bot', 'Please enter a valid budget amount (e.g., 50).');
      }
      return;
    }

    // If awaiting tile type, capture it and skip backend call
    if (awaitingType) {
      setTileType(message);
      setAwaitingType(false);
      setCurrentStep(5); // Move to recommendations question
      setShowRecommendations(false);
      setStep5Answered(false);
      return;
    }

    showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      removeTypingIndicator();
      // If the bot's reply contains a tile calculation result, show the result card and advance to next step
      if (parseTileResult(data.reply)) {
        addMessage('Bot', data.reply);
        // If budget is not set, ask for it before recommendations
        if (!userBudget) {
          setAwaitingBudget(true);
          setCurrentStep(4); // Stay on step 4 until budget is entered
          setShowRecommendations(false);
          setStep5Answered(false);
          setTimeout(() => {
            addMessage('Bot', 'What is your budget per tile (in ₹)?');
          }, 400);
        } else {
          setCurrentStep(5); // Go to step 5 (recommendation question)
          setShowRecommendations(false); // Reset recommendations
          setStep5Answered(false);
        }
        return;
      }
      // If backend returns tile_type or budget, set them
      if (data.budget) setUserBudget(data.budget);
      // Otherwise, normal message flow
      addMessage('Bot', data.reply);
      if (typeof data.step === 'number') {
        setCurrentStep(mapBackendStepToProgress(data.step));
      }
      if (data.quick_replies && Array.isArray(data.quick_replies) && data.quick_replies.length > 0) {
        setQuickReplies(data.quick_replies);
      } else {
        setQuickReplies([]); // Clear quick replies if none are provided
      }
    } catch (error) {
      console.error('Error communicating with chatbot backend:', error);
      removeTypingIndicator();
      addMessage('Bot', 'Sorry, I am having trouble connecting right now. Please try again later.');
      setQuickReplies([]);
    }
  };

  // Function to initiate the chat with the bot when component mounts
  useEffect(() => {
    const startChat = async () => {
      showTypingIndicator();
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: "start_conversation" }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        removeTypingIndicator();
        addMessage('Bot', data.reply);
        if (typeof data.step === 'number') {
          setCurrentStep(mapBackendStepToProgress(data.step));
        }
        if (data.quick_replies && Array.isArray(data.quick_replies) && data.quick_replies.length > 0) {
          setQuickReplies(data.quick_replies);
        } else {
          setQuickReplies([]);
        }

      } catch (error) {
        console.error('Error initiating chat:', error);
        removeTypingIndicator();
        addMessage('Bot', 'Sorry, I could not start the chat. Please refresh the page.');
        setQuickReplies([]);
      }
    };

    startChat();
  }, []); // Empty dependency array means this runs once on mount

  const handleSendMessage = () => {
    const message = userInput.trim();
    if (message) {
      processUserInput(message);
    }
  };

  const handleQuickReplyClick = (reply) => {
    processUserInput(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Helper to detect and extract tile calculation result
  function parseTileResult(text) {
    // Example: "You will need approximately 851 tiles (213 boxes). This includes a 10% buffer for wastage and design matching."
    const tileMatch = text.match(/(\d+)\s+tiles?\s*\((\d+)\s+boxes?\)/i);
    const bufferMatch = text.match(/(\d+)% buffer|adjusted by (\d+)%/i);
    if (tileMatch) {
      return {
        tiles: tileMatch[1],
        boxes: tileMatch[2],
        buffer: bufferMatch ? (bufferMatch[1] || bufferMatch[2]) : '10',
      };
    }
    return null;
  }

  // PDF Download Handler
  const handleDownloadPDF = () => {
    if (pdfRef.current) {
      html2pdf()
        .set({
          margin: 0.5,
          filename: 'tile-estimate.pdf',
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        })
        .from(pdfRef.current)
        .save();
    }
  };

  function mapBackendStepToProgress(step) {
    // step is a number from backend (ConversationStep enum value)
    if (step === 1 || step === 2) return 1; // INITIAL or ASK_TILE_TYPE
    if (step === 3) return 2; // ASK_DIMENSIONS
    if (step === 4) return 3; // ASK_TILE_SIZE
    if (step === 5) return 4; // CALCULATED
    if (step === 6) return 5; // SUGGESTIONS
    return 1;
  }

  const handleTileSizeSelect = (e) => {
    setSelectedTileSize(e.target.value);
    // Extract area in sq.ft from selectedTileSize (e.g., "(7.75 sq.ft)")
    const areaMatch = e.target.value.match(/\((\d+(?:\.\d+)?)\s*sq\.ft\)/i);
    if (areaMatch) setAreaVal(Number(areaMatch[1]));
  };

  const handleTileSizeSubmit = () => {
    if (selectedTileSize) {
      processUserInput(selectedTileSize);
      setSelectedTileSize('');
    }
  };

  // Always render floating button on mobile when minimized
  const showFloatingBtn = isMinimized && window.innerWidth <= 600;

  // Extract area in sq.ft from user input (e.g., "120 sq.ft" or "120 sqft")
  useEffect(() => {
    const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
    // Area extraction
    const areaMatch = lastMsg.match(/(\d+(?:\.\d+)?)\s*(sq\.?\s*ft|sqft|square\s*feet|sq\.?\s*m|sqm|square\s*meter)/i);
    if (areaMatch) setUserArea(Number(areaMatch[1]));
    // Type extraction
    if (lastMsg.includes('glossy')) setTileType('Glossy');
    else if (lastMsg.includes('matte')) setTileType('Matte');
    else if (lastMsg.includes('double charged')) setTileType('Double Charged');
    else if (lastMsg.includes('gvt')) setTileType('GVT');
  }, [messages]);

  // Ask for budget and type before recommendations
  useEffect(() => {
    if (currentStep === 4 && areaVal && !userBudget && !awaitingBudget) {
      setAwaitingBudget(true);
      setTimeout(() => addMessage('Bot', 'What is your budget per tile (in ₹)?'), 400);
    } else if (currentStep === 4 && areaVal && userBudget && !tileType && !awaitingType) {
      setAwaitingType(true);
      setTimeout(() => addMessage('Bot', 'What tile type do you prefer? (e.g., Glossy, Matte, GVT, Double Charged)'), 400);
    }
  }, [currentStep, areaVal, userBudget, tileType, awaitingBudget, awaitingType]);

  // Recommendation logic: area, then price, then type
  const getRecommendedProducts = () => {
    // Helper to extract area from product title
    const extractArea = (p) => {
      const prodAreaMatch = p.title.match(/(\d{1,3}\.\d{1,2}|\d{1,4})\s*sq\.ft/i);
      let prodArea = prodAreaMatch ? Number(prodAreaMatch[1]) : null;
      if (!prodArea) {
        const sizeMatch = p.title.match(/(\d{3,4})\s*mm\s*x\s*(\d{3,4})\s*mm/i);
        if (sizeMatch) {
          const w = Number(sizeMatch[1]) * 0.00328084;
          const h = Number(sizeMatch[2]) * 0.00328084;
          prodArea = +(w * h).toFixed(2);
        }
      }
      return prodArea;
    };
    // Helper to check area match (within 10%)
    const isAreaMatch = (prodArea, areaVal) =>
      prodArea && areaVal && Math.abs(prodArea - areaVal) / areaVal <= 0.1;
    // Helper to check type match
    const isTypeMatch = (p, tileType) => tileType && (
      p.title.toLowerCase().includes(tileType.toLowerCase()) ||
      (p.type && p.type.toLowerCase().includes(tileType.toLowerCase()))
    );
    // 1. Area + Budget + Type
    let matches = products.filter(p => {
      const prodArea = extractArea(p);
      return isAreaMatch(prodArea, areaVal) && userBudget && Number(p.price) <= userBudget && isTypeMatch(p, tileType);
    });
    if (matches.length > 0) return matches;
    // 2. Area + Budget
    matches = products.filter(p => {
      const prodArea = extractArea(p);
      return isAreaMatch(prodArea, areaVal) && userBudget && Number(p.price) <= userBudget;
    });
    if (matches.length > 0) return matches;
    // 3. Budget + Type
    matches = products.filter(p => {
      return userBudget && Number(p.price) <= userBudget && isTypeMatch(p, tileType);
    });
    if (matches.length > 0) return matches;
    // 4. Budget only
    matches = products.filter(p => userBudget && Number(p.price) <= userBudget);
    return matches;
  };

  // Only show recommendations if all three are set
  const canShowRecommendations = areaVal && userBudget && tileType;

  // Setup Web Speech API on mount
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setListening(false);
      };
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
    }
  }, []);

  const handleMicClick = () => {
    if (recognitionRef.current && !listening) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <>
      {showFloatingBtn && (
        <button
          className="floating-chat-btn"
          onClick={toggleMinimize}
          aria-label="Open Chat"
          style={{zIndex: 10001, position: 'fixed', bottom: 24, right: 24, display: 'flex'}}
        >
          💬
        </button>
      )}
      {!(isMinimized && window.innerWidth <= 600) && (
        <section className={`chatbot-section ${isMinimized ? 'minimized' : ''}`}>
          <div className="chat-header">
            <h2 className="section-title">Tile Calculator</h2>
            <div className="chat-header-controls">
              {window.innerWidth <= 600 && !isMinimized && (
                <button
                  className="close-btn"
                  onClick={toggleMinimize}
                  title="Close"
                >
                  &times;
                </button>
              )}
              {isMinimized ? (
                <button className="minimize-btn" onClick={toggleMinimize} title="Maximize">
                  <span style={{fontSize: '1.3em'}}>⛶</span>
                </button>
              ) : (
                <button className="minimize-btn" onClick={toggleMinimize} title="Minimize">
                  <span style={{fontSize: '1.3em'}}>🗕</span>
                </button>
              )}
            </div>
          </div>
          {/* Progress Bar */}
          {!isMinimized && (
            <div className="chat-progress-bar">
              <div className="progress-label">
                Step {currentStep} of 5: {STEP_LABELS[currentStep - 1]}
              </div>
              <div className="progress-bar-outer">
                <div
                  className="progress-bar-inner"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          {!isMinimized && (
            <div className="chat-container">
              <div className="chat-box" id="chat-box" ref={chatBoxRef}>
                {messages.map((msg, index) => {
                  if (!msg.isUser && parseTileResult(msg.text)) {
                    const result = parseTileResult(msg.text);
                    return (
                      <div key={index} className="result-card" ref={pdfRef}>
                        <div className="result-row">
                          <span className="result-label">Tile pieces required:</span>
                          <span className="result-value">{result.tiles} pcs *</span>
                        </div>
                        <div className="result-row">
                          <span className="result-label">Total boxes required:</span>
                          <span className="result-value">{result.boxes} boxes #</span>
                        </div>
                        <div className="result-note">*Adjusting for {result.buffer}% wastage.<br/>#Assuming 4 Pcs per box.</div>
                        <button className="download-pdf-btn" onClick={handleDownloadPDF}>
                          Download PDF
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div key={index} className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
                      <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="message bot-message typing-indicator">
                    <strong>Bot:</strong> <span></span><span></span><span></span>
                  </div>
                )}
                {/* Step 5: Always ask if user wants recommendations, then show based on response */}
                {currentStep === 5 && !step5Answered && (
                  <div className="message bot-message">
                    <strong>Bot:</strong> Would you like to see tiles matching your selection?
                  </div>
                )}
                {/* Show recommendations only if user said Yes */}
                {currentStep === 5 && step5Answered && showRecommendations && canShowRecommendations && (
                  <div className="message bot-message">
                    <strong>Bot:</strong> Here are some tiles matching your selection:
                    <div className="product-grid" style={{marginTop: '18px'}}>
                      {getRecommendedProducts().map((product, idx) => (
                        <ProductCard
                          key={idx}
                          imageUrl={product.imageUrl}
                          title={product.title}
                          price={product.price}
                          reviews={product.reviews}
                          link={product.link}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* If user says No, show a polite closing message */}
                {currentStep === 5 && step5Answered && !showRecommendations && (
                  <div className="message bot-message">
                    <strong>Bot:</strong> Okay, let me know if you need anything else!
                  </div>
                )}
              </div>
              <div className="input-area">
                {/* Show quick replies for step 5 Yes/No only if not answered yet */}
                {currentStep === 5 && !step5Answered && (
                  <div className="quick-replies">
                    <button onClick={() => { setShowRecommendations(true); setStep5Answered(true); }}>Yes</button>
                    <button onClick={() => { setShowRecommendations(false); setStep5Answered(true); }}>No</button>
                  </div>
                )}
                {/* Show other quick replies for other steps */}
                {quickReplies.length > 0 && !(currentStep === 5 && !step5Answered) && (
                  <div className="quick-replies">
                    {quickReplies.map((reply, index) => (
                      <button key={index} onClick={() => handleQuickReplyClick(reply)}>
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
                <div className="input-field-and-button">
                  {currentStep === 3 ? (
                    <>
                      <select
                        value={selectedTileSize}
                        onChange={handleTileSizeSelect}
                        className="tile-size-dropdown"
                      >
                        <option value="">Select tile size...</option>
                        {TILE_SIZE_OPTIONS.map((option, idx) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                      </select>
                      <button
                      id="send-button"
                      onClick={handleTileSizeSubmit}
                      disabled={!selectedTileSize}
                      >
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="14" cy="14" r="14" fill="none"/>
                          <polygon points="8,6 22,14 8,22" fill="#fff"/>
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        id="user-input"
                        placeholder="Type your message..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <button id="send-button" onClick={handleSendMessage}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="14" cy="14" r="14" fill="none"/>
                          <polygon points="8,6 22,14 8,22" fill="#fff"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="mic-btn"
                        onClick={handleMicClick}
                        disabled={listening}
                        aria-label={listening ? "Listening..." : "Start voice input"}
                        style={{ marginLeft: 6, background: listening ? '#e0f7fa' : '#f3f3f3', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: listening ? 'not-allowed' : 'pointer' }}
                      >
                        {listening ? (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                        ) : (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default Chatbot;