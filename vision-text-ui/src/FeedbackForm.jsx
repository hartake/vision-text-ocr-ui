import { useState } from 'react';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setMessage('Feedback cannot be empty.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: feedback }),
      });

      if (response.ok) {
        setMessage('Feedback submitted successfully!');
        setFeedback('');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message || 'Something went wrong.'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="feedback-form">
      <h2>Feedback</h2>
      <p>We would love to hear your feedback!</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback here..."
          rows="5"
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
        ></textarea>
        <button type="submit" style={{ marginTop: '10px' }}>
          Submit Feedback
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FeedbackForm;
