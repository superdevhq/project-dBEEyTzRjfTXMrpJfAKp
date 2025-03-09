
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AddMeasurementForm from "@/components/AddMeasurementForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AddMeasurementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/charts")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Charts
        </Button>
        <h1 className="text-3xl font-bold">Add Body Measurements</h1>
      </div>

      <AddMeasurementForm />
    </div>
  );
};

export default AddMeasurementPage;
