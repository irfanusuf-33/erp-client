'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { X, MapPin, Mail, Phone, Briefcase, Calendar, Users } from 'lucide-react';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  lat: number;
  lng: number;
  avatar: string;
  joinDate: string;
  teamSize?: number;
}

const employees: Employee[] = [
  {
    id: '1',
    name: 'Irfan Yousuf',
    role: 'Marketing Director',
    department: 'Marketing',
    email: 'irfan.yousuf@voctrum.com',
    phone: '+1 12312312',
    location: 'New York, USA',
    lat: 40.7128,
    lng: -74.0060,
    avatar: 'IY',
    joinDate: 'Jan 2020',
    teamSize: 12
  },
  {
    id: '2',
    name: 'Marib Hamid',
    role: 'Product Lead',
    department: 'Product',
    email: 'marib.hamid@voctrum.com',
    phone: '+1 12312312',
    location: 'San Francisco, USA',
    lat: 37.7749,
    lng: -122.4194,
    avatar: 'MH',
    joinDate: 'Mar 2019',
    teamSize: 8
  },
  {
    id: '3',
    name: 'Uzari Bahir',
    role: 'HR Director',
    department: 'Human Resources',
    email: 'uzair.bashir@voctrum.com',
    phone: '+44 12312312',
    location: 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    avatar: 'UB',
    joinDate: 'Jun 2018',
    teamSize: 6
  },
  {
    id: '4',
    name: 'Burhan Backend',
    role: 'Sales Director',
    department: 'Sales',
    email: 'jamebackend@vocyrum.com',
    phone: '+1 12312312',
    location: 'Chicago, USA',
    lat: 41.8781,
    lng: -87.6298,
    avatar: 'BB',
    joinDate: 'Sep 2019',
    teamSize: 15
  },
  {
    id: '5',
    name: 'Asrar Javeed',
    role: 'Operations Manager',
    department: 'Operations',
    email: 'asrar.javeed@voctrum.com',
    phone: '+49 12312312',
    location: 'Berlin, Germany',
    lat: 52.5200,
    lng: 13.4050,
    avatar: 'AJ',
    joinDate: 'Feb 2021',
    teamSize: 10
  },
  {
    id: '6',
    name: 'Zubair Bhar',
    role: 'Engineering Lead',
    department: 'Engineering',
    email: 'zubair,bhat@voctrum.com',
    phone: '+91 22 1234 5678',
    location: 'Mumbai, India',
    lat: 19.0760,
    lng: 72.8777,
    avatar: 'ZB',
    joinDate: 'Nov 2020',
    teamSize: 20
  },
  {
    id: '7',
    name: 'Faheem aabdullah',
    role: 'Design Director',
    department: 'Design',
    email: 'faheem.abdullah@voctrum.com',
    phone: '+33 1 1231123123',
    location: 'Paris, France',
    lat: 48.8566,
    lng: 2.3522,
    avatar: 'FA',
    joinDate: 'Apr 2019',
    teamSize: 7
  },
  {
    id: '8',
    name: 'Arsalan Majeed',
    role: 'Finance Manager',
    department: 'Finance',
    email: 'arsalan.majeed@voctrum.com',
    phone: '+82 12312312',
    location: 'Seoul, South Korea',
    lat: 37.5665,
    lng: 126.9780,
    avatar: 'AM',
    joinDate: 'Aug 2020',
    teamSize: 5
  },
  {
    id: '9',
    name: 'Mohammad Unaib',
    role: 'Customer Success Lead',
    department: 'Customer Success',
    email: 'mohammad.unaib@voctrum.com',
    phone: '+34 12312312',
    location: 'Madrid, Spain',
    lat: 40.4168,
    lng: -3.7038,
    avatar: 'MU',
    joinDate: 'Dec 2021',
    teamSize: 9
  },
  {
    id: '10',
    name: 'Saqib Sheikh',
    role: 'DevOps Engineer',
    department: 'Engineering',
    email: 'saqib.sheikh@voctrum.com',
    phone: '+61 12312312',
    location: 'Sydney, Australia',
    lat: -33.8688,
    lng: 151.2093,
    avatar: 'SS',
    joinDate: 'May 2022',
    teamSize: 4
  }
];

export default function NetworkSection() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const globeEl = useRef<any>();

  useEffect(() => {
    // Auto-rotate globe
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    
    // Point camera to employee location
    if (globeEl.current) {
      globeEl.current.pointOfView(
        { lat: employee.lat, lng: employee.lng, altitude: 1.5 },
        1000
      );
    }
  };

  return (
    <div className="relative h-[calc(100vh-200px)] min-h-[600px]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-slate-900/80 to-transparent p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Global Network</h2>
          <p className="text-slate-300 text-sm">
            {employees.length} team members across {new Set(employees.map(e => e.location.split(',')[1])).size} countries
          </p>
        </div>
      </div>

      {/* Globe */}
      <div className="w-full h-full">
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          pointsData={employees}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => '#3b82f6'}
          pointAltitude={0.01}
          pointRadius={0.6}
          pointLabel={(d: any) => `
            <div style="
              background: rgba(15, 23, 42, 0.95);
              padding: 12px 16px;
              border-radius: 8px;
              border: 1px solid rgba(59, 130, 246, 0.3);
              color: white;
              font-family: system-ui;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            ">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${d.name}</div>
              <div style="font-size: 12px; color: #94a3b8;">${d.role}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                <span style="color: #3b82f6;">📍</span> ${d.location}
              </div>
            </div>
          `}
          onPointClick={(point: any) => handleEmployeeClick(point as Employee)}
          
          // Arcs between locations (optional connections)
          arcsData={[]}
          arcColor={() => 'rgba(59, 130, 246, 0.4)'}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={3000}
          
          // Atmosphere
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.15}
          
          // Controls
          enablePointerInteraction={true}
        />
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedEmployee(null)}
          />
          
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 pb-16">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-600 shadow-lg">
                    {selectedEmployee.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {selectedEmployee.name}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {selectedEmployee.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 -mt-8">
                {/* Department Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {selectedEmployee.department}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {selectedEmployee.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {selectedEmployee.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {selectedEmployee.phone}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Joined</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {selectedEmployee.joinDate}
                        </p>
                      </div>
                    </div>

                    {selectedEmployee.teamSize && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <Users className="w-5 h-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Team</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {selectedEmployee.teamSize} members
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                    View Profile
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
