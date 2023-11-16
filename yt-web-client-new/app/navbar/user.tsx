import styles from "./user.module.css"

interface UserProfileProps {
  profilePicture: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profilePicture }) => {
  return (
    <>
      <label className={styles.profilePicture}>
        <img src={profilePicture} alt="user" />
      </label>
    </>
  );
}


