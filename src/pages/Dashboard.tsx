import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  projects, tasks, hurdles, departmentStats, towers, floors, statusLabels, statusColors,
  getTowersByProject, getFloorsByTower, getTasksByProject, getTasksByTower, getTasksByFloor,
  getHurdlesByProject, getProjectById, getTowerById, type Project, type Tower, type Task, type TaskStatus,
} from "@/data/demo-data";
import {
  Building2, AlertTriangle, CheckCircle2, Clock, TrendingUp, ArrowUpRight,
  ArrowLeft, ChevronRight, Download, Layers, FileSpreadsheet,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ===== EXCEL EXPORT UTILITY =====
function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${(cell ?? '').replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ===== STATUS HELPERS =====
const statusColorMap: Record<string, string> = {
  completed: 'hsl(152, 60%, 42%)',
  in_progress: 'hsl(38, 92%, 50%)',
  delayed: 'hsl(0, 72%, 51%)',
  blocked: 'hsl(0, 62%, 40%)',
  not_started: 'hsl(220, 14%, 80%)',
  review: 'hsl(224, 76%, 48%)',
  ready: 'hsl(200, 80%, 50%)',
};

function getStatusPieData(taskList: Task[]) {
  return [
    { name: 'Completed', value: taskList.filter(t => t.status === 'completed').length, color: statusColorMap.completed },
    { name: 'In Progress', value: taskList.filter(t => t.status === 'in_progress').length, color: statusColorMap.in_progress },
    { name: 'Delayed', value: taskList.filter(t => t.status === 'delayed').length, color: statusColorMap.delayed },
    { name: 'Blocked', value: taskList.filter(t => t.status === 'blocked').length, color: statusColorMap.blocked },
    { name: 'Not Started', value: taskList.filter(t => t.status === 'not_started').length, color: statusColorMap.not_started },
    { name: 'Review', value: taskList.filter(t => t.status === 'review').length, color: statusColorMap.review },
    { name: 'Ready', value: taskList.filter(t => t.status === 'ready').length, color: statusColorMap.ready },
  ].filter(d => d.value > 0);
}

function getDeptBreakdown(taskList: Task[]) {
  const depts: Record<string, { completed: number; inProgress: number; delayed: number }> = {};
  taskList.forEach(t => {
    if (!depts[t.department]) depts[t.department] = { completed: 0, inProgress: 0, delayed: 0 };
    if (t.status === 'completed') depts[t.department].completed++;
    else if (t.status === 'delayed' || t.status === 'blocked') depts[t.department].delayed++;
    else depts[t.department].inProgress++;
  });
  return Object.entries(depts).map(([name, data]) => ({ name, ...data }));
}

// ===== STAT CARD COMPONENT =====
function StatCard({ label, value, icon, subtitle }: { label: string; value: number | string; icon: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl md:text-3xl font-display font-bold mt-1">{value}</p>
          </div>
          {icon}
        </div>
        {subtitle && <div className="mt-2">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

// ===== ACTIVITY TABLE (FLOOR / TASK LEVEL) =====
function ActivityTable({ taskList, title, onDrillTask }: { taskList: Task[]; title: string; onDrillTask?: (task: Task) => void }) {
  const handleExport = () => {
    exportToCSV(
      title.replace(/\s+/g, '_'),
      ['Task', 'Department', 'Phase', 'Status', 'Priority', 'Progress %', 'Delay Days', 'Delay Reason', 'Start Date', 'End Date', 'Critical Path'],
      taskList.map(t => [
        t.title, t.department, t.phase, statusLabels[t.status], t.priority,
        String(t.progress), String(t.delayDays), t.delayReason || '', t.startDate, t.endDate,
        t.criticalPath ? 'Yes' : 'No',
      ])
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Delay</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskList.map(task => (
              <TableRow
                key={task.id}
                className={onDrillTask ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => onDrillTask?.(task)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{task.title}</span>
                    {task.criticalPath && <Badge variant="destructive" className="text-[9px] px-1 py-0">CP</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{task.department}</TableCell>
                <TableCell className="text-sm">{task.phase}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[task.status]} text-[10px]`}>{statusLabels[task.status]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="h-1.5 w-16" />
                    <span className="text-xs font-medium">{task.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {task.delayDays > 0 ? (
                    <div>
                      <Badge variant="destructive" className="text-[10px]">+{task.delayDays}d</Badge>
                      {task.delayReason && <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[120px] truncate">{task.delayReason}</p>}
                    </div>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] capitalize">{task.priority}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {taskList.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No tasks found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ===== TASK DETAIL DRILL-DOWN =====
function TaskDrillDown({ task, onBack }: { task: Task; onBack: () => void }) {
  const project = getProjectById(task.projectId);
  const tower = getTowerById(task.towerId);

  const handleExport = () => {
    exportToCSV(
      `Task_${task.title.replace(/\s+/g, '_')}`,
      ['Field', 'Value'],
      [
        ['Task', task.title], ['Description', task.description], ['Project', project?.name || ''],
        ['Tower', tower?.name || ''], ['Department', task.department], ['Phase', task.phase],
        ['Status', statusLabels[task.status]], ['Priority', task.priority], ['Progress', `${task.progress}%`],
        ['Start Date', task.startDate], ['End Date', task.endDate],
        ['Actual Start', task.actualStartDate || ''], ['Actual End', task.actualEndDate || ''],
        ['Delay Days', String(task.delayDays)], ['Delay Reason', task.delayReason || ''],
        ['Critical Path', task.criticalPath ? 'Yes' : 'No'],
        ...task.checklist.map((c, i) => [`Checklist ${i + 1}`, `${c.completed ? '✓' : '○'} ${c.title}`]),
        ...task.comments.map((c, i) => [`Comment ${i + 1}`, `${c.user} (${c.date}): ${c.text}`]),
      ]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Dashboard</span><ChevronRight className="h-3 w-3" />
            <span>{project?.name}</span><ChevronRight className="h-3 w-3" />
            <span>{tower?.name}</span><ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{task.title}</span>
          </div>
          <h1 className="font-display text-2xl font-bold mt-1">Task Detail</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="font-display text-lg">Task Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
              <Badge variant="outline" className="capitalize">{task.priority}</Badge>
              {task.criticalPath && <Badge variant="destructive">Critical Path</Badge>}
            </div>
            <h3 className="font-display font-bold text-xl">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Department:</span> <span className="font-medium">{task.department}</span></div>
              <div><span className="text-muted-foreground">Phase:</span> <span className="font-medium">{task.phase}</span></div>
              <div><span className="text-muted-foreground">Planned:</span> <span className="font-medium">{task.startDate} — {task.endDate}</span></div>
              {task.actualStartDate && <div><span className="text-muted-foreground">Actual Start:</span> <span className="font-medium">{task.actualStartDate}</span></div>}
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Progress</span><span className="font-bold">{task.progress}%</span></div>
              <Progress value={task.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="font-display text-lg">Delay & Impact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {task.delayDays > 0 ? (
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-destructive" />
                  <span className="text-2xl font-display font-bold text-destructive">{task.delayDays} days</span>
                </div>
                <p className="text-sm text-muted-foreground">{task.delayReason || 'No reason specified'}</p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-success/5 border border-success/20 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-success">No delays recorded</span>
              </div>
            )}
            {task.checklist.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Checklist ({task.checklist.filter(c => c.completed).length}/{task.checklist.length})</h4>
                <div className="space-y-1.5">
                  {task.checklist.map(c => (
                    <div key={c.id} className="flex items-center gap-2 text-sm">
                      <div className={`h-4 w-4 rounded border flex items-center justify-center ${c.completed ? 'bg-success border-success text-success-foreground' : 'border-border'}`}>
                        {c.completed && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span className={c.completed ? 'line-through text-muted-foreground' : ''}>{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {task.comments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Activity Log</h4>
                {task.comments.map((c, i) => (
                  <div key={i} className="p-2 rounded bg-muted/50 text-xs mb-1.5">
                    <span className="font-medium">{c.user}</span> <span className="text-muted-foreground">· {c.date}</span>
                    <p className="text-muted-foreground mt-0.5">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===== FLOOR DRILL-DOWN =====
function FloorDrillDown({ tower, project, onBack, onDrillTask }: {
  tower: Tower; project: Project; onBack: () => void; onDrillTask: (task: Task) => void;
}) {
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const towerTasks = getTasksByTower(tower.id);
  const towerFloors = getFloorsByTower(tower.id);

  const floorStats = towerFloors.map(f => {
    const fTasks = getTasksByFloor(f.id);
    const completed = fTasks.filter(t => t.status === 'completed').length;
    const delayed = fTasks.filter(t => t.status === 'delayed' || t.delayDays > 0).length;
    return { ...f, taskCount: fTasks.length, completed, delayed, progress: fTasks.length > 0 ? Math.round((completed / fTasks.length) * 100) : 0 };
  });

  const handleExportTower = () => {
    exportToCSV(
      `${project.name}_${tower.name}_Tasks`,
      ['Floor', 'Task', 'Department', 'Phase', 'Status', 'Progress %', 'Delay Days', 'Delay Reason', 'Priority'],
      towerTasks.map(t => {
        const fl = floors.find(f => f.id === t.floorId);
        return [fl?.name || '', t.title, t.department, t.phase, statusLabels[t.status], String(t.progress), String(t.delayDays), t.delayReason || '', t.priority];
      })
    );
  };

  if (selectedFloorId) {
    const floor = towerFloors.find(f => f.id === selectedFloorId)!;
    const floorTasks = getTasksByFloor(selectedFloorId);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedFloorId(null)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Dashboard</span><ChevronRight className="h-3 w-3" />
              <span>{project.name}</span><ChevronRight className="h-3 w-3" />
              <span>{tower.name}</span><ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{floor.name}</span>
            </div>
            <h1 className="font-display text-2xl font-bold mt-1">{floor.name} — Activity Analytics</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={floorTasks.length} icon={<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Layers className="h-5 w-5 text-primary" /></div>} />
          <StatCard label="Completed" value={floorTasks.filter(t => t.status === 'completed').length} icon={<div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-success" /></div>} />
          <StatCard label="Delayed" value={floorTasks.filter(t => t.delayDays > 0).length} icon={<div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>} />
          <StatCard label="Total Delay" value={`${floorTasks.reduce((a, t) => a + t.delayDays, 0)}d`} icon={<div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={getStatusPieData(floorTasks)} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {getStatusPieData(floorTasks).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {getStatusPieData(floorTasks).map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Department Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getDeptBreakdown(floorTasks)} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="hsl(152, 60%, 42%)" name="Completed" />
                  <Bar dataKey="inProgress" stackId="a" fill="hsl(38, 92%, 50%)" name="In Progress" />
                  <Bar dataKey="delayed" stackId="a" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} name="Delayed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <ActivityTable taskList={floorTasks} title={`${floor.name} — All Activities`} onDrillTask={onDrillTask} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Dashboard</span><ChevronRight className="h-3 w-3" />
            <span>{project.name}</span><ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{tower.name}</span>
          </div>
          <h1 className="font-display text-2xl font-bold mt-1">{tower.name} — Floor Analytics</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportTower}><Download className="h-4 w-4 mr-2" />Export All</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={towerTasks.length} icon={<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-primary" /></div>} />
        <StatCard label="Completed" value={towerTasks.filter(t => t.status === 'completed').length} icon={<div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-success" /></div>} />
        <StatCard label="Progress" value={`${towerTasks.length > 0 ? Math.round((towerTasks.filter(t => t.status === 'completed').length / towerTasks.length) * 100) : 0}%`} icon={<div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-info" /></div>} subtitle={<Progress value={towerTasks.length > 0 ? (towerTasks.filter(t => t.status === 'completed').length / towerTasks.length) * 100 : 0} className="h-1.5" />} />
        <StatCard label="Delay Impact" value={`${towerTasks.reduce((a, t) => a + t.delayDays, 0)}d`} icon={<div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Clock className="h-5 w-5 text-destructive" /></div>} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Task Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={getStatusPieData(towerTasks)} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                  {getStatusPieData(towerTasks).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {getStatusPieData(towerTasks).map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Department Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getDeptBreakdown(towerTasks)} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="hsl(152, 60%, 42%)" name="Completed" />
                <Bar dataKey="inProgress" stackId="a" fill="hsl(38, 92%, 50%)" name="In Progress" />
                <Bar dataKey="delayed" stackId="a" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Floor Cards */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Floors</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {floorStats.sort((a, b) => b.number - a.number).map(floor => (
              <div key={floor.id}
                onClick={() => setSelectedFloorId(floor.id)}
                className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{floor.name}</p>
                  <p className="text-xs text-muted-foreground">{floor.taskCount} tasks · {floor.completed} done</p>
                </div>
                <Progress value={floor.progress} className="h-1.5 w-20 hidden md:flex" />
                <span className="text-xs font-medium w-8 text-right">{floor.progress}%</span>
                {floor.delayed > 0 && <Badge variant="destructive" className="text-[10px]">{floor.delayed} delayed</Badge>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ActivityTable taskList={towerTasks} title={`${tower.name} — All Tasks`} onDrillTask={onDrillTask} />
    </div>
  );
}

// ===== PROJECT DRILL-DOWN =====
function ProjectDrillDown({ project, onBack, onDrillTower }: {
  project: Project; onBack: () => void; onDrillTower: (tower: Tower) => void;
}) {
  const projectTasks = getTasksByProject(project.id);
  const projectTowers = getTowersByProject(project.id);
  const projectHurdles = getHurdlesByProject(project.id);

  const handleExport = () => {
    exportToCSV(
      `${project.name}_Overview`,
      ['Tower', 'Task', 'Department', 'Phase', 'Status', 'Progress %', 'Delay Days', 'Delay Reason'],
      projectTasks.map(t => {
        const tw = towers.find(tw => tw.id === t.towerId);
        return [tw?.name || '', t.title, t.department, t.phase, statusLabels[t.status], String(t.progress), String(t.delayDays), t.delayReason || ''];
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Dashboard</span><ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{project.name}</span>
          </div>
          <h1 className="font-display text-2xl font-bold mt-1">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.location} · RERA: {project.reraNumber}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={projectTasks.length} icon={<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-primary" /></div>} />
        <StatCard label="Completion" value={`${project.progress}%`} icon={<div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-success" /></div>} subtitle={<Progress value={project.progress} className="h-1.5" />} />
        <StatCard label="Towers" value={projectTowers.length} icon={<div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-info" /></div>} />
        <StatCard label="Active Hurdles" value={projectHurdles.filter(h => h.status !== 'resolved').length} icon={<div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Task Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={getStatusPieData(projectTasks)} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                  {getStatusPieData(projectTasks).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {getStatusPieData(projectTasks).map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Department Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getDeptBreakdown(projectTasks)} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="hsl(152, 60%, 42%)" name="Completed" />
                <Bar dataKey="inProgress" stackId="a" fill="hsl(38, 92%, 50%)" name="In Progress" />
                <Bar dataKey="delayed" stackId="a" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tower Cards */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Tower Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {projectTowers.map(tower => {
              const tTasks = getTasksByTower(tower.id);
              const delayed = tTasks.filter(t => t.delayDays > 0).length;
              const totalDelay = tTasks.reduce((a, t) => a + t.delayDays, 0);
              return (
                <div key={tower.id}
                  onClick={() => onDrillTower(tower)}
                  className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-display font-bold">{tower.name}</p>
                      <Badge variant="secondary" className="text-xs">{tower.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{tTasks.length} tasks · {tower.totalFloors} floors</p>
                    <Progress value={tower.progress} className="h-1.5 mt-2" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-medium">{tower.progress}%</span>
                      {delayed > 0 && <span className="text-xs text-destructive font-medium">{delayed} delayed ({totalDelay}d impact)</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delay Radar */}
      {projectTasks.filter(t => t.delayDays > 0).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />Delay Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projectTasks.filter(t => t.delayDays > 0).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.delayReason}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs shrink-0">+{task.delayDays}d</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===== MAIN DASHBOARD =====
const Dashboard = () => {
  const [drillLevel, setDrillLevel] = useState<'portfolio' | 'project' | 'tower' | 'task'>('portfolio');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const openHurdles = hurdles.filter(h => h.status === 'open' || h.status === 'escalated').length;
  const activeTowers = towers.filter(t => t.status === 'Construction').length;

  const statusPieData = getStatusPieData(tasks);

  // Handle drill-down navigation
  if (drillLevel === 'task' && selectedTask) {
    return <TaskDrillDown task={selectedTask} onBack={() => { setDrillLevel('tower'); setSelectedTask(null); }} />;
  }

  if (drillLevel === 'tower' && selectedTower && selectedProject) {
    return (
      <FloorDrillDown
        tower={selectedTower}
        project={selectedProject}
        onBack={() => { setDrillLevel('project'); setSelectedTower(null); }}
        onDrillTask={(task) => { setSelectedTask(task); setDrillLevel('task'); }}
      />
    );
  }

  if (drillLevel === 'project' && selectedProject) {
    return (
      <ProjectDrillDown
        project={selectedProject}
        onBack={() => { setDrillLevel('portfolio'); setSelectedProject(null); }}
        onDrillTower={(tower) => { setSelectedTower(tower); setDrillLevel('tower'); }}
      />
    );
  }

  // Portfolio export
  const handlePortfolioExport = () => {
    exportToCSV(
      'Portfolio_Overview',
      ['Project', 'Location', 'Status', 'Progress %', 'Towers', 'Total Units', 'Budget (Cr)', 'Spent (Cr)', 'Tasks', 'Delayed Tasks'],
      projects.map(p => {
        const pTasks = getTasksByProject(p.id);
        return [p.name, p.location, p.status, String(p.progress), String(getTowersByProject(p.id).length),
          String(p.totalUnits), String(Math.round(p.budget / 10000000)), String(Math.round(p.spent / 10000000)),
          String(pTasks.length), String(pTasks.filter(t => t.delayDays > 0).length)];
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">CEO Dashboard</h1>
          <p className="text-muted-foreground mt-1">Portfolio overview — MICL Group · Click any project to drill down</p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePortfolioExport}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />Export Portfolio
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={projects.length}
          icon={<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary" /></div>}
          subtitle={<p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-success" />{projects.filter(p => p.status === 'active').length} active</p>}
        />
        <StatCard label="Active Towers" value={activeTowers}
          icon={<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-info/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-info" /></div>}
          subtitle={<p className="text-xs text-muted-foreground">of {towers.length} total towers</p>}
        />
        <StatCard label="Completion" value={`${Math.round((completedTasks / totalTasks) * 100)}%`}
          icon={<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-success" /></div>}
          subtitle={<Progress value={(completedTasks / totalTasks) * 100} className="h-1.5" />}
        />
        <StatCard label="Open Hurdles" value={openHurdles}
          icon={<div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-destructive" /></div>}
          subtitle={<p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3 text-warning" />{hurdles.filter(h => h.severity === 'critical' && h.status !== 'resolved').length} critical</p>}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {/* Project Progress — clickable */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Project Progress <span className="text-xs text-muted-foreground font-normal ml-2">Click to drill down →</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.map((project) => (
              <div key={project.id}
                className="space-y-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => { setSelectedProject(project); setDrillLevel('project'); }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">{project.status}</Badge>
                    <span className="font-display font-bold text-sm">{project.progress}%</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task Status Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                  {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {statusPieData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Department Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={departmentStats} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="hsl(152, 60%, 42%)" name="Completed" />
                <Bar dataKey="inProgress" stackId="a" fill="hsl(38, 92%, 50%)" name="In Progress" />
                <Bar dataKey="delayed" stackId="a" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} name="Delayed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Critical Hurdles */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />Critical Hurdles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hurdles.filter(h => h.status !== 'resolved').slice(0, 5).map(hurdle => (
              <div key={hurdle.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${hurdle.severity === 'critical' ? 'bg-destructive' : hurdle.severity === 'high' ? 'bg-warning' : 'bg-info'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{hurdle.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{hurdle.affectedTower} · {hurdle.impactDays} days impact</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{hurdle.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Delay Radar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg font-display">Delay Radar</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasks.filter(t => t.delayDays > 0).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => { setSelectedProject(projects.find(p => p.id === task.projectId) || null); setSelectedTower(towers.find(t => t.id === task.towerId) || null); setSelectedTask(task); setDrillLevel('task'); }}>
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.delayReason}</p>
                </div>
                <Badge variant="destructive" className="text-xs shrink-0">+{task.delayDays}d</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
