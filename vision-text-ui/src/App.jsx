import { useState } from 'react';
import './App.css';
import ImageUploadForm from './ImageUploadForm.jsx';
import FeedbackForm from './FeedbackForm.jsx';

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
  const [activeTab, setActiveTab] = useState('ocr');

  return (
    <>
      <h1>Vision Text: Image to Text (OCR)</h1>

      <div className="tabs">
        <button
          onClick={() => setActiveTab('ocr')}
          className={activeTab === 'ocr' ? 'active' : ''}
        >
          OCR
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={activeTab === 'feedback' ? 'active' : ''}
        >
          Feedback
        </button>
      </div>

      {activeTab === 'ocr' ? (
        <>
          <ImageUploadForm setOcrResult={setOcrResult} />

          <OcrResult text={ocrResult} />
        </>
      ) : (
        <FeedbackForm />
      )}

      <p className="read-the-docs">
        This Vision Text powered by Vite and React.
      </p>
    </>
  );
}

export default App;