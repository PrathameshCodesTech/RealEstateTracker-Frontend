import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tasks, projects, statusLabels } from "@/data/demo-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const startYear = 2024;
const totalMonths = 30; // 2.5 years

function getMonthIndex(dateStr: string) {
  const d = new Date(dateStr);
  return (d.getFullYear() - startYear) * 12 + d.getMonth();
}

function getBarColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-success';
    case 'in_progress': return 'bg-warning';
    case 'delayed': case 'blocked': return 'bg-destructive';
    case 'review': return 'bg-primary';
    case 'ready': return 'bg-info';
    default: return 'bg-muted-foreground/30';
  }
}

const Timeline = () => {
  const [projectFilter, setProjectFilter] = useState("all");
  const [zoom, setZoom] = useState<'month' | 'quarter'>('month');

  const filtered = tasks.filter(t => projectFilter === 'all' || t.projectId === projectFilter);
  const colWidth = zoom === 'month' ? 80 : 240;

  const headerCols = zoom === 'month'
    ? Array.from({ length: totalMonths }, (_, i) => {
        const m = i % 12;
        const y = startYear + Math.floor(i / 12);
        return { label: months[m], sub: y.toString(), key: `${y}-${m}` };
      })
    : Array.from({ length: Math.ceil(totalMonths / 3) }, (_, i) => {
        const q = (i % 4) + 1;
        const y = startYear + Math.floor(i / 4);
        return { label: `Q${q}`, sub: y.toString(), key: `${y}-Q${q}` };
      });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Timeline</h1>
          <p className="text-muted-foreground mt-1">Project execution Gantt view</p>
        </div>
        <div className="flex gap-3">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={zoom} onValueChange={(v: 'month' | 'quarter') => setZoom(v)}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="flex border-b sticky top-0 bg-card z-10">
              <div className="w-[250px] shrink-0 p-3 font-medium text-sm border-r">Task</div>
              <div className="flex">
                {headerCols.map((col) => (
                  <div key={col.key} className="text-center border-r p-2" style={{ width: colWidth }}>
                    <p className="text-xs font-medium">{col.label}</p>
                    <p className="text-[10px] text-muted-foreground">{col.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {filtered.map((task) => {
              const startIdx = getMonthIndex(task.startDate);
              const endIdx = getMonthIndex(task.endDate);
              const duration = Math.max(1, endIdx - startIdx + 1);
              const leftPx = zoom === 'month'
                ? startIdx * colWidth
                : (startIdx / 3) * colWidth;
              const widthPx = zoom === 'month'
                ? duration * colWidth - 4
                : (duration / 3) * colWidth - 4;

              return (
                <div key={task.id} className="flex border-b hover:bg-muted/30 transition-colors">
                  <div className="w-[250px] shrink-0 p-3 border-r">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{task.department}</span>
                      {task.criticalPath && <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3">CP</Badge>}
                    </div>
                  </div>
                  <div className="flex-1 relative" style={{ minWidth: headerCols.length * colWidth }}>
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {headerCols.map((col) => (
                        <div key={col.key} className="border-r h-full" style={{ width: colWidth }} />
                      ))}
                    </div>
                    {/* Bar */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-2.5 h-5 rounded-full ${getBarColor(task.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                          style={{ left: leftPx + 2, width: Math.max(widthPx, 8) }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-xs">{statusLabels[task.status]} · {task.progress}%</p>
                        <p className="text-xs">{task.startDate} — {task.endDate}</p>
                      </TooltipContent>
                    </Tooltip>
                    {/* Dependency arrows (simplified) */}
                    {task.dependencies.length > 0 && (
                      <div className="absolute top-5 h-0.5 bg-muted-foreground/20" style={{ left: 0, width: leftPx }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timeline;
