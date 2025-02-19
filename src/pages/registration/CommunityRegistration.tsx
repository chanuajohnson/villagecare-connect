
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CommunityRegistration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard/community");
  }, [navigate]);

  return null;
};

export default CommunityRegistration;
