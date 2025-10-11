import { useState } from 'react';
import './App.css';
import ImageUploadForm from './ImageUploadForm.jsx';

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

  return (
    <>
      <h1>Vision Text: Image to Text (OCR)</h1>

      <ImageUploadForm setOcrResult={setOcrResult} />

      <OcrResult text={ocrResult} />

      <p className="read-the-docs">This Vision Text powered by Vite and React.</p>
    </>
  );
}

export default App;