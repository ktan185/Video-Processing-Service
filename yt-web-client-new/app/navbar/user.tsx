import { SVGProps } from "react"
import styles from "./user.module.css"

interface UserprofileProps extends SVGProps<SVGImageElement> {
  profilePicture: string
}

export const Userprofile = ({ profilePicture, ...rest }: UserprofileProps) => {
  return (
    <>
      <label htmlFor="upload" className={styles.profilePicture}>
        <img src={profilePicture} alt="user" {...rest as any} />
      </label>
    </>
  )
}
