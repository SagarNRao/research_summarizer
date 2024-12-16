"use client";
import React from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Main() {
  interface wikiSearchRes {
    title: string;
  }

  const [searchQuery, setSearchQuery] = useState<string>("");

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
      console.log(titles); // Log the titles
  
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
        console.log(`Content for ${title}:`, pageContent); // Log the page content for each title
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        callAPI();
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
  );
}
