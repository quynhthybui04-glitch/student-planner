import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BookOpen, CalendarDays,
  Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, GraduationCap,
  LayoutDashboard, LogOut, Menu, Moon, Plus, Search, Settings, Sparkles,
  Target, Trash2, TrendingUp, X, ListTodo, Pencil, LoaderCircle
} from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const NAV = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'courses', label: 'Môn học', icon: BookOpen },
  { id: 'tasks', label: 'Bài tập', icon: ListTodo },
  { id: 'calendar', label: 'Lịch học', icon: CalendarDays },
  { id: 'goals', label: 'Mục tiêu', icon: Target },
  { id: 'analytics', label: 'Thống kê', icon: TrendingUp },
];
const COLORS = ['#6759e8', '#e7a23b', '#30a88a', '#e06b8b', '#4388d8'];
const DEMO_MODE = !isSupabaseConfigured;
const dateOffset = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const DEMO_DATA = {
  courses: [
    { id: 'demo-course-1', name: 'Nhập môn lập trình', code: 'PRF101', lecturer: 'Thầy Minh', credits: 3, color: '#6759e8', notes: 'Ôn tập JavaScript', created_at: new Date().toISOString() },
    { id: 'demo-course-2', name: 'Kỹ năng học tập đại học', code: 'SSG104', lecturer: 'Cô Lan', credits: 2, color: '#30a88a', notes: '', created_at: new Date().toISOString() },
    { id: 'demo-course-3', name: 'Tiếng Anh cơ bản', code: 'ENG101', lecturer: 'Thầy Alex', credits: 3, color: '#e7a23b', notes: '', created_at: new Date().toISOString() }
  ],
  tasks: [
    { id: 'demo-task-1', title: 'Hoàn thành bài thực hành tuần 3', course_id: 'demo-course-1', description: 'Hoàn thiện các bài tập về biến và hàm.', due_date: dateOffset(2), priority: 'high', status: 'in_progress', estimated_minutes: 90, created_at: new Date().toISOString() },
    { id: 'demo-task-2', title: 'Đọc tài liệu kỹ năng học tập', course_id: 'demo-course-2', description: 'Ghi lại 5 ý chính.', due_date: dateOffset(1), priority: 'medium', status: 'not_started', estimated_minutes: 45, created_at: new Date().toISOString() },
    { id: 'demo-task-3', title: 'Luyện từ vựng Unit 2', course_id: 'demo-course-3', description: 'Ôn từ vựng và làm quiz.', due_date: dateOffset(4), priority: 'low', status: 'not_started', estimated_minutes: 30, created_at: new Date().toISOString() },
    { id: 'demo-task-4', title: 'Nộp bài phản tư tuần trước', course_id: 'demo-course-2', description: 'Bài đã nộp thành công.', due_date: dateOffset(-1), priority: 'medium', status: 'completed', estimated_minutes: 60, created_at: new Date().toISOString() },
    { id: 'demo-task-5', title: 'Ôn tập vòng lặp', course_id: 'demo-course-1', description: 'Làm lại ví dụ trên lớp.', due_date: dateOffset(-2), priority: 'high', status: 'not_started', estimated_minutes: 60, created_at: new Date().toISOString() }
  ],
  schedule_events: [
    { id: 'demo-event-1', title: 'Nhập môn lập trình', event_type: 'class', course_id: 'demo-course-1', event_date: dateOffset(1), start_time: '08:00', end_time: '10:00', location: 'Phòng A203', notes: '', created_at: new Date().toISOString() },
    { id: 'demo-event-2', title: 'Ôn tập tiếng Anh', event_type: 'personal', course_id: 'demo-course-3', event_date: dateOffset(2), start_time: '14:00', end_time: '15:00', location: 'Thư viện', notes: '', created_at: new Date().toISOString() },
    { id: 'demo-event-3', title: 'Kiểm tra giữa kỳ', event_type: 'exam', course_id: 'demo-course-2', event_date: dateOffset(5), start_time: '09:00', end_time: '10:30', location: 'Phòng B101', notes: '', created_at: new Date().toISOString() }
  ],
  study_goals: [
    { id: 'demo-goal-1', title: 'Hoàn thành bài tập đúng hạn', description: 'Theo dõi deadline và chia nhỏ công việc.', start_date: dateOffset(-7), due_date: dateOffset(14), progress: 65, created_at: new Date().toISOString() },
    { id: 'demo-goal-2', title: 'Duy trì thói quen học tiếng Anh', description: 'Học ít nhất 20 phút mỗi ngày.', start_date: dateOffset(-3), due_date: dateOffset(21), progress: 35, created_at: new Date().toISOString() }
  ],
  notifications: []
};
const TODAY = new Date().toISOString().slice(0, 10);
const blankData = { courses: [], tasks: [], schedule_events: [], study_goals: [], notifications: [] };
const prettyDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Chưa đặt';
const dueLabel = (date) => {
  if (!date) return 'Chưa có hạn';
  const diff = Math.round((new Date(`${date}T00:00:00`) - new Date(`${TODAY}T00:00:00`)) / 86400000);
  if (diff < 0) return `Quá hạn ${Math.abs(diff)} ngày`;
  if (diff === 0) return 'Hạn hôm nay';
  if (diff === 1) return 'Hạn ngày mai';
  return `Còn ${diff} ngày`;
};
const isOverdue = (task) => task.due_date && task.due_date < TODAY && task.status !== 'completed';
const safeError = (e) => e?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(!DEMO_MODE);
  const [page, setPage] = useState('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [profile, setProfile] = useState(DEMO_MODE ? { full_name: 'Sinh viên Demo', email: 'demo@student-planner.local' } : { full_name: '', email: '' });
  const [data, setData] = useState(DEMO_MODE ? DEMO_DATA : blankData);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dark, setDark] = useState(false);

  const notify = useCallback((message, type = 'success') => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3500);
  }, []);

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    const tables = Object.keys(blankData);
    const results = await Promise.all(tables.map((table) => supabase.from(table).select('*').order('created_at', { ascending: false }).then((r) => ({ table, ...r }))));
    const failed = results.find((r) => r.error);
    if (failed) {
      notify(`Không tải được dữ liệu (${failed.table}): ${failed.error.message}`, 'error');
    } else {
      const next = { ...blankData };
      results.forEach(({ table, data: rows }) => { next[table] = rows || []; });
      setData(next);
    }
    const { data: p } = await supabase.from('profiles').select('full_name,email').eq('id', session.user.id).maybeSingle();
    setProfile({ full_name: p?.full_name || session.user.user_metadata?.full_name || '', email: p?.email || session.user.email || '' });
    setLoading(false);
  }, [session, notify]);

  useEffect(() => { loadData(); }, [loadData]);

  const allTasks = data.tasks;
  const pendingTasks = allTasks.filter((t) => t.status !== 'completed');
  const completedTasks = allTasks.filter((t) => t.status === 'completed');
  const overdueTasks = pendingTasks.filter(isOverdue);
  const upcomingTasks = pendingTasks.filter((t) => t.due_date >= TODAY).sort((a,b) => (a.due_date || '').localeCompare(b.due_date || '')).slice(0, 4);
  const completion = allTasks.length ? Math.round(completedTasks.length / allTasks.length * 100) : 0;
  const activeNav = NAV.find((n) => n.id === page);

  async function mutate(table, mode, values, id) {
    if (DEMO_MODE) {
      setData((current) => {
        const rows = current[table] || [];
        if (mode === 'delete') return { ...current, [table]: rows.filter((row) => row.id !== id) };
        if (mode === 'update') return { ...current, [table]: rows.map((row) => row.id === id ? { ...row, ...values } : row) };
        return { ...current, [table]: [{ ...values, id: `demo-${table}-${Date.now()}`, created_at: new Date().toISOString() }, ...rows] };
      });
      notify(mode === 'delete' ? 'Đã xóa dữ liệu demo.' : mode === 'update' ? 'Đã cập nhật dữ liệu demo.' : 'Đã thêm dữ liệu demo.');
      setModal(null);
      return true;
    }
    if (!supabase || !session?.user) return notify('Bạn cần đăng nhập và cấu hình Supabase.', 'error');
    let result;
    if (mode === 'delete') result = await supabase.from(table).delete().eq('id', id);
    else if (mode === 'update') result = await supabase.from(table).update(values).eq('id', id).select().single();
    else result = await supabase.from(table).insert({ ...values, user_id: session.user.id }).select().single();
    if (result.error) { notify(safeError(result.error), 'error'); return false; }
    await loadData();
    notify(mode === 'delete' ? 'Đã xóa dữ liệu.' : mode === 'update' ? 'Đã cập nhật thành công.' : 'Đã thêm dữ liệu thành công.');
    setModal(null);
    return true;
  }

  async function signOut() {
    if (DEMO_MODE) { setData(DEMO_DATA); setProfile({ full_name: 'Sinh viên Demo', email: 'demo@student-planner.local' }); setPage('dashboard'); notify('Đã làm mới dữ liệu demo.'); return; }
    const { error } = await supabase.auth.signOut();
    if (error) notify(safeError(error), 'error');
    else { setData(blankData); setPage('dashboard'); notify('Bạn đã đăng xuất.'); }
  }

  if (authLoading) return <Centered><LoaderCircle className="spin" size={26} /><p>Đang kiểm tra phiên đăng nhập...</p></Centered>;
  if (!isSupabaseConfigured && !DEMO_MODE) return <SetupScreen />;
  if (!session && !DEMO_MODE) return <AuthScreen notify={notify} />;
  return (
    <div className={`app-shell ${dark ? 'dark' : ''}`}>
      {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Đóng menu" />}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand"><div className="brand-mark"><GraduationCap size={22} /></div><div><strong>studyflow</strong><span>STUDENT PLANNER</span></div><button className="icon-button sidebar-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
        <div className="workspace-label">KHÔNG GIAN HỌC TẬP</div>
        <nav className="main-nav">
          {NAV.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setMobileNav(false); setQuery(''); }}><item.icon size={18}/><span>{item.label}</span>{item.id === 'tasks' && overdueTasks.length > 0 && <em>{overdueTasks.length}</em>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="focus-card"><div className="focus-icon"><Sparkles size={17}/></div><strong>Học tập có kế hoạch</strong><p>Tiến bộ mỗi ngày, từng bước một.</p><div className="mini-progress"><span style={{ width: `${completion}%` }}/></div><small>{completion}% nhiệm vụ hoàn thành</small></div>
          <button className="nav-item" onClick={() => setPage('settings')}><Settings size={18}/><span>Cài đặt</span></button>
          <div className="profile-row"><div className="avatar">{(profile.full_name || profile.email || 'SV').slice(0,1).toUpperCase()}</div><div className="profile-copy"><strong>{profile.full_name || 'Sinh viên'}</strong><span>{profile.email}</span></div><button className="icon-button" title="Đăng xuất" onClick={signOut}><LogOut size={17}/></button></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileNav(true)}><Menu size={21}/></button><div className="breadcrumb">Không gian học tập <span>/</span> <strong>{activeNav?.label || (page === 'settings' ? 'Cài đặt' : 'Chi tiết')}</strong></div></div>
          <div className="top-actions"><div className="date-chip"><CalendarDays size={15}/>{new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: 'short' })}</div><button className="icon-button" title="Đổi giao diện" onClick={() => setDark(!dark)}><Moon size={18}/></button><button className="notification-button" title="Thông báo" onClick={() => setPage('tasks')}><Bell size={18}/>{overdueTasks.length > 0 && <i/>}</button></div>
        </header>
        <div className="page-content">
          {loading && <div className="loading-line"><span/></div>}
          {page === 'dashboard' && <Dashboard profile={profile} data={data} completion={completion} pendingTasks={pendingTasks} completedTasks={completedTasks} overdueTasks={overdueTasks} upcomingTasks={upcomingTasks} setPage={setPage} setModal={setModal} />}
          {page === 'courses' && <Courses data={data} query={query} setQuery={setQuery} setModal={setModal} mutate={mutate}/>}
          {page === 'tasks' && <Tasks data={data} query={query} setQuery={setQuery} statusFilter={statusFilter} setStatusFilter={setStatusFilter} setModal={setModal} mutate={mutate}/>}
          {page === 'calendar' && <CalendarPage data={data} setModal={setModal}/>}
          {page === 'goals' && <Goals data={data} setModal={setModal} mutate={mutate}/>}
          {page === 'analytics' && <Analytics data={data} completion={completion} overdueTasks={overdueTasks}/>}
          {page === 'settings' && <SettingsPage profile={profile} notify={notify} session={session} reload={loadData} demoMode={DEMO_MODE} setProfile={setProfile}/>}
        </div>
        <footer className="footer"><span>Studyflow · Student Planner</span><span>Học tập thông minh hơn mỗi ngày ✦</span></footer>
      </main>
      {modal && <DataModal modal={modal} data={data} close={() => setModal(null)} save={mutate}/>}
      {notice && <div className={`toast ${notice.type}`}><span>{notice.type === 'error' ? '!' : <Check size={16}/>}</span>{notice.message}<button onClick={() => setNotice(null)}><X size={15}/></button></div>}
    </div>
  );
}

