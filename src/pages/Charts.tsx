
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WorkoutCharts from "@/components/WorkoutCharts";
import AddBodyMeasurementForm from "@/components/AddBodyMeasurementForm";
import AddExerciseProgressForm from "@/components/AddExerciseProgressForm";
import { useAuth } from "@/contexts/AuthContext";
import { DATA_UPDATED_EVENT } from "./Index";

const Charts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleDataUpdate = () => {
    // Trigger a refresh of the charts
    setRefreshKey(prev => prev + 1);
    
    // Dispatch the data updated event to refresh other components if needed
    window.dispatchEvent(new CustomEvent(DATA_UPDATED_EVENT));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Progress Charts</h1>
        <Button onClick={() => navigate("/")} variant="outline">Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <WorkoutCharts key={refreshKey} />

        <Card>
          <CardHeader>
            <CardTitle>Add Progress Data</CardTitle>
            <CardDescription>
              Record your exercise progress and body measurements to see them in the charts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <AddExerciseProgressForm onSuccess={handleDataUpdate} />
              <AddBodyMeasurementForm onSuccess={handleDataUpdate} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Charts;
