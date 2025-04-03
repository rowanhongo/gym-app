import React, { useState, useEffect } from 'react';
import { Dumbbell, Users, Calendar, Bell, Gift, MessageSquare, LogIn } from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'member' | 'staff' | null>(null);
  const [loginStep, setLoginStep] = useState<'initial' | 'member' | 'staff'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        checkUserType(user.email!);
      } else {
        setIsLoggedIn(false);
        setUserType(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUserType = async (userEmail: string) => {
    try {
      const staffRef = collection(db, 'staff');
      const staffQuery = query(staffRef, where('email', '==', userEmail));
      const staffDocs = await getDocs(staffQuery);

      if (!staffDocs.empty) {
        setUserType('staff');
      } else {
        const membersRef = collection(db, 'users');
        const memberQuery = query(membersRef, where('email', '==', userEmail));
        const memberDocs = await getDocs(memberQuery);

        if (!memberDocs.empty) {
          setUserType('member');
          setMemberData(memberDocs.docs[0].data());
        }
      }
    } catch (error) {
      console.error('Error checking user type:', error);
    }
  };

  const handleStaffLogin = async () => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);
      setUserType('staff');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleMemberLogin = async () => {
    try {
      setError('');
      // Query Firestore for member with phone number
      const membersRef = collection(db, 'users');
      const memberQuery = query(membersRef, where('phone', '==', phoneNumber));
      const memberDocs = await getDocs(memberQuery);

      if (!memberDocs.empty) {
        setIsLoggedIn(true);
        setUserType('member');
        setMemberData(memberDocs.docs[0].data());
      } else {
        setError('Member not found. Please check your phone number.');
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUserType(null);
      setEmail('');
      setPassword('');
      setPhoneNumber('');
      setLoginStep('initial');
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };

  const InitialLoginSection = () => (
    <div className="min-h-screen bg-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          className="object-cover w-full h-full"
          alt="Gym background"
        />
        <div className="absolute inset-0 bg-white/75"></div>
      </div>
      
      <div className="relative flex min-h-screen">
        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="w-full max-w-sm mx-auto lg:w-96">
            <div className="flex items-center justify-center mb-8">
              <Dumbbell size={40} className="text-blue-600" />
              <h1 className="ml-3 text-3xl font-bold text-gray-900">FitFlow</h1>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center text-gray-900">Welcome Back</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setLoginStep('member')}
                  className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Login as Member
                </button>
                <button
                  onClick={() => setLoginStep('staff')}
                  className="w-full px-4 py-3 text-sm font-semibold text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Login as Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MemberLoginSection = () => (
    <div className="min-h-screen bg-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          className="object-cover w-full h-full"
          alt="Gym background"
        />
        <div className="absolute inset-0 bg-white/75"></div>
      </div>
      
      <div className="relative flex min-h-screen">
        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="w-full max-w-sm mx-auto lg:w-96">
            <div className="flex items-center justify-center mb-8">
              <Dumbbell size={40} className="text-blue-600" />
              <h1 className="ml-3 text-3xl font-bold text-gray-900">Member Login</h1>
            </div>
            
            <div className="space-y-6">
              {error && (
                <p className="text-sm text-center text-red-600">{error}</p>
              )}
              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleMemberLogin}
                  className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Login
                </button>
                <button
                  onClick={() => setLoginStep('initial')}
                  className="w-full px-4 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StaffLoginSection = () => (
    <div className="min-h-screen bg-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          className="object-cover w-full h-full"
          alt="Gym background"
        />
        <div className="absolute inset-0 bg-white/75"></div>
      </div>
      
      <div className="relative flex min-h-screen">
        <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="w-full max-w-sm mx-auto lg:w-96">
            <div className="flex items-center justify-center mb-8">
              <Dumbbell size={40} className="text-blue-600" />
              <h1 className="ml-3 text-3xl font-bold text-gray-900">Staff Login</h1>
            </div>
            
            <div className="space-y-6">
              {error && (
                <p className="text-sm text-center text-red-600">{error}</p>
              )}
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleStaffLogin}
                  className="w-full px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Login
                </button>
                <button
                  onClick={() => setLoginStep('initial')}
                  className="w-full px-4 py-3 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardSection = () => {
    const features = userType === 'member' 
      ? [
          { icon: Calendar, title: 'Book Classes', description: 'Schedule your next workout session' },
          { icon: Bell, title: 'Notifications', description: 'Stay updated with gym announcements' },
          { icon: Gift, title: 'Rewards', description: 'View and redeem your loyalty points' },
          { icon: MessageSquare, title: 'Support', description: 'Get help from our team' },
        ]
      : [
          { icon: Users, title: 'Members', description: 'Manage gym memberships' },
          { icon: Calendar, title: 'Classes', description: 'Manage class schedules' },
          { icon: Bell, title: 'Announcements', description: 'Send notifications to members' },
          { icon: MessageSquare, title: 'Support', description: 'Handle member inquiries' },
        ];

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Dumbbell size={28} className="text-blue-600" />
                <h1 className="ml-2 text-xl font-semibold text-gray-900">FitFlow</h1>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-10">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {userType === 'member' ? 'Member Dashboard' : 'Staff Dashboard'}
            </h2>
            {memberData && (
              <div className="mt-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
                <p className="text-gray-600">Subscription expires: {memberData.expiry_date?.toDate().toLocaleDateString()}</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <feature.icon className="w-8 h-8 text-blue-600" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  };

  if (isLoggedIn) {
    return <DashboardSection />;
  }

  switch (loginStep) {
    case 'member':
      return <MemberLoginSection />;
    case 'staff':
      return <StaffLoginSection />;
    default:
      return <InitialLoginSection />;
  }
}

export default App;