function Centered({ children }) { return <div className="centered">{children}</div>; }

function SetupScreen() {
  return <div className="setup-page"><div className="setup-card"><div className="brand-mark large"><GraduationCap size={28}/></div><p className="eyebrow">STUDENT PLANNER · SETUP</p><h1>Chào mừng đến với Studyflow</h1><p className="muted">Gần hoàn tất rồi! Hãy kết nối dự án Supabase để bật đăng nhập và lưu dữ liệu trực tuyến.</p><div className="setup-steps"><div><b>01</b><span><strong>Tạo dự án Supabase</strong><small>Truy cập supabase.com và tạo một project mới.</small></span></div><div><b>02</b><span><strong>Tạo database</strong><small>Mở SQL Editor, chạy nội dung trong <code>supabase/schema.sql</code>.</small></span></div><div><b>03</b><span><strong>Thêm biến môi trường</strong><small>Sao chép <code>.env.example</code> thành <code>.env</code> và điền Project URL cùng publishable/anon key.</small></span></div></div><p className="security-note">Chỉ dùng khóa publishable/anon ở frontend. Tuyệt đối không đưa service_role key vào website.</p><p className="muted small">Sau khi lưu file <code>.env</code>, khởi động lại máy chủ phát triển.</p></div></div>;
}

