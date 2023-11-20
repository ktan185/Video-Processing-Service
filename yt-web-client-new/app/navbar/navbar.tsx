'use client';

import Link from "next/link";
import SignIn from "./sign-in";

import styles from "./navbar.module.css";
import { useEffect, useState } from "react";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import Upload from "./upload";
import { UserProfilePicture } from "./user";
import { useUser } from "../context/UserContext";
import getRandomGreeting from "./greetings/greetings"
import SearchBar from "./searchbar/searchbar";

function createWaveText(text: string) {
  return text.split('').map((char, index) => (
    <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>{char}</span>
  ));
}

function NavBar() {
  // Initialise user state
  const { user, setUser } = useUser();
  const [profilePicture, setProfilePicture] = useState('');
  const [greeting, setGreeting] = useState('');

  // Display a greeting to the user on refresh
  useEffect(() => {
    const randomGreeting = getRandomGreeting();
    setGreeting(randomGreeting);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
      console.log(user);
      const pictureURL = user?.photoURL;
      if (pictureURL) {
        setProfilePicture(pictureURL);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser]);

  return (
    <nav className={styles.nav}>
      <Link href="/">
        <span className={styles.logoContainer}>
          <img className={styles.logo} src="/youtube-logo.svg" alt="YouTube Logo" />
        </span>
      </Link>
      <SearchBar/>
      <div className={styles.rightSide}>
        {user && <p className={styles.wave}>{createWaveText(greeting)}</p>}
        {user && <UserProfilePicture profilePicture={profilePicture}/>}
        {user && <Upload />}
        <SignIn user={user} />
      </div>
    </nav>
  );
}

export default NavBar;
