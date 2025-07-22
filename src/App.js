import React, { useState, useEffect, useContext, createContext, useRef } from 'react';

// --- Helper Components & Icons (Minecraft Style) ---
const UploadCloudIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
  </svg>
);
const CameraIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);
const CheckCircleIcon = (props) => ( <svg {...props}  width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg> );
const XCircleIcon = (props) => ( <svg {...props} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M10 10l4 4m0 -4l-4 4" /></svg> );
const BookOpenIcon = (props) => ( <svg {...props} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" /></svg> );
const LightbulbIcon = (props) => ( <svg {...props} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" /><path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" /><path d="M9.7 17l4.6 0" /></svg> );
const TargetIcon = (props) => ( <svg {...props} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg> );
const AlertTriangleIcon = (props) => ( <svg {...props} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" /><path d="M12 16h.01" /></svg> );


// --- App Context for State Management ---
const AppContext = createContext();

// --- Main App Component ---
function App() {
    // --- State Management ---
    const [view, setView] = useState('upload');
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [performanceData, setPerformanceData] = useState([]);
    const [apiKey, setApiKey] = useState('AIzaSyAAYzNzXtz6vyDpTOM4ccf0OK879ZY4Qc0');
    const [error, setError] = useState(null);

    // --- Helper Functions ---
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            const mimeType = result.substring(result.indexOf(':') + 1, result.indexOf(';'));
            const base64Data = result.split(',')[1];
            resolve({ mimeType, base64Data });
        };
        reader.onerror = error => reject(error);
    });
    
    // --- API Call Helper with Retry Logic ---
    const fetchWithRetry = async (url, options, maxRetries = 3) => {
        let lastError = null;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(url, options);
                if (response.status === 503) throw new Error(`API Error: 503 - The model is overloaded. Retrying...`);
                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`API Error: ${response.status} - ${errorBody.error?.message || 'Unknown error'}`);
                }
                return response.json(); // Success
            } catch (err) {
                lastError = err;
                console.error(`Attempt ${attempt + 1} failed:`, err.message);
                if (attempt < maxRetries - 1) {
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(res => setTimeout(res, delay));
                }
            }
        }
        throw lastError;
    };

    // --- API Interactions ---
    const callGeminiAPI = async (prompt, base64ImageData = null, schema = null, mimeType = null) => {
        // Use Gemini 1.5 Pro for all text analysis
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
        let parts = [{ text: prompt }];
        if (base64ImageData && mimeType) parts.push({ inlineData: { mimeType, data: base64ImageData } });
        const payload = { contents: [{ role: "user", parts }] };
        if (schema) payload.generationConfig = { responseMimeType: "application/json", responseSchema: schema };
        
        const result = await fetchWithRetry(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        
        if (result.candidates?.[0]?.content?.parts?.[0]) {
            const responseText = result.candidates[0].content.parts[0].text;
            return schema ? JSON.parse(responseText) : responseText;
        }
        throw new Error("Invalid response from Gemini 1.5 Pro.");
    };

    const handleApiError = (err) => {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
    };

    // --- Core App Logic ---
    const handleProblemSheetUpload = async (file) => {
        if (!file) return;
        setIsLoading(true);
        setLoadingMessage('Analyzing problem sheet...');
        setError(null);
        try {
            const { mimeType, base64Data } = await toBase64(file);
            const prompt = "You are an expert academic assistant. Analyze the provided image of a math, science, or chemistry problem sheet. Extract each distinct question. Return the result as a JSON array of objects, where each object has an 'id' (a unique string like 'q1') and a 'text' field. Ensure all mathematical notation is valid LaTeX (e.g., $...$, $$...$$) and chemical formulas use the mhchem `\\ce{}` format (e.g., `\\ce{H2O}`).";
            const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, text: { type: "STRING" } }, required: ["id", "text"] } };
            const result = await callGeminiAPI(prompt, base64Data, schema, mimeType);
            if (result) {
                setQuestions(result);
                setView('question');
            }
        } catch (err) { handleApiError(err); }
        setIsLoading(false);
    };

    const handleSolutionUpload = async (file) => {
        if (!file) return;
        setIsLoading(true);
        setLoadingMessage('Analyzing your solution...');
        setError(null);
        setFeedback(null);

        try {
            const currentQuestion = questions[currentQuestionIndex];
            const { mimeType, base64Data } = await toBase64(file);
            const textPrompt = `Analyze the user's handwritten solution (in the image) for the problem: "${currentQuestion.text}". Determine if the final answer is correct. Identify the exact mistake step. Provide a clear, step-by-step correct approach using LaTeX for math and \\ce{} for chemistry. Explain the problem's crux. Identify the main conceptual gap and related micro-concepts. Return a structured JSON.`;
            const schema = { type: "OBJECT", properties: { isCorrect: { type: "BOOLEAN" }, mistakeStep: { type: "STRING" }, correctApproach: { type: "STRING" }, problemCrux: { type: "STRING" }, conceptualGaps: { type: "OBJECT", properties: { mainConcept: { type: "STRING" }, microConcepts: { type: "ARRAY", items: { "type": "STRING" } } } }, generalPattern: { type: "STRING" } }, required: ["isCorrect", "mistakeStep", "correctApproach", "problemCrux", "conceptualGaps", "generalPattern"] };
            
            const textResult = await callGeminiAPI(textPrompt, base64Data, schema, mimeType);
            
            if (textResult) {
                setFeedback(textResult);
                setPerformanceData(prev => [...prev, { questionId: currentQuestion.id, ...textResult.conceptualGaps }]);
                setView('feedback');
            }
        } catch (err) { handleApiError(err); }
        setIsLoading(false);
        setLoadingMessage('');
    };
    
    const generateNewProblems = async () => {
        setIsLoading(true);
        setLoadingMessage('Creating a new targeted problem set...');
        setError(null);
        try {
            const summary = performanceData.reduce((acc, item) => {
                if(item.mainConcept) {
                    const set = acc[item.mainConcept] || new Set();
                    if(item.microConcepts) item.microConcepts.forEach(mc => set.add(mc));
                    acc[item.mainConcept] = set;
                }
                return acc;
            }, {});
            const summaryText = Object.entries(summary).map(([main, micros]) => `${main}: ${Array.from(micros).join(', ')}`).join('; ');
            const prompt = `Based on this performance summary: ${summaryText || 'general calculus and chemistry'}. Generate 3 new practice problems targeting these concepts. Ramp up difficulty slightly. Return a JSON array of objects with 'id' and 'text' fields. Use LaTeX for math and \\ce{} for chemistry.`;
            const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, text: { type: "STRING" } }, required: ["id", "text"] } };
            const newProblems = await callGeminiAPI(prompt, null, schema);
            if (newProblems) {
                setQuestions(newProblems);
                setCurrentQuestionIndex(0);
                setFeedback(null);
                setView('question');
            }
        } catch (err) { handleApiError(err); }
        setIsLoading(false);
    };

    const goToNextQuestion = () => {
        setError(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setView('question');
            setFeedback(null);
        } else {
            setView('dashboard');
        }
    };

    // --- Render Logic ---
    const renderView = () => {
        if (isLoading && !feedback) return <LoadingScreen message={loadingMessage || 'Working on it...'} />;
        if (error) return <ErrorScreen message={error} onClear={() => { setError(null); setIsLoading(false); }} />;
        switch (view) {
            case 'question': return <QuestionScreen />;
            case 'feedback': return <FeedbackScreen />;
            case 'dashboard': return <DashboardScreen />;
            case 'upload':
            default: return <UploadScreen />;
        }
    };

    return (
        <AppContext.Provider value={{ view, questions, currentQuestionIndex, feedback, performanceData, apiKey, setApiKey, handleProblemSheetUpload, handleSolutionUpload, goToNextQuestion, generateNewProblems, isLoading, loadingMessage }}>
            <div className="font-minecraft bg-stone-700 text-white min-h-screen w-full flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md mx-auto">
                    {renderView()}
                </div>
            </div>
        </AppContext.Provider>
    );
}

