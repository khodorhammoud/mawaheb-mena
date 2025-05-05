import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  accountStatus?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userAccountStatus: string | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userAccountStatus, setUserAccountStatus] = useState<string | undefined>(undefined);

  // You can add logic here to fetch user data from an API or local storage
  useEffect(() => {
    // Example: Fetch user data from an API
    // const fetchUser = async () => {
    //   try {
    //     const response = await fetch('/api/user');
    //     const userData = await response.json();
    //     setUser(userData);
    //     setUserAccountStatus(userData.accountStatus);
    //   } catch (error) {
    //     console.error('Failed to fetch user data:', error);
    //   }
    // };
    // fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, userAccountStatus }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
