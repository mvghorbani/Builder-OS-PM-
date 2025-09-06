
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Search,
  Folder,
  Image,
  File,
  Archive,
  Share2,
  Lock,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

export default function Documents() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('documents');

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/api/auth/login';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout activeView={activeView} onViewChange={setActiveView}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Documents</h1>
                <p className="text-base sm:text-lg text-gray-600">Project files, documentation, and asset management</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <Search className="w-4 h-4" />
                  Search Files
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
          </header>

          {/* Document Overview */}
          <div className="mb-8 sm:mb-12 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Files</p>
                    <p className="text-3xl font-bold text-gray-900">1,247</p>
                    <p className="text-xs text-blue-600 mt-1">Across all projects</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Storage Used</p>
                    <p className="text-3xl font-bold text-gray-900">24.8GB</p>
                    <p className="text-xs text-green-600 mt-1">62% of capacity</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Archive className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Shared Files</p>
                    <p className="text-3xl font-bold text-gray-900">342</p>
                    <p className="text-xs text-purple-600 mt-1">With team access</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recent Uploads</p>
                    <p className="text-3xl font-bold text-gray-900">18</p>
                    <p className="text-xs text-orange-600 mt-1">This week</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Management Tools */}
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {/* File Browser */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-600" />
                  File Browser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Browse and organize project files with advanced filtering and sorting.</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Browse Files
                </Button>
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  Bulk Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Upload multiple files simultaneously with automatic categorization.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Upload Documents
                </Button>
              </CardContent>
            </Card>

            {/* Version Control */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-purple-600" />
                  Version Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Track document versions and maintain revision history.</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Manage Versions
                </Button>
              </CardContent>
            </Card>

            {/* Access Control */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-600" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage user permissions and secure document access.</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Manage Access
                </Button>
              </CardContent>
            </Card>

            {/* Document Search */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-red-600" />
                  Advanced Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Search documents by content, metadata, and project association.</p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Search Documents
                </Button>
              </CardContent>
            </Card>

            {/* Export & Backup */}
            <Card className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-600" />
                  Export & Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Export document collections and create automated backups.</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Export Files
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Recent Documents</h2>
            <div className="space-y-4">
              <Card className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Structural_Plans_v2.pdf</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Downtown Office Renovation</span>
                          <span>•</span>
                          <span>2.4 MB</span>
                          <span>•</span>
                          <span>Uploaded 2 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Plans</Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Image className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Site_Photos_Dec10_2024.zip</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Harbor View Apartments</span>
                          <span>•</span>
                          <span>15.7 MB</span>
                          <span>•</span>
                          <span>Uploaded 5 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Photos</Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <File className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Permit_Application_B2024-1456.pdf</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Residential Complex Phase 2</span>
                          <span>•</span>
                          <span>890 KB</span>
                          <span>•</span>
                          <span>Uploaded 1 day ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">Permits</Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Document Categories */}
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Document Categories</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border border-blue-200 bg-blue-50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-1">Plans & Drawings</h3>
                  <p className="text-sm text-blue-800 mb-2">Architectural and engineering plans</p>
                  <p className="text-lg font-bold text-blue-900">247 files</p>
                </CardContent>
              </Card>

              <Card className="border border-green-200 bg-green-50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Image className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-900 mb-1">Photos & Media</h3>
                  <p className="text-sm text-green-800 mb-2">Progress photos and videos</p>
                  <p className="text-lg font-bold text-green-900">583 files</p>
                </CardContent>
              </Card>

              <Card className="border border-purple-200 bg-purple-50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <File className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-1">Permits & Legal</h3>
                  <p className="text-sm text-purple-800 mb-2">Official documentation</p>
                  <p className="text-lg font-bold text-purple-900">124 files</p>
                </CardContent>
              </Card>

              <Card className="border border-orange-200 bg-orange-50 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Archive className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-orange-900 mb-1">Contracts</h3>
                  <p className="text-sm text-orange-800 mb-2">Vendor and client agreements</p>
                  <p className="text-lg font-bold text-orange-900">293 files</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
