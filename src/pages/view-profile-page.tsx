import { useParams } from "react-router-dom";
import ProfileView from "../components/profile-view";

export default function ViewProfilePage() {
  const { userId = "" } = useParams();

  return (
    <div>
      <ProfileView userId={userId} />
    </div>
  );
}
