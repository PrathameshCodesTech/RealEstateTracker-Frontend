import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { projects, getTowersByProject, getFloorsByTower, getUnitsByFloor, tasks, statusLabels, statusColors } from "@/data/demo-data";
import { Building2, Layers, Grid3X3, ArrowLeft, ChevronRight } from "lucide-react";

type View = 'projects' | 'towers' | 'floors' | 'units';

const DigitalTwin = () => {
  const [view, setView] = useState<View>('projects');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);

  const goBack = () => {
    if (view === 'units') { setView('floors'); setSelectedFloor(null); }
    else if (view === 'floors') { setView('towers'); setSelectedTower(null); }
    else if (view === 'towers') { setView('projects'); setSelectedProject(null); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'in_progress': return 'bg-warning';
      case 'delayed': case 'blocked': return 'bg-destructive';
      default: return 'bg-muted-foreground/30';
    }
  };

  const getBgColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 border-success/30';
      case 'in_progress': return 'bg-warning/10 border-warning/30';
      case 'delayed': case 'blocked': return 'bg-destructive/10 border-destructive/30';
      default: return 'bg-muted border-border';
    }
  };

  const breadcrumb = () => {
    const parts: string[] = ['Digital Twin'];
    if (selectedProject) parts.push(projects.find(p => p.id === selectedProject)?.name || '');
    if (selectedTower) {
      const t = getTowersByProject(selectedProject!).find(t => t.id === selectedTower);
      parts.push(t?.name || '');
    }
    if (selectedFloor) {
      const f = getFloorsByTower(selectedTower!).find(f => f.id === selectedFloor);
      parts.push(f?.name || '');
    }
    return parts;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {view !== 'projects' && (
          <Button variant="ghost" size="icon" onClick={goBack} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumb().map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={i === breadcrumb().length - 1 ? 'text-foreground font-medium' : ''}>{part}</span>
              </span>
            ))}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Execution Map</h1>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Completed', color: 'bg-success' },
          { label: 'In Progress', color: 'bg-warning' },
          { label: 'Delayed / Blocked', color: 'bg-destructive' },
          { label: 'Not Started', color: 'bg-muted-foreground/30' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <div className={`h-3 w-3 rounded-sm ${item.color}`} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Projects View */}
      {view === 'projects' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const pTowers = getTowersByProject(project.id);
            return (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setSelectedProject(project.id); setView('towers'); }}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold">{project.name}</h3>
                      <p className="text-xs text-muted-foreground">{project.location}</p>
                    </div>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{pTowers.length} Towers</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Towers View */}
      {view === 'towers' && selectedProject && (
        <div className="grid md:grid-cols-2 gap-6">
          {getTowersByProject(selectedProject).map((tower) => {
            const tFloors = getFloorsByTower(tower.id);
            return (
              <Card key={tower.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">{tower.name}</CardTitle>
                    <Badge variant="secondary">{tower.status}</Badge>
                  </div>
                  <Progress value={tower.progress} className="h-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col-reverse gap-1">
                    {tFloors.sort((a, b) => b.number - a.number).map((floor) => {
                      const floorTasks = tasks.filter(t => t.floorId === floor.id);
                      const completed = floorTasks.filter(t => t.status === 'completed').length;
                      const total = floorTasks.length;
                      const hasDelay = floorTasks.some(t => t.status === 'delayed' || t.status === 'blocked');
                      const allDone = total > 0 && completed === total;
                      const inProg = floorTasks.some(t => t.status === 'in_progress');
                      const floorStatus = allDone ? 'completed' : hasDelay ? 'delayed' : inProg ? 'in_progress' : 'not_started';

                      return (
                        <button key={floor.id}
                          onClick={() => { setSelectedTower(tower.id); setSelectedFloor(floor.id); setView('units'); }}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm ${getBgColor(floorStatus)}`}
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{floor.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{completed}/{total} tasks</span>
                            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(floorStatus)}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Units / Floor View */}
      {view === 'units' && selectedFloor && (
        <div className="space-y-6">
          {/* Floor task overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getUnitsByFloor(selectedFloor).map((unit) => {
              const unitTasks = tasks.filter(t => t.unitId === unit.id);
              return (
                <Card key={unit.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{unit.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{unit.type}</Badge>
                    </div>
                    {unitTasks.length > 0 ? (
                      <div className="space-y-2">
                        {unitTasks.map((task) => (
                          <div key={task.id} className={`p-2 rounded-md border text-xs ${getBgColor(task.status)}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium truncate">{task.title}</span>
                              <div className={`h-2 w-2 rounded-full shrink-0 ${getStatusColor(task.status)}`} />
                            </div>
                            <Progress value={task.progress} className="h-1" />
                            <div className="flex justify-between mt-1 text-muted-foreground">
                              <span>{task.department}</span>
                              <span>{task.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No tasks assigned</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Floor-level tasks (not unit-specific) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-display">Floor-Level Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.filter(t => t.floorId === selectedFloor && !t.unitId).map((task) => (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border ${getBgColor(task.status)}`}>
                    <div className={`h-3 w-3 rounded-full shrink-0 ${getStatusColor(task.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.department} · {statusLabels[task.status]}</p>
                    </div>
                    <Progress value={task.progress} className="h-1.5 w-20 hidden md:flex" />
                    <span className="text-xs font-medium">{task.progress}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DigitalTwin;
