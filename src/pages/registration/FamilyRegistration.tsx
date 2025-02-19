
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const FamilyRegistration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard/family");
  }, [navigate]);

  return null;
};

export default FamilyRegistration;
