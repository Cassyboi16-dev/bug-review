import React from "react";
import programmerMp4 from "/public/programmer.mp4";

export default function Video() {
  return (
    <main className="bg-black text-white min-h-dvh relative overflow-hidden">
      <video
        src={programmerMp4}
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover -z-10"
      ></video>
    </main>
  );
}
