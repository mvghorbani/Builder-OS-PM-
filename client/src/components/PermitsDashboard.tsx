import { FC } from 'react';
import { FileText, Search, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface PermitActivity {
  id: string;
  title: string;
  description: string;
  department: string;
  status: 'Approved' | 'Under Review' | 'Action Required';
  date: string;
}

interface Inspection {
  type: string;
  project: string;
  date: string;
  time: string;
  location: string;
}

const PermitsDashboard: FC = () => {
  const recentActivity: PermitActivity[] = [
    {
      id: 'B-2024-1456',
      title: 'Building Permit #B-2024-1456',
      description: '717 S Palmway Development - Structural modifications approved',
      department: 'San Francisco Building Dept.',
      status: 'Approved',
      date: 'Dec 10, 2024'
    },
    {
      id: 'E-2024-3789',
      title: 'Electrical Permit #E-2024-3789',
      description: '284 Lytton Project - Electrical system upgrade',
      department: 'Oakland Building Dept.',
      status: 'Under Review',
      date: 'Dec 5, 2024'
    },
    {
      id: 'P-2024-2134',
      title: 'Plumbing Permit #P-2024-2134',
      description: '128 18th Ave Construction - Additional documentation required',
      department: 'San Jose Building Dept.',
      status: 'Action Required',
      date: 'Dec 18, 2024'
    }
  ];

  const upcomingInspections: Inspection[] = [
    {
      type: 'Foundation Inspection',
      project: 'Downtown Office Renovation',
      date: 'December 15, 2024',
      time: '10:00 AM',
      location: '123 Market Street, San Francisco'
    },
    {
      type: 'Electrical Rough-in',
      project: '284 Lytton Project',
      date: 'December 18, 2024',
      time: '2:00 PM',
      location: '284 Lytton Ave, Palo Alto'
    },
    {
      type: 'Framing Inspection',
      project: '128 18th Ave Construction',
      date: 'December 20, 2024',
      time: '9:00 AM',
      location: '789 Residential Way, San Jose'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Document Management</h3>
            <p className="text-sm text-muted-foreground mb-4">Organize and manage all permit-related documentation.</p>
            <Button variant="default" className="w-full">Manage Documents</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Permit Lookup</h3>
            <p className="text-sm text-muted-foreground mb-4">Search and verify permit status across jurisdictions.</p>
            <Button variant="default" className="w-full">Search Permits</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Compliance Reports</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate compliance reports and permit summaries.</p>
            <Button variant="default" className="w-full">Generate Reports</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Permit Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {activity.status === 'Approved' && <CheckCircle className="h-6 w-6 text-green-500" />}
                    {activity.status === 'Under Review' && <Clock className="h-6 w-6 text-yellow-500" />}
                    {activity.status === 'Action Required' && <AlertTriangle className="h-6 w-6 text-red-500" />}
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={
                          activity.status === 'Approved' ? 'default' :
                          activity.status === 'Under Review' ? 'secondary' :
                          'destructive'
                        }>
                          {activity.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {activity.department} • {activity.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Inspections</h2>
        <div className="grid grid-cols-3 gap-4">
          {upcomingInspections.map((inspection) => (
            <Card key={inspection.type}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{inspection.type}</h3>
                <p className="text-sm text-muted-foreground">{inspection.project}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{inspection.date} at {inspection.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{inspection.location}</span>
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

export default PermitsDashboard;
