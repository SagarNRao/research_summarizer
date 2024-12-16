const { getTranscript } = require('youtube-transcript');

async function fetchTranscript(videoId) {
    try {
        const transcript = await fetchTranscript(videoId);
        console.log(transcript);
    } catch (error) {
        console.error('Error fetching transcript:', error);
    }
}

// Replace 'VIDEO_ID' with the actual YouTube video ID
const videoId = 'bki8FteQa-Q'; // Example video ID
fetchTranscript(videoId);