function AuthScreen({ notify }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setError('');
    if (password.length < 6) return setError('Mật khẩu cần có ít nhất 6 ký tự.');
    setBusy(true);
    let result;
    if (mode === 'signup') result = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    else result = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) setError(result.error.message);
    else if (mode === 'signup' && !result.data.session) setError('Tài khoản đã được tạo. Hãy kiểm tra email để xác nhận rồi đăng nhập.');
    else notify(mode === 'signup' ? 'Tạo tài khoản thành công.' : 'Đăng nhập thành công.');
  }
  return <div className="auth-page"><div className="auth-art"><div className="art-glow"/><div className="brand light"><div className="brand-mark"><GraduationCap size={22}/></div><div><strong>studyflow</strong><span>STUDENT PLANNER</span></div></div><div className="art-copy"><span className="eyebrow">YOUR SPACE TO GROW</span><h1>Làm chủ thời gian.<br/><em>Chủ động tương lai.</em></h1><p>Một không gian nhỏ để bạn sắp xếp việc học, theo dõi mục tiêu và tiến bộ mỗi ngày.</p><div className="art-tags"><span><CheckCircle2 size={15}/> Kế hoạch rõ ràng</span><span><CheckCircle2 size={15}/> Tiến độ trực quan</span></div></div><div className="art-footer">Được thiết kế cho hành trình đại học của bạn.</div></div><div className="auth-panel"><div className="auth-box"><div className="auth-mobile-brand"><div className="brand-mark"><GraduationCap size={22}/></div><strong>studyflow</strong></div><p className="eyebrow">{mode === 'login' ? 'CHÀO MỪNG TRỞ LẠI' : 'BẮT ĐẦU HÀNH TRÌNH'}</p><h2>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2><p className="muted">{mode === 'login' ? 'Tiếp tục kế hoạch học tập của bạn.' : 'Tạo không gian học tập cá nhân của riêng bạn.'}</p><form onSubmit={submit} className="auth-form">{mode === 'signup' && <label>Họ và tên<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nguyễn Văn A"/></label>}<label>Email sinh viên<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label><label>Mật khẩu<input required type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Ít nhất 6 ký tự"/></label>{error && <div className="form-error">{error}</div>}<button className="primary-button full" disabled={busy}>{busy ? <LoaderCircle size={17} className="spin"/> : null}{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'} <span>→</span></button></form><p className="switch-auth">{mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>{mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}</button></p><div className="auth-privacy"><span>🔒</span> Dữ liệu học tập được bảo vệ theo tài khoản của bạn.</div></div></div></div>;
}

function PageHeading({ eyebrow, title, description, action, actionLabel = 'Thêm mới' }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div>{action && <button className="primary-button" onClick={action}><Plus size={17}/>{actionLabel}</button>}</div>;
}
function StatCard({ label, value, caption, icon: Icon, tone = 'purple', trend }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-caption">{trend && <span className="trend"><ArrowUpRight size={13}/></span>}{caption}</div></div>;
}
function EmptyState({ icon: Icon = CircleHelp, title, description, action, buttonText }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={23}/></div><strong>{title}</strong><p>{description}</p>{action && <button className="secondary-button" onClick={action}><Plus size={15}/>{buttonText || 'Thêm mới'}</button>}</div>;
}
function Dashboard({ profile, data, completion, pendingTasks, completedTasks, overdueTasks, upcomingTasks, setPage, setModal }) {
  const firstName = (profile.full_name || 'bạn').trim().split(' ')[0];
  const weekDays = ['T2','T3','T4','T5','T6','T7','CN'];
  const chartData = weekDays.map((day, i) => ({ day, done: i === 0 ? completedTasks.length : Math.max(0, Math.round(completedTasks.length * (i+1) / 7)) }));
  return <><PageHeading eyebrow="TỔNG QUAN HỌC TẬP" title={`Chào ${firstName} 👋`} description="Mỗi kế hoạch tốt bắt đầu từ một bước nhỏ. Cùng xem hôm nay bạn có gì nhé." action={() => setModal({ table: 'tasks' })} actionLabel="Thêm bài tập"/><div className="welcome-strip"><div><div className="welcome-pill"><Sparkles size={13}/> KẾ HOẠCH CỦA BẠN</div><h2>Học tập có kế hoạch,<br/>tiến bộ <em>mỗi ngày.</em></h2><p>Hãy dành vài phút để sắp xếp những việc quan trọng nhất.</p><button className="welcome-link" onClick={() => setPage('tasks')}>Xem danh sách bài tập <span>→</span></button></div><div className="welcome-illustration"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="floating-note note-one"><CheckCircle2 size={17}/><span><b>Tiến độ</b><small>{completion}% hoàn thành</small></span></div><div className="book-stack"><div className="book book-a"/><div className="book book-b"/><div className="book book-c"><BookOpen size={35}/></div></div><div className="floating-note note-two"><Target size={17}/><span><b>Mục tiêu</b><small>Tiến từng bước</small></span></div></div></div><div className="stats-grid"><StatCard label="Môn học" value={data.courses.length} caption="Đang theo dõi" icon={BookOpen} tone="purple"/><StatCard label="Chưa hoàn thành" value={pendingTasks.length} caption="Nhiệm vụ cần xử lý" icon={ListTodo} tone="orange"/><StatCard label="Đã hoàn thành" value={completedTasks.length} caption="Nhiệm vụ đã xong" icon={CheckCircle2} tone="green"/><StatCard label="Quá hạn" value={overdueTasks.length} caption={overdueTasks.length ? 'Cần ưu tiên xử lý' : 'Bạn đang theo kịp!'} icon={Clock3} tone="pink"/></div><div className="dashboard-grid"><section className="panel task-panel"><div className="panel-heading"><div><h3>Việc cần làm tiếp theo</h3><p>Các bài tập gần đến hạn của bạn</p></div><button className="text-button" onClick={() => setPage('tasks')}>Xem tất cả <span>→</span></button></div>{upcomingTasks.length ? <div className="upcoming-list">{upcomingTasks.map(t => <div className="upcoming-item" key={t.id}><div className="task-check" onClick={() => setModal({ table:'tasks', item:t })}><Check size={15}/></div><div className="upcoming-copy"><strong>{t.title}</strong><span>{data.courses.find(c=>c.id===t.course_id)?.name || 'Chưa gắn môn học'}</span></div><div className={`due-chip ${t.due_date === TODAY ? 'due-today' : ''}`}>{dueLabel(t.due_date)}</div></div>)}</div> : <EmptyState icon={CheckCircle2} title="Bạn đã sẵn sàng!" description="Chưa có bài tập sắp đến hạn. Thêm nhiệm vụ để bắt đầu lên kế hoạch." action={() => setModal({table:'tasks'})} buttonText="Thêm bài tập"/>}</section><section className="panel progress-panel"><div className="panel-heading"><div><h3>Tiến độ của bạn</h3><p>Tổng quan nhiệm vụ</p></div><span className="panel-icon"><Activity size={18}/></span></div><div className="progress-circle" style={{'--progress': `${completion * 3.6}deg`}}><div><strong>{completion}%</strong><span>hoàn thành</span></div></div><div className="progress-legend"><div><span className="legend-dot purple-dot"/><span>Đã hoàn thành</span><strong>{completedTasks.length}</strong></div><div><span className="legend-dot gray-dot"/><span>Đang thực hiện</span><strong>{pendingTasks.length}</strong></div></div><button className="secondary-button full" onClick={() => setPage('analytics')}>Xem báo cáo chi tiết <span>→</span></button></section></div><section className="panel course-panel"><div className="panel-heading"><div><h3>Môn học của bạn</h3><p>Giữ mọi thứ gọn gàng theo từng môn</p></div><button className="text-button" onClick={() => setPage('courses')}>Quản lý môn học <span>→</span></button></div>{data.courses.length ? <div className="course-grid">{data.courses.slice(0,4).map((c,i)=><div className="course-card" key={c.id}><div className="course-color" style={{background:c.color || COLORS[i%COLORS.length]}}><BookOpen size={20}/></div><div className="course-card-copy"><strong>{c.name}</strong><span>{c.code || 'Môn học'}</span></div><div className="course-card-meta"><span>{data.tasks.filter(t=>t.course_id===c.id && t.status!=='completed').length} nhiệm vụ còn lại</span><span className="course-arrow">↗</span></div></div>)}</div> : <EmptyState icon={BookOpen} title="Thêm môn học đầu tiên" description="Tạo danh sách môn học để liên kết bài tập và lịch học." action={() => setModal({table:'courses'})} buttonText="Thêm môn học"/>}</section></>;
}

function SearchBar({ value, onChange, placeholder = 'Tìm kiếm...' }) {
  return <div className="search-box"><Search size={17}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>{value && <button onClick={()=>onChange('')}><X size={14}/></button>}</div>;
}
function Courses({ data, query, setQuery, setModal, mutate }) {
  const courses = data.courses.filter(c => `${c.name} ${c.code||''} ${c.lecturer||''}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading eyebrow="KHÔNG GIAN HỌC TẬP" title="Môn học" description="Quản lý các môn học và giữ tài liệu học tập có tổ chức." action={()=>setModal({table:'courses'})} actionLabel="Thêm môn học"/><div className="toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Tìm theo tên hoặc mã môn học"/><span className="result-count">{courses.length} môn học</span></div>{courses.length ? <div className="course-grid course-grid-large">{courses.map((c,i)=><div className="course-card course-card-large" key={c.id}><div className="course-card-top"><div className="course-color" style={{background:c.color||COLORS[i%COLORS.length]}}><BookOpen size={21}/></div><div className="inline-actions"><button className="icon-button" onClick={()=>setModal({table:'courses',item:c})} title="Chỉnh sửa"><Pencil size={15}/></button><button className="icon-button danger-hover" onClick={()=>window.confirm(`Xóa môn học "${c.name}"?`)&&mutate('courses','delete',null,c.id)} title="Xóa"><Trash2 size={15}/></button></div></div><span className="course-code">{c.code || 'MÔN HỌC'}</span><h3>{c.name}</h3><p className="muted">{c.lecturer || 'Chưa cập nhật giảng viên'}</p><div className="course-card-meta"><span>{data.tasks.filter(t=>t.course_id===c.id).length} bài tập</span><span>{c.credits ? `${c.credits} tín chỉ` : 'Đang theo học'}</span></div></div>)}</div> : <EmptyState icon={BookOpen} title={query ? 'Không tìm thấy môn học' : 'Chưa có môn học nào'} description={query ? 'Thử từ khóa khác.' : 'Thêm môn học đầu tiên để quản lý kế hoạch theo từng môn.'} action={()=>setModal({table:'courses'})} buttonText="Thêm môn học"/>}</>;
}

function Tasks({ data, query, setQuery, statusFilter, setStatusFilter, setModal, mutate }) {
  const tasks = data.tasks.filter(t => `${t.title} ${t.description||''}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === 'all' || (statusFilter === 'overdue' ? isOverdue(t) : t.status === statusFilter)));
  const statusName = (t) => isOverdue(t) ? 'Quá hạn' : t.status === 'completed' ? 'Hoàn thành' : t.status === 'in_progress' ? 'Đang làm' : 'Chưa bắt đầu';
  return <><PageHeading eyebrow="QUẢN LÝ CÔNG VIỆC" title="Bài tập & nhiệm vụ" description="Theo dõi hạn nộp, mức ưu tiên và trạng thái từng nhiệm vụ." action={()=>setModal({table:'tasks'})} actionLabel="Thêm bài tập"/><div className="toolbar task-toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Tìm bài tập..."/><select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="not_started">Chưa bắt đầu</option><option value="in_progress">Đang làm</option><option value="completed">Hoàn thành</option><option value="overdue">Quá hạn</option></select></div><div className="panel table-panel">{tasks.length ? <div className="table-scroll"><table><thead><tr><th>Tên bài tập</th><th>Môn học</th><th>Hạn nộp</th><th>Ưu tiên</th><th>Trạng thái</th><th></th></tr></thead><tbody>{tasks.map(t=><tr key={t.id}><td><div className="table-title"><button className={`task-checkbox ${t.status==='completed'?'checked':''}`} onClick={()=>mutate('tasks','update',{status:t.status==='completed'?'not_started':'completed'},t.id)}>{t.status==='completed'&&<Check size={12}/>}</button><div><strong className={t.status==='completed'?'completed-text':''}>{t.title}</strong>{t.description&&<small>{t.description}</small>}</div></div></td><td>{data.courses.find(c=>c.id===t.course_id)?.name || <span className="muted">Chưa gắn môn</span>}</td><td><span className={isOverdue(t)?'overdue-text':''}>{prettyDate(t.due_date)}</span>{isOverdue(t)&&<small className="overdue-text">{dueLabel(t.due_date)}</small>}</td><td><span className={`priority priority-${t.priority||'medium'}`}>{t.priority==='high'?'Cao':t.priority==='low'?'Thấp':'Trung bình'}</span></td><td><span className={`status-pill ${isOverdue(t)?'status-overdue':t.status==='completed'?'status-done':t.status==='in_progress'?'status-progress':'status-todo'}`}><i/>{statusName(t)}</span></td><td><div className="inline-actions"><button className="icon-button" onClick={()=>setModal({table:'tasks',item:t})}><Pencil size={15}/></button><button className="icon-button danger-hover" onClick={()=>window.confirm('Bạn có chắc muốn xóa bài tập này?')&&mutate('tasks','delete',null,t.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={ListTodo} title="Không có nhiệm vụ phù hợp" description="Thêm bài tập mới hoặc điều chỉnh bộ lọc." action={()=>setModal({table:'tasks'})} buttonText="Thêm bài tập"/>}</div></>;
}

function CalendarPage({ data, setModal }) {
  const events = [...data.schedule_events].sort((a,b)=>(a.event_date||'').localeCompare(b.event_date||''));
  const tasks = data.tasks.filter(t=>t.status!=='completed'&&t.due_date).map(t=>({id:`task-${t.id}`, title:t.title, event_date:t.due_date, start_time:'23:59', event_type:'deadline', notes:'Hạn nộp bài tập'}));
  const combined = [...events,...tasks].filter(e=>e.event_date >= TODAY).sort((a,b)=>(a.event_date||'').localeCompare(b.event_date||''));
  return <><PageHeading eyebrow="LỊCH TRÌNH CỦA BẠN" title="Lịch học & sự kiện" description="Theo dõi lịch học, kỳ thi và thời hạn quan trọng." action={()=>setModal({table:'schedule_events'})} actionLabel="Thêm sự kiện"/><div className="calendar-summary"><div><CalendarDays size={19}/><span><strong>{combined.length}</strong><small>Sự kiện sắp tới</small></span></div><div><Clock3 size={19}/><span><strong>{combined.filter(e=>e.event_date===TODAY).length}</strong><small>Diễn ra hôm nay</small></span></div><div><ListTodo size={19}/><span><strong>{tasks.filter(t=>t.event_date===TODAY).length}</strong><small>Hạn nộp hôm nay</small></span></div></div><div className="panel schedule-panel"><div className="panel-heading"><div><h3>Lịch trình sắp tới</h3><p>Sự kiện và deadline được sắp xếp theo ngày</p></div></div>{combined.length ? <div className="timeline">{combined.map(e=><div className="timeline-item" key={e.id}><div className="timeline-date"><strong>{new Date(`${e.event_date}T00:00:00`).getDate()}</strong><span>TH{(new Date(`${e.event_date}T00:00:00`).getDay()||7)}</span></div><div className={`timeline-marker ${e.event_type==='deadline'?'marker-orange':''}`}/><div className="timeline-content"><div><strong>{e.title}</strong><p>{e.notes || (e.location ? `Địa điểm: ${e.location}` : 'Không có ghi chú')}</p></div><div className="timeline-meta"><span>{prettyDate(e.event_date)}</span><span>{e.start_time?.slice(0,5) || (e.event_type==='deadline'?'Hạn nộp':'')}</span>{e.event_type==='deadline'&&<span className="priority priority-high">Deadline</span>}</div></div></div>)}</div> : <EmptyState icon={CalendarDays} title="Lịch của bạn đang trống" description="Thêm lịch học, lịch thi hoặc sự kiện để lên kế hoạch tốt hơn." action={()=>setModal({table:'schedule_events'})} buttonText="Thêm sự kiện"/>}</div></>;
}

function Goals({ data, setModal, mutate }) {
  return <><PageHeading eyebrow="PHÁT TRIỂN BẢN THÂN" title="Mục tiêu học tập" description="Chia mục tiêu lớn thành những bước nhỏ có thể thực hiện." action={()=>setModal({table:'study_goals'})} actionLabel="Tạo mục tiêu"/>{data.study_goals.length ? <div className="goal-grid">{data.study_goals.map(g=><div className="panel goal-card" key={g.id}><div className="goal-card-head"><div className="goal-icon"><Target size={19}/></div><button className="icon-button" onClick={()=>setModal({table:'study_goals',item:g})}><Pencil size={15}/></button></div><h3>{g.title}</h3><p className="muted">{g.description||'Mục tiêu học tập cá nhân'}</p><div className="goal-progress-label"><span>Tiến độ</span><strong>{g.progress||0}%</strong></div><div className="goal-progress"><span style={{width:`${g.progress||0}%`}}/></div><div className="goal-foot"><span>Hạn: {prettyDate(g.due_date)}</span><button className="text-button" onClick={()=>setModal({table:'study_goals',item:g})}>Cập nhật →</button></div></div>)}</div> : <EmptyState icon={Target} title="Bạn muốn đạt được điều gì?" description="Tạo mục tiêu đầu tiên để theo dõi tiến độ học tập của mình." action={()=>setModal({table:'study_goals'})} buttonText="Tạo mục tiêu"/>}</>;
}

function Analytics({ data, completion, overdueTasks }) {
  const completed = data.tasks.filter(t=>t.status==='completed').length;
  const inProgress = data.tasks.filter(t=>t.status==='in_progress').length;
  const notStarted = data.tasks.filter(t=>t.status==='not_started').length;
  const chart = useMemo(()=> {
    const now = new Date();
    return Array.from({length:6},(_,i)=>{
      const d = new Date(now.getFullYear(),now.getMonth()-5+i,1);
      const month = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      return { month: d.toLocaleDateString('vi-VN',{month:'short'}), tasks: data.tasks.filter(t=>t.created_at?.startsWith(month)).length, done: data.tasks.filter(t=>t.created_at?.startsWith(month)&&t.status==='completed').length };
    });
  },[data.tasks]);
  return <><PageHeading eyebrow="NHÌN LẠI HÀNH TRÌNH" title="Thống kê học tập" description="Theo dõi thói quen hoàn thành nhiệm vụ và tiến độ của bạn."/><div className="stats-grid analytics-stats"><StatCard label="Tổng nhiệm vụ" value={data.tasks.length} caption="Tất cả bài tập" icon={ListTodo} tone="purple"/><StatCard label="Đã hoàn thành" value={completed} caption={`${completion}% tổng nhiệm vụ`} icon={CheckCircle2} tone="green"/><StatCard label="Đang thực hiện" value={inProgress} caption="Đang trong tiến trình" icon={Activity} tone="orange"/><StatCard label="Quá hạn" value={overdueTasks.length} caption="Cần được ưu tiên" icon={Clock3} tone="pink"/></div><div className="analytics-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h3>Hoạt động 6 tháng gần đây</h3><p>Số nhiệm vụ được tạo và hoàn thành theo tháng</p></div></div><div className="chart-wrap">{data.tasks.length ? <ResponsiveContainer width="100%" height={280}><BarChart data={chart} barGap={6}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ececf3"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis allowDecimals={false} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="tasks" name="Được tạo" fill="#d9d5ff" radius={[5,5,0,0]}/><Bar dataKey="done" name="Hoàn thành" fill="#6b5ce7" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer> : <EmptyState icon={TrendingUp} title="Chưa có dữ liệu thống kê" description="Khi bạn thêm bài tập, biểu đồ sẽ hiển thị dữ liệu thực tế."/>}</div></section><section className="panel breakdown-panel"><div className="panel-heading"><div><h3>Trạng thái nhiệm vụ</h3><p>Phân bổ công việc hiện tại</p></div></div><div className="breakdown-total"><strong>{data.tasks.length}</strong><span>tổng nhiệm vụ</span></div><div className="breakdown-row"><div><span className="legend-dot purple-dot"/>Hoàn thành</div><strong>{completed}</strong></div><div className="breakdown-bar"><span style={{width:`${data.tasks.length?completed/data.tasks.length*100:0}%`,background:'#6b5ce7'}}/></div><div className="breakdown-row"><div><span className="legend-dot orange-dot"/>Đang thực hiện</div><strong>{inProgress}</strong></div><div className="breakdown-bar"><span style={{width:`${data.tasks.length?inProgress/data.tasks.length*100:0}%`,background:'#efa94a'}}/></div><div className="breakdown-row"><div><span className="legend-dot gray-dot"/>Chưa bắt đầu</div><strong>{notStarted}</strong></div><div className="breakdown-bar"><span style={{width:`${data.tasks.length?notStarted/data.tasks.length*100:0}%`,background:'#c9cbd7'}}/></div></section></div><section className="panel subject-progress"><div className="panel-heading"><div><h3>Tiến độ theo môn học</h3><p>Tỷ lệ bài tập đã hoàn thành ở từng môn</p></div></div>{data.courses.length ? data.courses.map((c,i)=>{const ts=data.tasks.filter(t=>t.course_id===c.id);const done=ts.filter(t=>t.status==='completed').length;const pct=ts.length?Math.round(done/ts.length*100):0;return <div className="subject-row" key={c.id}><div className="subject-dot" style={{background:c.color||COLORS[i%COLORS.length]}}/><div className="subject-name"><strong>{c.name}</strong><span>{done}/{ts.length} bài tập</span></div><div className="subject-bar"><span style={{width:`${pct}%`,background:c.color||COLORS[i%COLORS.length]}}/></div><strong className="subject-percent">{pct}%</strong></div>}) : <p className="muted">Thêm môn học để xem thống kê theo môn.</p>}</section></>;
}

function SettingsPage({ profile, notify, session, reload, demoMode, setProfile }) {
  const [name, setName] = useState(profile.full_name);
  const [busy, setBusy] = useState(false);
  useEffect(()=>setName(profile.full_name),[profile.full_name]);
  async function save(e) {
    e.preventDefault(); setBusy(true);
    if (demoMode) { setProfile((current) => ({ ...current, full_name: name.trim() })); setBusy(false); notify('Đã cập nhật hồ sơ demo.'); return; }
    const { error } = await supabase.from('profiles').upsert({id:session.user.id, full_name:name.trim(), email:session.user.email, updated_at:new Date().toISOString()});
    setBusy(false);
    if(error) notify(error.message,'error'); else { notify('Đã cập nhật hồ sơ.'); reload(); }
  }
  return <><PageHeading eyebrow="TÙY CHỈNH KHÔNG GIAN" title="Cài đặt" description="Quản lý thông tin tài khoản của bạn."/><div className="panel settings-panel"><div className="settings-heading"><div className="settings-avatar">{(name||profile.email||'S').slice(0,1).toUpperCase()}</div><div><h3>Thông tin cá nhân</h3><p>Thông tin này dùng để cá nhân hóa trải nghiệm học tập.</p></div></div><form className="data-form settings-form" onSubmit={save}><label>Họ và tên<input required maxLength="100" value={name} onChange={e=>setName(e.target.value)} placeholder="Nhập họ và tên"/></label><label>Email<input value={profile.email} disabled/><small>Email được quản lý bởi hệ thống xác thực.</small></label><button className="primary-button" disabled={busy}>{busy&&<LoaderCircle size={16} className="spin"/>}Lưu thay đổi</button></form><div className="security-note settings-note">🔐 {demoMode ? 'Bạn đang sử dụng dữ liệu minh họa; thay đổi chỉ tồn tại trong phiên demo.' : 'Dữ liệu được lưu trong Supabase. Hãy đăng xuất khi sử dụng thiết bị công cộng.'}</div></div></>;
}

const FORM_FIELDS = {
  courses: [
    {name:'name',label:'Tên môn học',required:true,placeholder:'Ví dụ: Nhập môn lập trình'},
    {name:'code',label:'Mã môn học',placeholder:'Ví dụ: PRF192'},
    {name:'lecturer',label:'Giảng viên',placeholder:'Tên giảng viên'},
    {name:'credits',label:'Số tín chỉ',type:'number',min:0},
    {name:'color',label:'Màu đại diện',type:'color',default:'#6759e8'},
    {name:'notes',label:'Ghi chú',type:'textarea'}
  ],
  tasks: [
    {name:'title',label:'Tên bài tập',required:true,placeholder:'Ví dụ: Hoàn thành bài thực hành tuần 3'},
    {name:'course_id',label:'Môn học',type:'course'},
    {name:'description',label:'Mô tả',type:'textarea'},
    {name:'due_date',label:'Hạn nộp',type:'date'},
    {name:'priority',label:'Mức ưu tiên',type:'select',options:[['low','Thấp'],['medium','Trung bình'],['high','Cao']],default:'medium'},
    {name:'status',label:'Trạng thái',type:'select',options:[['not_started','Chưa bắt đầu'],['in_progress','Đang thực hiện'],['completed','Hoàn thành']],default:'not_started'},
    {name:'estimated_minutes',label:'Thời gian dự kiến (phút)',type:'number',min:0}
  ],
  schedule_events: [
    {name:'title',label:'Tên sự kiện',required:true,placeholder:'Ví dụ: Lập trình cơ bản'},
    {name:'event_type',label:'Loại sự kiện',type:'select',options:[['class','Lịch học'],['exam','Lịch thi'],['personal','Cá nhân']],default:'class'},
    {name:'course_id',label:'Môn học liên quan',type:'course'},
    {name:'event_date',label:'Ngày',type:'date',required:true},
    {name:'start_time',label:'Giờ bắt đầu',type:'time'},
    {name:'end_time',label:'Giờ kết thúc',type:'time'},
    {name:'location',label:'Phòng học / địa điểm',placeholder:'Ví dụ: Phòng 302'},
    {name:'notes',label:'Ghi chú',type:'textarea'}
  ],
  study_goals: [
    {name:'title',label:'Tên mục tiêu',required:true,placeholder:'Ví dụ: Hoàn thành bài tập đúng hạn'},
    {name:'description',label:'Mô tả',type:'textarea'},
    {name:'start_date',label:'Ngày bắt đầu',type:'date',default:TODAY},
    {name:'due_date',label:'Hạn hoàn thành',type:'date'},
    {name:'progress',label:'Tiến độ (%)',type:'number',min:0,max:100,default:0}
  ]
};
const TABLE_NAMES = {courses:'môn học',tasks:'bài tập',schedule_events:'sự kiện',study_goals:'mục tiêu'};
function DataModal({ modal, data, close, save }) {
  const table=modal.table; const fields=FORM_FIELDS[table]||[];
  const [values,setValues]=useState({});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{
    const initial={};
    fields.forEach(f=>{initial[f.name]=modal.item?.[f.name] ?? f.default ?? (f.type==='course'?'':'');});
    setValues(initial);
  },[modal.item,table]);
  function change(name,value){setValues(prev=>({...prev,[name]:value}));}
  async function submit(e){
    e.preventDefault(); setError('');
    for(const f of fields){if(f.required&&!String(values[f.name]||'').trim()){setError(`Vui lòng nhập "${f.label}".`);return;}}
    if(table==='schedule_events'&&values.start_time&&values.end_time&&values.end_time<=values.start_time){setError('Giờ kết thúc phải sau giờ bắt đầu.');return;}
    if(table==='tasks'&&values.due_date&&values.due_date<TODAY&&values.status!=='completed'){/* Past deadlines are allowed. */}
    const payload={...values};
    fields.forEach(f=>{if(f.type==='number') payload[f.name]=values[f.name]===''||values[f.name]===undefined?null:Number(values[f.name]); if(f.type==='course'&&payload[f.name]==='') payload[f.name]=null;});
    setBusy(true); const ok=await save(table,modal.item?'update':'insert',payload,modal.item?.id);setBusy(false);
    if(!ok)setError('Không lưu được dữ liệu. Hãy kiểm tra kết nối hoặc quyền truy cập.');
  }
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="modal-card"><div className="modal-heading"><div><p className="eyebrow">{modal.item?'CHỈNH SỬA':'THÊM MỚI'}</p><h2>{modal.item?'Cập nhật': 'Thêm'} {TABLE_NAMES[table]}</h2></div><button className="icon-button" onClick={close}><X size={19}/></button></div><form className="data-form" onSubmit={submit}><div className="form-grid">{fields.map(f=><label key={f.name} className={f.type==='textarea'?'span-2':''}>{f.label}{f.type==='textarea'?<textarea rows="3" value={values[f.name]??''} onChange={e=>change(f.name,e.target.value)} placeholder={f.placeholder||''}/>:f.type==='select'?<select value={values[f.name]??f.default??''} onChange={e=>change(f.name,e.target.value)}>{f.options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>:f.type==='course'?<select value={values[f.name]??''} onChange={e=>change(f.name,e.target.value)}><option value="">Không chọn môn học</option>{data.courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>:<input type={f.type||'text'} required={f.required} min={f.min} max={f.max} maxLength={f.type==='text'?180:undefined} value={values[f.name]??''} onChange={e=>change(f.name,e.target.value)} placeholder={f.placeholder||''}/>}</label>)}</div>{error&&<div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Hủy</button><button className="primary-button" disabled={busy}>{busy&&<LoaderCircle size={16} className="spin"/>}{modal.item?'Lưu thay đổi':'Tạo mới'}</button></div></form></div></div>;
}

export default App;
