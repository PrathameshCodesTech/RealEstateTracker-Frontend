import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { projects as seedProjects, getTowersByProject, getTasksByProject, type Project } from "@/data/demo-data";
import { Building2, MapPin, Calendar, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

interface ProjectFormValues {
  name: string;
  location: string;
  status: Project["status"];
  startDate: string;
  endDate: string;
  totalUnits: string;
  reraNumber: string;
  budgetCr: string;
  progress: string;
}

const defaultForm: ProjectFormValues = {
  name: "",
  location: "",
  status: "planning",
  startDate: "",
  endDate: "",
  totalUnits: "100",
  reraNumber: "",
  budgetCr: "100",
  progress: "0",
};

const createProjectId = () => `p-${Math.random().toString(36).slice(2, 10)}`;

function ProjectDialog({
  open,
  onOpenChange,
  onSave,
  initialProject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ProjectFormValues) => void;
  initialProject: Project | null;
}) {
  const [form, setForm] = useState<ProjectFormValues>(defaultForm);

  useEffect(() => {
    if (!open) return;
    if (!initialProject) {
      setForm(defaultForm);
      return;
    }

    setForm({
      name: initialProject.name,
      location: initialProject.location,
      status: initialProject.status,
      startDate: initialProject.startDate,
      endDate: initialProject.endDate,
      totalUnits: String(initialProject.totalUnits),
      reraNumber: initialProject.reraNumber,
      budgetCr: String(Math.round(initialProject.budget / 10000000)),
      progress: String(initialProject.progress),
    });
  }, [open, initialProject]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialProject ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-location">Location</Label>
            <Input
              id="project-location"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value: Project["status"]) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-progress">Progress %</Label>
              <Input
                id="project-progress"
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => setForm((prev) => ({ ...prev, progress: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-start">Start Date</Label>
              <Input
                id="project-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-end">End Date</Label>
              <Input
                id="project-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-units">Total Units</Label>
              <Input
                id="project-units"
                type="number"
                min={1}
                value={form.totalUnits}
                onChange={(e) => setForm((prev) => ({ ...prev, totalUnits: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-rera">RERA Number</Label>
              <Input
                id="project-rera"
                value={form.reraNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, reraNumber: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-budget">Budget (Cr)</Label>
              <Input
                id="project-budget"
                type="number"
                min={1}
                value={form.budgetCr}
                onChange={(e) => setForm((prev) => ({ ...prev, budgetCr: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initialProject ? "Update Project" : "Create Project"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectList({
  projectList,
  onCreate,
  onEdit,
  onDelete,
}: {
  projectList: Project[];
  onCreate: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">{projectList.length} projects in portfolio</p>
        </div>
        <Button onClick={onCreate}>+ New Project</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {projectList.map((project) => {
          const pTowers = getTowersByProject(project.id);
          const pTasks = getTasksByProject(project.id);
          const delayed = pTasks.filter((task) => task.status === "delayed" || task.delayDays > 0).length;

          return (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow cursor-pointer h-full"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        project.status === "active"
                          ? "default"
                          : project.status === "planning"
                          ? "secondary"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(project);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(project);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-bold text-lg">{project.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {project.location}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-lg font-display font-bold">{pTowers.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Towers</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-lg font-display font-bold">{project.totalUnits}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Units</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <p className="text-lg font-display font-bold">{pTasks.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Tasks</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {delayed > 0 && <p className="text-xs text-destructive font-medium">{delayed} delayed tasks</p>}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {project.startDate || "--"} — {project.endDate || "--"}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ProjectDetail({ project }: { project: Project | undefined }) {
  if (!project) return <div className="text-center py-12">Project not found</div>;

  const pTowers = getTowersByProject(project.id);
  const pTasks = getTasksByProject(project.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/projects" className="hover:text-foreground">
          Projects
        </Link>
        <ArrowRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {project.location} · RERA: {project.reraNumber || "NA"}
          </p>
        </div>
        <Badge variant={project.status === "active" ? "default" : "secondary"} className="capitalize self-start">
          {project.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Units", value: project.totalUnits },
          { label: "Towers", value: pTowers.length },
          { label: "Tasks", value: pTasks.length },
          { label: "Progress", value: `${project.progress}%` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="towers">
        <TabsList>
          <TabsTrigger value="towers">Towers</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="towers" className="mt-4">
          {pTowers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">No towers mapped yet for this project.</CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pTowers.map((tower) => (
                <Card key={tower.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-bold">{tower.name}</h3>
                      <Badge variant="secondary">{tower.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tower.totalFloors} Floors</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{tower.progress}%</span>
                      </div>
                      <Progress value={tower.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <div className="space-y-2">
            {pTasks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">No tasks mapped yet for this project.</CardContent>
              </Card>
            ) : (
              pTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      task.status === "completed"
                        ? "bg-success"
                        : task.status === "in_progress"
                        ? "bg-warning"
                        : task.status === "delayed"
                        ? "bg-destructive"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.department} · {task.phase}
                    </p>
                  </div>
                  <Progress value={task.progress} className="h-1.5 w-20 hidden md:flex" />
                  <span className="text-xs font-medium">{task.progress}%</span>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Budget</span>
                <span className="font-display font-bold">₹{(project.budget / 10000000).toFixed(0)} Cr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-display font-bold">₹{(project.spent / 10000000).toFixed(0)} Cr</span>
              </div>
              <Progress value={(project.spent / Math.max(project.budget, 1)) * 100} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {Math.round((project.spent / Math.max(project.budget, 1)) * 100)}% utilized
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Projects = () => {
  const { projectId } = useParams();
  const [projectList, setProjectList] = useLocalStorageState<Project[]>("reo-projects", seedProjects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const selectedProject = useMemo(
    () => projectList.find((project) => project.id === projectId),
    [projectList, projectId]
  );

  const handleSaveProject = (values: ProjectFormValues) => {
    const budget = Number(values.budgetCr || 0) * 10000000;
    const payload: Project = {
      id: editingProject?.id ?? createProjectId(),
      towers: editingProject?.towers ?? [],
      developer: editingProject?.developer ?? "Vibe Group",
      spent: editingProject?.spent ?? 0,
      name: values.name.trim(),
      location: values.location.trim(),
      status: values.status,
      startDate: values.startDate,
      endDate: values.endDate,
      totalUnits: Number(values.totalUnits || 0),
      reraNumber: values.reraNumber.trim(),
      budget,
      progress: Number(values.progress || 0),
    };

    setProjectList((current) => {
      if (editingProject) {
        return current.map((project) => (project.id === editingProject.id ? payload : project));
      }
      return [payload, ...current];
    });

    setEditingProject(null);
  };

  const handleDeleteProject = (project: Project) => {
    if (!window.confirm(`Delete ${project.name}?`)) return;
    setProjectList((current) => current.filter((item) => item.id !== project.id));
  };

  if (projectId) {
    return <ProjectDetail project={selectedProject} />;
  }

  return (
    <>
      <ProjectList
        projectList={projectList}
        onCreate={() => {
          setEditingProject(null);
          setDialogOpen(true);
        }}
        onEdit={(project) => {
          setEditingProject(project);
          setDialogOpen(true);
        }}
        onDelete={handleDeleteProject}
      />

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialProject={editingProject}
      />
    </>
  );
};

export default Projects;
