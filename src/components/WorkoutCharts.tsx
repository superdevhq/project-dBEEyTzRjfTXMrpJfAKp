
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format, subDays, subMonths } from "date-fns";

interface ExerciseProgress {
  id: string;
  exercise_id: string;
  exercise_name: string;
  date: string;
  weight: number;
  reps: number;
  sets: number;
}

interface BodyMeasurement {
  id: string;
  date: string;
  weight: number;
  body_fat_percentage: number;
  chest: number;
  waist: number;
  hips: number;
  biceps: number;
  thighs: number;
}

interface Exercise {
  id: string;
  name: string;
}

const WorkoutCharts = () => {
  const [activeTab, setActiveTab] = useState("exercise-progress");
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [selectedBodyMetric, setSelectedBodyMetric] = useState("weight");
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch exercises for the dropdown
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from('exercises_library')
          .select('id, name')
          .order('name');

        if (error) throw error;

        if (data && data.length > 0) {
          setExercises(data);
          setSelectedExercise(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast({
          title: "Error",
          description: "Failed to load exercises",
          variant: "destructive",
        });
      }
    };

    fetchExercises();
  }, [toast]);

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "30days":
        startDate = subDays(now, 30);
        break;
      case "3months":
        startDate = subMonths(now, 3);
        break;
      case "6months":
        startDate = subMonths(now, 6);
        break;
      case "1year":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return {
      start: startDate.toISOString(),
      end: now.toISOString(),
    };
  };

  // Fetch exercise progress data
  useEffect(() => {
    if (!selectedExercise) return;

    const fetchExerciseProgress = async () => {
      setLoading(true);
      const { start, end } = getDateRange();

      try {
        const { data, error } = await supabase
          .from('exercise_progress')
          .select(`
            id,
            exercise_id,
            date,
            weight,
            reps,
            sets,
            exercises_library(name)
          `)
          .eq('exercise_id', selectedExercise)
          .gte('date', start)
          .lte('date', end)
          .order('date');

        if (error) throw error;

        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            exercise_id: item.exercise_id,
            exercise_name: item.exercises_library.name,
            date: format(new Date(item.date), 'MMM dd'),
            weight: item.weight,
            reps: item.reps,
            sets: item.sets
          }));
          
          setExerciseProgress(formattedData);
        }
      } catch (error) {
        console.error('Error fetching exercise progress:', error);
        toast({
          title: "Error",
          description: "Failed to load exercise progress data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseProgress();
  }, [selectedExercise, timeRange, toast]);

  // Fetch body measurements data
  useEffect(() => {
    const fetchBodyMeasurements = async () => {
      setLoading(true);
      const { start, end } = getDateRange();

      try {
        const { data, error } = await supabase
          .from('body_measurements')
          .select('*')
          .gte('date', start)
          .lte('date', end)
          .order('date');

        if (error) throw error;

        if (data) {
          const formattedData = data.map(item => ({
            ...item,
            date: format(new Date(item.date), 'MMM dd')
          }));
          
          setBodyMeasurements(formattedData);
        }
      } catch (error) {
        console.error('Error fetching body measurements:', error);
        toast({
          title: "Error",
          description: "Failed to load body measurement data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "body-measurements") {
      fetchBodyMeasurements();
    }
  }, [activeTab, timeRange, toast]);

  // Get the appropriate data for the selected metric
  const getChartData = () => {
    if (activeTab === "exercise-progress") {
      return exerciseProgress;
    } else {
      return bodyMeasurements;
    }
  };

  // Get the appropriate metric for the chart
  const getMetricKey = () => {
    if (activeTab === "exercise-progress") {
      return selectedMetric;
    } else {
      return selectedBodyMetric;
    }
  };

  // Get the label for the selected metric
  const getMetricLabel = () => {
    const metricMap: Record<string, string> = {
      weight: "Weight (lbs)",
      reps: "Repetitions",
      sets: "Sets",
      body_fat_percentage: "Body Fat %",
      chest: "Chest (in)",
      waist: "Waist (in)",
      hips: "Hips (in)",
      biceps: "Biceps (in)",
      thighs: "Thighs (in)"
    };

    return metricMap[getMetricKey()] || getMetricKey();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Progress Charts</CardTitle>
        <CardDescription>Track your fitness progress over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exercise-progress">Exercise Progress</TabsTrigger>
            <TabsTrigger value="body-measurements">Body Measurements</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="w-full md:w-1/3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeTab === "exercise-progress" && (
              <>
                <div className="w-full md:w-1/3">
                  <Select value={selectedExercise || ""} onValueChange={setSelectedExercise}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map(exercise => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-1/3">
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="reps">Repetitions</SelectItem>
                      <SelectItem value="sets">Sets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activeTab === "body-measurements" && (
              <div className="w-full md:w-1/3">
                <Select value={selectedBodyMetric} onValueChange={setSelectedBodyMetric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="body_fat_percentage">Body Fat %</SelectItem>
                    <SelectItem value="chest">Chest</SelectItem>
                    <SelectItem value="waist">Waist</SelectItem>
                    <SelectItem value="hips">Hips</SelectItem>
                    <SelectItem value="biceps">Biceps</SelectItem>
                    <SelectItem value="thighs">Thighs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <TabsContent value="exercise-progress" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading data...</p>
              </div>
            ) : exerciseProgress.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p>No data available for the selected exercise and time range.</p>
              </div>
            ) : (
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={getMetricKey()}
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="body-measurements" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading data...</p>
              </div>
            ) : bodyMeasurements.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p>No body measurement data available for the selected time range.</p>
              </div>
            ) : (
              <div className="h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={getMetricKey()}
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkoutCharts;
