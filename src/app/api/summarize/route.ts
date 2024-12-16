import { NextRequest } from "next/server";

import { YoutubeTranscript } from 'youtube-transcript';

YoutubeTranscript.fetchTranscript('videoId or URL').then(console.log);
