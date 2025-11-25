import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

const mockFiles: UploadedFile[] = [
  { id: '1', name: 'Student_List_2025.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '2025-01-15' },
  { id: '2', name: 'Attendance_Report_Jan.xlsx', type: 'Excel', size: '1.8 MB', uploadDate: '2025-01-14' },
  { id: '3', name: 'Class_Schedule.docx', type: 'Word', size: '856 KB', uploadDate: '2025-01-13' },
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>(mockFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload logic here
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Files</h1>
        <p className="text-muted-foreground mt-2">Upload and manage documents and files.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`glass-card shadow-card border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
              <p className="text-muted-foreground mb-4">
                or click to browse from your computer
              </p>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Select Files
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Maximum file size: 20MB
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card shadow-card">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative rounded-lg border border-border bg-card p-4 hover:shadow-elegant transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {file.type} • {file.size}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
