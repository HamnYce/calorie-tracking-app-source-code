import Login from "@/app/auth/Login";
import { theme } from "@/src/constants/theme/theme";
import "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import LandingPage from "./LandingPage";

if (true) {
  const ip = "172.20.10.9"
  auth().useEmulator(`http://${ip}:9099`);
  firestore().useEmulator(ip, 8080);
}

export default function EntryPage() {
  const [user, setUser] = useState(auth().currentUser);

  useEffect(() => {
    auth().onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const content = user ? <LandingPage /> : <Login />;
  return <PaperProvider theme={theme}>{content}</PaperProvider>;
}
