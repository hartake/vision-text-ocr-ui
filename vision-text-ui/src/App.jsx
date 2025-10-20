import { useState } from 'react';
import './App.css';
import ImageUploadForm from './ImageUploadForm.jsx';
import FeedbackForm from './FeedbackForm.jsx';

// Simple component to display the OCR result
const OcrResult = ({ text }) => {
  if (!text) return null;
  return (
    <div className="ocr-result">
      <h2>Extracted Text:</h2>
      <div className="ocr-result-text">
        <p>{text}</p>
      </div>
    </div>
  );
};

function App() {
  const [ocrResult, setOcrResult] = useState('');
  const [view, setView] = useState('ocr'); // 'ocr' or 'feedback'

  return (
    <>
      <nav className="navbar">
        <button onClick={() => setView('ocr')}>OCR</button>
        <button onClick={() => setView('feedback')}>Feedback</button>
      </nav>

      <h1>Vision Text: Image to Text (OCR)</h1>

      {view === 'ocr' ? (
        <>
          <ImageUploadForm setOcrResult={setOcrResult} />
          <OcrResult text={ocrResult} />
        </>
      ) : (
        <FeedbackForm />
      )}

      <p className="read-the-docs">This Vision Text powered by Vite and React.</p>
    </>
  );
}

export default App;