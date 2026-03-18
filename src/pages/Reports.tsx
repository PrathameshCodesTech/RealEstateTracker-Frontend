import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projects, tasks, hurdles, departmentStats } from "@/data/demo-data";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

const delayByProject = projects.map(p => ({
  name: p.name.split(' ')[0],
  delayed: tasks.filter(t => t.projectId === p.id && t.delayDays > 0).length,
  totalDelay: tasks.filter(t => t.projectId === p.id).reduce((a, t) => a + t.delayDays, 0),
}));

const progressData = [
  { month: 'Sep', marine: 25, skyline: 5, palm: 0 },
  { month: 'Oct', marine: 28, skyline: 8, palm: 0 },
  { month: 'Nov', marine: 32, skyline: 12, palm: 2 },
  { month: 'Dec', marine: 35, skyline: 16, palm: 3 },
  { month: 'Jan', marine: 38, skyline: 20, palm: 5 },
  { month: 'Feb', marine: 40, skyline: 24, palm: 6 },
  { month: 'Mar', marine: 42, skyline: 28, palm: 8 },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Analytics and insights</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Progress Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={progressData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="marine" name="Marine Heights" stroke="hsl(224, 76%, 48%)" strokeWidth={2} />
                <Line type="monotone" dataKey="skyline" name="Skyline" stroke="hsl(152, 60%, 42%)" strokeWidth={2} />
                <Line type="monotone" dataKey="palm" name="Palm Gardens" stroke="hsl(38, 92%, 50%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Delay Analysis</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={delayByProject}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="delayed" name="Delayed Tasks" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalDelay" name="Total Delay Days" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="font-display text-lg">Department Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentStats}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="hsl(152, 60%, 42%)" stackId="a" />
                <Bar dataKey="inProgress" name="In Progress" fill="hsl(38, 92%, 50%)" stackId="a" />
                <Bar dataKey="delayed" name="Delayed" fill="hsl(0, 72%, 51%)" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
