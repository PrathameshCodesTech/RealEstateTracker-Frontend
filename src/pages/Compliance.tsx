import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertTriangle, FileCheck, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

type ComplianceStatus = "completed" | "in_progress" | "pending" | "not_started";

interface ComplianceItem {
  id: string;
  name: string;
  project: string;
  status: ComplianceStatus;
  progress: number;
  dueDate: string;
}

const seedComplianceItems: ComplianceItem[] = [
  { id: "cmp-1", name: "RERA Registration", project: "Marine Heights", status: "completed", progress: 100, dueDate: "2024-03-15" },
  { id: "cmp-2", name: "RERA Registration", project: "Skyline Residences", status: "completed", progress: 100, dueDate: "2024-08-20" },
  { id: "cmp-3", name: "RERA Registration", project: "Palm Gardens", status: "in_progress", progress: 60, dueDate: "2025-03-31" },
  { id: "cmp-4", name: "Environmental Clearance", project: "Marine Heights", status: "completed", progress: 100, dueDate: "2024-01-10" },
  { id: "cmp-5", name: "Environmental Clearance", project: "Skyline Residences", status: "completed", progress: 100, dueDate: "2024-05-20" },
  { id: "cmp-6", name: "Fire NOC - Tower A", project: "Marine Heights", status: "pending", progress: 30, dueDate: "2025-06-30" },
  { id: "cmp-7", name: "Fire NOC - Tower B", project: "Marine Heights", status: "not_started", progress: 0, dueDate: "2025-12-31" },
  { id: "cmp-8", name: "Lift Certification", project: "Marine Heights", status: "not_started", progress: 0, dueDate: "2026-03-31" },
  { id: "cmp-9", name: "Occupancy Certificate", project: "Marine Heights", status: "not_started", progress: 0, dueDate: "2026-12-31" },
  { id: "cmp-10", name: "Building Completion Certificate", project: "Marine Heights", status: "not_started", progress: 0, dueDate: "2026-10-31" },
];

const statusBadgeVariant = (status: ComplianceStatus) =>
  status === "completed" ? "default" : "secondary";

const Compliance = () => {
  const [items, setItems] = useLocalStorageState<ComplianceItem[]>("reo-compliance-items", seedComplianceItems);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    project: "",
    status: "not_started" as ComplianceStatus,
    dueDate: "",
  });

  const completed = items.filter((item) => item.status === "completed").length;

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newItem.name.trim() || !newItem.project.trim()) return;

    setItems((current) => [
      {
        id: `cmp-${Math.random().toString(36).slice(2, 10)}`,
        name: newItem.name.trim(),
        project: newItem.project.trim(),
        status: newItem.status,
        progress: newItem.status === "completed" ? 100 : 0,
        dueDate: newItem.dueDate,
      },
      ...current,
    ]);

    setNewItem({ name: "", project: "", status: "not_started", dueDate: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Compliance Tracking</h1>
          <p className="text-muted-foreground mt-1">{completed}/{items.length} compliances cleared</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Compliance
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-success" /><div><p className="text-xl font-display font-bold">{completed}</p><p className="text-xs text-muted-foreground">Completed</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Clock className="h-5 w-5 text-warning" /><div><p className="text-xl font-display font-bold">{items.filter((item) => item.status === "in_progress" || item.status === "pending").length}</p><p className="text-xs text-muted-foreground">In Progress</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-destructive" /><div><p className="text-xl font-display font-bold">{items.filter((item) => item.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><FileCheck className="h-5 w-5 text-muted-foreground" /><div><p className="text-xl font-display font-bold">{items.filter((item) => item.status === "not_started").length}</p><p className="text-xs text-muted-foreground">Not Started</p></div></CardContent></Card>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full shrink-0 ${item.status === "completed" ? "bg-success" : item.status === "in_progress" ? "bg-warning" : item.status === "pending" ? "bg-destructive" : "bg-muted-foreground/30"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.project} · Due: {item.dueDate || "NA"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setItems((current) => current.filter((value) => value.id !== item.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-[180px_1fr_120px] gap-3 items-center">
                <Select
                  value={item.status}
                  onValueChange={(value: ComplianceStatus) =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, status: value, progress: value === "completed" ? 100 : entry.progress }
                          : entry
                      )
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Progress value={item.progress} className="h-2" />

                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={item.progress}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, progress: Number(event.target.value || 0) }
                          : entry
                      )
                    )
                  }
                />
              </div>

              <Badge variant={statusBadgeVariant(item.status)} className="capitalize text-xs">
                {item.status.replace("_", " ")}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Compliance Item</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="compliance-name">Compliance Name</Label>
              <Input
                id="compliance-name"
                value={newItem.name}
                onChange={(event) => setNewItem((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="compliance-project">Project</Label>
              <Input
                id="compliance-project"
                value={newItem.project}
                onChange={(event) => setNewItem((prev) => ({ ...prev, project: event.target.value }))}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={newItem.status}
                  onValueChange={(value: ComplianceStatus) => setNewItem((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="compliance-due-date">Due Date</Label>
                <Input
                  id="compliance-due-date"
                  type="date"
                  value={newItem.dueDate}
                  onChange={(event) => setNewItem((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compliance;
