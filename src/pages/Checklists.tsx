import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { checklistTemplates as demoTemplates, type ChecklistTemplate } from "@/data/demo-data";
import { useState } from "react";
import { Search, CheckSquare, Plus, Trash2, Edit2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Checklists = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(demoTemplates);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formItems, setFormItems] = useState<string[]>([""]);

  const categories = [...new Set(templates.map(t => t.category))];

  const filtered = templates.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && t.category !== category) return false;
    return true;
  });

  const resetForm = () => { setFormName(""); setFormCategory(""); setFormItems([""]); };

  const handleCreate = () => {
    if (!formName.trim()) return;
    const items = formItems.filter(i => i.trim());
    if (items.length === 0) return;
    const newTemplate: ChecklistTemplate = { id: `ct_${Date.now()}`, name: formName, category: formCategory || 'General', items };
    setTemplates(prev => [...prev, newTemplate]);
    toast({ title: "Template created", description: `"${formName}" with ${items.length} items.` });
    setCreateOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingTemplate || !formName.trim()) return;
    const items = formItems.filter(i => i.trim());
    setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, name: formName, category: formCategory || t.category, items } : t));
    toast({ title: "Template updated" });
    setEditingTemplate(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({ title: "Template deleted" });
  };

  const openEdit = (template: ChecklistTemplate) => {
    setFormName(template.name);
    setFormCategory(template.category);
    setFormItems([...template.items, ""]);
    setEditingTemplate(template);
  };

  const TemplateForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Template Name *</Label>
          <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Slab Casting" />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="e.g., Foundation" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Checklist Items</Label>
        {formItems.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input value={item} onChange={e => { const items = [...formItems]; items[i] = e.target.value; setFormItems(items); }} placeholder={`Item ${i + 1}`} />
            {formItems.length > 1 && (
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setFormItems(formItems.filter((_, j) => j !== i))}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setFormItems([...formItems, ""])}><Plus className="h-3 w-3 mr-1" />Add Item</Button>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => { setCreateOpen(false); setEditingTemplate(null); resetForm(); }}>Cancel</Button>
        <Button onClick={onSubmit} disabled={!formName.trim()}>{submitLabel}</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Checklist Library</h1>
          <p className="text-muted-foreground mt-1">{templates.length} templates across {categories.length} categories</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create Checklist Template</DialogTitle>
            </DialogHeader>
            <TemplateForm onSubmit={handleCreate} submitLabel="Create Template" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={!category ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setCategory(null)}>All</Badge>
        {categories.map(c => (
          <Badge key={c} variant={category === c ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setCategory(c)}>{c}</Badge>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-display">{template.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Dialog open={editingTemplate?.id === template.id} onOpenChange={open => { if (!open) { setEditingTemplate(null); resetForm(); } }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(template)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-display text-xl">Edit Template</DialogTitle>
                      </DialogHeader>
                      <TemplateForm onSubmit={handleEdit} submitLabel="Save Changes" />
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs w-fit">{template.category}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {template.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3">{template.items.length} items</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Checklists;