// --- Screen Components ---

const Button = ({ onClick, disabled, children, className }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`w-full text-lg font-bold py-3 px-6 border-2 border-b-4 border-black/70 active:border-b-2 transition-all duration-100 disabled:bg-gray-500 disabled:cursor-not-allowed ${className}`}>
      <div className="flex items-center justify-center gap-3">{children}</div>
    </button>
);

const Card = ({ children, className }) => (
    <div className={`bg-[#c6c6c6] border-2 border-t-[#fbfbfb] border-l-[#fbfbfb] border-r-[#585858] border-b-[#585858] p-4 ${className}`}>
        {children}
    </div>
);

function LoadingScreen({ message }) {
    return (
        <Card className="text-center text-black">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-bold">Working on it...</h2>
            <p className="mt-2">{message}</p>
        </Card>
    );
}

function ErrorScreen({ message, onClear }) {
    return (
        <Card className="text-center text-red-800">
            <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4"/>
            <h2 className="text-xl font-bold">An Error Occurred</h2>
            <p className="mb-6 text-sm">{message}</p>
            <Button onClick={onClear} className="bg-red-500 text-white">Try Again</Button>
        </Card>
    );
}

function UploadScreen() {
    const { handleProblemSheetUpload, apiKey, setApiKey } = useContext(AppContext);
    const fileInputRef = useRef(null);
    const onFileChange = (e) => { if (e.target.files?.[0]) handleProblemSheetUpload(e.target.files[0]); };
    return (
        <Card className="text-center text-black">
            <h1 className="text-3xl font-bold mb-2">AI Study Buddy</h1>
            <p className="mb-6">Upload a photo of your problem set to begin.</p>
            <div className="w-full mb-6">
                <label htmlFor="apiKey" className="text-sm block text-left mb-1">Gemini API Key</label>
                <input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-stone-300 border-2 border-stone-500 p-2 text-black placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your Gemini API Key" />
            </div>
            <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={onFileChange} className="hidden" />
            <Button onClick={() => fileInputRef.current.click()} disabled={!apiKey} className="bg-lime-500 text-black">
                <UploadCloudIcon /> Analyze Problems
            </Button>
        </Card>
    );
}

