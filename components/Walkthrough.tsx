"use client";

import React, { useState, useEffect } from "react";
import { Joyride, STATUS, Step, EventData } from "react-joyride";

export function Walkthrough({ ownerName }: { ownerName?: string }) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run on the client side
    const hasSeenTour = localStorage.getItem("hasSeenTour_v1");
    if (!hasSeenTour) {
      // Small delay to let canvas and UI mount
      setTimeout(() => setRun(true), 1500);
    }
  }, []);

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("hasSeenTour_v1", "true");
    }
  };

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Welcome to {ownerName ? `${ownerName}'s` : "E-Shirt"} Signout! 🎉</h2>
          <p className="text-slate-600">This quick tour will show you how to use the 3D shirt canvas. Let's get started!</p>
        </div>
      ),
      placement: "center",
      skipBeacon: true,
    },
    {
      target: ".tour-action-bar",
      content: (
        <div>
          <h3 className="font-bold text-slate-800 mb-1">Draw or Move</h3>
          <p className="text-slate-600">Switch between <span className="font-bold">Draw</span> mode to sign the shirt, and <span className="font-bold">Move</span> mode to rotate and view all sides.</p>
        </div>
      ),
      placement: "left",
    },
    {
      target: ".tour-color-picker",
      content: (
        <div>
          <h3 className="font-bold text-slate-800 mb-1">Choose Your Style</h3>
          <p className="text-slate-600">Pick a color, adjust the pen size, or grab the eraser here. You can also undo mistakes!</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: ".tour-share-buttons",
      content: (
        <div>
          <h3 className="font-bold text-slate-800 mb-1">Share with Friends</h3>
          <p className="text-slate-600">Click <span className="font-bold">Share Link</span> to invite others to sign your shirt, or <span className="font-bold">Snapshot</span> to download a picture!</p>
        </div>
      ),
      placement: "bottom",
    }
  ];

  return (
    <Joyride
      onEvent={handleJoyrideEvent}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        primaryColor: "#6B21A8", // Primary purple from the app
        textColor: "#1e293b", // slate-800
        zIndex: 10000,
        showProgress: true,
        buttons: ["back", "skip", "primary"]
      }}
      styles={{
        tooltipContainer: {
          textAlign: "left",
        },
        buttonPrimary: {
          backgroundColor: "#6B21A8",
          borderRadius: "8px",
        },
        buttonBack: {
          color: "#64748b",
        },
        buttonSkip: {
          color: "#64748b",
        }
      }}
    />
  );
}
