import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { Auth } from './components/Auth';
import { StudentApp } from './components/StudentApp';
import { TeacherApp } from './components/TeacherApp';

interface Profile {
  id: string;
  role: 'student' | 'teacher';
  email: string;
}

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchProfile(session.user);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`role, email`)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // 如果获取profile失败，尝试从user的metadata中获取role
        const roleFromMetadata = user.user_metadata?.role as 'student' | 'teacher';
        if (roleFromMetadata) {
          console.log('Using role from user metadata:', roleFromMetadata);
          setProfile({
            id: user.id,
            role: roleFromMetadata,
            email: user.email || ''
          });
        } else {
          // 默认设为学生角色
          console.log('Using default student role');
          setProfile({
            id: user.id,
            role: 'student',
            email: user.email || ''
          });
        }
        return;
      }

      if (data) {
        setProfile({
          id: user.id,
          role: data.role as 'student' | 'teacher',
          email: data.email || user.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // 捕获异常时也设置默认profile
      setProfile({
        id: user.id,
        role: 'student',
        email: user.email || ''
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || !profile) {
    return <Auth />;
  }

  return profile.role === 'student' ? (
    <StudentApp session={session} profile={profile} />
  ) : (
    <TeacherApp session={session} profile={profile} />
  );
};

export default App;