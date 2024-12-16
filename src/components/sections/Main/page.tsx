"use client";
import React from "react";
import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";
// import json

import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Main() {
  interface wikiSearchRes {
    title: string;
    content: string;
  }

  interface YTMTrack {
    snippet: {
      title: string | undefined;
    };
    id: {
      videoId: string | undefined;
    };

    finalTitle: string;
    finalID: string;
  }

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [wikiSearchResults, setWikiSearchResults] = useState<wikiSearchRes[]>(
    []
  );
  const [YTSearchResults, setYTSearchResults] = useState<YTMTrack[]>([]);

  const [researchInput, setResearchInput] = useState<string>("");

  const callAPI = async () => {
    const params: { [key: string]: string } = {
      action: "query",
      list: "search",
      srsearch: searchQuery,
      srlimit: "5",
      format: "json",
      origin: "*",
    };

    let url = "https://simple.wikipedia.org/w/api.php";
    url += "?" + new URLSearchParams(params).toString();

    try {
      const response = await fetch(url, {
        method: "GET",
      });
      const data = await response.json();
      const titles = data.query.search.map((item: any) => item.title); // Extract titles from the response
      // console.log(titles); // Log the titles

      for (const title of titles) {
        const contentParams: { [key: string]: string } = {
          action: "query",
          prop: "extracts",
          titles: title, // Get content of each result
          format: "json",
          origin: "*",
          explaintext: "true", // Get plain text extract
        };

        let contentUrl = "https://simple.wikipedia.org/w/api.php";
        contentUrl += "?" + new URLSearchParams(contentParams).toString();

        const contentResponse = await fetch(contentUrl, {
          method: "GET",
        });
        const contentData = await contentResponse.json();
        const pageId = Object.keys(contentData.query.pages)[0];
        const pageContent = contentData.query.pages[pageId].extract;

        setWikiSearchResults((prevResults) => [
          ...prevResults,
          { title, content: contentData.query.pages[pageId].extract },
        ]);

        // console.log(`Content for ${title}:`, pageContent); // Log the page content for each title
      }

      console.log("here");
      console.log(wikiSearchResults);
    } catch (error) {
      console.log(error);
    }
  };

  const extractVideoID = (parsedData: any) => {
    console.log("eh?");
    try {
      const YTSearchResults: YTMTrack[] = parsedData.items.map(
        (items: YTMTrack) => {
          const title = items.snippet.title;
          const videoId = items.id.videoId;

          return {
            snippet: {
              title: title,
            },
            id: {
              videoId: videoId,
            },
            finalTitle: title,
            finalID: videoId,
          };
        }
      );
      console.log("YT SEARCH RESULTS HERE GUYZ");
      setYTSearchResults(YTSearchResults);
    } catch (e) {
      console.error("ERROR IS", e);
    }
  };

  const YTSearch = async () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      console.error("Google API key is missing");
      return;
    }

    if (!searchQuery) {
      console.error("Search query is empty");
      return;
    }

    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
            q: searchQuery,
            part: "snippet",
          },
        }
      );
      const data = response.data;
      extractVideoID(data);
      console.log("Is it here?");
      console.log(data);
    } catch (error) {
      console.error("Error fetching data from YouTube API", error);
    }
  };

  const addResearchInput = (data: string) => {
    console.log("research input here ");
    setResearchInput((prevInput) => prevInput + data + "\n");
    console.log(researchInput);
  };

  const addYTResearchInput = (data: string) => {
    console.log("YT research input here");
    const baseYTURL = `https://www.youtube.com/watch?v=${data}`;
    setResearchInput((prevInput) => prevInput + baseYTURL + "\n");
    console.log(researchInput);
  };

  useEffect(() => {
    console.log(researchInput);
  }, [researchInput]);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          callAPI();
          YTSearch();
        }}
      >
        <div className="flex">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">Here</Button>
        </div>
      </form>

      {/* <Button onClick={}>CLEAR INPUT</Button> */}

      <div className="flex">
        <div>
          {wikiSearchResults.map((item: wikiSearchRes, index) => (
            <Card key={index}>
              <CardHeader>{item.title}</CardHeader>
              <CardFooter>
                <Button
                  onClick={() => {
                    addResearchInput(item.content);
                  }}
                >
                  Add as input
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div>
          {YTSearchResults.map((item: YTMTrack, index) => (
            <Card key={index}>
              <CardHeader>{item.finalTitle}re</CardHeader>
              <CardFooter>
                <Button
                  onClick={() => {
                    addYTResearchInput(item.finalID);
                  }}
                >
                  Add as input
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
