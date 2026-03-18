import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, FileSpreadsheet, File } from "lucide-react";

const documents = [
  { name: 'Marine Heights - Master Plan', type: 'PDF', category: 'Planning', project: 'Marine Heights', date: '2024-01-10', size: '12.5 MB' },
  { name: 'Structural Drawing - Tower A', type: 'DWG', category: 'Design', project: 'Marine Heights', date: '2024-02-20', size: '45.2 MB' },
  { name: 'RERA Certificate', type: 'PDF', category: 'Legal', project: 'Marine Heights', date: '2024-03-15', size: '1.2 MB' },
  { name: 'Environmental Clearance', type: 'PDF', category: 'Approvals', project: 'Marine Heights', date: '2024-01-10', size: '3.4 MB' },
  { name: 'Soil Test Report', type: 'PDF', category: 'Reports', project: 'Palm Gardens', date: '2025-03-01', size: '8.7 MB' },
  { name: 'Material Procurement Schedule', type: 'XLSX', category: 'Procurement', project: 'Marine Heights', date: '2025-01-15', size: '2.1 MB' },
  { name: 'Site Progress Photos - Feb 2025', type: 'ZIP', category: 'Photos', project: 'Marine Heights', date: '2025-02-28', size: '156 MB' },
  { name: 'Skyline Residences - BOQ', type: 'XLSX', category: 'Procurement', project: 'Skyline Residences', date: '2024-07-10', size: '4.5 MB' },
  { name: 'Fire Safety Design', type: 'PDF', category: 'Design', project: 'Marine Heights', date: '2024-11-20', size: '18.3 MB' },
  { name: 'Labour Compliance Certificate', type: 'PDF', category: 'Legal', project: 'Marine Heights', date: '2025-01-30', size: '0.8 MB' },
];

const iconMap: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-5 w-5 text-destructive" />,
  XLSX: <FileSpreadsheet className="h-5 w-5 text-success" />,
  DWG: <File className="h-5 w-5 text-primary" />,
  ZIP: <Image className="h-5 w-5 text-warning" />,
};

const Documents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-1">{documents.length} documents</p>
      </div>
      <div className="space-y-2">
        {documents.map((doc, i) => (
          <Card key={i} className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              {iconMap[doc.type] || <File className="h-5 w-5 text-muted-foreground" />}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">{doc.project} · {doc.date}</p>
              </div>
              <Badge variant="secondary" className="text-xs hidden md:flex">{doc.category}</Badge>
              <span className="text-xs text-muted-foreground">{doc.size}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Documents;
