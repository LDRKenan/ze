import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, CheckCircle } from "lucide-react";
import { Progress as ProgressUI } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Course, Progress } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function CoursesPage() {
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<Progress[]>({
    queryKey: ["/api/progress"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ courseId, completed }: { courseId: number; completed: boolean }) => {
      const res = await apiRequest("POST", `/api/progress/${courseId}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  if (coursesLoading || progressLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses</h1>
        {user?.role === "instructor" && (
          <Button>Create Course</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => {
          const courseProgress = progress?.find((p) => p.courseId === course.id);

          return (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {course.title}
                </CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ProgressUI value={courseProgress?.completed ? 100 : 0} className="my-4" />
              </CardContent>

              <CardFooter>
                <Button 
                  variant={courseProgress?.completed ? "secondary" : "default"}
                  className="w-full"
                  onClick={() => updateProgressMutation.mutate({
                    courseId: course.id,
                    completed: !courseProgress?.completed
                  })}
                  disabled={updateProgressMutation.isPending}
                >
                  {updateProgressMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {courseProgress?.completed ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}