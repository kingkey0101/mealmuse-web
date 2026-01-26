"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";

export default function DebugSession() {
  useEffect(() => {
    async function check() {
      const session = await getSession();
      console.log("SESSION:", session);
    }
    check();
  }, []);

  return <div>Check the console</div>;
}
