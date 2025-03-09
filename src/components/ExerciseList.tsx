
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { DATA_UPDATED_EVENT } from "@/pages/Index";
import ExerciseEditDialog from "@/components/ExerciseEditDialog";

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  description?: string;
}

const ExerciseList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchExercises();

    // Listen for data update events
    const handleDataUpdate = () => {
      fetchExercises();
    };

    window.addEventListener(DATA_UPDATED_EVENT, handleDataUpdate);
    return () => {
      window.removeEventListener(DATA_UPDATED_EVENT, handleDataUpdate);
    };
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setExercises(data);
        setFilteredExercises(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(ex => ex.category)));
        setCategories(["All", ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Error loading exercises",
        description: "There was a problem loading the exercise library.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter exercises based on search query and selected category
    let filtered = exercises;
    
    if (searchQuery) {
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(ex => ex.category === selectedCategory);
    }
    
    setFilteredExercises(filtered);
  }, [searchQuery, selectedCategory, exercises]);

  const handleAddToWorkout = (exercise: Exercise) => {
    // This is a placeholder for future functionality
    // Could dispatch an event that the workout form listens to
    toast({
      title: "Feature coming soon",
      description: `"${exercise.name}" will be added to your workout in a future update.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Exercise Library</CardTitle>
        <CardDescription>Browse and search for exercises to add to your workouts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Exercise list */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredExercises.length > 0 ? (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium">{exercise.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {exercise.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                        {exercise.muscle_group}
                      </span>
                    </div>
                    {exercise.description && (
                      <p className="text-sm text-muted-foreground mt-1">{exercise.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <ExerciseEditDialog 
                      exercise={exercise} 
                      onSuccess={fetchExercises} 
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleAddToWorkout(exercise)}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No exercises found matching your search.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseList;