function MathJaxRenderer({ children }) {
    const ref = useRef();
    useEffect(() => {
        const renderMath = () => {
            if (window.MathJax && ref.current) {
                window.MathJax.typesetClear([ref.current]);
                window.MathJax.typeset([ref.current]);
            }
        };

        if (!window.MathJax) {
            window.MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    packages: {'[+]': ['mhchem']}
                },
                svg: { fontCache: 'global' }
            };
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
            script.async = true;
            script.onload = renderMath;
            document.head.appendChild(script);
        } else {
            renderMath();
        }
    }, [children]);

    return <div ref={ref}>{children}</div>;
}


function QuestionScreen() {
    const { questions, currentQuestionIndex, handleSolutionUpload } = useContext(AppContext);
    const fileInputRef = useRef(null);
    if (!questions || !questions.length) return <div>No questions loaded. Please start over.</div>;
    const question = questions[currentQuestionIndex];
    const onFileChange = (e) => { if (e.target.files?.[0]) handleSolutionUpload(e.target.files[0]); };
    return (
        <Card>
            <div className="text-sm text-black mb-4">Question {currentQuestionIndex + 1} of {questions.length}</div>
            <div className="bg-stone-300 border-2 border-stone-500 p-4 mb-6 text-black text-lg min-h-[120px] flex items-center justify-center">
                <MathJaxRenderer>{question.text}</MathJaxRenderer>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="hidden" />
            <Button onClick={() => fileInputRef.current.click()} className="bg-lime-500 text-black">
                <CameraIcon/> Analyze My Solution
            </Button>
        </Card>
    );
}

