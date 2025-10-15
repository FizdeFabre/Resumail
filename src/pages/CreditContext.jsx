import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";

const CreditContext = createContext();

export function CreditProvider({ children }) {
  const [credits, setCredits] = useState(null);
  const isMounted = useRef(true);

  // --- Fetch depuis la DB ---
  async function fetchCredits(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (isMounted.current && data) {
        setCredits(data.credits);
        localStorage.setItem("credits", data.credits);
      }
    } catch (err) {
      console.warn("[CreditContext] fetchCredits failed:", err.message);
    }
  }

  // --- Update via RPC (ex: achat, analyse, etc.) ---
  async function updateCredits(userId, amount) {
    try {
      const { data, error } = await supabase.rpc("increment_credits", {
        uid: userId,
        delta: amount,
      });
      if (error) throw error;
      if (isMounted.current) {
        setCredits(data);
        localStorage.setItem("credits", data);
      }
    } catch (err) {
      console.error("[CreditContext] updateCredits error:", err.message);
    }
  }

  // --- Auto-fetch au montage + cache local ---
  useEffect(() => {
    isMounted.current = true;

    const cached = localStorage.getItem("credits");
    if (cached !== null) setCredits(Number(cached));

    const loadCredits = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (user) await fetchCredits(user.id);
    };
    loadCredits();

    // --- Realtime sync ---
    const channel = supabase
      .channel("credits-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const newCredits = payload.new?.credits;
          if (newCredits !== undefined) {
            setCredits(newCredits);
            localStorage.setItem("credits", newCredits);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <CreditContext.Provider value={{ credits, fetchCredits, updateCredits }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditContext);
}