import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Landmark, Users, FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type SocietyStatus = "in_formation" | "registered" | "committee_formed";

interface SocietyStep {
  id: string;
  name: string;
  completed: boolean;
}

interface SocietyItem {
  id: string;
  name: string;
  project: string;
  status: SocietyStatus;
  progress: number;
  steps: SocietyStep[];
}

const defaultSteps: SocietyStep[] = [
  { id: "step-1", name: "Conveyance Deed Preparation", completed: false },
  { id: "step-2", name: "Society Registration Application", completed: false },
  { id: "step-3", name: "First AGM", completed: false },
  { id: "step-4", name: "Committee Election", completed: false },
  { id: "step-5", name: "Bank Account Opening", completed: false },
];

const seedSocieties: SocietyItem[] = [
  {
    id: "soc-1",
    name: "Marine Heights Co-op Society",
    project: "Marine Heights",
    status: "in_formation",
    progress: 35,
    steps: [
      { id: "seed-step-1", name: "Conveyance Deed Preparation", completed: true },
      { id: "seed-step-2", name: "Society Registration Application", completed: false },
      { id: "seed-step-3", name: "First AGM", completed: false },
      { id: "seed-step-4", name: "Committee Election", completed: false },
      { id: "seed-step-5", name: "Bank Account Opening", completed: false },
      { id: "seed-step-6", name: "Common Area Handover", completed: false },
      { id: "seed-step-7", name: "Maintenance Agreement", completed: false },
    ],
  },
];

const recalculateProgress = (steps: SocietyStep[]) => {
  if (steps.length === 0) return 0;
  const done = steps.filter((step) => step.completed).length;
  return Math.round((done / steps.length) * 100);
};

const Society = () => {
  const [societies, setSocieties] = useLocalStorageState<SocietyItem[]>("reo-societies", seedSocieties);
  const [open, setOpen] = useState(false);
  const [newSociety, setNewSociety] = useState({
    name: "",
    project: "",
    status: "in_formation" as SocietyStatus,
  });

  const committeesFormed = societies.filter((society) => society.status === "committee_formed").length;

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newSociety.name.trim() || !newSociety.project.trim()) return;

    const clonedSteps = defaultSteps.map((step) => ({ ...step, id: `${step.id}-${Math.random().toString(36).slice(2, 6)}` }));

    setSocieties((current) => [
      {
        id: `soc-${Math.random().toString(36).slice(2, 10)}`,
        name: newSociety.name.trim(),
        project: newSociety.project.trim(),
        status: newSociety.status,
        progress: recalculateProgress(clonedSteps),
        steps: clonedSteps,
      },
      ...current,
    ]);

    setNewSociety({ name: "", project: "", status: "in_formation" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Society Formation</h1>
          <p className="text-muted-foreground mt-1">Post-handover society setup tracking</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Society
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Landmark className="h-5 w-5 text-primary" /><div><p className="text-xl font-display font-bold">{societies.length}</p><p className="text-xs text-muted-foreground">Societies</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-5 w-5 text-info" /><div><p className="text-xl font-display font-bold">{committeesFormed}</p><p className="text-xs text-muted-foreground">Committees Formed</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><FileText className="h-5 w-5 text-warning" /><div><p className="text-xl font-display font-bold">{societies.filter((society) => society.status === "in_formation").length}</p><p className="text-xs text-muted-foreground">In Formation</p></div></CardContent></Card>
      </div>

      {societies.map((society) => (
        <Card key={society.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display">{society.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{society.project}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={society.status}
                  onValueChange={(value: SocietyStatus) =>
                    setSocieties((current) =>
                      current.map((entry) =>
                        entry.id === society.id ? { ...entry, status: value } : entry
                      )
                    )
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_formation">In Formation</SelectItem>
                    <SelectItem value="committee_formed">Committee Formed</SelectItem>
                    <SelectItem value="registered">Registered</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSocieties((current) => current.filter((entry) => entry.id !== society.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Badge className="capitalize w-fit">{society.status.replace("_", " ")}</Badge>
            <Progress value={society.progress} className="h-2 mt-2" />
          </CardHeader>

          <CardContent className="space-y-2">
            {society.steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50">
                <Checkbox
                  checked={step.completed}
                  onCheckedChange={(checked) =>
                    setSocieties((current) =>
                      current.map((entry) => {
                        if (entry.id !== society.id) return entry;

                        const updatedSteps = entry.steps.map((currentStep) =>
                          currentStep.id === step.id ? { ...currentStep, completed: Boolean(checked) } : currentStep
                        );

                        return {
                          ...entry,
                          steps: updatedSteps,
                          progress: recalculateProgress(updatedSteps),
                        };
                      })
                    )
                  }
                />
                <span className={`text-sm flex-1 ${step.completed ? "line-through text-muted-foreground" : ""}`}>{step.name}</span>
                <Badge variant="secondary" className="text-xs capitalize">{step.completed ? "Completed" : "Pending"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Society</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="society-name">Society Name</Label>
              <Input
                id="society-name"
                value={newSociety.name}
                onChange={(event) => setNewSociety((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="society-project">Project</Label>
              <Input
                id="society-project"
                value={newSociety.project}
                onChange={(event) => setNewSociety((prev) => ({ ...prev, project: event.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={newSociety.status}
                onValueChange={(value: SocietyStatus) => setNewSociety((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_formation">In Formation</SelectItem>
                  <SelectItem value="committee_formed">Committee Formed</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create Society</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Society;
