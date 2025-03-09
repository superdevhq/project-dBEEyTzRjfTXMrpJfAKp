
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AddProgressForm from "@/components/AddProgressForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AddProgressPage = () => {
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
        <h1 className="text-3xl font-bold">Add Exercise Progress</h1>
      </div>

      <AddProgressForm />
    </div>
  );
};

export default AddProgressPage;
