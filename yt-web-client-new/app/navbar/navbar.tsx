'use client';

import Link from "next/link";
import SignIn from "./sign-in";

import styles from "./navbar.module.css";
import { useEffect, useState } from "react";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import Upload from "./upload";
import { UserProfile } from "./user";
import { useUser } from "../context/UserContext";

function NavBar() {
  // Initialise user state
  const { user, setUser } = useUser();
  const [profilePicture, setProfilePicture] = useState('');


  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
      console.log(user);
      console.log('This is their photo link: ',user?.photoURL)
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
      <div className={styles.userActions}>
        {user && <UserProfile profilePicture ={profilePicture}/>}
        {user && <Upload />}
        <SignIn user={user} />
      </div>
    </nav>
  );
}

export default NavBar;
