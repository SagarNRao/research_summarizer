import React from "react";
import { summary } from "../Main/page";

export default function Summary() {
  return (
    <>
      <section className="flex flex-col justify-center items-center h-screen text-center px-16 md:px-40">
        <h1 className="font-bold text-4xl text-left">Here's your summary</h1>
        <div className="text-left">{summary}</div>
      </section>
    </>
  );
}
