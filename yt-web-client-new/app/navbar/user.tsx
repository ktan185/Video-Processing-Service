import styles from "./user.module.css"

interface UserProfileProps {
  displayName?: string,
  profilePicture: string;
}

export const UserProfilePicture: React.FC<UserProfileProps> = ({ profilePicture }) => {
  return (
    <>
      <label className={styles.profilePicture}>
        <img src={profilePicture} alt="user" />
      </label>
    </>
  );
}

export const UserProfile: React.FC<UserProfileProps> = ({ displayName, profilePicture }) => {
  return (
    <>
      <label className={styles.videoPicture}>
        <img src={profilePicture} alt="user" />
        {displayName}
      </label>
    </>
  );
}


