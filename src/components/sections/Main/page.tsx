"use client";
import React from "react";
import { YoutubeTranscript } from "youtube-transcript";
import axios from "axios";
import { Redirect } from "next";

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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { redirect } from "next/navigation";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_KEY as string
);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export let summary: string = "";

export default function Main() {
  interface wikiSearchRes {
    titleForURL: string;
    title: string;
    content: string;
    url: string;
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
  const [researchInputTITLES, setResearchInputTITLES] = useState<string[]>([]);
  const [generatingSummary, setGeneratingSummary] = useState<boolean>(true);

  const callAPI = async () => {
    const params: { [key: string]: string } = {
      action: "query",
      prop: "extracts|info",
      inprop: "url",
      list: "search",
      srsearch: searchQuery,
      srlimit: "7",
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
        console.log(contentData);
        const pageId = Object.keys(contentData.query.pages)[0];
        const pageContent = contentData.query.pages[pageId].extract;
        let titleForURL = title;
        titleForURL = titleForURL.replace(/\s+/g, "_");
        const pageURL = "https://en.wikipedia.org/wiki/" + titleForURL;
        // console.log(contentURLS)

        setWikiSearchResults((prevResults) => [
          ...prevResults,
          {
            titleForURL: titleForURL,
            title,
            content: pageContent,
            url: pageURL,
          },
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
  const addResearchInputTITLES = (data: string) => {
    console.log("research input here ");
    setResearchInputTITLES((prevInput) => [...prevInput, data]);
    console.log(researchInputTITLES);
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

  function ResearchInput() {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">View Input</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Research Input</SheetTitle>
            <SheetDescription>
              View your input before summarizing
            </SheetDescription>
            {researchInputTITLES.map((title, index) => (
              <div key={index}>
                <CardHeader>{title}</CardHeader>
                <Separator />
              </div>
            ))}
          </SheetHeader>

          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit" onClick={TheBigSummarize}>
                Summarize
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  const TheBigSummarize = async () => {
    console.log(researchInput);

    const result = await model.generateContent(researchInput + "\nsummarize the wikipedia pages and use the transcripts in the youtube videos(if any)");
    setGeneratingSummary(false);
    console.log(result.response.text());
    summary = result.response.text();
    redirect("/Summary");
  };

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
          <Button type="submit">Search</Button>
          <ResearchInput></ResearchInput>
        </div>
      </form>

      {/* <Button onClick={}>CLEAR INPUT</Button> */}

      <div className="flex">
        <div>
          {wikiSearchResults.map((item: wikiSearchRes, index) => (
            <Card key={index}>
              <CardHeader>
                <>
                  {item.title}
                  <Badge variant="default">Wikipedia</Badge>
                </>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => {
                    addResearchInputTITLES(item.titleForURL);
                    addResearchInput(item.url as string);
                  }}
                >
                  Add as input
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="p-5"></div>
        <div>
          {YTSearchResults.map((item: YTMTrack, index) => (
            <Card key={index}>
              <CardHeader>
                <>
                  {item.finalTitle}
                  <Badge variant="youtube">YouTube</Badge>
                </>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => {
                    addResearchInputTITLES(item.finalTitle);
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
