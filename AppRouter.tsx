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

// 首页：角色选择
const RoleSelector: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 font-sans">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8">交互式 AI 教师平台</h1>
        <p className="text-slate-300 text-lg mb-12">请选择您的身份</p>
        
        <div className="flex gap-8 justify-center">
          <a
            href="/teacher"
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg rounded-lg transition-colors transform hover:scale-105"
          >
            教师端
          </a>
          <a
            href="/student"
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg rounded-lg transition-colors transform hover:scale-105"
          >
            学生端
          </a>
        </div>
      </div>
    </div>
  );
};

const AppRouter: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);

  useEffect(() => {
    // 根据当前路径获取预期的角色
    const path = window.location.pathname;
    if (path.startsWith('/teacher')) {
      setRole('teacher');
    } else if (path.startsWith('/student')) {
      setRole('student');
    } else if (path.startsWith('/clear-session')) {
      // 显示清理工具
      window.location.href = '/clearSession.html';
      return;
    }

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
        const roleFromMetadata = user.user_metadata?.role as 'student' | 'teacher';
        if (roleFromMetadata) {
          console.log('Using role from user metadata:', roleFromMetadata);
          setProfile({
            id: user.id,
            role: roleFromMetadata,
            email: user.email || ''
          });
        } else {
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

  // 如果没有选定角色，显示角色选择页面
  if (!role) {
    return <RoleSelector />;
  }

  // 如果没有登录会话，显示登录页面
  if (!session || !profile) {
    return <Auth defaultRole={role} />;
  }

  // 严格角色检查：必须匹配当前路径的角色要求
  if (profile.role !== role) {
    console.log(`角色不匹配: 用户是 ${profile.role}, 但访问路径要求 ${role}, 强制登出并重定向...`);
    const handleRoleMismatch = async () => {
      await supabase.auth.signOut();
      window.location.href = role === 'teacher' ? '/teacher' : '/student';
    };
    handleRoleMismatch();
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-cyan-400 text-xl">切换角色中，请稍候...</div>
      </div>
    );
  }

  // 登录成功，显示对应的应用
  return profile.role === 'student' ? (
    <StudentApp session={session} profile={profile} />
  ) : (
    <TeacherApp session={session} profile={profile} />
  );
};

export default AppRouter;
