
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ProfessionalRegistration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard/professional");
  }, [navigate]);

  return null;
};

export default ProfessionalRegistration;
