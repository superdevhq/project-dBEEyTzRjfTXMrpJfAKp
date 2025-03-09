
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WorkoutCharts from "@/components/WorkoutCharts";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChartsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleAddProgress = () => {
    navigate("/add-progress");
  };

  const handleAddMeasurement = () => {
    navigate("/add-measurement");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Progress Tracking</h1>
        <Tabs defaultValue="progress" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress">Exercise Progress</TabsTrigger>
            <TabsTrigger value="measurements">Body Measurements</TabsTrigger>
          </TabsList>
          <TabsContent value="progress">
            <Button 
              onClick={handleAddProgress}
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exercise Progress
            </Button>
          </TabsContent>
          <TabsContent value="measurements">
            <Button 
              onClick={handleAddMeasurement}
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Body Measurement
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <WorkoutCharts />
      </div>
    </div>
  );
};

export default ChartsPage;