function FeedbackScreen() {
    const { feedback, goToNextQuestion, isLoading } = useContext(AppContext);
    if (!feedback) return <LoadingScreen message="Waiting for feedback..." />;

    const FeedbackCard = ({ icon, title, children, colorClass = "" }) => (
        <div className="bg-stone-300 border-2 border-stone-500 p-4 mb-4 text-black">
            <h3 className={`flex items-center text-lg font-bold mb-2 ${colorClass}`}>{icon}<span className="ml-2">{title}</span></h3>
            <div className="space-y-2 text-sm leading-relaxed">{children}</div>
        </div>
    );
    
    return (
        <div className="w-full">
            <div className={`flex items-center p-4 mb-4 border-2 border-black/70 ${feedback.isCorrect ? 'bg-lime-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                {feedback.isCorrect ? <CheckCircleIcon className="h-8 w-8 mr-4" /> : <XCircleIcon className="h-8 w-8 mr-4" />}
                <div>
                    <h2 className="text-xl font-bold">{feedback.isCorrect ? "Correct!" : "Let's review this."}</h2>
                    {!feedback.isCorrect && <p className="text-sm">{feedback.mistakeStep}</p>}
                </div>
            </div>

            <FeedbackCard icon={<LightbulbIcon/>} title="Correct Approach" colorClass="text-green-800"><MathJaxRenderer>{feedback.correctApproach}</MathJaxRenderer></FeedbackCard>
            <FeedbackCard icon={<TargetIcon/>} title="Problem Crux" colorClass="text-yellow-800"><p>{feedback.problemCrux}</p></FeedbackCard>
            {feedback.conceptualGaps && 
                <FeedbackCard icon={<BookOpenIcon/>} title="Conceptual Gaps" colorClass="text-red-800">
                    <p className="font-semibold">{feedback.conceptualGaps.mainConcept}</p>
                    <ul className="list-disc list-inside pl-2">{feedback.conceptualGaps.microConcepts.map((concept, i) => <li key={i}>{concept}</li>)}</ul>
                </FeedbackCard>
            }
            <Button onClick={goToNextQuestion} disabled={isLoading} className="bg-sky-400 text-black mt-4">Next Question</Button>
        </div>
    );
}

function DashboardScreen() {
    const { performanceData, generateNewProblems } = useContext(AppContext);
    const aggregatedGaps = performanceData.reduce((acc, item) => {
        if (item.mainConcept) {
            const set = acc[item.mainConcept] || new Set();
            if(item.microConcepts) item.microConcepts.forEach(mc => set.add(mc));
            acc[item.mainConcept] = set;
        }
        return acc;
    }, {});
    return (
        <Card>
            <h2 className="text-2xl font-bold text-center mb-4 text-black">Session Complete!</h2>
            <p className="text-center mb-6 text-black">Here's a summary of concepts to work on.</p>
            <div className="space-y-4 mb-8">
                {Object.keys(aggregatedGaps).length > 0 ? (
                    Object.entries(aggregatedGaps).map(([main, micros]) => (
                        <div key={main} className="bg-stone-300 border-2 border-stone-500 p-3">
                            <h3 className="font-bold text-sky-800">{main}</h3>
                            <ul className="list-disc list-inside text-black text-sm mt-2">{Array.from(micros).map(mc => <li key={mc}>{mc}</li>)}</ul>
                        </div>
                    ))
                ) : ( <p className="text-center text-stone-600">No problem areas identified yet. Great work!</p> )}
            </div>
            <Button onClick={generateNewProblems} className="bg-lime-500 text-black">
                <TargetIcon /> Start Targeted Practice
            </Button>
        </Card>
    );
}

// --- Font and Global Styles ---
// Using a component to inject global styles into the document head
function GlobalStyles() {
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
            .font-minecraft {
                font-family: 'VT323', monospace;
            }
            body {
                image-rendering: pixelated;
                image-rendering: -moz-crisp-edges;
                image-rendering: crisp-edges;
            }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);
    return null;
}


// --- Main App Wrapper ---
function AppWrapper() {
    return (
        <>
            <GlobalStyles />
            <App />
        </>
    );
}

export default AppWrapper;
