import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resources, tasks, type Resource } from "@/data/demo-data";
import { Users, Wrench, Package, Building2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";

type ResourceRecord = Resource & { id: string };

const seedResources: ResourceRecord[] = resources.map((item, index) => ({
  ...item,
  id: `resource-${index + 1}`,
}));

interface ResourceForm {
  taskId: string;
  labour: string;
  vendor: string;
}

const defaultForm: ResourceForm = {
  taskId: "",
  labour: "0",
  vendor: "",
};

const Resources = () => {
  const [allocations, setAllocations] = useLocalStorageState<ResourceRecord[]>("reo-resource-allocations", seedResources);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ResourceForm>(defaultForm);

  const totalLabour = allocations.reduce((sum, item) => sum + item.labour, 0);
  const totalMachines = allocations.reduce(
    (sum, item) => sum + item.machines.reduce((acc, machine) => acc + machine.qty, 0),
    0
  );
  const materialTypes = allocations.reduce((sum, item) => sum + item.materials.length, 0);
  const vendors = allocations.filter((item) => item.vendor).length;

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.taskId) return;

    setAllocations((current) => [
      {
        id: `resource-${Math.random().toString(36).slice(2, 10)}`,
        taskId: form.taskId,
        labour: Number(form.labour || 0),
        vendor: form.vendor.trim() || undefined,
        machines: [],
        materials: [],
      },
      ...current,
    ]);

    setForm(defaultForm);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Resource Planning</h1>
          <p className="text-muted-foreground mt-1">Resource allocation across tasks</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Allocate Resource
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xl font-display font-bold">{totalLabour}</p><p className="text-xs text-muted-foreground">Total Labour</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center"><Wrench className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xl font-display font-bold">{totalMachines}</p><p className="text-xs text-muted-foreground">Machines</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center"><Package className="h-5 w-5 text-info" /></div>
            <div><p className="text-xl font-display font-bold">{materialTypes}</p><p className="text-xs text-muted-foreground">Material Types</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-success" /></div>
            <div><p className="text-xl font-display font-bold">{vendors}</p><p className="text-xs text-muted-foreground">Vendors</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {allocations.map((allocation) => {
          const task = tasks.find((taskItem) => taskItem.id === allocation.taskId);
          if (!task) return null;

          return (
            <Card key={allocation.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-display text-base">{task.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{task.department}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAllocations((current) => current.filter((item) => item.id !== allocation.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Labour</p>
                  <p className="font-medium">{allocation.labour} workers</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Machines</p>
                  {allocation.machines.map((machine, index) => (
                    <p key={index} className="text-sm">{machine.qty}× {machine.name}</p>
                  ))}
                  {allocation.machines.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Materials</p>
                  {allocation.materials.map((material, index) => (
                    <p key={index} className="text-sm">{material.qty} {material.unit} {material.name}</p>
                  ))}
                  {allocation.materials.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Vendor</p>
                  <p className="text-sm">{allocation.vendor || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Resource</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-2">
              <Label>Task</Label>
              <Select value={form.taskId} onValueChange={(value) => setForm((prev) => ({ ...prev, taskId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="labour">Labour</Label>
                <Input
                  id="labour"
                  type="number"
                  min={0}
                  value={form.labour}
                  onChange={(event) => setForm((prev) => ({ ...prev, labour: event.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={form.vendor}
                  onChange={(event) => setForm((prev) => ({ ...prev, vendor: event.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Add Allocation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;
