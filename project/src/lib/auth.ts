import { backend } from './backendMock';
export type UserRole = 'student' | 'advisor' | 'admin';
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profileId: string;
  fullName: string;
}
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await backend.auth.getUser();
  if (!user) return null;
  const role = await getUserRole(user.id);
  if (!role) return null;
  const profile = await getUserProfile(user.id, role);
  if (!profile) return null;
  return {
    id: user.id,
    email: user.email!,
    role,
    profileId: profile.id,
    fullName: profile.full_name,
  };
}




export async function getCurrentUserDevFallback(): Promise<AuthUser | null> {
  const { data: { user } } = await backend.auth.getUser();
  if (!user) return null;

  const role = await getUserRole(user.id);
  const profile = role ? await getUserProfile(user.id, role) : null;
  if (role && profile) {
    return {
      id: user.id,
      email: user.email!,
      role,
      profileId: profile.id,
      fullName: profile.full_name,
    };
  }



  if (!import.meta?.env?.DEV) return null;
  const email = (user.email || '').toLowerCase();
  let devRole: UserRole = 'student';
  if (email.includes('testadvisor')) devRole = 'advisor';
  if (email.includes('testadmin')) devRole = 'admin';
  return {
    id: user.id,
    email: user.email!,
    role: devRole,
    profileId: `dev-profile-${user.id}`,
    fullName: `${devRole[0].toUpperCase() + devRole.slice(1)} (dev)`,
  };
}
async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data: studentProfile } = await backend
    .from('student_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (studentProfile) return 'student';
  const { data: advisorProfile } = await backend
    .from('advisor_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (advisorProfile) return 'advisor';
  const { data: adminProfile } = await backend
    .from('admin_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (adminProfile) return 'admin';
  return null;
}
async function getUserProfile(userId: string, role: UserRole) {
  if (role === 'student') {
    const { data } = await backend
      .from('student_profiles')
      .select('id, full_name')
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  }
  if (role === 'advisor') {
    const { data } = await backend
      .from('advisor_profiles')
      .select('id, full_name')
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  }
  if (role === 'admin') {
    const { data } = await backend
      .from('admin_profiles')
      .select('id, full_name')
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  }
  return null;
}
export async function signIn(email: string, password: string) {
  const { data, error } = await backend.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}
export async function signOut() {
  const { error } = await backend.auth.signOut();
  if (error) throw error;
}
export async function signUpStudent(data: {
  email: string;
  password: string;
  fullName: string;
  registrationNumber: string;
  currentYear: number;
  currentGpa?: number;
  githubUsername?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
}) {
  const { data: authData, error: authError } = await backend.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');
  const { error: profileError } = await backend.from('student_profiles').insert({
    user_id: authData.user.id,
    full_name: data.fullName,
    registration_number: data.registrationNumber,
    university_email: data.email,
    current_year: data.currentYear,
    current_gpa: data.currentGpa || null,
    github_username: data.githubUsername || null,
    linkedin_url: data.linkedinUrl || null,
    facebook_url: data.facebookUrl || null,
  });
  if (profileError) throw profileError;
  return authData;
}
export async function signUpAdvisor(data: {
  email: string;
  password: string;
  fullName: string;
  employeeId: string;
  department: string;
  specialization?: string;
}) {
  const { data: authData, error: authError } = await backend.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');
  const { error: profileError } = await backend.from('advisor_profiles').insert({
    user_id: authData.user.id,
    full_name: data.fullName,
    employee_id: data.employeeId,
    university_email: data.email,
    department: data.department,
    specialization: data.specialization || null,
  });
  if (profileError) throw profileError;
  return authData;
}
export async function signUpAdmin(data: {
  email: string;
  password: string;
  fullName: string;
}) {
  const { data: authData, error: authError } = await backend.auth.signUp({
    email: data.email,
    password: data.password,
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');
  const { error: profileError } = await backend.from('admin_profiles').insert({
    user_id: authData.user.id,
    full_name: data.fullName,
    admin_email: data.email,
  });
  if (profileError) throw profileError;
  return authData;
}
