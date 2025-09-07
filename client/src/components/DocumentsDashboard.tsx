import { FC } from 'react';
import { FileText, Upload, Git, Lock, Search, Download } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface DocumentStats {
  totalFiles: number;
  storageUsed: string;
  sharedFiles: number;
  recentUploads: number;
}

interface RecentDocument {
  name: string;
  project: string;
  size: string;
  uploadedAt: string;
  type: 'plans' | 'photos' | 'permits';
}

const DocumentsDashboard: FC = () => {
  const stats: DocumentStats = {
    totalFiles: 1247,
    storageUsed: '24.8GB',
    sharedFiles: 342,
    recentUploads: 18
  };

  const recentDocuments: RecentDocument[] = [
    {
      name: 'Structural_Plans_v5.pdf',
      project: 'Downtown Office Renovation',
      size: '2.4 MB',
      uploadedAt: '2 hours ago',
      type: 'plans'
    },
    {
      name: 'Site_Photos_Dec10_2024.jpg',
      project: '284 Lytton Project',
      size: '18.5 MB',
      uploadedAt: '5 hours ago',
      type: 'photos'
    },
    {
      name: 'Permit_Application_B2024-1456.pdf',
      project: '128 18th Ave Construction',
      size: '890 KB',
      uploadedAt: '1 day ago',
      type: 'permits'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button variant="default">+ Upload Files</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <h3 className="text-2xl font-bold">{stats.totalFiles}</h3>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <h3 className="text-2xl font-bold">{stats.storageUsed}</h3>
              </div>
              <Upload className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Shared Files</p>
                <h3 className="text-2xl font-bold">{stats.sharedFiles}</h3>
              </div>
              <Lock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Recent Uploads</p>
                <h3 className="text-2xl font-bold">{stats.recentUploads}</h3>
              </div>
              <Upload className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">File Browser</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse and organize project files with advanced filtering and sorting.</p>
            <Button variant="default" className="w-full">Browse Files</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Bulk Upload</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload multiple files simultaneously with automatic categorization.</p>
            <Button variant="default" className="w-full">Upload Documents</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Version Control</h3>
            <p className="text-sm text-muted-foreground mb-4">Track document versions and maintain revision history.</p>
            <Button variant="default" className="w-full">Manage Versions</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Access Control</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage user permissions and secure document access.</p>
            <Button variant="default" className="w-full">Manage Access</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
            <p className="text-sm text-muted-foreground mb-4">Search documents by content, metadata, and project association.</p>
            <Button variant="default" className="w-full">Search Documents</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Export & Backup</h3>
            <p className="text-sm text-muted-foreground mb-4">Export document collections and create automated backups.</p>
            <Button variant="default" className="w-full">Export Files</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
        <div className="space-y-4">
          {recentDocuments.map((doc) => (
            <Card key={doc.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-muted-foreground">{doc.size}</p>
                    <p className="text-sm text-muted-foreground">{doc.uploadedAt}</p>
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsDashboard;
