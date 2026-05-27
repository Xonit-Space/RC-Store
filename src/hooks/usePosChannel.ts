"use client";

import { useEffect, useRef } from "react";

export type PosMessage =
  | { type: "FEATURE_TOGGLE"; enabled: boolean } 
  | { type: "CUSTOMER_SELECTED"; customer: any }
  | { type: "CUSTOMER_CLEARED" }
  | { type: "ORDER_UPDATED"; items: any[]; subtotal: number; total: number }
  | { type: "ORDER_CLEARED" }
  | { type: "PAYMENT_DONE"; total: number }
  | { type: "PAYMENT_SUMMARY"; summary: any }
  | { type: "ORDER_CONFIRMED" };

const CHANNEL_NAME = "pos-customer-display";

export function usePosChannel(onMessage: (msg: PosMessage) => void) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const callbackRef = useRef(onMessage);

  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.onmessage = (e) => callbackRef.current(e.data as PosMessage);
    return () => channel.close();
  }, []);

  const send = (msg: PosMessage) => {
    channelRef.current?.postMessage(msg);
  };

  return { send };
}
