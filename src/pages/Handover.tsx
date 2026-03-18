import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KeyRound, ClipboardList, CheckCircle2, Plus, Trash2 } from "lucide-react";
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

type HandoverStatus = "snagging" | "inspection" | "not_ready" | "handed_over";

interface HandoverUnit {
  id: string;
  unit: string;
  tower: string;
  project: string;
  status: HandoverStatus;
  progress: number;
  buyer: string;
}

const seedUnits: HandoverUnit[] = [
  { id: "handover-1", unit: "Unit 101", tower: "Tower A", project: "Marine Heights", status: "snagging", progress: 70, buyer: "Mr. Anil Kapoor" },
  { id: "handover-2", unit: "Unit 102", tower: "Tower A", project: "Marine Heights", status: "inspection", progress: 50, buyer: "Mrs. Priya Shah" },
  { id: "handover-3", unit: "Unit 103", tower: "Tower A", project: "Marine Heights", status: "not_ready", progress: 30, buyer: "Mr. Rakesh Jain" },
  { id: "handover-4", unit: "Unit 104", tower: "Tower A", project: "Marine Heights", status: "not_ready", progress: 15, buyer: "Mrs. Sunita Mehta" },
  { id: "handover-5", unit: "Unit 201", tower: "Tower A", project: "Marine Heights", status: "handed_over", progress: 100, buyer: "Mr. Vijay Kumar" },
  { id: "handover-6", unit: "Unit 202", tower: "Tower A", project: "Marine Heights", status: "handed_over", progress: 100, buyer: "Dr. Anita Rao" },
];

const Handover = () => {
  const [units, setUnits] = useLocalStorageState<HandoverUnit[]>("reo-handover-units", seedUnits);
  const [open, setOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unit: "",
    tower: "",
    project: "",
    buyer: "",
    status: "not_ready" as HandoverStatus,
  });

  const count = (status: HandoverStatus) => units.filter((unit) => unit.status === status).length;

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newUnit.unit.trim() || !newUnit.project.trim()) return;

    setUnits((current) => [
      {
        id: `handover-${Math.random().toString(36).slice(2, 10)}`,
        unit: newUnit.unit.trim(),
        tower: newUnit.tower.trim() || "Tower A",
        project: newUnit.project.trim(),
        buyer: newUnit.buyer.trim() || "Not Assigned",
        status: newUnit.status,
        progress: newUnit.status === "handed_over" ? 100 : newUnit.status === "inspection" ? 60 : newUnit.status === "snagging" ? 40 : 0,
      },
      ...current,
    ]);

    setNewUnit({ unit: "", tower: "", project: "", buyer: "", status: "not_ready" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Handover Management</h1>
          <p className="text-muted-foreground mt-1">Unit handover tracking and status</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Add Unit
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><KeyRound className="h-5 w-5 text-success" /><div><p className="text-xl font-display font-bold">{count("handed_over")}</p><p className="text-xs text-muted-foreground">Handed Over</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><ClipboardList className="h-5 w-5 text-warning" /><div><p className="text-xl font-display font-bold">{count("snagging")}</p><p className="text-xs text-muted-foreground">Snagging</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-info" /><div><p className="text-xl font-display font-bold">{count("inspection")}</p><p className="text-xs text-muted-foreground">Inspection</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="h-5 w-5 rounded-full bg-muted-foreground/30" /><div><p className="text-xl font-display font-bold">{count("not_ready")}</p><p className="text-xs text-muted-foreground">Not Ready</p></div></CardContent></Card>
      </div>

      <div className="space-y-3">
        {units.map((unit) => (
          <Card key={unit.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full shrink-0 ${unit.status === "handed_over" ? "bg-success" : unit.status === "snagging" ? "bg-warning" : unit.status === "inspection" ? "bg-info" : "bg-muted-foreground/30"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{unit.unit} — {unit.tower}</p>
                  <p className="text-xs text-muted-foreground">{unit.project} · Buyer: {unit.buyer}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setUnits((current) => current.filter((entry) => entry.id !== unit.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-[180px_1fr] gap-3 items-center">
                <Select
                  value={unit.status}
                  onValueChange={(value: HandoverStatus) =>
                    setUnits((current) =>
                      current.map((entry) =>
                        entry.id === unit.id
                          ? {
                              ...entry,
                              status: value,
                              progress: value === "handed_over" ? 100 : value === "inspection" ? 70 : value === "snagging" ? 45 : 10,
                            }
                          : entry
                      )
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_ready">Not Ready</SelectItem>
                    <SelectItem value="snagging">Snagging</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="handed_over">Handed Over</SelectItem>
                  </SelectContent>
                </Select>
                <Progress value={unit.progress} className="h-2" />
              </div>

              <Badge variant={unit.status === "handed_over" ? "default" : "secondary"} className="capitalize text-xs">
                {unit.status.replace("_", " ")}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Handover Unit</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="handover-unit">Unit</Label>
                <Input
                  id="handover-unit"
                  value={newUnit.unit}
                  onChange={(event) => setNewUnit((prev) => ({ ...prev, unit: event.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="handover-tower">Tower</Label>
                <Input
                  id="handover-tower"
                  value={newUnit.tower}
                  onChange={(event) => setNewUnit((prev) => ({ ...prev, tower: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="handover-project">Project</Label>
                <Input
                  id="handover-project"
                  value={newUnit.project}
                  onChange={(event) => setNewUnit((prev) => ({ ...prev, project: event.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="handover-buyer">Buyer</Label>
                <Input
                  id="handover-buyer"
                  value={newUnit.buyer}
                  onChange={(event) => setNewUnit((prev) => ({ ...prev, buyer: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={newUnit.status}
                onValueChange={(value: HandoverStatus) => setNewUnit((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_ready">Not Ready</SelectItem>
                  <SelectItem value="snagging">Snagging</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="handed_over">Handed Over</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Add Unit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Handover;
