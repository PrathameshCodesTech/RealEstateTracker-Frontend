import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { tasks, hurdles, getProjectById, getTowerById } from "@/data/demo-data";
import { AlertTriangle, TrendingUp, Clock, Shield, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Delay prediction algorithm
function calculateRiskScore(task: typeof tasks[0]) {
  let score = 0;

  // Base: historical delay pattern
  if (task.delayDays > 0) score += Math.min(task.delayDays * 3, 30);

  // Dependency chain risk
  const deps = tasks.filter(t => task.dependencies.includes(t.id));
  const delayedDeps = deps.filter(d => d.status === 'delayed' || d.status === 'blocked');
  score += delayedDeps.length * 15;

  // Active hurdles on same tower
  const towerHurdles = hurdles.filter(h => {
    const affectedTask = tasks.find(t => t.id === h.affectedTaskId);
    return affectedTask?.towerId === task.towerId && h.status !== 'resolved';
  });
  score += towerHurdles.length * 10;
  score += towerHurdles.filter(h => h.severity === 'critical').length * 10;

  // Progress vs timeline risk
  if (task.startDate && task.endDate) {
    const start = new Date(task.startDate).getTime();
    const end = new Date(task.endDate).getTime();
    const now = Date.now();
    const totalDuration = end - start;
    const elapsed = now - start;
    const expectedProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const progressGap = expectedProgress - task.progress;
    if (progressGap > 20) score += 20;
    else if (progressGap > 10) score += 10;
  }

  // Critical path multiplier
  if (task.criticalPath) score = Math.round(score * 1.3);

  // Status penalties
  if (task.status === 'blocked') score += 25;
  if (task.status === 'delayed') score += 20;

  return Math.min(100, Math.max(0, score));
}

function getRiskLevel(score: number): { label: string; color: string; badgeClass: string } {
  if (score >= 60) return { label: 'High Risk', color: 'text-destructive', badgeClass: 'bg-destructive text-destructive-foreground' };
  if (score >= 30) return { label: 'Medium Risk', color: 'text-warning', badgeClass: 'bg-warning text-warning-foreground' };
  return { label: 'Low Risk', color: 'text-success', badgeClass: 'bg-success text-success-foreground' };
}

const DelayPrediction = () => {
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const predictions = activeTasks.map(task => ({
    task,
    riskScore: calculateRiskScore(task),
    risk: getRiskLevel(calculateRiskScore(task)),
    project: getProjectById(task.projectId),
    tower: getTowerById(task.towerId),
  })).sort((a, b) => b.riskScore - a.riskScore);

  const highRisk = predictions.filter(p => p.riskScore >= 60);
  const mediumRisk = predictions.filter(p => p.riskScore >= 30 && p.riskScore < 60);
  const lowRisk = predictions.filter(p => p.riskScore < 30);

  const riskByDept = Object.entries(
    predictions.reduce((acc, p) => {
      const dept = p.task.department;
      if (!acc[dept]) acc[dept] = { high: 0, medium: 0, low: 0 };
      if (p.riskScore >= 60) acc[dept].high++;
      else if (p.riskScore >= 30) acc[dept].medium++;
      else acc[dept].low++;
      return acc;
    }, {} as Record<string, { high: number; medium: number; low: number }>)
  ).map(([name, data]) => ({ name, ...data }));

  const riskTrend = [
    { week: 'W1', risk: 28 }, { week: 'W2', risk: 35 }, { week: 'W3', risk: 42 },
    { week: 'W4', risk: 38 }, { week: 'W5', risk: 52 }, { week: 'W6', risk: 48 },
    { week: 'W7', risk: 55 }, { week: 'W8', risk: 60 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Delay Prediction Engine</h1>
        <p className="text-muted-foreground mt-1">AI-powered construction delay forecasting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{highRisk.length}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{mediumRisk.length}</p>
                <p className="text-xs text-muted-foreground">Medium Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{lowRisk.length}</p>
                <p className="text-xs text-muted-foreground">Low Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{Math.round(predictions.reduce((a, p) => a + p.riskScore, 0) / predictions.length)}</p>
                <p className="text-xs text-muted-foreground">Avg Risk Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Risk Trend (8 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="risk" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 4 }} name="Risk Index" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk by Department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Risk by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskByDept} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="high" stackId="a" fill="hsl(0, 72%, 51%)" name="High" />
                <Bar dataKey="medium" stackId="a" fill="hsl(38, 92%, 50%)" name="Medium" />
                <Bar dataKey="low" stackId="a" fill="hsl(152, 60%, 42%)" radius={[0, 4, 4, 0]} name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Tasks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Critical Risk Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {predictions.slice(0, 10).map(({ task, riskScore, risk, project, tower }) => (
            <Dialog key={task.id}>
              <DialogTrigger asChild>
                <div className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`text-xl font-display font-bold ${risk.color}`}>{riskScore}</div>
                    <Badge className={`text-[9px] ${risk.badgeClass}`}>{risk.label}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {project?.name} · {tower?.name} · {task.department}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Progress value={task.progress} className="h-1.5 flex-1 max-w-[120px]" />
                      <span className="text-xs text-muted-foreground">{task.progress}%</span>
                      {task.delayDays > 0 && <Badge variant="destructive" className="text-[9px]">+{task.delayDays}d delay</Badge>}
                      {task.criticalPath && <Badge variant="outline" className="text-[9px]">Critical Path</Badge>}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display">Risk Analysis: {task.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-display font-bold ${risk.color}`}>{riskScore}</div>
                    <div>
                      <Badge className={risk.badgeClass}>{risk.label}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Composite Risk Score</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Risk Factors</h4>
                    <div className="space-y-1.5 text-sm">
                      {task.delayDays > 0 && <div className="flex items-center gap-2 text-destructive">• Historical delay: {task.delayDays} days</div>}
                      {task.status === 'blocked' && <div className="flex items-center gap-2 text-destructive">• Task is currently blocked</div>}
                      {task.criticalPath && <div className="flex items-center gap-2 text-warning">• On critical path (1.3x multiplier)</div>}
                      {task.dependencies.length > 0 && <div className="flex items-center gap-2 text-muted-foreground">• {task.dependencies.length} dependencies</div>}
                      <div className="flex items-center gap-2 text-muted-foreground">• Progress: {task.progress}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Project:</span> <span className="font-medium">{project?.name}</span></div>
                    <div><span className="text-muted-foreground">Tower:</span> <span className="font-medium">{tower?.name}</span></div>
                    <div><span className="text-muted-foreground">Phase:</span> <span className="font-medium">{task.phase}</span></div>
                    <div><span className="text-muted-foreground">Planned End:</span> <span className="font-medium">{task.endDate}</span></div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DelayPrediction;
