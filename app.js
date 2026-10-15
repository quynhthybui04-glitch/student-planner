const $ = id => document.getElementById(id);
const today = new Date(); today.setHours(0,0,0,0);
const iso = d => { const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
const plusDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return iso(d); };
const fmtDate = s => { if(!s)return 'Chưa có hạn'; const d=new Date(s+'T00:00:00'); return d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}); };
const dayNames = ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
const seedSubjects = [
 {id:'s1',name:'AIF101',teacher:'Nhập môn Trí tuệ nhân tạo'},
 {id:'s2',name:'CSI104',teacher:'Cơ sở ngành máy tính'},
 {id:'s3',name:'MAE101',teacher:'Toán học ứng dụng'},
 {id:'s4',name:'ENG',teacher:'Tiếng Anh'}
];
const load = (key, fallback) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } };
let subjects = load('sp_subjects',seedSubjects);
let tasks = load('sp_tasks',[
 {id:'t1',title:'Hoàn thành bài phản tư AI',subject:'AIF101',type:'Bài tập',deadline:plusDays(1),priority:'high',notes:'Viết phản tư và kiểm chứng nội dung',done:false},
 {id:'t2',title:'Ôn tập nội dung tuần 3',subject:'CSI104',type:'Ôn tập',deadline:plusDays(2),priority:'medium',notes:'Tóm tắt các ý chính',done:false},
 {id:'t3',title:'Chuẩn bị bài thuyết trình nhóm',subject:'MAE101',type:'Thuyết trình',deadline:plusDays(4),priority:'high',notes:'Hoàn thiện slide cùng nhóm',done:false},
 {id:'t4',title:'Nộp bài luyện tập tiếng Anh',subject:'ENG',type:'Bài tập',deadline:plusDays(-1),priority:'medium',notes:'',done:false},
 {id:'t5',title:'Đọc tài liệu nhập môn',subject:'AIF101',type:'Ôn tập',deadline:plusDays(-2),priority:'low',notes:'',done:true}
]);
let schedules = load('sp_schedules',[
 {id:'c1',subject:'AIF101 · Nhập môn AI',day:1,time:'08:00',room:'Phòng A-203'},
 {id:'c2',subject:'CSI104 · Cơ sở ngành',day:2,time:'10:00',room:'Phòng B-105'},
 {id:'c3',subject:'MAE101 · Toán ứng dụng',day:3,time:'13:30',room:'Phòng A-201'},
 {id:'c4',subject:'Tiếng Anh',day:5,time:'08:00',room:'Phòng học ngoại ngữ'}
]);
function save(){localStorage.setItem('sp_tasks',JSON.stringify(tasks));localStorage.setItem('sp_subjects',JSON.stringify(subjects));localStorage.setItem('sp_schedules',JSON.stringify(schedules));}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function isOverdue(t){return !t.done && t.deadline && t.deadline < iso(today);}
function daysLeft(t){return Math.round((new Date(t.deadline+'T00:00:00')-today)/86400000);}
function priorityLabel(p){return ({high:'Ưu tiên cao',medium:'Trung bình',low:'Ưu tiên thấp'})[p]||'Trung bình';}
function deadlineLabel(t){if(t.done)return 'Đã hoàn thành';if(isOverdue(t))return 'Quá hạn';const n=daysLeft(t);if(n===0)return 'Hôm nay';if(n===1)return 'Ngày mai';return fmtDate(t.deadline);}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2500);}
function empty(msg,sub=''){return `<div class="empty-state"><b>${esc(msg)}</b>${esc(sub)}</div>`;}
function taskRow(t,full=false){
 const status=isOverdue(t)?'<span class="pill overdue">Quá hạn</span>':t.done?'<span class="pill done">Hoàn thành</span>':`<span class="pill ${t.priority}">${priorityLabel(t.priority)}</span>`;
 return `<div class="task-row" data-id="${esc(t.id)}"><input class="task-check" type="checkbox" data-toggle="${esc(t.id)}" ${t.done?'checked':''} aria-label="Đánh dấu hoàn thành"><div class="task-info ${t.done?'completed':''}"><strong>${esc(t.title)}</strong><small>${esc(t.subject||'Chưa phân môn')} · ${esc(t.type||'Công việc')}${full&&t.notes?' · '+esc(t.notes):''}</small></div><div class="task-end">${status}<span class="task-date">${deadlineLabel(t)}</span></div>${full?`<div class="row-actions"><button class="action-btn" data-edit="${esc(t.id)}">Sửa</button><button class="action-btn" data-delete="${esc(t.id)}">Xóa</button></div>`:''}</div>`;
}
function renderDashboard(){
 const done=tasks.filter(t=>t.done).length, total=tasks.length, due=tasks.filter(t=>!t.done&&!isOverdue(t)&&daysLeft(t)>=0&&daysLeft(t)<=3).length, overdue=tasks.filter(isOverdue).length, pct=total?Math.round(done/total*100):0;
 $('totalStat').textContent=total;$('doneStat').textContent=done;$('dueStat').textContent=due;$('overdueStat').textContent=overdue;
 $('progressRing').style.setProperty('--p',pct+'%');$('progressPercent').textContent=pct+'%';
 $('progressMessage').textContent=pct===100&&total?'Tuyệt vời! Hoàn thành hết!':pct>=60?'Bạn đang làm rất tốt!':pct>0?'Tiếp tục cố gắng nhé!':'Bắt đầu thôi!';
 $('progressDetail').textContent=total?`Bạn đã hoàn thành ${done}/${total} công việc trong kế hoạch.`:'Thêm công việc đầu tiên để theo dõi tiến độ.';
 const upcoming=tasks.filter(t=>!t.done).sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,4);
 $('upcomingList').innerHTML=upcoming.length?upcoming.map(t=>taskRow(t)).join(''):empty('Không còn việc cần làm','Bạn có thể thêm công việc mới bất cứ lúc nào.');
 renderSchedulePreview();
}
function renderTasks(){
 const q=$('taskSearch').value.trim().toLowerCase(), status=$('statusFilter').value, pr=$('priorityFilter').value;
 const list=tasks.filter(t=>(!q||(t.title+' '+t.subject+' '+t.type).toLowerCase().includes(q))&&(status==='all'||(status==='todo'&&!t.done)||(status==='done'&&t.done)||(status==='overdue'&&isOverdue(t)))&&(pr==='all'||t.priority===pr)).sort((a,b)=>Number(a.done)-Number(b.done)||a.deadline.localeCompare(b.deadline));
 $('allTasksList').innerHTML=list.length?list.map(t=>taskRow(t,true)).join(''):empty('Không tìm thấy công việc','Thử thay đổi bộ lọc hoặc thêm công việc mới.');
}
function scheduleHtml(items,allowDelete=true){
 if(!items.length)return empty('Chưa có buổi học','Thêm lịch học để xây dựng thời khóa biểu của bạn.');
 return items.map(s=>`<div class="schedule-row"><div class="day-box"><strong>${dayNames[s.day].replace('Thứ ','T')}</strong><small>${s.day==0?'CN':'TRONG TUẦN'}</small></div><div class="schedule-detail"><strong>${esc(s.subject)}</strong><small>${esc(s.room||'Chưa cập nhật phòng học')}</small></div><span class="schedule-time">${esc(s.time)}</span>${allowDelete?`<button class="delete-mini" data-schedule-delete="${esc(s.id)}" aria-label="Xóa buổi học">×</button>`:''}</div>`).join('');
}
function renderSchedulePreview(){const sorted=[...schedules].sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time));$('schedulePreview').innerHTML=scheduleHtml(sorted.slice(0,3),false);}
function renderSchedule(){$('fullSchedule').innerHTML=scheduleHtml([...schedules].sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time)));}
function renderSubjects(){
 $('subjectGrid').innerHTML=subjects.length?subjects.map(s=>{const related=tasks.filter(t=>t.subject===s.name),done=related.filter(t=>t.done).length,p=related.length?Math.round(done/related.length*100):0;return `<article class="subject-card"><button class="delete-mini" data-subject-delete="${esc(s.id)}" title="Xóa môn học">×</button><h3>${esc(s.name)}</h3><p>${esc(s.teacher||'Môn học')}</p><div class="subject-count"><strong>${related.length}</strong> công việc · ${done} hoàn thành</div><div class="subject-progress"><span style="width:${p}%"></span></div></article>`}).join(''):empty('Chưa có môn học','Thêm môn học để phân loại công việc.');
 const opts=subjects.map(s=>`<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('');
 $('taskSubject').innerHTML='<option value="">Chưa chọn môn học</option>'+opts;
}
function renderAll(){save();renderDashboard();renderTasks();renderSchedule();renderSubjects();}
function showView(name){
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(name+'View').classList.add('active');
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
 $('pageTitle').textContent=({dashboard:'Tổng quan',tasks:'Công việc',schedule:'Lịch học',subjects:'Môn học'})[name];$('sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});
}
function openTask(id=null){
 $('taskForm').reset();$('taskId').value='';$('taskDeadline').value=plusDays(1);$('taskPriority').value='medium';$('taskDialogTitle').textContent=id?'Chỉnh sửa công việc':'Thêm công việc';
 if(id){const t=tasks.find(x=>x.id===id);if(!t)return;$('taskId').value=t.id;$('taskTitle').value=t.title;$('taskSubject').value=t.subject||'';$('taskType').value=t.type||'Bài tập';$('taskDeadline').value=t.deadline;$('taskPriority').value=t.priority||'medium';$('taskNotes').value=t.notes||'';}
 $('taskDialog').showModal();
}
function newId(){return 'id'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));
$('mobileMenu').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
$('addTaskTop').addEventListener('click',()=>openTask());$('addTaskList').addEventListener('click',()=>openTask());
$('taskSearch').addEventListener('input',renderTasks);$('statusFilter').addEventListener('change',renderTasks);$('priorityFilter').addEventListener('change',renderTasks);
$('taskForm').addEventListener('submit',e=>{e.preventDefault();const id=$('taskId').value;const obj={id:id||newId(),title:$('taskTitle').value.trim(),subject:$('taskSubject').value,type:$('taskType').value,deadline:$('taskDeadline').value,priority:$('taskPriority').value,notes:$('taskNotes').value.trim(),done:id?(tasks.find(t=>t.id===id)?.done||false):false};if(!obj.title||!obj.deadline)return;if(id){tasks=tasks.map(t=>t.id===id?obj:t);toast('Đã cập nhật công việc.');}else{tasks.push(obj);toast('Đã thêm công việc mới.');}$('taskDialog').close();renderAll();});
document.addEventListener('change',e=>{const id=e.target.dataset.toggle;if(id){tasks=tasks.map(t=>t.id===id?{...t,done:e.target.checked}:t);renderAll();toast(e.target.checked?'Đã hoàn thành công việc!':'Đã cập nhật trạng thái.');}});
document.addEventListener('click',e=>{
 const edit=e.target.closest('[data-edit]');if(edit)openTask(edit.dataset.edit);
 const del=e.target.closest('[data-delete]');if(del){const t=tasks.find(t=>t.id===del.dataset.delete);if(t&&confirm(`Bạn có chắc muốn xóa "${t.title}"?`)){tasks=tasks.filter(t=>t.id!==del.dataset.delete);renderAll();toast('Đã xóa công việc.');}}
 const sd=e.target.closest('[data-schedule-delete]');if(sd&&confirm('Xóa buổi học này khỏi thời khóa biểu?')){schedules=schedules.filter(s=>s.id!==sd.dataset.scheduleDelete);renderAll();toast('Đã xóa buổi học.');}
 const sub=e.target.closest('[data-subject-delete]');if(sub){const s=subjects.find(x=>x.id===sub.dataset.subjectDelete);if(s&&confirm(`Xóa môn "${s.name}"? Các công việc hiện có vẫn được giữ lại.`)){subjects=subjects.filter(x=>x.id!==s.id);renderAll();toast('Đã xóa môn học.');}}
});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
$('addScheduleBtn').addEventListener('click',()=>{$('scheduleForm').reset();$('scheduleDialog').showModal();});
$('scheduleForm').addEventListener('submit',e=>{e.preventDefault();schedules.push({id:newId(),subject:$('scheduleSubject').value.trim(),day:Number($('scheduleDay').value),time:$('scheduleTime').value,room:$('scheduleRoom').value.trim()});$('scheduleDialog').close();renderAll();toast('Đã thêm buổi học.');});
$('addSubjectBtn').addEventListener('click',()=>{$('subjectForm').reset();$('subjectDialog').showModal();});
$('subjectForm').addEventListener('submit',e=>{e.preventDefault();const name=$('subjectName').value.trim();if(subjects.some(s=>s.name.toLowerCase()===name.toLowerCase())){toast('Môn học này đã tồn tại.');return;}subjects.push({id:newId(),name,teacher:$('subjectTeacher').value.trim()});$('subjectDialog').close();renderAll();toast('Đã thêm môn học.');});
$('todayLabel').textContent=today.toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'});
renderAll();
