import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { getSavedPublicProgramUrl, isPwaStandalone } from "../functions/pwaPublicProgram";
import Home from "./Home";

export default function PwaStartPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPwaStandalone()) return undefined;

    const savedProgramUrl = getSavedPublicProgramUrl();
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else if (savedProgramUrl) {
        navigate(savedProgramUrl, { replace: true });
      }
    });
  }, [navigate]);

  return <Home />;
}
