import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useAuth(resetNavigation = () => {}) {

  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  async function validateUser(user) {

    const { data, error } = await supabase
      .from("usuario")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data;
  }

  useEffect(() => {

    const processUser = async (sessionUser) => {

      setLoadingSession(true);

      if (!sessionUser) {
        setUser(null);
        setLoadingSession(false);
        return;
      }

      const validUser = await validateUser(sessionUser);

      if (!validUser) {

        alert("No autorizado");

        await supabase.auth.signOut();

        setUser(null);
        setLoadingSession(false);

        return;
      }

      setUser({
        ...sessionUser,
        ...validUser
      });

      setLoadingSession(false);
    };

    const checkSession = async () => {

      const { data } = await supabase.auth.getSession();

      await processUser(data?.session?.user);
    };

    checkSession();

    const { data: listener } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {

          setTimeout(() => {
            processUser(session?.user);
          }, 0);
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    resetNavigation("kanban");
  };

  return {
    user,
    loadingSession,
    handleLogout
  };
}