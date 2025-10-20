import React, { useState } from 'react';

const ImageUploadForm = ({ setOcrResult }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('initial');

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatus('initial'); 
      setOcrResult('');
    }
  };

  const handleUpload = async () => {
    if (file) {
      setStatus('uploading');
      console.log('Uploading file...');
  
      const formData = new FormData();
      formData.append('Images', file);
  
      try {
        const result = await fetch('http://localhost:8000/api/v1/extract_text_async', {
          method: 'POST',
          body: formData,
        });
  
        const data = await result.json();
        
        console.log(data);
        if (data && data.length > 0) {
            setOcrResult(data[0].extracted_text);
            setStatus('success');
        } else {
            setStatus('fail');
        }

      } catch (error) {
        console.error(error);
        setStatus('fail');
      }
    }
  };

  const renderStatus = () => {
    if (status === 'uploading') {
      return <p>Uploading...</p>;
    }
    if (status === 'success') {
      return <p>Upload complete!</p>;
    }
    if (status === 'fail') {
      return <p>Upload failed. Please try again.</p>;
    }
    return null;
  };

  return (
    <>
      <div className="input-group">
        <input id="file" type="file" onChange={handleFileChange} />
      </div>
      {file && (
        <section>
          File details:
          <ul className="file-details">
            <li>Name: {file.name}</li>
            <li>Type: {file.type}</li>
            <li>Size: {file.size} bytes</li>
          </ul>
        </section>
      )}

      {file && (
        <button 
          onClick={handleUpload}
          className="submit"
          disabled={status === 'uploading'}
        >
          {status === 'uploading' ? 'Uploading...' : 'Upload a file'}
        </button>
      )}
      
      {renderStatus()}
    </>
  );
};

export default ImageUploadForm;