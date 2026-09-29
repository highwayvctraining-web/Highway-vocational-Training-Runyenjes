(function(){
'use strict';

var CONFIG = { PAYMENT_ID: '9586' };
var adminMode = false;
var adminPanelAuthed = false;
var ADMIN_PANEL_PASSWORD = '9586';
var currentAppStep = 1;
var notifications = [];
var adminNotifHistory = [];
var testimonials = [];
var testimonialIndex = 0;
var galleryImages = [];
var currentGalleryImage = null;
var adminPassword = '9586';
var systemPassword = '9586';
var pauseTimerId = null;
var pauseDuration = '1month';
var heroSlides = [];
var currentSlideIndex = 0;
var slideAutoPlayTimer = null;
var slideAutoPlayInterval = 5000;
var autoPlayStarted = false;
var currentStudentSession = null;
var broadcastChannel = null;
var studentReports = [];
var receiptScanData = null;
var liveClasses = [];

var liveCamState = {
  stream: null,
  facing: 'environment',
  mode: 'photo',
  filter: 'natural',
  flashOn: false,
  gridOn: false,
  timerDelay: 0,
  recording: false,
  mediaRecorder: null,
  recordedChunks: [],
  micEnabled: true,
  captures: [],
  lastCapture: null,
  qrScanTimer: null,
  locked: false,
  dragged: false,
  pos: { x: 20, y: 90 },
  minimized: false,
  bcLockChannel: null,
  sessionId: null,
  viewers: 1
};

var DEFAULT_TIMETABLE_DATA = {
  days: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
  slots: [
    { time: '8:30 - 10:30', type: 'lesson' },
    { time: '10:30 - 11:00', type: 'break' },
    { time: '11:00 - 1:00', type: 'lesson' },
    { time: '1:00 - 2:00', type: 'break' },
    { time: '2:00 - 4:00', type: 'lesson' }
  ],
  schedule: {
    'computer-packages': [
      { mon:['Computer Fundamentals','Lab 1'], tue:['MS Office','Lab 1'], wed:['Internet & Email','Lab 2'], thu:['Google Workspace','Lab 1'], fri:['Data Analysis','Lab 2'] },
      { mon:['Break',''], tue:['Break',''], wed:['Break',''], thu:['Break',''], fri:['Break',''] },
      { mon:['MS Word','Lab 1'], tue:['MS Excel','Lab 2'], wed:['MS PowerPoint','Lab 1'], thu:['MS Access','Lab 2'], fri:['Web Design','Lab 1'] },
      { mon:['Lunch',''], tue:['Lunch',''], wed:['Lunch',''], thu:['Lunch',''], fri:['Lunch',''] },
      { mon:['AI & ML Intro','Lab 1'], tue:['Cybersecurity','Lab 2'], wed:['Practical Project','Lab 1'], thu:['Revision','Lab 2'], fri:['Assessment','Lab 1'] }
    ],
    'beauty-therapy': [
      { mon:['Manicure','Studio A'], tue:['Pedicure','Studio A'], wed:['Nail Art','Studio B'], thu:['Waxing','Studio A'], fri:['Facial','Studio B'] },
      { mon:['Break',''], tue:['Break',''], wed:['Break',''], thu:['Break',''], fri:['Break',''] },
      { mon:['Nail Gels','Studio A'], tue:['Eyebrow Shaping','Studio B'], wed:['Skin Care','Studio A'], thu:['Salon Practice','Studio A'], fri:['Client Practical','Studio B'] },
      { mon:['Lunch',''], tue:['Lunch',''], wed:['Lunch',''], thu:['Lunch',''], fri:['Lunch',''] },
      { mon:['Business Skills','Class 2'], tue:['Customer Care','Class 2'], wed:['Salon Management','Class 2'], thu:['Practical Revision','Studio A'], fri:['Assessment','Studio A'] }
    ],
    'hairdressing': [
      { mon:['Hair Styling','Salon'], tue:['Hair Treatment','Salon'], wed:['Braiding','Salon'], thu:['Weaving','Salon'], fri:['Salon Practice','Salon'] },
      { mon:['Break',''], tue:['Break',''], wed:['Break',''], thu:['Break',''], fri:['Break',''] },
      { mon:['Hair Cutting','Salon'], tue:['Coloring','Salon'], wed:['Relaxing','Salon'], thu:['Client Practical','Salon'], fri:['Styling Techniques','Salon'] },
      { mon:['Lunch',''], tue:['Lunch',''], wed:['Lunch',''], thu:['Lunch',''], fri:['Lunch',''] },
      { mon:['Salon Management','Class 3'], tue:['Customer Care','Class 3'], wed:['Hair Science','Class 3'], thu:['Practical Revision','Salon'], fri:['Assessment','Salon'] }
    ],
    'cyber-services': [
      { mon:['eCitizen Services','Cyber'], tue:['KRA Services','Cyber'], wed:['NTSA Services','Cyber'], thu:['HELB Services','Cyber'], fri:['Printing & Scanning','Cyber'] },
      { mon:['Break',''], tue:['Break',''], wed:['Break',''], thu:['Break',''], fri:['Break',''] },
      { mon:['Passport Application','Cyber'], tue:['Good Conduct','Cyber'], wed:['Business Reg.','Cyber'], thu:['Client Service','Cyber'], fri:['Practical','Cyber'] },
      { mon:['Lunch',''], tue:['Lunch',''], wed:['Lunch',''], thu:['Lunch',''], fri:['Lunch',''] },
      { mon:['Digital Literacy','Cyber'], tue:['Online Forms','Cyber'], wed:['Customer Care','Cyber'], thu:['Revision','Cyber'], fri:['Assessment','Cyber'] }
    ]
  }
};

var TIMETABLE_DATA = JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_DATA));

function loadSavedTimetable(){
  var saved = safeGet('timetable_data', null);
  if(saved && saved.schedule){
    TIMETABLE_DATA = JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_DATA));
    Object.keys(saved.schedule).forEach(function(k){ TIMETABLE_DATA.schedule[k] = saved.schedule[k]; });
  }
}

var RESULTS_DATA = {
  'computer-packages': [
    { code:'CS101', subject:'Computer Fundamentals', score:82, grade:'A', remarks:'Excellent' },
    { code:'CS102', subject:'MS Office Professional', score:78, grade:'B', remarks:'Very Good' },
    { code:'CS103', subject:'Internet & Digital Literacy', score:88, grade:'A', remarks:'Excellent' },
    { code:'CS104', subject:'Google Workspace', score:75, grade:'B', remarks:'Good' },
    { code:'CS105', subject:'Data Analysis', score:70, grade:'B', remarks:'Good' },
    { code:'CS106', subject:'AI & Machine Learning', score:68, grade:'C', remarks:'Fair' },
    { code:'CS107', subject:'Web Design', score:80, grade:'A', remarks:'Excellent' },
    { code:'CS108', subject:'Cybersecurity', score:72, grade:'B', remarks:'Good' }
  ],
  'beauty-therapy': [
    { code:'BT101', subject:'Manicure & Pedicure', score:85, grade:'A', remarks:'Excellent' },
    { code:'BT102', subject:'Nail Art & Gels', score:80, grade:'A', remarks:'Excellent' },
    { code:'BT103', subject:'Waxing Techniques', score:76, grade:'B', remarks:'Very Good' },
    { code:'BT104', subject:'Facial Treatment', score:82, grade:'A', remarks:'Excellent' },
    { code:'BT105', subject:'Eyebrow Shaping', score:78, grade:'B', remarks:'Very Good' },
    { code:'BT106', subject:'Salon Management', score:72, grade:'B', remarks:'Good' }
  ],
  'hairdressing': [
    { code:'HD101', subject:'Hair Styling', score:88, grade:'A', remarks:'Excellent' },
    { code:'HD102', subject:'Hair Treatment', score:82, grade:'A', remarks:'Excellent' },
    { code:'HD103', subject:'Braiding & Weaving', score:85, grade:'A', remarks:'Excellent' },
    { code:'HD104', subject:'Hair Cutting', score:75, grade:'B', remarks:'Good' },
    { code:'HD105', subject:'Coloring & Relaxing', score:70, grade:'B', remarks:'Good' },
    { code:'HD106', subject:'Salon Management', score:68, grade:'C', remarks:'Fair' }
  ],
  'cyber-services': [
    { code:'CY101', subject:'eCitizen Services', score:90, grade:'A', remarks:'Excellent' },
    { code:'CY102', subject:'KRA Services', score:85, grade:'A', remarks:'Excellent' },
    { code:'CY103', subject:'NTSA Services', score:80, grade:'A', remarks:'Excellent' },
    { code:'CY104', subject:'HELB Services', score:78, grade:'B', remarks:'Very Good' }
  ]
};

var MATERIALS_DATA = {
  'computer-packages': [
    { title:'Computer Fundamentals Notes', type:'pdf', size:'2.4 MB', updated:'2026-01-15', desc:'Introduction to computers, hardware, software and basic operations.' },
    { title:'MS Office Complete Guide', type:'pdf', size:'5.8 MB', updated:'2026-01-20', desc:'Word, Excel, PowerPoint and Access with practical exercises.' },
    { title:'Internet & Email Handbook', type:'pdf', size:'1.9 MB', updated:'2026-01-22', desc:'Browsing, searching, email etiquette and online safety.' },
    { title:'Data Analysis with Excel', type:'pdf', size:'3.2 MB', updated:'2026-02-01', desc:'Pivot tables, charts and data visualization techniques.' },
    { title:'Web Design (HTML/CSS)', type:'pdf', size:'4.1 MB', updated:'2026-02-05', desc:'Building responsive websites from scratch.' },
    { title:'Introduction to AI & ML', type:'pdf', size:'2.8 MB', updated:'2026-02-10', desc:'Basic concepts and practical applications.' }
  ],
  'beauty-therapy': [
    { title:'Manicure & Pedicure Manual', type:'pdf', size:'3.1 MB', updated:'2026-01-18', desc:'Step-by-step procedures and hygiene standards.' },
    { title:'Nail Art Design Catalogue', type:'pdf', size:'6.5 MB', updated:'2026-01-25', desc:'Over 50 designs with technique guides.' },
    { title:'Facial Treatment Guide', type:'pdf', size:'2.2 MB', updated:'2026-02-02', desc:'Skin analysis, cleansing and massage techniques.' },
    { title:'Waxing & Hair Removal', type:'pdf', size:'1.8 MB', updated:'2026-02-08', desc:'Different waxing methods and safety precautions.' }
  ],
  'hairdressing': [
    { title:'Hair Styling Techniques', type:'pdf', size:'4.2 MB', updated:'2026-01-16', desc:'Blow-drying, curling, straightening and updos.' },
    { title:'Braiding & Weaving Manual', type:'pdf', size:'5.5 MB', updated:'2026-01-28', desc:'Cornrows, twists, box braids and weaves.' },
    { title:'Hair Treatment Guide', type:'pdf', size:'2.6 MB', updated:'2026-02-03', desc:'Scalp care, conditioning and damage repair.' },
    { title:'Salon Management Notes', type:'pdf', size:'1.9 MB', updated:'2026-02-09', desc:'Business skills for hairdressers.' }
  ],
  'cyber-services': [
    { title:'eCitizen Services Guide', type:'pdf', size:'2.0 MB', updated:'2026-01-20', desc:'All eCitizen services step-by-step.' },
    { title:'KRA Services Handbook', type:'pdf', size:'2.4 MB', updated:'2026-01-26', desc:'PIN registration, returns filing and iTax.' },
    { title:'NTSA Services Manual', type:'pdf', size:'1.7 MB', updated:'2026-02-04', desc:'Driving license, vehicle transfer and TIMS.' },
    { title:'Customer Service Notes', type:'pdf', size:'1.2 MB', updated:'2026-02-11', desc:'Client handling and service excellence.' }
  ]
};

function getStudentCourseKey(courseLabel){
  if(!courseLabel) return 'computer-packages';
  var c = String(courseLabel).toLowerCase();
  if(c.indexOf('cyber') !== -1) return 'cyber-services';
  if(c.indexOf('beauty') !== -1) return 'beauty-therapy';
  if(c.indexOf('hair') !== -1) return 'hairdressing';
  if(c.indexOf('computer') !== -1) return 'computer-packages';
  return 'computer-packages';
}

function renderTimetableForStudent(courseKey){
  var grid = document.getElementById('timetableGrid');
  if(!grid) return;
  var schedule = TIMETABLE_DATA.schedule[courseKey] || TIMETABLE_DATA.schedule['computer-packages'];
  var html = '';
  html += '<div class="tt-head">Time</div>';
  TIMETABLE_DATA.days.forEach(function(d){ html += '<div class="tt-head">' + d + '</div>'; });
  TIMETABLE_DATA.slots.forEach(function(slot, idx){
    html += '<div class="tt-slot ' + slot.type + '"><div class="tt-subject" style="font-size:9.5px;">' + slot.time + '</div></div>';
    TIMETABLE_DATA.days.forEach(function(day){
      var key = day.toLowerCase().substring(0,3);
      var entry = schedule[idx] ? schedule[idx][key] : null;
      if(slot.type === 'break'){
        html += '<div class="tt-slot break"><div class="tt-subject">' + (entry ? entry[0] : 'Break') + '</div></div>';
      } else {
        if(entry && entry[0]){
          html += '<div class="tt-slot lesson"><div class="tt-subject">' + entry[0] + '</div>' + (entry[1] ? '<div class="tt-room">' + entry[1] + '</div>' : '') + '</div>';
        } else {
          html += '<div class="tt-slot"><div class="tt-subject" style="color:#6b7688;">—</div></div>';
        }
      }
    });
  });
  grid.innerHTML = html;
}

function renderResultsForStudent(courseKey){
  var table = document.getElementById('resultsTable');
  var summary = document.getElementById('resultsSummary');
  if(!table) return;
  var results = RESULTS_DATA[courseKey] || RESULTS_DATA['computer-packages'];
  var total = 0, count = 0;
  var html = '<thead><tr><th>Code</th><th>Subject</th><th>Score</th><th>Grade</th><th>Remarks</th></tr></thead><tbody>';
  results.forEach(function(r){
    total += r.score; count++;
    var gradeClass = r.grade.toLowerCase();
    html += '<tr><td><strong>' + escapeHtml(r.code) + '</strong></td><td>' + escapeHtml(r.subject) + '</td>' +
      '<td>' + r.score + '%</td>' +
      '<td><span class="grade ' + gradeClass + '">' + escapeHtml(r.grade) + '</span></td>' +
      '<td>' + escapeHtml(r.remarks) + '</td></tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
  var avg = count ? Math.round(total / count) : 0;
  var overall = avg >= 80 ? 'A' : avg >= 70 ? 'B' : avg >= 60 ? 'C' : avg >= 50 ? 'D' : 'E';
  if(summary){
    summary.innerHTML = '<i class="fas fa-trophy" style="color:var(--gold);"></i> <strong>Overall Average: ' + avg + '% (' + overall + ')</strong> — Keep up the good work!';
  }
}

function renderMaterialsForStudent(courseKey){
  var list = document.getElementById('materialsList');
  var countEl = document.getElementById('materialsCount');
  if(!list) return;
  var materials = MATERIALS_DATA[courseKey] || MATERIALS_DATA['computer-packages'];
  if(countEl) countEl.textContent = materials.length + ' items';
  if(materials.length === 0){
    list.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">No materials available yet.</p>';
    return;
  }
  list.innerHTML = materials.map(function(m){
    var iconClass = m.type === 'pdf' ? 'fa-file-pdf' : m.type === 'doc' ? 'fa-file-word' : 'fa-file-alt';
    return '<div class="material-item">' +
      '<div class="mat-icon"><i class="fas ' + iconClass + '"></i></div>' +
      '<div class="mat-info">' +
        '<div class="mat-title">' + escapeHtml(m.title) + '</div>' +
        '<div class="mat-meta"><span><i class="fas fa-hdd"></i> ' + escapeHtml(m.size) + '</span><span><i class="fas fa-calendar"></i> ' + escapeHtml(m.updated) + '</span></div>' +
        '<div style="font-size:11px;color:#6b7688;margin-top:3px;">' + escapeHtml(m.desc) + '</div>' +
      '</div>' +
      '<div class="mat-actions">' +
        '<button class="mat-view" onclick="viewMaterial(\'' + escapeHtml(m.title) + '\')"><i class="fas fa-eye"></i> View</button>' +
        '<button class="mat-dl" onclick="downloadMaterial(\'' + escapeHtml(m.title) + '\')"><i class="fas fa-download"></i></button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function viewMaterial(title){
  showToast('Opening "' + title + '"...', 'success');
  setTimeout(function(){ showToast('Material viewed: ' + title, 'success'); }, 800);
}
function downloadMaterial(title){
  showToast('Downloading "' + title + '"...', 'success');
  setTimeout(function(){ showToast('Download complete: ' + title, 'success'); }, 1200);
}

var KENYA_COUNTIES = {
  "Baringo": ["Baringo Central","Baringo North","Baringo South","Eldama Ravine","Mogotio","Tiaty"],
  "Bomet": ["Bomet Central","Bomet East","Chepalungu","Konoin","Sotik"],
  "Bungoma": ["Bumula","Kanduyi","Kabuchai","Kimilili","Mt Elgon","Sirisia","Tongaren","Webuye East","Webuye West"],
  "Busia": ["Bunyala","Butula","Funyula","Matayos","Nambale","Teso North","Teso South"],
  "Elgeyo-Marakwet": ["Keiyo North","Keiyo South","Marakwet East","Marakwet West"],
  "Embu": ["Manyatta","Mbeere North","Mbeere South","Runyenjes"],
  "Garissa": ["Balambala","Dadaab","Fafi","Garissa Township","Ijara","Lagdera"],
  "Homa Bay": ["Homa Bay Town","Kabondo Kasipul","Karachuonyo","Kasipul","Ndhiwa","Rangwe","Suba North","Suba South"],
  "Isiolo": ["Isiolo North","Isiolo South","Merti"],
  "Kajiado": ["Kajiado Central","Kajiado East","Kajiado North","Kajiado South","Kajiado West","Loitokitok"],
  "Kakamega": ["Butere","Emuhaya","Ikolomani","Khwisero","Likuyani","Lurambi","Malava","Matungu","Mumias East","Mumias West","Navakholo","Shinyalu"],
  "Kericho": ["Ainamoi","Belgut","Bureti","Kipkelion East","Kipkelion West","Sigowet/Soin"],
  "Kiambu": ["Gatundu North","Gatundu South","Githunguri","Juja","Kabete","Kiambaa","Kiambu","Kikuyu","Limuru","Lari","Ruiru","Thika Town"],
  "Kilifi": ["Ganze","Kaloleni","Kilifi North","Kilifi South","Magarini","Malindi","Rabai"],
  "Kirinyaga": ["Gichugu","Kirinyaga Central","Mwea East","Mwea West","Ndia"],
  "Kisii": ["Bobasi","Bomachoge Borabu","Bomachoge Chache","Bonchari","Kitutu Chache North","Kitutu Chache South","Nyaribari Chache","Nyaribari Masaba","South Mugirango"],
  "Kisumu": ["Kisumu Central","Kisumu East","Kisumu West","Muhoroni","Nyakach","Nyando","Seme"],
  "Kitui": ["Kitui Central","Kitui East","Kitui Rural","Kitui South","Kitui West","Mwingi Central","Mwingi North","Mwingi West"],
  "Kwale": ["Kinango","Lunga Lunga","Matuga","Msambweni"],
  "Laikipia": ["Laikipia Central","Laikipia East","Laikipia North","Laikipia West","Nyahururu"],
  "Lamu": ["Lamu East","Lamu West"],
  "Machakos": ["Kathiani","Machakos Town","Masinga","Matungulu","Mavoko","Mwala","Yatta","Kangundo"],
  "Makueni": ["Kaiti","Kibwezi East","Kibwezi West","Kilome","Makueni","Mbooni"],
  "Mandera": ["Banissa","Lafey","Mandera East","Mandera North","Mandera South","Mandera West"],
  "Marsabit": ["Laisamis","Moyale","North Horr","Saku"],
  "Meru": ["Buuri","Igembe Central","Igembe North","Igembe South","Imenti Central","Imenti North","Imenti South","Tigania East","Tigania West"],
  "Migori": ["Awendo","Kuria East","Kuria West","Nyatike","Rongo","Suna East","Suna West","Uriri"],
  "Mombasa": ["Changamwe","Jomvu","Kisauni","Likoni","Mvita","Nyali"],
  "Murang'a": ["Gatanga","Kahuro","Kandara","Kangema","Kigumo","Kiharu","Mathioya","Murang'a South"],
  "Nairobi": ["Dagoretti North","Dagoretti South","Embakasi Central","Embakasi East","Embakasi North","Embakasi South","Embakasi West","Kamukunji","Kasarani","Kibra","Langata","Makadara","Mathare","Roysambu","Ruaraka","Starehe","Westlands"],
  "Nakuru": ["Bahati","Gilgil","Kuresoi North","Kuresoi South","Molo","Naivasha","Nakuru Town East","Nakuru Town West","Njoro","Rongai","Subukia"],
  "Nandi": ["Aldai","Chesumei","Emgwen","Mosop","Nandi Hills","Tinderet"],
  "Narok": ["Kilgoris","Emurua Dikirr","Narok East","Narok North","Narok South","Narok West"],
  "Nyamira": ["Borabu","Kitutu Masaba","Manga","Masaba North","Nyamira North","Nyamira South"],
  "Nyandarua": ["Kinangop","Kipipiri","Ndaragwa","Ol Joro Orok","Ol Kalou"],
  "Nyeri": ["Kieni East","Kieni West","Mathira East","Mathira West","Mukurweini","Nyeri Town","Othaya","Tetu"],
  "Samburu": ["Samburu East","Samburu North","Samburu West"],
  "Siaya": ["Alego Usonga","Bondo","Gem","Rarieda","Ugenya","Ugunja"],
  "Taita-Taveta": ["Mwatate","Taveta","Voi","Wundanyi"],
  "Tana River": ["Bura","Galole","Garsen"],
  "Tharaka-Nithi": ["Chuka/Igambang'ombe","Igembe South","Maara","Muthambi","Tharaka North","Tharaka South"],
  "Trans Nzoia": ["Cherangany","Endebess","Kiminini","Kwanza","Saboti"],
  "Turkana": ["Loima","Turkana Central","Turkana East","Turkana North","Turkana South","Turkana West"],
  "Uasin Gishu": ["Ainabkoi","Kapseret","Kesses","Moiben","Soy","Turbo"],
  "Vihiga": ["Emuhaya","Hamisi","Luanda","Sabatia","Vihiga"],
  "Wajir": ["Eldas","Tarbaj","Wajir East","Wajir North","Wajir South","Wajir West"],
  "West Pokot": ["Kacheliba","Kapenguria","Pokot South","Sigor"]
};

function populateAllCountySelects(){
  var selects = ['appCounty','appHomeCounty','appGuardianCounty'];
  selects.forEach(function(id){
    var sel = document.getElementById(id);
    if(!sel) return;
    var opts = '<option value="">Select County...</option>';
    Object.keys(KENYA_COUNTIES).sort().forEach(function(c){
      opts += '<option value="' + c + '">' + c + '</option>';
    });
    sel.innerHTML = opts;
  });
}

function populateSubCounties(countyId, subCountyId){
  var countySel = document.getElementById(countyId);
  var subSel = document.getElementById(subCountyId);
  if(!countySel || !subSel) return;
  var county = countySel.value;
  if(!county || !KENYA_COUNTIES[county]){
    subSel.innerHTML = '<option value="">Select County first...</option>';
    return;
  }
  var opts = '<option value="">Select Sub-County...</option>';
  KENYA_COUNTIES[county].forEach(function(sc){
    opts += '<option value="' + sc + '">' + sc + '</option>';
  });
  subSel.innerHTML = opts;
}

var FEE_STRUCTURE = {
  'computer-packages':  { registration: 500, tuition: 2500, label: 'Computer Packages',       duration: '2 Months' },
  'short-courses':      { registration: 500, tuition: 1500, label: 'Short Courses',           duration: '1-4 Weeks' },
  'web-design':         { registration: 500, tuition: 3000, label: 'Web Design',              duration: '2 Months' },
  'beauty-therapy':     { registration: 500, tuition: 1500, label: 'Beauty & Therapy',        duration: '6 Months' },
  'hairdressing':       { registration: 500, tuition: 2000, label: 'HairDressing',            duration: '6 Months' },
  'cyber-services':     { registration: 0,   tuition: 0,    label: 'Cyber & eCitizen Services',duration: 'Daily' }
};

var APPLICATION_STATUSES = {
  submitted:            { label: 'Submitted',           color: '#dbeafe', text: '#1e40af', step: 1 },
  documents_verified:   { label: 'Documents Verified',  color: '#e0e7ff', text: '#3730a3', step: 2 },
  under_review:         { label: 'Under Review',        color: '#fef3c7', text: '#92400e', step: 3 },
  interview_scheduled:  { label: 'Interview Scheduled', color: '#fde68a', text: '#78350f', step: 4 },
  accepted:             { label: 'Accepted',            color: '#d1fae5', text: '#065f46', step: 5 },
  waitlisted:           { label: 'Waitlisted',          color: '#fce7f3', text: '#9d174d', step: 5 },
  rejected:             { label: 'Not Successful',      color: '#fee2e2', text: '#991b1b', step: 5 },
  registered:           { label: 'Registered Student',  color: '#dcfce7', text: '#166534', step: 6 }
};

function showToast(message, type){
  var toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = message;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function(){ toast.classList.remove('show'); }, 3000);
}

function safeGet(key, fallback){
  try {
    var raw = localStorage.getItem(key);
    if(raw == null) return fallback;
    return JSON.parse(raw);
  } catch(e){ return fallback; }
}
function safeSet(key, value){
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch(e){ return false; }
}

function escapeHtml(s){
  if(s == null) return '';
  return String(s).replace(/[&<>"']/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
  });
}

function showPage(pageId){
  document.querySelectorAll('.page-section').forEach(function(s){ s.classList.remove('active-section'); });
  var target = document.getElementById('page-' + pageId);
  if(target) target.classList.add('active-section');
  document.querySelectorAll('.nav-list > li').forEach(function(li){
    li.classList.remove('active');
    if(li.dataset.page === pageId) li.classList.add('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMobileNav();
  if(pageId === 'home' && heroSlides.length > 1 && !checkPause() && !autoPlayStarted){ resetSlideAutoPlay(); }
  if(pageId === 'admin'){ refreshAdminPanel(); }
  if(pageId === 'resources'){ renderPublicResources(); }
  if(pageId === 'liveclasses'){ renderPublicLiveClasses(); }
}

function navigateToSection(pageId, sectionId){
  showPage(pageId);
  setTimeout(function(){
    var el = document.getElementById(sectionId);
    if(!el) return;
    document.querySelectorAll('.target-flash').forEach(function(n){ n.remove(); });
    var rect = el.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var targetY = rect.top + scrollTop - 100;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    var flash = document.createElement('div');
    flash.className = 'target-flash';
    if(getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.appendChild(flash);
    setTimeout(function(){ flash.remove(); }, 2200);
  }, 250);
}

function toggleMobileNav(){
  var navList = document.getElementById('navList');
  if(navList) navList.classList.toggle('open');
  if(navList && navList.classList.contains('open')) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';
}
function closeMobileNav(){
  var navList = document.getElementById('navList');
  if(navList) navList.classList.remove('open');
  document.body.style.overflow = '';
  document.querySelectorAll('.nav-list > li').forEach(function(li){ li.classList.remove('open'); });
}
function toggleDropdown(btn){
  var li = btn.closest('li');
  if(!li) return;
  if(window.innerWidth <= 768){
    li.classList.toggle('open');
    document.querySelectorAll('.nav-list > li').forEach(function(other){ if(other !== li) other.classList.remove('open'); });
  }
}

function loadHeroSlides(){
  heroSlides = safeGet('hero_slides', []);
  if(!Array.isArray(heroSlides)) heroSlides = [];
  if(currentSlideIndex >= heroSlides.length) currentSlideIndex = 0;
  renderHeroSlides();
}
function saveHeroSlides(){
  safeSet('hero_slides', heroSlides);
  broadcastRefresh();
  renderHeroSlides();
  if(heroSlides.length > 1 && !checkPause() && !autoPlayStarted) resetSlideAutoPlay();
}
function renderHeroSlides(){
  var container = document.getElementById('heroSlidesContainer');
  var placeholder = document.getElementById('heroPlaceholder');
  var dots = document.getElementById('heroDots');
  var count = document.getElementById('slideCount');
  var list = document.getElementById('slideList');
  if(!container) return;
  container.innerHTML = '';
  if(dots) dots.innerHTML = '';
  if(heroSlides.length === 0){
    if(placeholder) placeholder.style.display = 'flex';
    if(count) count.textContent = '0';
    if(list) list.innerHTML = '<div class="empty-slides">No slides yet. Click "Add Image Slide" to get started.</div>';
    return;
  }
  if(placeholder) placeholder.style.display = 'none';
  heroSlides.forEach(function(slide, index){
    var slideDiv = document.createElement('div');
    slideDiv.className = 'hero-slide' + (index === currentSlideIndex ? ' active' : '');
    var eyebrow = slide.eyebrow || 'Welcome to Highway Vocational Center';
    var title = slide.title || 'Skills for Life.<br><span class="accent">Careers for Tomorrow.</span>';
    var text = slide.text || 'NITA registered TVET institution offering practical, industry-relevant training in Embu County, Kenya.';
    slideDiv.innerHTML =
      '<img src="' + slide.url + '" alt="">' +
      '<div class="hero-content">' +
        '<div class="hero-eyebrow"><i class="fas fa-graduation-cap"></i> <span class="editable-slide" data-slide-key="eyebrow" data-slide-id="' + slide.id + '">' + eyebrow + '</span></div>' +
        '<h1 class="editable-slide" data-slide-key="title" data-slide-id="' + slide.id + '">' + title + '</h1>' +
        '<p class="editable-slide" data-slide-key="text" data-slide-id="' + slide.id + '">' + text + '</p>' +
        '<div class="hero-buttons">' +
          '<button class="btn-hero-primary" onclick="showPage(\'apply\')"><i class="fas fa-file-signature"></i> Apply for Admission</button>' +
          '<button class="btn-hero-secondary" onclick="showPage(\'courses\')"><i class="fas fa-graduation-cap"></i> Explore Courses</button>' +
        '</div>' +
      '</div>' +
      '<span class="slide-title">' + escapeHtml(slide.name || '') + '</span>' +
      '<button class="slide-remove-btn" onclick="deleteHeroSlide(\'' + slide.id + '\')"><i class="fas fa-times"></i></button>';
    container.appendChild(slideDiv);
  });
  if(dots){
    heroSlides.forEach(function(s, i){
      var dot = document.createElement('button');
      dot.className = (i === currentSlideIndex ? 'active' : '');
      dot.onclick = function(){ goToSlide(i); };
      dots.appendChild(dot);
    });
  }
  if(count) count.textContent = heroSlides.length;
  if(list){
    list.innerHTML = heroSlides.map(function(s){
      return '<div class="slide-item"><img src="' + s.url + '" alt=""><div class="si-info">' + escapeHtml(s.name || 'Slide') + '</div><button class="si-del" onclick="deleteHeroSlide(\'' + s.id + '\')"><i class="fas fa-times"></i></button></div>';
    }).join('');
  }
  applyEditableState();
}
function goToSlide(index){
  if(heroSlides.length === 0) return;
  if(index < 0) index = heroSlides.length - 1;
  if(index >= heroSlides.length) index = 0;
  currentSlideIndex = index;
  document.querySelectorAll('.hero-slide').forEach(function(s, i){ s.classList.toggle('active', i === index); });
  document.querySelectorAll('.hero-dots button').forEach(function(d, i){ d.classList.toggle('active', i === index); });
  resetSlideAutoPlay();
}
function nextSlide(){ if(heroSlides.length) goToSlide(currentSlideIndex + 1); }
function prevSlide(){ if(heroSlides.length) goToSlide(currentSlideIndex - 1); }
function resetSlideAutoPlay(){
  if(slideAutoPlayTimer){ clearInterval(slideAutoPlayTimer); slideAutoPlayTimer = null; autoPlayStarted = false; }
  if(!checkPause() && heroSlides.length > 1 && !autoPlayStarted){
    autoPlayStarted = true;
    slideAutoPlayTimer = setInterval(function(){
      if(!checkPause() && heroSlides.length > 1) nextSlide();
      else { clearInterval(slideAutoPlayTimer); slideAutoPlayTimer = null; autoPlayStarted = false; }
    }, slideAutoPlayInterval);
  }
}
function addHeroSlide(){
  if(!adminMode){ showToast('Enable Edit Mode first (Ctrl+Shift+A)', ''); return; }
  var input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = function(e){
    var file = e.target.files[0];
    if(!file) return;
    if(file.size > 8 * 1024 * 1024){ showToast('Image too large (max 8MB)', ''); return; }
    var reader = new FileReader();
    reader.onload = function(ev){
      compressImage(ev.target.result, 1920, 0.92).then(function(compressed){
        var slide = {
          id: 'slide_' + Date.now(),
          url: compressed,
          name: file.name.replace(/\.[^.]+$/, ''),
          eyebrow: 'Welcome to Highway Vocational Center',
          title: 'Skills for Life.<br><span class="accent">Careers for Tomorrow.</span>',
          text: 'NITA registered TVET institution offering practical, industry-relevant training in Embu County, Kenya.'
        };
        heroSlides.push(slide);
        currentSlideIndex = heroSlides.length - 1;
        saveHeroSlides();
        addToGallery(compressed, 'Hero Slide');
        showToast('Slide added!', 'success');
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
function deleteHeroSlide(id){
  if(!adminMode){ showToast('Enable Edit Mode first', ''); return; }
  if(!confirm('Delete this slide?')) return;
  heroSlides = heroSlides.filter(function(s){ return s.id !== id; });
  if(currentSlideIndex >= heroSlides.length) currentSlideIndex = Math.max(0, heroSlides.length - 1);
  saveHeroSlides();
  showToast('Slide deleted', '');
}
function removeAllHeroSlides(){
  if(!adminMode){ showToast('Enable Edit Mode first', ''); return; }
  if(!confirm('Remove ALL slides?')) return;
  heroSlides = []; currentSlideIndex = 0;
  try { localStorage.removeItem('hero_slides'); } catch(e){}
  renderHeroSlides();
  showToast('All slides removed', '');
}
function adminUploadLogo(){
  if(!adminMode) return;
  var input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*';
  input.onchange = function(e){
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      compressImage(ev.target.result, 300, 0.95).then(function(compressed){
        var logoMark = document.getElementById('logoMark');
        if(logoMark){ logoMark.innerHTML = ''; var img = document.createElement('img'); img.src = compressed; img.alt = 'Logo'; logoMark.appendChild(img); }
        try { localStorage.setItem('logo', compressed); } catch(e){}
        addToGallery(compressed, 'Logo');
        showToast('Logo updated! Click Save.', 'success');
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
function compressImage(dataUrl, maxW, q){
  return new Promise(function(resolve){
    var img = new Image();
    img.onload = function(){
      var c = document.createElement('canvas');
      var w = img.width, h = img.height;
      if(w > maxW){ h = Math.round(h * (maxW / w)); w = maxW; }
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', q || 0.9));
    };
    img.onerror = function(){ resolve(dataUrl); };
    img.src = dataUrl;
  });
}

function applyEditableState(){
  document.querySelectorAll('[data-key]').forEach(function(el){
    if(adminMode) el.setAttribute('contenteditable', 'true');
    else el.removeAttribute('contenteditable');
  });
  document.querySelectorAll('.editable-slide').forEach(function(el){
    if(adminMode) el.setAttribute('contenteditable', 'true');
    else el.removeAttribute('contenteditable');
  });
  var hint = document.getElementById('adminEditHint');
  if(hint) hint.classList.toggle('active', adminMode);
  if(adminMode){
    var links = safeGet('social_links', {});
    ['whatsapp','facebook','instagram','tiktok','youtube','telegram','twitter','linkedin'].forEach(function(p){
      var cap = p.charAt(0).toUpperCase() + p.slice(1);
      var inp = document.getElementById('liveSocial' + cap);
      if(inp) inp.value = links[p] || '';
    });
  }
}
function loadSavedContent(){
  var content = safeGet('site_content', {});
  Object.keys(content).forEach(function(key){
    var el = document.querySelector('[data-key="' + key + '"]');
    if(el) el.innerHTML = content[key];
  });
  var ph = safeGet('site_placeholders', {});
  Object.keys(ph).forEach(function(key){
    var el = document.querySelector('[data-key-placeholder="' + key + '"]');
    if(el) el.setAttribute('placeholder', ph[key]);
  });
}
function saveAllChanges(){
  try {
    var content = {};
    document.querySelectorAll('[data-key]').forEach(function(el){ content[el.dataset.key] = el.innerHTML; });
    safeSet('site_content', content);
    var ph = {};
    document.querySelectorAll('[data-key-placeholder]').forEach(function(el){ ph[el.dataset.keyPlaceholder] = el.getAttribute('placeholder') || ''; });
    safeSet('site_placeholders', ph);
    var slideContent = {};
    document.querySelectorAll('.editable-slide[data-slide-id]').forEach(function(el){
      var id = el.dataset.slideId;
      if(!slideContent[id]) slideContent[id] = {};
      slideContent[id][el.dataset.slideKey] = el.innerHTML;
    });
    heroSlides.forEach(function(s){
      if(slideContent[s.id]){
        s.eyebrow = slideContent[s.id].eyebrow || s.eyebrow;
        s.title = slideContent[s.id].title || s.title;
        s.text = slideContent[s.id].text || s.text;
      }
    });
    safeSet('hero_slides', heroSlides);
    var socialInputs = {
      whatsapp: 'liveSocialWhatsApp', facebook: 'liveSocialFacebook', instagram: 'liveSocialInstagram',
      tiktok: 'liveSocialTikTok', youtube: 'liveSocialYouTube', telegram: 'liveSocialTelegram',
      twitter: 'liveSocialTwitter', linkedin: 'liveSocialLinkedIn'
    };
    var links = safeGet('social_links', {});
    Object.keys(socialInputs).forEach(function(k){
      var inp = document.getElementById(socialInputs[k]);
      if(inp) links[k] = inp.value.trim();
    });
    safeSet('social_links', links);
    applySocialLinks();
    broadcastRefresh();
    showToast('All changes saved & live!', 'success');
  } catch(e){ showToast('Save error: ' + e.message, 'error'); }
}
function exportData(){
  try {
    var data = {
      content: localStorage.getItem('site_content'),
      placeholders: localStorage.getItem('site_placeholders'),
      hero_slides: localStorage.getItem('hero_slides'),
      gallery_images: localStorage.getItem('gallery_images'),
      testimonials: localStorage.getItem('testimonials'),
      social_links: localStorage.getItem('social_links'),
      notifications: localStorage.getItem('notifications'),
      applications: localStorage.getItem('applications'),
      students: localStorage.getItem('students'),
      announcements: localStorage.getItem('announcements'),
      payments: localStorage.getItem('payments'),
      student_reports: localStorage.getItem('student_reports'),
      admin_notif_history: localStorage.getItem('admin_notif_history'),
      resources: localStorage.getItem('resources'),
      timetable_data: localStorage.getItem('timetable_data'),
      live_classes: localStorage.getItem('live_classes')
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'highway_backup_' + new Date().toISOString().slice(0,10) + '.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
  } catch(e){ showToast('Export failed', 'error'); }
}

function getPauseExpiry(d){
  var date = new Date();
  var days = {'1day':1,'3days':3,'7days':7,'1month':30,'6months':180,'1year':365};
  if(d === 'lifetime') return null;
  date.setDate(date.getDate() + (days[d] || 30));
  return date.getTime();
}
function getDurationLabel(d){
  var labels = {'1day':'1 Day','3days':'3 Days','7days':'1 Week','1month':'1 Month','6months':'6 Months','1year':'1 Year','lifetime':'Lifetime'};
  return labels[d] || d;
}
function savePause(d){
  var state = { paused:true, expiresAt:getPauseExpiry(d), duration:d, startTime:Date.now() };
  try { localStorage.setItem('wf_pause', JSON.stringify(state)); return true; } catch(e){ return false; }
}
function clearPause(){
  try { localStorage.removeItem('wf_pause'); } catch(e){}
  if(pauseTimerId){ clearInterval(pauseTimerId); pauseTimerId = null; }
  try { localStorage.removeItem('pause_timer_end'); } catch(e){}
}
function checkPause(){
  var state = safeGet('wf_pause', null);
  if(!state || !state.paused) return false;
  if(state.expiresAt && Date.now() > state.expiresAt){ clearPause(); return false; }
  return true;
}
function getRemaining(){
  var state = safeGet('wf_pause', null);
  if(!state || !state.paused) return null;
  if(state.expiresAt === null || state.expiresAt === undefined) return null;
  var rem = state.expiresAt - Date.now();
  if(rem <= 0){ clearPause(); return null; }
  return rem;
}
function formatTime(ms){
  if(!ms) return '';
  var d = Math.floor(ms/86400000); ms -= d*86400000;
  var h = Math.floor(ms/3600000); ms -= h*3600000;
  var m = Math.floor(ms/60000); ms -= m*60000;
  var s = Math.floor(ms/1000);
  if(d > 0) return d+'d '+h+'h '+m+'m';
  if(h > 0) return h+'h '+m+'m '+s+'s';
  if(m > 0) return m+'m '+s+'s';
  return s+'s';
}
function updatePauseUI(){
  var rem = getRemaining();
  var overlay = document.getElementById('pauseOverlay');
  var cd = document.getElementById('pauseCountdown');
  if(checkPause()){
    if(overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if(cd) cd.textContent = rem ? 'Remaining: ' + formatTime(rem) : 'Lifetime (never expires)';
    if(slideAutoPlayTimer){ clearInterval(slideAutoPlayTimer); slideAutoPlayTimer = null; autoPlayStarted = false; }
  } else {
    if(overlay) overlay.classList.remove('active');
    if(document.body.style.overflow === 'hidden' && !document.getElementById('liveCamPopup').classList.contains('open')) document.body.style.overflow = '';
    if(cd) cd.textContent = '';
    checkTimerPause();
    if(heroSlides.length > 1 && !autoPlayStarted) resetSlideAutoPlay();
  }
}
function checkTimerPause(){
  try {
    var endTime = localStorage.getItem('pause_timer_end');
    if(!endTime) return;
    var end = parseInt(endTime, 10);
    if(Date.now() >= end){
      localStorage.removeItem('pause_timer_end');
      if(!checkPause()){ savePause(pauseDuration); updatePauseUI(); }
    } else {
      if(!pauseTimerId){ pauseTimerId = setInterval(checkTimerPause, 5000); }
    }
  } catch(e){}
}
function setPauseTimer(d){
  pauseDuration = d || '1month';
  var expiry = getPauseExpiry(d);
  if(expiry === null){
    try { localStorage.setItem('pause_timer_end', '0'); } catch(e){}
    showToast('Lifetime timer set', '');
    return;
  }
  try { localStorage.setItem('pause_timer_end', String(expiry)); } catch(e){}
  if(pauseTimerId) clearInterval(pauseTimerId);
  pauseTimerId = setInterval(checkTimerPause, 5000);
  showToast('Timer set for ' + getDurationLabel(d), 'success');
}
function togglePause(d){
  if(checkPause()){ clearPause(); updatePauseUI(); showToast('System unpaused','success'); return; }
  if(!d) d = '1month';
  savePause(d); updatePauseUI();
  showToast('System paused for ' + getDurationLabel(d), '');
}
function handleMakePayment(){
  var id = prompt('Enter your ID Number to proceed with payment:');
  if(id === null) return;
  if(id.trim() === CONFIG.PAYMENT_ID) window.location.href = 'payment.html';
  else showToast('Invalid ID Number', 'error');
}
function showPausePasswordModal(){
  var modal = document.getElementById('pwModal');
  var title = document.getElementById('pwModalTitle');
  var sub = document.getElementById('pwModalSub');
  if(!modal) return;
  if(checkPause()){ title.textContent = 'Unpause System'; sub.textContent = 'Enter password to unpause'; }
  else { title.textContent = 'Pause System'; sub.textContent = 'Enter password to pause'; }
  modal.classList.add('active');
  var input = document.getElementById('pwInput');
  if(input){ input.value = ''; input.focus(); }
  document.getElementById('pwError').classList.remove('show');
}
function handleSystemPassword(){
  var input = document.getElementById('pwInput');
  var err = document.getElementById('pwError');
  if(!input || !err) return;
  if(input.value === systemPassword){
    err.classList.remove('show');
    document.getElementById('pwModal').classList.remove('active');
    if(checkPause()){ clearPause(); updatePauseUI(); showToast('System unpaused!','success'); }
    else document.getElementById('durModal').classList.add('active');
  } else { err.classList.add('show'); input.value = ''; input.focus(); }
}
function verifyAdminPassword(){
  var input = document.getElementById('adminPasswordInput');
  var error = document.getElementById('adminPasswordError');
  if(!input || !error) return;
  if(input.value === adminPassword){
    closeAdminPasswordModal(); toggleAdminMode();
    showToast('Edit Mode ON — click any text to edit', 'success');
  } else {
    error.classList.add('show'); input.value = ''; input.focus();
    showToast('Incorrect password', 'error');
  }
}
function closeAdminPasswordModal(){
  var m = document.getElementById('adminPasswordModal');
  if(m) m.classList.remove('open');
  var i = document.getElementById('adminPasswordInput');
  if(i) i.value = '';
  var e = document.getElementById('adminPasswordError');
  if(e) e.classList.remove('show');
}
function toggleAdminMode(){
  adminMode = !adminMode;
  var ind = document.getElementById('adminIndicator');
  var sv = document.getElementById('adminSaveBtn');
  var ex = document.getElementById('adminExportBtn');
  if(adminMode){
    if(ind) ind.classList.add('active');
    if(sv) sv.classList.add('active');
    if(ex) ex.classList.add('active');
    document.body.classList.add('admin-mode');
    applyEditableState();
    showToast('Edit Mode ON', 'success');
  } else {
    if(ind) ind.classList.remove('active');
    if(sv) sv.classList.remove('active');
    if(ex) ex.classList.remove('active');
    document.body.classList.remove('admin-mode');
    applyEditableState();
    showToast('Edit Mode OFF', '');
  }
}

function openAdminPanelLogin(){
  if(adminPanelAuthed){ showPage('admin'); return; }
  var m = document.getElementById('adminPanelLoginModal');
  if(m) m.classList.add('open');
  var i = document.getElementById('adminPanelInput');
  if(i){ i.value = ''; setTimeout(function(){ i.focus(); }, 100); }
  var e = document.getElementById('adminPanelError');
  if(e) e.classList.remove('show');
}
function closeAdminPanelLogin(){
  var m = document.getElementById('adminPanelLoginModal');
  if(m) m.classList.remove('open');
  var i = document.getElementById('adminPanelInput');
  if(i) i.value = '';
  var e = document.getElementById('adminPanelError');
  if(e) e.classList.remove('show');
}
function verifyAdminPanelPassword(){
  var input = document.getElementById('adminPanelInput');
  var error = document.getElementById('adminPanelError');
  if(!input || !error) return;
  if(input.value === ADMIN_PANEL_PASSWORD){
    adminPanelAuthed = true;
    closeAdminPanelLogin();
    document.getElementById('navAdminLi').style.display = '';
    showPage('admin');
    refreshAdminPanel();
    showToast('Welcome, Administrator', 'success');
  } else {
    error.classList.add('show'); input.value = ''; input.focus();
    showToast('Incorrect admin password', 'error');
  }
}
function adminPanelLogout(){
  adminPanelAuthed = false;
  document.getElementById('navAdminLi').style.display = 'none';
  showPage('home');
  showToast('Logged out of admin panel', '');
}
function refreshAdminPanel(){
  if(!adminPanelAuthed){
    openAdminPanelLogin();
    return;
  }
  updateAdminStats();
  renderAdminApplications();
  renderAdminStudents();
  populateReceiptStudentSelect();
  renderAdminPayments();
  renderAdminAnnouncements();
  renderAdminNotifHistory();
  renderAdminReports();
  renderAdminResources();
  renderTimetableEditor();
  renderAdminLiveClasses();
}
function switchAdminTab(tab){
  document.querySelectorAll('.admin-tab').forEach(function(b){ b.classList.toggle('active', b.dataset.tab === tab); });
  document.querySelectorAll('.admin-tab-content').forEach(function(c){ c.classList.toggle('active', c.id === 'adminTab-' + tab); });
  if(tab === 'timetables') renderTimetableEditor();
  if(tab === 'liveclasses') renderAdminLiveClasses();
}

function renderTimetableEditor(){
  var wrap = document.getElementById('ttEditorWrap');
  var sel = document.getElementById('ttEditorCourse');
  if(!wrap || !sel) return;
  var courseKey = sel.value;
  var schedule = TIMETABLE_DATA.schedule[courseKey];
  if(!schedule){ wrap.innerHTML = '<p style="color:#6b7688;">No timetable data for this course.</p>'; return; }
  var html = '<table class="tt-editor-table"><thead><tr><th>Time</th>';
  TIMETABLE_DATA.days.forEach(function(d){ html += '<th>' + d + '</th>'; });
  html += '</tr></thead><tbody>';
  TIMETABLE_DATA.slots.forEach(function(slot, idx){
    html += '<tr>';
    html += '<td class="tt-time-cell">' + slot.time + '</td>';
    TIMETABLE_DATA.days.forEach(function(day){
      var key = day.toLowerCase().substring(0,3);
      var entry = schedule[idx] && schedule[idx][key] ? schedule[idx][key] : ['',''];
      var sub = entry[0] || '';
      var room = entry[1] || '';
      html += '<td>' +
        '<input type="text" data-tt-course="' + courseKey + '" data-tt-slot="' + idx + '" data-tt-day="' + key + '" data-tt-field="subject" value="' + escapeHtml(sub) + '" placeholder="Subject">' +
        '<input type="text" data-tt-course="' + courseKey + '" data-tt-slot="' + idx + '" data-tt-day="' + key + '" data-tt-field="room" value="' + escapeHtml(room) + '" placeholder="Room" style="margin-top:3px;">' +
      '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}
function saveTimetableEditor(){
  var inputs = document.querySelectorAll('#ttEditorWrap input[data-tt-course]');
  if(!inputs.length) return;
  var newSchedule = JSON.parse(JSON.stringify(TIMETABLE_DATA.schedule));
  inputs.forEach(function(inp){
    var course = inp.dataset.ttCourse;
    var slot = parseInt(inp.dataset.ttSlot, 10);
    var day = inp.dataset.ttDay;
    var field = inp.dataset.ttField;
    if(!newSchedule[course]) newSchedule[course] = [];
    if(!newSchedule[course][slot]) newSchedule[course][slot] = {};
    if(!newSchedule[course][slot][day]) newSchedule[course][slot][day] = ['', ''];
    if(field === 'subject') newSchedule[course][slot][day][0] = inp.value;
    else newSchedule[course][slot][day][1] = inp.value;
  });
  TIMETABLE_DATA.schedule = newSchedule;
  safeSet('timetable_data', { schedule: newSchedule });
  broadcastRefresh();
  showToast('Timetable saved!', 'success');
}
function resetTimetableEditor(){
  if(!confirm('Reset this course timetable to default?')) return;
  var sel = document.getElementById('ttEditorCourse');
  var courseKey = sel ? sel.value : 'computer-packages';
  TIMETABLE_DATA.schedule[courseKey] = JSON.parse(JSON.stringify(DEFAULT_TIMETABLE_DATA.schedule[courseKey]));
  safeSet('timetable_data', { schedule: TIMETABLE_DATA.schedule });
  renderTimetableEditor();
  showToast('Timetable reset to default', 'success');
}

function getAllResources(){
  var r = safeGet('resources', []);
  return Array.isArray(r) ? r : [];
}
function saveAllResources(r){
  safeSet('resources', r);
  broadcastRefresh();
}

function handleResourceUpload(event){
  var files = event.target.files ? Array.from(event.target.files) : [];
  if(files.length === 0) return;
  files.forEach(function(file){
    if(file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')){
      showToast(file.name + ' is not a PDF. Skipped.', 'error');
      return;
    }
    if(file.size > 15 * 1024 * 1024){
      showToast(file.name + ' exceeds 15MB. Skipped.', 'error');
      return;
    }
    var reader = new FileReader();
    reader.onload = function(ev){
      var resources = getAllResources();
      resources.push({
        id: 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
        title: file.name.replace(/\.pdf$/i, ''),
        fileName: file.name,
        size: formatFileSize(file.size),
        dataUrl: ev.target.result,
        uploadedAt: new Date().toISOString()
      });
      saveAllResources(resources);
      renderAdminResources();
      renderPublicResources();
      showToast(file.name + ' uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function formatFileSize(bytes){
  if(bytes < 1024) return bytes + ' B';
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/(1024*1024)).toFixed(2) + ' MB';
}

function renderAdminResources(){
  var list = document.getElementById('adminResourceList');
  var count = document.getElementById('resourceCount');
  if(!list) return;
  var resources = getAllResources().slice().reverse();
  if(count) count.textContent = resources.length;
  if(resources.length === 0){
    list.innerHTML = '<p style="color:#6b7688;font-size:12.5px;text-align:center;padding:14px;">No resources uploaded yet.</p>';
    return;
  }
  list.innerHTML = resources.map(function(r){
    return '<div class="resource-admin-item">' +
      '<div class="rai-icon"><i class="fas fa-file-pdf"></i></div>' +
      '<div class="rai-info">' +
        '<div class="rai-title">' + escapeHtml(r.title) + '</div>' +
        '<div class="rai-meta"><span><i class="fas fa-hdd"></i> ' + escapeHtml(r.size) + '</span><span><i class="fas fa-calendar"></i> ' + new Date(r.uploadedAt).toLocaleDateString() + '</span></div>' +
      '</div>' +
      '<div class="rai-actions">' +
        '<button class="rai-view" onclick="viewResource(\'' + r.id + '\')"><i class="fas fa-eye"></i></button>' +
        '<button class="rai-dl" onclick="downloadResource(\'' + r.id + '\')"><i class="fas fa-download"></i></button>' +
        '<button class="rai-del" onclick="deleteResource(\'' + r.id + '\')"><i class="fas fa-trash"></i></button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderPublicResources(){
  var list = document.getElementById('publicResourcesList');
  if(!list) return;
  var resources = getAllResources().slice().reverse();
  if(resources.length === 0){
    list.innerHTML = '<div class="gallery-empty" style="text-align:center;padding:40px 20px;color:var(--text-muted);"><i class="fas fa-folder-open" style="font-size:40px;color:var(--border-dark);margin-bottom:11px;display:block;"></i><p>No resources uploaded yet. Check back soon.</p></div>';
    return;
  }
  list.innerHTML = resources.map(function(r){
    return '<div class="material-item">' +
      '<div class="mat-icon" style="background:#dc2626;"><i class="fas fa-file-pdf"></i></div>' +
      '<div class="mat-info">' +
        '<div class="mat-title">' + escapeHtml(r.title) + '</div>' +
        '<div class="mat-meta"><span><i class="fas fa-hdd"></i> ' + escapeHtml(r.size) + '</span><span><i class="fas fa-calendar"></i> ' + new Date(r.uploadedAt).toLocaleDateString() + '</span></div>' +
      '</div>' +
      '<div class="mat-actions">' +
        '<button class="mat-view" onclick="viewResource(\'' + r.id + '\')"><i class="fas fa-eye"></i> View</button>' +
        '<button class="mat-dl" onclick="downloadResource(\'' + r.id + '\')"><i class="fas fa-download"></i> Download</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function viewResource(id){
  var resources = getAllResources();
  var r = null;
  for(var i=0;i<resources.length;i++){ if(resources[i].id === id){ r = resources[i]; break; } }
  if(!r){ showToast('Resource not found', 'error'); return; }
  try {
    var blob = dataURLtoBlob(r.dataUrl);
    var url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(function(){ URL.revokeObjectURL(url); }, 60000);
    showToast('Opening ' + r.title + '...', 'success');
  } catch(e){
    showToast('Could not open resource', 'error');
  }
}

function downloadResource(id){
  var resources = getAllResources();
  var r = null;
  for(var i=0;i<resources.length;i++){ if(resources[i].id === id){ r = resources[i]; break; } }
  if(!r){ showToast('Resource not found', 'error'); return; }
  try {
    var a = document.createElement('a');
    a.href = r.dataUrl;
    a.download = r.fileName || (r.title + '.pdf');
    a.click();
    showToast('Downloading ' + r.title + '...', 'success');
  } catch(e){
    showToast('Download failed', 'error');
  }
}

function deleteResource(id){
  if(!confirm('Delete this resource? Students will no longer be able to access it.')) return;
  var resources = getAllResources().filter(function(r){ return r.id !== id; });
  saveAllResources(resources);
  renderAdminResources();
  renderPublicResources();
  showToast('Resource deleted', '');
}

function dataURLtoBlob(dataUrl){
  var arr = dataUrl.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while(n--){ u8arr[n] = bstr.charCodeAt(n); }
  return new Blob([u8arr], { type: mime });
}

function getAllAnnouncements(){
  var a = safeGet('announcements', []);
  return Array.isArray(a) ? a : [];
}
function saveAllAnnouncements(a){
  safeSet('announcements', a);
  broadcastRefresh();
}

function postOrUpdateAnnouncement(){
  var title = document.getElementById('annTitle').value.trim();
  var message = document.getElementById('annMessage').value.trim();
  var priority = document.getElementById('annPriority').value;
  var audience = document.getElementById('annAudience').value;
  var editingId = document.getElementById('editingAnnId').value;
  if(!title || !message){ showToast('Enter title and message', 'error'); return; }
  var anns = getAllAnnouncements();
  if(editingId){
    var idx = -1;
    for(var i=0;i<anns.length;i++){ if(anns[i].id === editingId){ idx = i; break; } }
    if(idx === -1){ showToast('Announcement not found', 'error'); return; }
    anns[idx].title = title;
    anns[idx].message = message;
    anns[idx].priority = priority;
    anns[idx].audience = audience;
    anns[idx].updatedAt = new Date().toISOString();
    saveAllAnnouncements(anns);
    cancelAnnouncementEdit();
    showToast('Announcement updated!', 'success');
    pushAnnouncementToBell(title, message, priority, audience);
  } else {
    var newAnn = {
      id: 'ann_' + Date.now(),
      title: title, message: message, priority: priority, audience: audience,
      at: new Date().toISOString()
    };
    anns.push(newAnn);
    saveAllAnnouncements(anns);
    document.getElementById('annTitle').value = '';
    document.getElementById('annMessage').value = '';
    showToast('Announcement posted! Bell notification sent.', 'success');
    pushAnnouncementToBell(title, message, priority, audience);
  }
  renderAdminAnnouncements();
  renderStudentAnnouncements();
}

function pushAnnouncementToBell(title, message, priority, audience){
  var tone = 'info';
  if(priority === 'Urgent') tone = 'danger';
  else if(priority === 'Important') tone = 'warning';
  var notifs = safeGet('notifications', []);
  if(!Array.isArray(notifs)) notifs = [];
  notifs.push({
    id: 'notif_' + Date.now(),
    title: title,
    message: message,
    type: tone,
    audience: audience,
    at: new Date().toISOString()
  });
  safeSet('notifications', notifs);
  showNotification(title, message, tone);
}

function editAnnouncement(id){
  var anns = getAllAnnouncements();
  var ann = null;
  for(var i=0;i<anns.length;i++){ if(anns[i].id === id){ ann = anns[i]; break; } }
  if(!ann) return;
  document.getElementById('annTitle').value = ann.title;
  document.getElementById('annMessage').value = ann.message;
  document.getElementById('annPriority').value = ann.priority;
  document.getElementById('annAudience').value = ann.audience || 'all';
  document.getElementById('editingAnnId').value = ann.id;
  document.getElementById('annPostBtn').innerHTML = '<i class="fas fa-save"></i> Update Announcement';
  document.getElementById('annCancelBtn').style.display = 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Editing announcement — modify and click Update', 'success');
}

function cancelAnnouncementEdit(){
  document.getElementById('annTitle').value = '';
  document.getElementById('annMessage').value = '';
  document.getElementById('editingAnnId').value = '';
  document.getElementById('annPostBtn').innerHTML = '<i class="fas fa-paper-plane"></i> Post Announcement';
  document.getElementById('annCancelBtn').style.display = 'none';
}

function deleteAnnouncement(id){
  if(!confirm('Delete this announcement?')) return;
  var anns = getAllAnnouncements().filter(function(a){ return a.id !== id; });
  saveAllAnnouncements(anns);
  renderAdminAnnouncements();
  renderStudentAnnouncements();
  showToast('Announcement deleted', '');
}

function getAudienceLabel(aud){
  var labels = {
    all: 'All Students',
    applicants: 'Applicants',
    active: 'Active Students',
    course_computer: 'Computer Students',
    course_beauty: 'Beauty Students',
    course_hair: 'HairDressing Students',
    course_cyber: 'Cyber Students',
    debtors: 'Students with Balance',
    staff: 'Staff Only'
  };
  return labels[aud] || aud || 'All Students';
}

function announcementMatchesAudience(annAud, student){
  if(!annAud || annAud === 'all') return true;
  if(annAud === 'applicants') return false;
  if(annAud === 'active') return !!student.active;
  if(annAud === 'staff') return false;
  if(annAud === 'debtors'){
    var balance = (student.totalFees || 0) - (student.paid || 0);
    return balance > 0;
  }
  if(annAud === 'course_computer') return (student.course || '').toLowerCase().indexOf('computer') !== -1;
  if(annAud === 'course_beauty') return (student.course || '').toLowerCase().indexOf('beauty') !== -1;
  if(annAud === 'course_hair') return (student.course || '').toLowerCase().indexOf('hair') !== -1;
  if(annAud === 'course_cyber') return (student.course || '').toLowerCase().indexOf('cyber') !== -1;
  return true;
}

function renderAdminAnnouncements(){
  var list = document.getElementById('announcementsList');
  if(!list) return;
  var anns = getAllAnnouncements().slice().reverse();
  if(anns.length === 0){
    list.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">No announcements yet.</p>';
    return;
  }
  list.innerHTML = anns.map(function(a){
    var cls = a.priority === 'Urgent' ? ' urgent' : a.priority === 'Important' ? ' important' : '';
    return '<div class="announcement-item' + cls + '">' +
      '<div class="an-actions">' +
        '<button class="btn-edit-ann" onclick="editAnnouncement(\'' + a.id + '\')"><i class="fas fa-edit"></i> Edit</button>' +
        '<button class="btn-del-ann" onclick="deleteAnnouncement(\'' + a.id + '\')"><i class="fas fa-trash"></i></button>' +
      '</div>' +
      '<h4><i class="fas fa-bullhorn"></i> ' + escapeHtml(a.title) + '</h4>' +
      '<p>' + escapeHtml(a.message) + '</p>' +
      '<div class="an-meta">' +
        '<span><i class="fas fa-users"></i> ' + escapeHtml(getAudienceLabel(a.audience)) + '</span>' +
        '<span><i class="fas fa-flag"></i> ' + escapeHtml(a.priority) + '</span>' +
        '<span><i class="fas fa-clock"></i> ' + new Date(a.at).toLocaleString() + '</span>' +
        (a.updatedAt ? '<span><i class="fas fa-edit"></i> Updated ' + new Date(a.updatedAt).toLocaleString() + '</span>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function renderStudentAnnouncements(){
  var box = document.getElementById('studentAnnouncements');
  if(!box) return;
  if(!currentStudentSession){
    box.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">Login to view announcements.</p>';
    return;
  }
  var student = currentStudentSession;
  var anns = getAllAnnouncements().filter(function(a){
    return announcementMatchesAudience(a.audience, student);
  }).slice().reverse();
  var notifs = safeGet('notifications', []);
  if(!Array.isArray(notifs)) notifs = [];
  var relevantNotifs = notifs.filter(function(n){
    return announcementMatchesAudience(n.audience, student);
  }).slice().reverse();
  var combined = [];
  anns.forEach(function(a){
    combined.push({ title: a.title, message: a.message, at: a.at, priority: a.priority, type: 'announcement' });
  });
  relevantNotifs.forEach(function(n){
    combined.push({ title: n.title, message: n.message, at: n.at, priority: n.type === 'danger' ? 'Urgent' : n.type === 'warning' ? 'Important' : 'Normal', type: 'notification' });
  });
  combined.sort(function(a,b){ return new Date(b.at) - new Date(a.at); });
  if(combined.length === 0){
    box.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">No announcements at the moment.</p>';
    return;
  }
  box.innerHTML = combined.slice(0, 20).map(function(a){
    var cls = a.priority === 'Urgent' ? ' urgent' : a.priority === 'Important' ? ' important' : '';
    var icon = a.type === 'notification' ? 'fa-bell' : 'fa-bullhorn';
    return '<div class="announcement-item' + cls + '">' +
      '<h4><i class="fas ' + icon + '"></i> ' + escapeHtml(a.title) + '</h4>' +
      '<p>' + escapeHtml(a.message) + '</p>' +
      '<div class="an-meta"><span>' + escapeHtml(a.priority) + '</span><span>' + new Date(a.at).toLocaleString() + '</span></div>' +
    '</div>';
  }).join('');
}

function loadNotifications(){
  notifications = safeGet('notifications', []);
  if(!Array.isArray(notifications)) notifications = [];
}
function showNotification(title, message, type){
  var display = document.getElementById('notificationDisplay');
  if(!display) return;
  document.getElementById('notifTitle').textContent = title;
  document.getElementById('notifMessage').textContent = message;
  document.getElementById('notifTime').textContent = 'Just now';
  var typeEl = document.getElementById('notifType');
  var labels = { info:'Info', success:'Success', warning:'Warning', danger:'Alert' };
  typeEl.textContent = labels[type] || 'Info';
  typeEl.className = 'notif-type ' + (type || 'info');
  var actions = document.getElementById('notifActions');
  actions.innerHTML = '';
  var cb = document.createElement('button');
  cb.className = 'notif-action-secondary';
  cb.textContent = 'Dismiss';
  cb.onclick = closeNotification;
  actions.appendChild(cb);
  display.classList.add('show');
  document.getElementById('bellDot').classList.add('show');
}
function closeNotification(){
  document.getElementById('notificationDisplay').classList.remove('show');
  document.getElementById('bellDot').classList.remove('show');
}
function toggleNotification(){
  var d = document.getElementById('notificationDisplay');
  if(d.classList.contains('show')) closeNotification();
  else showNotification('Welcome!', 'Stay updated with the latest news.', 'info');
}
function openNotificationEditor(){
  document.getElementById('notificationEditorModal').classList.add('open');
}
function closeNotificationEditor(){ document.getElementById('notificationEditorModal').classList.remove('open'); }
function saveNotification(){
  var t = document.getElementById('notifEditorTitle').value.trim();
  var m = document.getElementById('notifEditorMessage').value.trim();
  var tp = document.getElementById('notifEditorType').value;
  if(!t || !m){ showToast('Please enter title and message', 'error'); return; }
  notifications.push({ title:t, message:m, type:tp, at:new Date().toISOString() });
  safeSet('notifications', notifications);
  showNotification(t, m, tp);
  closeNotificationEditor();
  showToast('Notification sent!', 'success');
}

/* ---------- LIVE CLASSES (Google Meet) ---------- */
function getAllLiveClasses(){
  var lc = safeGet('live_classes', []);
  return Array.isArray(lc) ? lc : [];
}
function saveAllLiveClasses(lc){
  safeSet('live_classes', lc);
  broadcastRefresh();
}
function postLiveClass(){
  var name = document.getElementById('liveClassName').value.trim();
  var link = document.getElementById('liveClassLink').value.trim();
  var time = document.getElementById('liveClassTime').value;
  var audience = document.getElementById('liveClassAudience').value;
  var notes = document.getElementById('liveClassNotes').value.trim();
  if(!name || !link){ showToast('Enter session title and Google Meet link', 'error'); return; }
  if(!/^https?:\/\/(meet\.google\.com|.*\.google\.com)/i.test(link) && link.indexOf('meet.google.com') === -1){
    if(!confirm('This does not look like a Google Meet link. Continue anyway?')) return;
  }
  var lc = getAllLiveClasses();
  lc.push({
    id: 'live_' + Date.now(),
    name: name, link: link, time: time, audience: audience, notes: notes,
    postedAt: new Date().toISOString(),
    ended: false
  });
  saveAllLiveClasses(lc);
  document.getElementById('liveClassName').value = '';
  document.getElementById('liveClassLink').value = '';
  document.getElementById('liveClassTime').value = '';
  document.getElementById('liveClassNotes').value = '';
  renderAdminLiveClasses();
  renderPublicLiveClasses();
  showToast('Live class published!', 'success');
  // Notify audience
  var title = 'Live Class: ' + name;
  var msg = 'Join now: ' + link + (time ? '\nScheduled: ' + new Date(time).toLocaleString() : '');
  pushAnnouncementToBell(title, msg, 'Important', audience === 'staff' ? 'all' : audience);
}
function endLiveClass(id){
  if(!confirm('Mark this live class as ended?')) return;
  var lc = getAllLiveClasses();
  for(var i=0;i<lc.length;i++){ if(lc[i].id === id){ lc[i].ended = true; lc[i].endedAt = new Date().toISOString(); break; } }
  saveAllLiveClasses(lc);
  renderAdminLiveClasses();
  renderPublicLiveClasses();
  showToast('Live class ended', '');
}
function deleteLiveClass(id){
  if(!confirm('Delete this live class?')) return;
  var lc = getAllLiveClasses().filter(function(l){ return l.id !== id; });
  saveAllLiveClasses(lc);
  renderAdminLiveClasses();
  renderPublicLiveClasses();
  showToast('Live class deleted', '');
}
function renderAdminLiveClasses(){
  var box = document.getElementById('adminLiveClassList');
  if(!box) return;
  var lc = getAllLiveClasses().slice().reverse();
  if(lc.length === 0){ box.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">No live classes published yet.</p>'; return; }
  box.innerHTML = lc.map(function(l){
    var timeStr = l.time ? new Date(l.time).toLocaleString() : 'Not scheduled';
    return '<div class="live-class-card' + (l.ended ? ' ended' : '') + '">' +
      '<div>' +
        '<h4><i class="fas fa-video" style="color:#1a73e8;"></i> ' + escapeHtml(l.name) + (l.ended ? ' <span style="font-size:10px;color:#6b7688;">(Ended)</span>' : ' <span class="lc-badge-live"><span class="dot"></span>LIVE</span>') + '</h4>' +
        '<div class="lc-meta"><span><i class="fas fa-users"></i> ' + escapeHtml(getAudienceLabel(l.audience)) + '</span><span><i class="fas fa-clock"></i> ' + escapeHtml(timeStr) + '</span></div>' +
        (l.notes ? '<div style="font-size:11.5px;color:#6b7688;margin-top:4px;">' + escapeHtml(l.notes) + '</div>' : '') +
      '</div>' +
      '<div class="lc-actions">' +
        '<a class="lc-join" href="' + escapeHtml(l.link) + '" target="_blank" rel="noopener"><i class="fas fa-video"></i> Open</a>' +
        (l.ended ? '' : '<button class="btn-action-del" onclick="endLiveClass(\'' + l.id + '\')" title="End"><i class="fas fa-stop"></i></button>') +
        '<button class="btn-action-del" onclick="deleteLiveClass(\'' + l.id + '\')" title="Delete"><i class="fas fa-trash"></i></button>' +
      '</div>' +
    '</div>';
  }).join('');
}
function renderPublicLiveClasses(){
  var box = document.getElementById('publicLiveClasses');
  if(!box) return;
  var lc = getAllLiveClasses().filter(function(l){ return !l.ended; }).slice().reverse();
  if(lc.length === 0){
    box.innerHTML = '<div class="info-box" style="text-align:center;"><h4 style="justify-content:center;"><i class="fas fa-video"></i> No live classes scheduled</h4><p>Check back later or log in to your portal for updates.</p></div>';
    return;
  }
  box.innerHTML = lc.map(function(l){
    var timeStr = l.time ? new Date(l.time).toLocaleString() : 'Not scheduled';
    return '<div class="live-class-card">' +
      '<div>' +
        '<h4><i class="fas fa-video" style="color:#1a73e8;"></i> ' + escapeHtml(l.name) + ' <span class="lc-badge-live"><span class="dot"></span>LIVE</span></h4>' +
        '<div class="lc-meta"><span><i class="fas fa-users"></i> ' + escapeHtml(getAudienceLabel(l.audience)) + '</span><span><i class="fas fa-clock"></i> ' + escapeHtml(timeStr) + '</span></div>' +
        (l.notes ? '<div style="font-size:11.5px;color:#6b7688;margin-top:4px;">' + escapeHtml(l.notes) + '</div>' : '') +
      '</div>' +
      '<div class="lc-actions">' +
        '<a class="lc-join" href="' + escapeHtml(l.link) + '" target="_blank" rel="noopener"><i class="fas fa-video"></i> Join Google Meet</a>' +
      '</div>' +
    '</div>';
  }).join('');
}
function renderStudentLiveClasses(){
  var box = document.getElementById('studentLiveClasses');
  if(!box) return;
  if(!currentStudentSession){
    box.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">Login to view live classes.</p>';
    return;
  }
  var student = currentStudentSession;
  var lc = getAllLiveClasses().filter(function(l){
    if(l.ended) return false;
    if(!l.audience || l.audience === 'all') return true;
    if(l.audience === 'staff') return false;
    return announcementMatchesAudience(l.audience, student);
  }).slice().reverse();
  if(lc.length === 0){
    box.innerHTML = '<div class="info-box"><h4><i class="fas fa-video"></i> No live classes right now</h4><p>Your teacher will post a Google Meet link when a class is about to start.</p></div>';
    return;
  }
  box.innerHTML = lc.map(function(l){
    var timeStr = l.time ? new Date(l.time).toLocaleString() : 'Not scheduled';
    return '<div class="live-class-card">' +
      '<div>' +
        '<h4><i class="fas fa-video" style="color:#1a73e8;"></i> ' + escapeHtml(l.name) + ' <span class="lc-badge-live"><span class="dot"></span>LIVE</span></h4>' +
        '<div class="lc-meta"><span><i class="fas fa-clock"></i> ' + escapeHtml(timeStr) + '</span></div>' +
        (l.notes ? '<div style="font-size:11.5px;color:#6b7688;margin-top:4px;">' + escapeHtml(l.notes) + '</div>' : '') +
      '</div>' +
      '<div class="lc-actions">' +
        '<a class="lc-join" href="' + escapeHtml(l.link) + '" target="_blank" rel="noopener"><i class="fas fa-video"></i> Join Class</a>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ---------- ADMIN NOTIFICATIONS ---------- */
function getAdminNotifHistory(){
  var h = safeGet('admin_notif_history', []);
  return Array.isArray(h) ? h : [];
}
function saveAdminNotifHistory(h){
  safeSet('admin_notif_history', h);
  broadcastRefresh();
}
function loadNotifTemplate(type){
  var templates = {
    fee: { title: 'Fee Payment Reminder', message: 'Dear student,\n\nThis is a gentle reminder that your fee balance is due. Please clear your outstanding balance before the end of this month to avoid any inconvenience.\n\nYou can pay via M-Pesa Paybill or bank transfer. Bring your receipt to the admin office for recording.\n\nThank you.' },
    exam: { title: 'End of Term Examination Schedule', message: 'Dear students,\n\nEnd of term examinations will commence on Monday next week. Please check the notice board for the full timetable.\n\nEnsure you carry your student ID and all required materials. No student will be allowed into the exam room without a valid ID.\n\nAll the best!' },
    holiday: { title: 'Holiday Notice', message: 'Dear students,\n\nThe institution will close for the holidays on Friday next week. Classes resume on the dates indicated in the academic calendar.\n\nPlease ensure you have cleared any pending fees and returned all borrowed items before leaving.\n\nEnjoy your break!' },
    report: { title: 'Reporting Date for New Intake', message: 'Dear students,\n\nReporting for the new intake begins on Monday next week from 8:00 AM. Please bring your original documents, passport photos, and payment receipt.\n\nReporting venue: Main Campus, Runyenjes.\n\nWelcome to Highway Vocational Center!' },
    meeting: { title: 'Parents & Guardians Meeting', message: 'Dear parents and guardians,\n\nThere will be a general meeting on Saturday next week from 10:00 AM at the main campus. We will discuss student progress, fee structure, and upcoming events.\n\nYour attendance is highly appreciated.' },
    results: { title: 'Exam Results Released', message: 'Dear students,\n\nYour end of term exam results have been released. Log in to the Student Portal to view your results.\n\nIf you have any queries regarding your results, please visit the academic office within 7 days.\n\nCongratulations!' },
    welcome: { title: 'Welcome to Highway Vocational Center', message: 'Dear student,\n\nWelcome to Highway Vocational Center! We are excited to have you join our community.\n\nRemember to collect your student ID, check your class timetable, and familiarise yourself with the campus facilities.\n\nWishing you a successful term ahead!' }
  };
  var t = templates[type];
  if(t){
    document.getElementById('notifTitleInput').value = t.title;
    document.getElementById('notifMessageInput').value = t.message;
    showToast('Template loaded — edit as needed', 'success');
  }
}
function previewAdminNotification(){
  var title = document.getElementById('notifTitleInput').value.trim();
  var msg = document.getElementById('notifMessageInput').value.trim();
  var tone = document.querySelector('input[name="notifTone"]:checked');
  var toneVal = tone ? tone.value : 'info';
  if(!title || !msg){ showToast('Please write a title and message', 'error'); return; }
  showNotification(title, msg, toneVal);
}
function sendAdminNotification(){
  var title = document.getElementById('notifTitleInput').value.trim();
  var msg = document.getElementById('notifMessageInput').value.trim();
  var tone = document.querySelector('input[name="notifTone"]:checked');
  var toneVal = tone ? tone.value : 'info';
  var audience = document.querySelector('input[name="notifAudience"]:checked');
  var audienceVal = audience ? audience.value : 'all';
  if(!title || !msg){ showToast('Please write a title and message', 'error'); return; }
  var item = { id: 'notif_' + Date.now(), title: title, message: msg, type: toneVal, audience: audienceVal, at: new Date().toISOString() };
  var hist = getAdminNotifHistory();
  hist.push(item);
  saveAdminNotifHistory(hist);
  var notifs = safeGet('notifications', []);
  if(!Array.isArray(notifs)) notifs = [];
  notifs.push({ title: title, message: msg, type: toneVal, audience: audienceVal, at: item.at, id: item.id });
  safeSet('notifications', notifs);
  showToast('Notification sent to ' + getAudienceLabel(audienceVal), 'success');
  showNotification(title, msg, toneVal);
  document.getElementById('notifTitleInput').value = '';
  document.getElementById('notifMessageInput').value = '';
  renderAdminNotifHistory();
  renderStudentAnnouncements();
}
function renderAdminNotifHistory(){
  var box = document.getElementById('adminNotifHistory');
  if(!box) return;
  var hist = getAdminNotifHistory().slice().reverse();
  if(hist.length === 0){ box.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">No notifications sent yet.</p>'; return; }
  box.innerHTML = hist.slice(0, 30).map(function(n){
    var toneLabel = { info:'Info', success:'Success', warning:'Warning', danger:'Urgent' }[n.type] || 'Info';
    return '<div class="notif-history-item">' +
      '<div class="nh-top"><span class="nh-title">' + escapeHtml(n.title) + '</span><span class="nh-time">' + new Date(n.at).toLocaleString() + '</span></div>' +
      '<div class="nh-msg">' + escapeHtml(n.message) + '</div>' +
      '<div class="nh-meta"><span><i class="fas fa-tag"></i> ' + toneLabel + '</span><span><i class="fas fa-users"></i> ' + escapeHtml(getAudienceLabel(n.audience)) + '</span></div>' +
    '</div>';
  }).join('');
}

/* ---------- APPLICATIONS ---------- */
function getAllApplications(){
  var a = safeGet('applications', []);
  return Array.isArray(a) ? a : [];
}
function saveAllApplications(apps){
  safeSet('applications', apps);
  broadcastRefresh();
}
function updateAdminStats(){
  var apps = getAllApplications();
  var students = getAllStudents();
  var total = apps.length;
  var pending = apps.filter(function(a){
    var s = a.status || 'submitted';
    return s !== 'accepted' && s !== 'rejected' && s !== 'registered';
  }).length;
  var accepted = apps.filter(function(a){ return a.status === 'accepted' || a.status === 'registered'; }).length;
  var set = function(id, v){ var el = document.getElementById(id); if(el) el.textContent = v; };
  set('statTotalApps', total);
  set('statPending', pending);
  set('statAccepted', accepted);
  set('statStudents', students.length);
}
function renderAdminApplications(){
  var apps = getAllApplications();
  var search = (document.getElementById('adminAppSearch') || {}).value || '';
  var statusFilter = (document.getElementById('adminAppStatusFilter') || {}).value || '';
  search = search.toLowerCase().trim();
  // Partial matching — find records even with a few characters
  var filtered = apps.filter(function(a){
    if(statusFilter && (a.status || 'submitted') !== statusFilter) return false;
    if(!search) return true;
    var hay = [a.appNumber, a.firstName, a.middleName, a.lastName, a.phone, a.email, a.course, a.intake, a.county, a.subCounty].join(' ').toLowerCase();
    return hay.indexOf(search) !== -1;
  }).slice().reverse();
  var tbody = document.getElementById('adminAppsTableBody');
  var meta = document.getElementById('adminAppSearchMeta');
  if(meta){
    var total = apps.length;
    meta.innerHTML = 'Showing <span class="badge-count">' + filtered.length + '</span> of <span class="badge-count">' + total + '</span> applications' + (search ? ' · <span class="badge-filter">search: "' + escapeHtml(search) + '"</span>' : '') + (statusFilter ? ' · <span class="badge-filter">status: ' + escapeHtml((APPLICATION_STATUSES[statusFilter]||{}).label || statusFilter) + '</span>' : '');
  }
  if(!tbody) return;
  if(filtered.length === 0){
    tbody.innerHTML = '<tr><td colspan="8"><div class="admin-empty"><i class="fas fa-inbox"></i><p>No applications match your search.</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(function(app){
    var st = APPLICATION_STATUSES[app.status || 'submitted'] || APPLICATION_STATUSES.submitted;
    return '<tr>' +
      '<td><strong>' + escapeHtml(app.appNumber) + '</strong></td>' +
      '<td>' + escapeHtml((app.firstName||'') + ' ' + (app.lastName||'')) + '</td>' +
      '<td>' + escapeHtml(app.phone || '—') + '</td>' +
      '<td>' + escapeHtml(app.course || '—') + '</td>' +
      '<td>' + escapeHtml(app.intake || '—') + '</td>' +
      '<td><span class="status-badge" style="background:' + st.color + ';color:' + st.text + ';">' + st.label + '</span></td>' +
      '<td>' + new Date(app.submittedAt).toLocaleDateString() + '</td>' +
      '<td>' +
        '<button class="btn-action-view" onclick="viewApplication(\'' + app.appNumber + '\')" title="View"><i class="fas fa-eye"></i></button> ' +
        '<button class="btn-action-edit" onclick="editApplicationStatus(\'' + app.appNumber + '\')" title="Update status"><i class="fas fa-edit"></i></button> ' +
        '<button class="btn-action-del" onclick="deleteApplication(\'' + app.appNumber + '\')" title="Delete"><i class="fas fa-trash"></i></button>' +
      '</td>' +
    '</tr>';
  }).join('');
}
function clearAdminAppFilters(){
  var s = document.getElementById('adminAppSearch'); if(s) s.value = '';
  var f = document.getElementById('adminAppStatusFilter'); if(f) f.value = '';
  renderAdminApplications();
}
function updateApplicationStatus(appNumber, newStatus, adminNote){
  var apps = getAllApplications();
  var idx = -1;
  for(var i=0;i<apps.length;i++){ if(apps[i].appNumber === appNumber){ idx = i; break; } }
  if(idx === -1) return false;
  apps[idx].status = newStatus;
  apps[idx].statusUpdatedAt = new Date().toISOString();
  if(adminNote !== undefined) apps[idx].adminNote = adminNote;
  if(!apps[idx].statusHistory) apps[idx].statusHistory = [];
  apps[idx].statusHistory.push({ status: newStatus, at: new Date().toISOString(), note: adminNote || '' });
  saveAllApplications(apps);
  return true;
}
function viewApplication(appNumber){
  var apps = getAllApplications();
  var app = null;
  for(var i=0;i<apps.length;i++){ if(apps[i].appNumber === appNumber){ app = apps[i]; break; } }
  if(!app) return;
  var html = '<div style="max-height:70vh;overflow-y:auto;">';
  html += '<h3 style="color:#0a1f3d;font-family:Poppins;margin-bottom:14px;">' + escapeHtml(app.appNumber) + '</h3>';
  var sections = {
    'Personal Information': ['firstName','middleName','lastName','dob','gender','nationality','idNumber','birthCert','maritalStatus','disability','disabilityDetails'],
    'Contact': ['phone','altPhone','email','county','subCounty','ward','town','homeCounty','homeSubCounty','homeTown'],
    'Academic': ['education','school','yearCompleted','kcseIndex','kcseGrade'],
    'Course': ['department','course','level','intake','studyMode','campus'],
    'Guardian': ['guardianName','guardianRelation','guardianPhone','guardianCounty','guardianSubCounty','guardianOccupation'],
    'Additional': ['hearAbout','financialAid','scholarship','additionalInfo']
  };
  Object.keys(sections).forEach(function(section){
    var rows = '';
    sections[section].forEach(function(key){
      var val = app[key];
      if(val){
        var label = key.replace(/([A-Z])/g, ' $1').replace(/^./, function(s){return s.toUpperCase();});
        rows += '<div style="display:flex;padding:3px 0;font-size:12.5px;"><div style="width:155px;color:#6b7688;">' + label + ':</div><div style="flex:1;color:#0a1f3d;font-weight:500;">' + escapeHtml(val) + '</div></div>';
      }
    });
    if(rows){
      html += '<div style="margin-bottom:13px;padding:12px;background:#f8fafc;border-radius:8px;">';
      html += '<h4 style="color:#0a6b3b;font-size:11.5px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' + section + '</h4>' + rows + '</div>';
    }
  });
  if(app.statusHistory && app.statusHistory.length){
    html += '<div style="margin-top:15px;"><h4 style="color:#0a6b3b;font-size:11.5px;text-transform:uppercase;margin-bottom:8px;">Status History</h4>';
    app.statusHistory.forEach(function(h){
      var st = APPLICATION_STATUSES[h.status] || {};
      html += '<div style="padding:6px 10px;border-left:3px solid #0a6b3b;background:#f0fdf4;margin-bottom:6px;font-size:12px;"><strong>' + escapeHtml(st.label || h.status) + '</strong> — ' + new Date(h.at).toLocaleString() + (h.note ? '<br><em style="color:#6b7688;">' + escapeHtml(h.note) + '</em>' : '') + '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  showGenericModal('Application Details', html);
}
function editApplicationStatus(appNumber){
  var apps = getAllApplications();
  var app = null;
  for(var i=0;i<apps.length;i++){ if(apps[i].appNumber === appNumber){ app = apps[i]; break; } }
  if(!app) return;
  var currentStatus = app.status || 'submitted';
  var options = Object.keys(APPLICATION_STATUSES).map(function(k){
    return '<option value="' + k + '"' + (currentStatus === k ? ' selected' : '') + '>' + APPLICATION_STATUSES[k].label + '</option>';
  }).join('');
  var html = '<div>' +
    '<p style="margin-bottom:12px;font-size:12.5px;">Application: <strong>' + escapeHtml(appNumber) + '</strong> — ' + escapeHtml((app.firstName||'') + ' ' + (app.lastName||'')) + '</p>' +
    '<label style="font-size:12px;font-weight:600;">New Status</label>' +
    '<select id="statusSelect" style="width:100%;padding:9px;border:1.5px solid #e6ebf1;border-radius:6px;margin-bottom:11px;">' + options + '</select>' +
    '<label style="font-size:12px;font-weight:600;">Admin Note (visible to applicant)</label>' +
    '<textarea id="statusNote" style="width:100%;padding:9px;border:1.5px solid #e6ebf1;border-radius:6px;min-height:78px;font-family:inherit;" placeholder="e.g. Bring original documents on reporting day...">' + escapeHtml(app.adminNote || '') + '</textarea>' +
    '<div style="display:flex;gap:8px;margin-top:13px;flex-wrap:wrap;">' +
      '<button class="btn btn-primary" onclick="saveAppStatus(\'' + appNumber + '\')"><i class="fas fa-save"></i> Save Status</button>' +
      '<button class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button>' +
    '</div>' +
  '</div>';
  showGenericModal('Update Application Status', html);
}
function saveAppStatus(appNumber){
  var status = document.getElementById('statusSelect').value;
  var note = document.getElementById('statusNote').value.trim();
  if(updateApplicationStatus(appNumber, status, note)){
    showToast('Status updated: ' + APPLICATION_STATUSES[status].label, 'success');
    closeGenericModal();
    renderAdminApplications();
    updateAdminStats();
    if(status === 'accepted' || status === 'registered'){
      if(confirm('Convert this applicant to a registered student now?')){
        var student = convertApplicationToStudent(appNumber);
        if(student){ showToast('Student ' + student.studentId + ' created', 'success'); renderAdminStudents(); updateAdminStats(); }
      }
    }
  } else { showToast('Failed to update status', 'error'); }
}
function deleteApplication(appNumber){
  if(!confirm('Delete application ' + appNumber + '? This cannot be undone.')) return;
  var apps = getAllApplications().filter(function(a){ return a.appNumber !== appNumber; });
  saveAllApplications(apps);
  renderAdminApplications();
  updateAdminStats();
  showToast('Application deleted', '');
}
function exportApplicationsCSV(){
  var apps = getAllApplications();
  if(apps.length === 0){ showToast('No applications to export', ''); return; }
  var headers = ['App Number','First Name','Middle Name','Last Name','DOB','Gender','Nationality','Phone','Email','County','Sub-County','Course','Level','Intake','Status','Submitted'];
  var rows = apps.map(function(a){
    return [a.appNumber, a.firstName, a.middleName, a.lastName, a.dob, a.gender, a.nationality, a.phone, a.email, a.county, a.subCounty, a.course, a.level, a.intake, a.status || 'submitted', a.submittedAt ? new Date(a.submittedAt).toISOString() : ''].map(function(v){
      var s = v == null ? '' : String(v);
      if(s.indexOf(',') !== -1 || s.indexOf('"') !== -1) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }).join(',');
  });
  var csv = headers.join(',') + '\n' + rows.join('\n');
  var blob = new Blob([csv], { type: 'text/csv' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'applications_' + new Date().toISOString().slice(0,10) + '.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported', 'success');
}

/* ---------- STUDENTS ---------- */
function getAllStudents(){
  var s = safeGet('students', []);
  return Array.isArray(s) ? s : [];
}
function saveAllStudents(s){
  safeSet('students', s);
  broadcastRefresh();
}
function renderAdminStudents(){
  var students = getAllStudents();
  var search = ((document.getElementById('adminStudentSearch') || {}).value || '').toLowerCase().trim();
  var tbody = document.getElementById('adminStudentsTableBody');
  var meta = document.getElementById('adminStudentSearchMeta');
  if(!tbody) return;
  // Partial matching
  var filtered = students.filter(function(s){
    if(!search) return true;
    return (s.studentId + ' ' + s.firstName + ' ' + s.lastName + ' ' + (s.course||'') + ' ' + (s.email||'') + ' ' + (s.phone||'')).toLowerCase().indexOf(search) !== -1;
  });
  if(meta){
    meta.innerHTML = 'Showing <span class="badge-count">' + filtered.length + '</span> of <span class="badge-count">' + students.length + '</span> students' + (search ? ' · <span class="badge-filter">search: "' + escapeHtml(search) + '"</span>' : '');
  }
  if(filtered.length === 0){
    tbody.innerHTML = '<tr><td colspan="6"><div class="admin-empty"><i class="fas fa-user-graduate"></i><p>' + (students.length === 0 ? 'No students yet. Add one or accept an application.' : 'No students match your search.') + '</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(function(s){
    var balance = (s.totalFees || 0) - (s.paid || 0);
    var balanceColor = balance > 0 ? '#dc2626' : '#065f46';
    return '<tr>' +
      '<td><strong>' + escapeHtml(s.studentId) + '</strong></td>' +
      '<td>' + escapeHtml(s.firstName + ' ' + s.lastName) + '</td>' +
      '<td>' + escapeHtml(s.course) + '</td>' +
      '<td style="color:' + balanceColor + ';font-weight:600;">KES ' + balance.toLocaleString() + '</td>' +
      '<td><span class="status-badge ' + (s.active ? 'registered' : 'rejected') + '">' + (s.active ? 'Active' : 'Inactive') + '</span></td>' +
      '<td><button class="btn-action-view" onclick="viewStudent(\'' + s.studentId + '\')" title="View"><i class="fas fa-eye"></i></button> <button class="btn-action-del" onclick="deleteStudent(\'' + s.studentId + '\')" title="Delete"><i class="fas fa-trash"></i></button></td>' +
    '</tr>';
  }).join('');
}
function clearAdminStudentFilters(){
  var s = document.getElementById('adminStudentSearch'); if(s) s.value = '';
  renderAdminStudents();
}
function convertApplicationToStudent(appNumber){
  var apps = getAllApplications();
  var app = null;
  for(var i=0;i<apps.length;i++){ if(apps[i].appNumber === appNumber){ app = apps[i]; break; } }
  if(!app) return null;
  var students = getAllStudents();
  for(var j=0;j<students.length;j++){
    if(students[j].applicationNumber === appNumber){ showToast('Already converted to ' + students[j].studentId, ''); return students[j]; }
  }
  var counter = parseInt(localStorage.getItem('student_counter') || '0', 10) + 1;
  localStorage.setItem('student_counter', String(counter));
  var year = new Date().getFullYear();
  var studentId = 'HVC/' + year + '/' + String(counter).padStart(3, '0');
  var fees = FEE_STRUCTURE[app.course] || { registration: 500, tuition: 2000 };
  var totalFees = (fees.registration || 0) + (fees.tuition || 0);
  var randomPw = 'hvc' + Math.floor(1000 + Math.random() * 9000);
  var student = {
    studentId: studentId, applicationNumber: appNumber,
    firstName: app.firstName, lastName: app.lastName,
    email: app.email, phone: app.phone, course: app.course, intake: app.intake, level: app.level,
    totalFees: totalFees, paid: 0, balance: totalFees,
    paymentHistory: [], enrolledAt: new Date().toISOString(),
    active: true, password: randomPw,
    overpaymentCarry: 0, lastReportBack: null, reportBackHistory: []
  };
  students.push(student);
  saveAllStudents(students);
  updateApplicationStatus(appNumber, 'registered', 'Converted to student ID ' + studentId + '. Default password: ' + randomPw);
  return student;
}
function openAddStudentModal(){
  var html = '<div>' +
    '<div class="form-row"><div class="form-group"><label>First Name</label><input id="nsFirstName"></div><div class="form-group"><label>Last Name</label><input id="nsLastName"></div></div>' +
    '<div class="form-row"><div class="form-group"><label>Email</label><input id="nsEmail" type="email"></div><div class="form-group"><label>Phone</label><input id="nsPhone"></div></div>' +
    '<div class="form-group"><label>Course</label><select id="nsCourse">' + Object.keys(FEE_STRUCTURE).map(function(k){ return '<option value="' + k + '">' + FEE_STRUCTURE[k].label + '</option>'; }).join('') + '</select></div>' +
    '<div class="form-row"><div class="form-group"><label>Intake</label><input id="nsIntake" value="September 2026"></div><div class="form-group"><label>Level</label><select id="nsLevel"><option>Artisan</option><option>Certificate</option><option>Short Course</option></select></div></div>' +
    '<div class="form-actions"><button class="btn btn-primary" onclick="createStudentManual()"><i class="fas fa-save"></i> Create Student</button><button class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button></div>' +
  '</div>';
  showGenericModal('Add New Student', html);
}
function createStudentManual(){
  var firstName = document.getElementById('nsFirstName').value.trim();
  var lastName = document.getElementById('nsLastName').value.trim();
  var email = document.getElementById('nsEmail').value.trim();
  var phone = document.getElementById('nsPhone').value.trim();
  var course = document.getElementById('nsCourse').value;
  var intake = document.getElementById('nsIntake').value;
  var level = document.getElementById('nsLevel').value;
  if(!firstName || !lastName){ showToast('Name is required', 'error'); return; }
  var students = getAllStudents();
  var counter = parseInt(localStorage.getItem('student_counter') || '0', 10) + 1;
  localStorage.setItem('student_counter', String(counter));
  var year = new Date().getFullYear();
  var studentId = 'HVC/' + year + '/' + String(counter).padStart(3, '0');
  var fees = FEE_STRUCTURE[course] || { registration: 500, tuition: 2000 };
  var randomPw = 'hvc' + Math.floor(1000 + Math.random() * 9000);
  students.push({ studentId: studentId, firstName: firstName, lastName: lastName, email: email, phone: phone, course: course, intake: intake, level: level, totalFees: (fees.registration||0) + (fees.tuition||0), paid: 0, paymentHistory: [], enrolledAt: new Date().toISOString(), active: true, password: randomPw, overpaymentCarry: 0, lastReportBack: null, reportBackHistory: [] });
  saveAllStudents(students);
  closeGenericModal();
  renderAdminStudents();
  updateAdminStats();
  showToast('Student ' + studentId + ' created. Password: ' + randomPw, 'success');
}
function viewStudent(studentId){
  var students = getAllStudents();
  var s = null;
  for(var i=0;i<students.length;i++){ if(students[i].studentId === studentId){ s = students[i]; break; } }
  if(!s) return;
  var balance = (s.totalFees || 0) - (s.paid || 0);
  var html = '<div>' +
    '<h3 style="color:#0a1f3d;">' + escapeHtml(s.studentId) + '</h3>' +
    '<p style="margin-bottom:13px;color:#6b7688;">' + escapeHtml(s.firstName + ' ' + s.lastName) + ' — ' + escapeHtml(s.course) + '</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px;">' +
      '<div style="padding:12px;background:#f0fdf4;border-radius:8px;"><div style="font-size:10.5px;color:#6b7688;text-transform:uppercase;">Total Fees</div><div style="font-size:15px;font-weight:700;color:#0a1f3d;">KES ' + (s.totalFees||0).toLocaleString() + '</div></div>' +
      '<div style="padding:12px;background:#fef2f2;border-radius:8px;"><div style="font-size:10.5px;color:#6b7688;text-transform:uppercase;">Balance</div><div style="font-size:15px;font-weight:700;color:' + (balance > 0 ? '#dc2626' : '#065f46') + ';">KES ' + balance.toLocaleString() + '</div></div>' +
    '</div>' +
    (s.overpaymentCarry > 0 ? '<div style="padding:10px 12px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:6px;margin-bottom:12px;font-size:12.5px;"><strong>Overpayment Credit:</strong> KES ' + s.overpaymentCarry.toLocaleString() + ' — will be auto-deducted on next report back.</div>' : '') +
    '<p style="font-size:12.5px;margin-bottom:8px;"><strong>Email:</strong> ' + escapeHtml(s.email || '—') + '</p>' +
    '<p style="font-size:12.5px;margin-bottom:8px;"><strong>Phone:</strong> ' + escapeHtml(s.phone || '—') + '</p>' +
    '<p style="font-size:12.5px;margin-bottom:15px;"><strong>Portal Password:</strong> <code>' + escapeHtml(s.password) + '</code></p>' +
    '<h4 style="font-size:12.5px;color:#0a6b3b;margin-bottom:8px;">Payment History</h4>' +
    ((s.paymentHistory && s.paymentHistory.length) ? s.paymentHistory.slice().reverse().map(function(p){
      return '<div style="padding:8px 12px;background:#f8fafc;border-left:3px solid #0a6b3b;margin-bottom:6px;font-size:12px;"><strong>KES ' + p.amount.toLocaleString() + '</strong> — ' + escapeHtml(p.method) + ' — ' + new Date(p.date).toLocaleDateString() + (p.receipt ? '<br><em>Receipt: ' + escapeHtml(p.receipt) + '</em>' : '') + '</div>';
    }).join('') : '<p style="color:#6b7688;font-size:12px;">No payments yet.</p>') +
    (s.reportBackHistory && s.reportBackHistory.length ? '<h4 style="font-size:12.5px;color:#0a6b3b;margin:15px 0 8px;">Report Back History</h4>' + s.reportBackHistory.map(function(r){ return '<div style="padding:8px 12px;background:#eff6ff;border-left:3px solid #3b82f6;margin-bottom:6px;font-size:12px;"><strong>' + escapeHtml(r.term) + '</strong> — ' + new Date(r.at).toLocaleString() + (r.deducted ? '<br><em>Auto-deducted overpayment: KES ' + r.deducted.toLocaleString() + '</em>' : '') + '</div>'; }).join('') : '') +
    '<div class="form-actions" style="margin-top:13px;"><button class="btn btn-danger" onclick="deleteStudent(\'' + s.studentId + '\')"><i class="fas fa-trash"></i> Delete Student</button><button class="btn btn-secondary" onclick="closeGenericModal()">Close</button></div>' +
  '</div>';
  showGenericModal('Student Profile', html);
}
function deleteStudent(studentId){
  if(!confirm('Delete student ' + studentId + '?')) return;
  var students = getAllStudents().filter(function(s){ return s.studentId !== studentId; });
  saveAllStudents(students);
  closeGenericModal();
  renderAdminStudents();
  updateAdminStats();
  showToast('Student deleted', '');
}

function populateReceiptStudentSelect(){
  var students = getAllStudents();
  var sel = document.getElementById('recStudentSelect');
  if(!sel) return;
  sel.innerHTML = '<option value="">Select student...</option>' + students.map(function(s){
    return '<option value="' + s.studentId + '">' + escapeHtml(s.studentId + ' — ' + s.firstName + ' ' + s.lastName) + '</option>';
  }).join('');
}

function handleReceiptUpload(event){
  var file = event.target.files && event.target.files[0];
  if(!file) return;
  if(file.size > 10 * 1024 * 1024){ showToast('File too large (max 10MB)', 'error'); return; }
  if(!file.type.startsWith('image/')){ showToast('Please upload an image file', 'error'); return; }
  receiptScanData = { file: file };
  var reader = new FileReader();
  reader.onload = function(ev){
    receiptScanData.dataUrl = ev.target.result;
    document.getElementById('receiptPreviewImg').src = ev.target.result;
    document.getElementById('receiptPreview').classList.add('show');
    document.getElementById('receiptExtracted').classList.remove('show');
    runOCR(ev.target.result);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function runOCR(imageDataUrl){
  var progressEl = document.getElementById('receiptProgress');
  var progressBar = document.getElementById('receiptProgressBar');
  var progressText = document.getElementById('receiptProgressText');
  progressEl.classList.add('show');
  progressBar.style.width = '0%';
  progressText.textContent = 'Initializing OCR engine...';

  if(typeof Tesseract === 'undefined'){
    progressText.textContent = 'OCR engine not loaded. Please refresh the page and try again.';
    showToast('OCR engine unavailable. Check your internet connection.', 'error');
    setTimeout(function(){ progressEl.classList.remove('show'); }, 3000);
    return;
  }

  Tesseract.recognize(
    imageDataUrl,
    'eng',
    {
      logger: function(m){
        if(m.status === 'loading tesseract core'){ progressText.textContent = 'Loading OCR core...'; progressBar.style.width = '15%'; }
        else if(m.status === 'initializing tesseract'){ progressText.textContent = 'Initializing OCR...'; progressBar.style.width = '25%'; }
        else if(m.status === 'loading language traineddata'){ progressText.textContent = 'Loading language data...'; progressBar.style.width = '40%'; }
        else if(m.status === 'initializing api'){ progressText.textContent = 'Preparing recognition...'; progressBar.style.width = '55%'; }
        else if(m.status === 'recognizing text'){
          var p = Math.round((m.progress || 0) * 100);
          progressText.textContent = 'Reading text from receipt... ' + p + '%';
          progressBar.style.width = (60 + p * 0.4) + '%';
        }
      }
    }
  ).then(function(result){
    progressBar.style.width = '100%';
    progressText.textContent = 'OCR complete!';
    var text = (result.data && result.data.text) ? result.data.text : '';
    setTimeout(function(){ progressEl.classList.remove('show'); }, 800);
    if(!text || text.trim().length < 5){
      showToast('Could not read text from image. Try a clearer photo.', 'error');
      document.getElementById('receiptExtracted').classList.add('show');
      document.getElementById('receiptRawText').textContent = '(no text detected)';
      return;
    }
    parseReceiptText(text);
    document.getElementById('receiptExtracted').classList.add('show');
    document.getElementById('receiptRawText').textContent = text;
    showToast('Receipt scanned! Review extracted details.', 'success');
  }).catch(function(err){
    console.error('OCR error:', err);
    progressText.textContent = 'OCR failed.';
    setTimeout(function(){ progressEl.classList.remove('show'); }, 1500);
    showToast('OCR failed: ' + (err.message || 'Unknown error'), 'error');
  });
}

function parseReceiptText(text){
  var lower = text.toLowerCase();
  var students = getAllStudents();

  var studentId = '';
  for(var i=0;i<students.length;i++){
    var s = students[i];
    var fullName = (s.firstName + ' ' + s.lastName).toLowerCase();
    var firstName = (s.firstName || '').toLowerCase();
    var lastName = (s.lastName || '').toLowerCase();
    var sid = (s.studentId || '').toLowerCase();
    if((sid && lower.indexOf(sid) !== -1) ||
       (fullName && lower.indexOf(fullName) !== -1) ||
       (firstName.length > 3 && lower.indexOf(firstName) !== -1) ||
       (lastName.length > 3 && lower.indexOf(lastName) !== -1)){
      studentId = s.studentId;
      break;
    }
  }
  if(studentId) document.getElementById('recStudentSelect').value = studentId;
  setConf('recStudentConf', studentId ? 'auto' : 'manual');

  var amount = '';
  var amountPatterns = [
    /(?:kes|ksh|sh|amount|total|paid)\s*[:\-]?\s*([0-9]{1,3}(?:[,][0-9]{3})*(?:\.[0-9]{2})?)/i,
    /([0-9]{1,3}(?:[,][0-9]{3})*(?:\.[0-9]{2})?)\s*(?:kes|ksh|sh)/i,
    /\b([0-9]{3,6}(?:\.[0-9]{2})?)\b/
  ];
  for(var p=0;p<amountPatterns.length;p++){
    var m = text.match(amountPatterns[p]);
    if(m && m[1]){
      var num = parseFloat(m[1].replace(/,/g, ''));
      if(num >= 10 && num <= 1000000){ amount = num; break; }
    }
  }
  if(amount) document.getElementById('recAmount').value = amount;
  setConf('recAmountConf', amount ? 'auto' : 'manual');

  var dateVal = '';
  var datePatterns = [
    /\b([0-9]{1,2})[\/\-\.]([0-9]{1,2})[\/\-\.]([0-9]{2,4})\b/,
    /\b([0-9]{4})[\/\-\.]([0-9]{1,2})[\/\-\.]([0-9]{1,2})\b/,
    /\b([0-9]{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+([0-9]{2,4})\b/i
  ];
  for(var d=0;d<datePatterns.length;d++){
    var dm = text.match(datePatterns[d]);
    if(dm){
      try {
        var dt;
        if(d === 0){
          var day = parseInt(dm[1],10), month = parseInt(dm[2],10)-1, year = parseInt(dm[3],10);
          if(year < 100) year += 2000;
          if(month > 11) continue;
          dt = new Date(year, month, day);
        } else if(d === 1){
          dt = new Date(parseInt(dm[1],10), parseInt(dm[2],10)-1, parseInt(dm[3],10));
        } else {
          var months = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
          var mn = months[dm[2].substring(0,3).toLowerCase()];
          dt = new Date(parseInt(dm[3],10), mn, parseInt(dm[1],10));
        }
        if(dt && !isNaN(dt.getTime())){
          var iso = dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0');
          dateVal = iso;
          break;
        }
      } catch(e){}
    }
  }
  if(dateVal) document.getElementById('recDate').value = dateVal;
  setConf('recDateConf', dateVal ? 'auto' : 'manual');

  var method = 'M-Pesa';
  if(lower.indexOf('bank') !== -1 || lower.indexOf('kcb') !== -1 || lower.indexOf('equity') !== -1 || lower.indexOf('coop') !== -1 || lower.indexOf('family bank') !== -1 || lower.indexOf('absa') !== -1){
    method = 'Bank Transfer';
  } else if(lower.indexOf('mpesa') !== -1 || lower.indexOf('m-pesa') !== -1 || lower.indexOf('safaricom') !== -1 || lower.indexOf('m pesa') !== -1){
    method = 'M-Pesa';
  } else if(lower.indexOf('capitation') !== -1 || lower.indexOf('government') !== -1 || lower.indexOf('treasury') !== -1){
    method = 'Government Capitation';
  } else if(lower.indexOf('helb') !== -1){
    method = 'HELB';
  } else if(lower.indexOf('cdf') !== -1 || lower.indexOf('bursary') !== -1){
    method = 'Bursary / CDF';
  } else if(lower.indexOf('cash') !== -1){
    method = 'Cash';
  } else if(lower.indexOf('cheque') !== -1 || lower.indexOf('check') !== -1){
    method = 'Cheque';
  }
  document.getElementById('recMethod').value = method;
  setConf('recMethodConf', 'auto');

  var source = 'Student / Parent';
  if(method === 'Government Capitation') source = 'Government Capitation';
  else if(method === 'HELB') source = 'HELB Loan';
  else if(method === 'Bursary / CDF') source = 'CDF Bursary';
  else if(lower.indexOf('sponsor') !== -1 || lower.indexOf('ngo') !== -1) source = 'NGO / Sponsor';
  else if(lower.indexOf('church') !== -1 || lower.indexOf('wellwisher') !== -1) source = 'Church / Well-wisher';
  else if(lower.indexOf('county') !== -1) source = 'County Bursary';
  document.getElementById('recSource').value = source;
  setConf('recSourceConf', 'auto');

  var receipt = '';
  var refPatterns = [
    /\b([A-Z]{2,3}[0-9]{6,12})\b/,
    /\b(?:ref|txn|transaction|receipt|code|no)[\s:#\-]*([A-Z0-9]{6,16})\b/i,
    /\b([A-Z0-9]{10,16})\b/
  ];
  for(var r=0;r<refPatterns.length;r++){
    var rm = text.match(refPatterns[r]);
    if(rm && rm[1] && rm[1].length >= 6){
      receipt = rm[1];
      break;
    }
  }
  if(receipt) document.getElementById('recReceipt').value = receipt;
  setConf('recReceiptConf', receipt ? 'auto' : 'manual');

  var desc = 'Fee payment (scanned from receipt)';
  if(lower.indexOf('tuition') !== -1) desc = 'Tuition payment';
  else if(lower.indexOf('registration') !== -1) desc = 'Registration fee';
  else if(lower.indexOf('exam') !== -1) desc = 'Exam fee';
  else if(lower.indexOf('term 1') !== -1) desc = 'Term 1 payment';
  else if(lower.indexOf('term 2') !== -1) desc = 'Term 2 payment';
  else if(lower.indexOf('term 3') !== -1) desc = 'Term 3 payment';
  document.getElementById('recDescription').value = desc;
}

function setConf(id, kind){
  var el = document.getElementById(id);
  if(!el) return;
  if(kind === 'auto'){
    el.className = 're-confidence';
    el.textContent = 'auto';
  } else {
    el.className = 're-confidence low';
    el.textContent = 'review';
  }
}

function toggleRawText(){
  var el = document.getElementById('receiptRawText');
  el.classList.toggle('show');
}

function saveScannedReceipt(){
  var studentId = document.getElementById('recStudentSelect').value;
  var amount = parseInt(document.getElementById('recAmount').value, 10);
  var date = document.getElementById('recDate').value;
  var method = document.getElementById('recMethod').value;
  var source = document.getElementById('recSource').value;
  var receipt = document.getElementById('recReceipt').value.trim();
  var description = document.getElementById('recDescription').value.trim();
  if(!studentId){ showToast('Select the student', 'error'); return; }
  if(!amount || amount <= 0){ showToast('Enter a valid amount', 'error'); return; }
  var students = getAllStudents();
  var idx = -1;
  for(var i=0;i<students.length;i++){ if(students[i].studentId === studentId){ idx = i; break; } }
  if(idx === -1){ showToast('Student not found', 'error'); return; }
  if(!students[idx].paymentHistory) students[idx].paymentHistory = [];
  students[idx].paymentHistory.push({
    amount: amount, method: method, receipt: receipt, description: description,
    source: source, date: date ? new Date(date).toISOString() : new Date().toISOString(),
    recordedBy: 'Admin (OCR Scanner)'
  });
  students[idx].paid = (students[idx].paid || 0) + amount;
  // Recompute overpayment carry
  var balance = (students[idx].totalFees || 0) - students[idx].paid;
  if(balance < 0){
    students[idx].overpaymentCarry = Math.abs(balance);
    students[idx].balance = 0;
  } else {
    students[idx].balance = balance;
  }
  saveAllStudents(students);
  showToast('Payment of KES ' + amount.toLocaleString() + ' recorded for ' + studentId, 'success');
  cancelReceiptScan();
  renderAdminStudents();
  renderAdminPayments();
  renderAdminLedgerSummary();
  updateAdminStats();
}
function cancelReceiptScan(){
  receiptScanData = null;
  document.getElementById('receiptPreview').classList.remove('show');
  document.getElementById('receiptExtracted').classList.remove('show');
  document.getElementById('receiptPreviewImg').src = '';
  ['recAmount','recReceipt','recDescription'].forEach(function(id){ var el = document.getElementById(id); if(el) el.value = ''; });
  document.getElementById('recStudentSelect').value = '';
  document.getElementById('receiptProgress').classList.remove('show');
  document.getElementById('receiptRawText').classList.remove('show');
  document.getElementById('receiptRawText').textContent = '';
}
function renderAdminPayments(){
  var tbody = document.getElementById('adminPaymentsTableBody');
  if(!tbody) return;
  var students = getAllStudents();
  var allPayments = [];
  students.forEach(function(s){
    (s.paymentHistory || []).forEach(function(p){
      allPayments.push({ studentId: s.studentId, name: s.firstName + ' ' + s.lastName, amount: p.amount, method: p.method, receipt: p.receipt, date: p.date, source: p.source || 'Student / Parent', recordedBy: p.recordedBy || 'Admin' });
    });
  });
  allPayments.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
  if(allPayments.length === 0){ tbody.innerHTML = '<tr><td colspan="7"><div class="admin-empty"><i class="fas fa-receipt"></i><p>No payments recorded yet.</p></div></td></tr>'; return; }
  tbody.innerHTML = allPayments.slice(0, 50).map(function(p){
    return '<tr><td>' + new Date(p.date).toLocaleDateString() + '</td><td>' + escapeHtml(p.studentId) + ' — ' + escapeHtml(p.name) + '</td><td>KES ' + p.amount.toLocaleString() + '</td><td>' + escapeHtml(p.method) + '</td><td>' + escapeHtml(p.source) + '</td><td>' + escapeHtml(p.receipt || '—') + '</td><td>' + escapeHtml(p.recordedBy) + '</td></tr>';
  }).join('');
}
function renderAdminLedgerSummary(){
  var wrap = document.getElementById('adminLedgerSummary');
  if(!wrap) return;
  var students = getAllStudents();
  var totalDebit = 0, totalCredit = 0;
  students.forEach(function(s){ totalDebit += (s.totalFees || 0); totalCredit += (s.paid || 0); });
  var balance = totalDebit - totalCredit;
  wrap.innerHTML = '<div class="ledger-summary">' +
    '<div class="ls-card debit"><div class="ls-num">KES ' + totalDebit.toLocaleString() + '</div><div class="ls-lbl">Total Debit (Fees Charged)</div></div>' +
    '<div class="ls-card credit"><div class="ls-num">KES ' + totalCredit.toLocaleString() + '</div><div class="ls-lbl">Total Credit (Paid)</div></div>' +
    '<div class="ls-card"><div class="ls-num">KES ' + balance.toLocaleString() + '</div><div class="ls-lbl">Outstanding Balance</div></div>' +
  '</div>';
}

/* ---------- STUDENT REPORTS + REPORT BACK ---------- */
function getAllStudentReports(){
  var r = safeGet('student_reports', []);
  return Array.isArray(r) ? r : [];
}
function saveAllStudentReports(r){
  safeSet('student_reports', r);
  broadcastRefresh();
}
function submitStudentReport(){
  if(!currentStudentSession){ showToast('Please login first', 'error'); return; }
  var subject = document.getElementById('reportSubject').value.trim();
  var category = document.getElementById('reportCategory').value;
  var message = document.getElementById('reportMessage').value.trim();
  if(!subject || !message){ showToast('Enter subject and message', 'error'); return; }
  var reports = getAllStudentReports();
  reports.push({ id:'rep_'+Date.now(), studentId:currentStudentSession.studentId, studentName:currentStudentSession.firstName+' '+currentStudentSession.lastName, subject:subject, category:category, message:message, status:'pending', at:new Date().toISOString(), response:'', updatedAt:null });
  saveAllStudentReports(reports);
  document.getElementById('reportSubject').value = '';
  document.getElementById('reportMessage').value = '';
  renderStudentReports();
  showToast('Report submitted successfully', 'success');
}

/* REPORT BACK — auto-deduct overpayment carry from previous term */
function submitReportBack(){
  if(!currentStudentSession){ showToast('Please login first', 'error'); return; }
  var term = document.getElementById('reportBackTerm').value;
  var note = document.getElementById('reportBackNote').value.trim();
  var students = getAllStudents();
  var idx = -1;
  for(var i=0;i<students.length;i++){ if(students[i].studentId === currentStudentSession.studentId){ idx = i; break; } }
  if(idx === -1){ showToast('Student record not found', 'error'); return; }
  var s = students[idx];
  if(!s.reportBackHistory) s.reportBackHistory = [];

  var deducted = 0;
  var carry = s.overpaymentCarry || 0;

  // Calculate current balance BEFORE applying carry
  var currentBalance = (s.totalFees || 0) - (s.paid || 0);

  // If there is overpayment credit, apply it to the current term balance
  if(carry > 0){
    deducted = Math.min(carry, currentBalance);
    if(deducted > 0){
      s.paid = (s.paid || 0) + deducted;
      s.overpaymentCarry = carry - deducted;
    }
  }

  // Recompute
  var newBalance = (s.totalFees || 0) - (s.paid || 0);
  if(newBalance < 0){
    s.overpaymentCarry = (s.overpaymentCarry || 0) + Math.abs(newBalance);
    s.balance = 0;
  } else {
    s.balance = newBalance;
  }

  var record = {
    term: term,
    at: new Date().toISOString(),
    note: note,
    deducted: deducted,
    balanceAfter: s.balance,
    overpaymentCarryAfter: s.overpaymentCarry || 0
  };
  s.reportBackHistory.push(record);
  s.lastReportBack = record.at;
  students[idx] = s;
  saveAllStudents(students);

  // Show result to student
  var result = document.getElementById('reportBackResult');
  var msg = '<div style="background:var(--green-light);border:1px solid rgba(10,107,59,.2);border-left:4px solid var(--green);border-radius:var(--radius-sm);padding:14px;font-size:12.5px;">' +
    '<strong style="color:var(--navy);"><i class="fas fa-check-circle" style="color:var(--green);"></i> Report back confirmed for ' + escapeHtml(term) + '</strong>';
  if(deducted > 0){
    msg += '<p style="margin-top:8px;">Overpayment credit of <strong>KES ' + deducted.toLocaleString() + '</strong> was automatically deducted from your current term fees.</p>';
  } else if(carry === 0){
    msg += '<p style="margin-top:8px;">No overpayment credit available to deduct. Your current balance is KES ' + (s.balance || 0).toLocaleString() + '.</p>';
  } else {
    msg += '<p style="margin-top:8px;">Your overpayment credit (KES ' + carry.toLocaleString() + ') exceeds your current balance. Remaining credit: KES ' + (s.overpaymentCarry || 0).toLocaleString() + '.</p>';
  }
  msg += '<p style="margin-top:6px;"><strong>New Balance:</strong> KES ' + (s.balance || 0).toLocaleString() + '</p>';
  msg += '<p style="margin-top:4px;font-size:11px;color:var(--text-muted);">This has been recorded on your ledger.</p>';
  msg += '</div>';
  result.innerHTML = msg;

  // Refresh UI
  currentStudentSession = s;
  renderStudentFinance();
  renderStudentDashboard();
  renderStudentReports();
  showToast('Report back confirmed!', 'success');
}

function renderStudentReports(){
  var box = document.getElementById('studentReportsList');
  if(!box || !currentStudentSession) return;
  var reports = getAllStudentReports().filter(function(r){ return r.studentId === currentStudentSession.studentId; }).reverse();
  if(reports.length === 0){ box.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">You have not submitted any reports yet.</p>'; return; }
  box.innerHTML = reports.map(function(r){
    var statusClass = r.status === 'resolved' ? 'resolved' : r.status === 'in_progress' ? 'in_progress' : 'pending';
    var statusLabel = r.status === 'resolved' ? 'Resolved' : r.status === 'in_progress' ? 'In Progress' : 'Pending';
    var replyHtml = (r.response && r.response.trim()) ? '<div class="rp-reply"><strong><i class="fas fa-reply"></i> Response from Administration:</strong>' + escapeHtml(r.response) + (r.updatedAt ? '<div style="font-size:10.5px;color:#6b7688;margin-top:3px;">' + new Date(r.updatedAt).toLocaleString() + '</div>' : '') + '</div>' : '';
    return '<div class="report-item ' + (r.status === 'resolved' ? 'resolved' : '') + '">' +
      '<div class="rp-top"><span class="rp-subject">' + escapeHtml(r.subject) + '</span><span class="rp-time">' + new Date(r.at).toLocaleDateString() + '</span></div>' +
      '<div class="rp-msg">' + escapeHtml(r.message) + '</div>' +
      '<div class="rp-meta"><span>' + escapeHtml(r.category) + '</span><span class="rp-status ' + statusClass + '">' + statusLabel + '</span></div>' +
      replyHtml +
    '</div>';
  }).join('');
}
function renderAdminReports(){
  var box = document.getElementById('adminReportsList');
  if(!box) return;
  var search = ((document.getElementById('adminReportSearch') || {}).value || '').toLowerCase().trim();
  var statusFilter = ((document.getElementById('adminReportStatusFilter') || {}).value || '');
  var reports = getAllStudentReports().slice().reverse();
  var filtered = reports.filter(function(r){
    if(statusFilter && r.status !== statusFilter) return false;
    if(!search) return true;
    return (r.studentId + ' ' + r.studentName + ' ' + r.subject + ' ' + r.message).toLowerCase().indexOf(search) !== -1;
  });
  var meta = document.getElementById('adminReportSearchMeta');
  if(meta){
    meta.innerHTML = 'Showing <span class="badge-count">' + filtered.length + '</span> of <span class="badge-count">' + reports.length + '</span> reports' + (search ? ' · <span class="badge-filter">search: "' + escapeHtml(search) + '"</span>' : '') + (statusFilter ? ' · <span class="badge-filter">status: ' + escapeHtml(statusFilter) + '</span>' : '');
  }
  if(filtered.length === 0){ box.innerHTML = '<div class="admin-empty"><i class="fas fa-inbox"></i><p>No reports found.</p></div>'; return; }
  box.innerHTML = filtered.map(function(r){
    var statusClass = r.status === 'resolved' ? 'resolved' : r.status === 'in_progress' ? 'in_progress' : 'pending';
    var statusLabel = r.status === 'resolved' ? 'Resolved' : r.status === 'in_progress' ? 'In Progress' : 'Pending';
    var replyHtml = (r.response && r.response.trim()) ? '<div class="rp-reply"><strong><i class="fas fa-reply"></i> Reply sent:</strong>' + escapeHtml(r.response) + '</div>' : '';
    return '<div class="report-item ' + (r.status === 'resolved' ? 'resolved' : '') + '">' +
      '<div class="rp-top"><span class="rp-subject">' + escapeHtml(r.subject) + '</span><span class="rp-time">' + new Date(r.at).toLocaleString() + '</span></div>' +
      '<div class="rp-msg">' + escapeHtml(r.message) + '</div>' +
      '<div class="rp-meta"><span><i class="fas fa-user"></i> ' + escapeHtml(r.studentId + ' — ' + r.studentName) + '</span><span><i class="fas fa-tag"></i> ' + escapeHtml(r.category) + '</span><span class="rp-status ' + statusClass + '">' + statusLabel + '</span><button class="btn-action-edit" onclick="updateReportStatus(\'' + r.id + '\')" style="margin-left:auto;"><i class="fas fa-edit"></i> Update</button></div>' +
      replyHtml +
    '</div>';
  }).join('');
}
function clearAdminReportFilters(){
  var s = document.getElementById('adminReportSearch'); if(s) s.value = '';
  var f = document.getElementById('adminReportStatusFilter'); if(f) f.value = '';
  renderAdminReports();
}
function updateReportStatus(reportId){
  var reports = getAllStudentReports();
  var idx = -1;
  for(var i=0;i<reports.length;i++){ if(reports[i].id === reportId){ idx = i; break; } }
  if(idx === -1) return;
  var current = reports[idx].status;
  var options = '<option value="pending"' + (current==='pending'?' selected':'') + '>Pending</option>' +
                '<option value="in_progress"' + (current==='in_progress'?' selected':'') + '>In Progress</option>' +
                '<option value="resolved"' + (current==='resolved'?' selected':'') + '>Resolved</option>';
  var html = '<div><p style="font-size:12.5px;margin-bottom:12px;"><strong>' + escapeHtml(reports[idx].subject) + '</strong> — ' + escapeHtml(reports[idx].studentName) + '</p>' +
    '<p style="font-size:11.5px;color:#6b7688;margin-bottom:12px;background:#f8fafc;padding:9px;border-radius:5px;border-left:3px solid #c9a227;">' + escapeHtml(reports[idx].message) + '</p>' +
    '<label style="font-size:12px;font-weight:600;">Status</label>' +
    '<select id="reportStatusSelect" style="width:100%;padding:9px;border:1.5px solid #e6ebf1;border-radius:6px;margin-bottom:11px;">' + options + '</select>' +
    '<label style="font-size:12px;font-weight:600;">Response to student</label>' +
    '<textarea id="reportResponse" style="width:100%;padding:9px;border:1.5px solid #e6ebf1;border-radius:6px;min-height:78px;font-family:inherit;" placeholder="Type your reply — the student will see it on their portal.">' + escapeHtml(reports[idx].response || '') + '</textarea>' +
    '<div style="display:flex;gap:8px;margin-top:13px;"><button class="btn btn-primary" onclick="saveReportStatus(\'' + reportId + '\')"><i class="fas fa-save"></i> Save &amp; Notify Student</button><button class="btn btn-secondary" onclick="closeGenericModal()">Cancel</button></div></div>';
  showGenericModal('Update Report Status', html);
}
function saveReportStatus(reportId){
  var status = document.getElementById('reportStatusSelect').value;
  var response = document.getElementById('reportResponse').value.trim();
  var reports = getAllStudentReports();
  var idx = -1;
  for(var i=0;i<reports.length;i++){ if(reports[i].id === reportId){ idx = i; break; } }
  if(idx === -1) return;
  reports[idx].status = status;
  reports[idx].response = response;
  reports[idx].updatedAt = new Date().toISOString();
  saveAllStudentReports(reports);
  closeGenericModal();
  renderAdminReports();
  showToast('Report updated — student will see your reply', 'success');
}

/* ---------- STUDENT PORTAL ---------- */
function studentLogin(){
  var id = document.getElementById('portalStudentId').value.trim();
  var pw = document.getElementById('portalPassword').value.trim();
  if(!id || !pw){ showToast('Please enter ID and password', 'error'); return; }
  var students = getAllStudents();
  var student = null;
  for(var i=0;i<students.length;i++){
    if(students[i].studentId.toLowerCase() === id.toLowerCase() && students[i].password === pw){ student = students[i]; break; }
  }
  if(!student){ showToast('Invalid Student ID or password', 'error'); return; }
  currentStudentSession = student;
  document.getElementById('portalLogin').style.display = 'none';
  document.getElementById('portalDashboard').style.display = 'block';
  document.getElementById('portalWelcome').textContent = student.firstName + ' ' + student.lastName;
  document.getElementById('portalCourse').textContent = student.course;
  document.getElementById('portalIntake').textContent = student.intake || '—';
  renderStudentDashboard();
  renderStudentFinance();
  renderStudentAnnouncements();
  renderStudentMessages();
  renderStudentReports();
  renderStudentLiveClasses();
  var courseKey = getStudentCourseKey(student.course);
  renderTimetableForStudent(courseKey);
  renderResultsForStudent(courseKey);
  renderMaterialsForStudent(courseKey);
  switchStudentTab('dash');
  showToast('Login successful', 'success');
}
function studentLogout(){
  currentStudentSession = null;
  document.getElementById('portalLogin').style.display = 'block';
  document.getElementById('portalDashboard').style.display = 'none';
  document.getElementById('portalStudentId').value = '';
  document.getElementById('portalPassword').value = '';
  showToast('Logged out', '');
}
function switchStudentTab(tab){
  document.querySelectorAll('.student-dash-tab').forEach(function(b){ b.classList.toggle('active', b.dataset.tab === tab); });
  document.querySelectorAll('.student-dash-content').forEach(function(c){ c.classList.toggle('active', c.id === 'studentTab-' + tab); });
  if(tab === 'live') renderStudentLiveClasses();
}
function renderStudentDashboard(){
  if(!currentStudentSession) return;
  var s = currentStudentSession;
  var balance = (s.totalFees || 0) - (s.paid || 0);
  var stats = document.getElementById('studentStats');
  if(stats){
    stats.innerHTML =
      '<div class="dash-stat-card green"><div class="ds-num">' + escapeHtml(s.studentId) + '</div><div class="ds-lbl">Student ID</div></div>' +
      '<div class="dash-stat-card"><div class="ds-num" style="font-size:14px;">' + escapeHtml(s.course) + '</div><div class="ds-lbl">Course</div></div>' +
      '<div class="dash-stat-card gold"><div class="ds-num">KES ' + (s.paid||0).toLocaleString() + '</div><div class="ds-lbl">Total Paid</div></div>' +
      '<div class="dash-stat-card ' + (balance > 0 ? 'red' : 'green') + '"><div class="ds-num">KES ' + balance.toLocaleString() + '</div><div class="ds-lbl">Balance</div></div>';
  }
}
function renderStudentFinance(){
  if(!currentStudentSession) return;
  var s = currentStudentSession;
  var balance = (s.totalFees || 0) - (s.paid || 0);
  if(balance < 0) balance = 0;
  var stats = document.getElementById('studentFeeStats');
  if(stats){
    stats.innerHTML =
      '<div class="dash-stat-card"><div class="ds-num">KES ' + (s.totalFees||0).toLocaleString() + '</div><div class="ds-lbl">Total Fees</div></div>' +
      '<div class="dash-stat-card green"><div class="ds-num">KES ' + (s.paid||0).toLocaleString() + '</div><div class="ds-lbl">Amount Paid</div></div>' +
      '<div class="dash-stat-card ' + (balance > 0 ? 'red' : 'green') + '"><div class="ds-num">KES ' + balance.toLocaleString() + '</div><div class="ds-lbl">Outstanding Balance</div></div>';
  }
  var ledgerWrap = document.getElementById('studentLedgerWrap');
  if(ledgerWrap){
    var rows = '';
    var runningBalance = 0;
    runningBalance += (s.totalFees || 0);
    rows += '<tr><td>' + new Date(s.enrolledAt || Date.now()).toLocaleDateString() + '</td><td>Tuition & Registration Fees</td><td class="dr">KES ' + (s.totalFees||0).toLocaleString() + '</td><td>—</td><td class="balance">KES ' + runningBalance.toLocaleString() + '</td></tr>';
    (s.paymentHistory || []).slice().sort(function(a,b){ return new Date(a.date) - new Date(b.date); }).forEach(function(p){
      runningBalance -= p.amount;
      rows += '<tr><td>' + new Date(p.date).toLocaleDateString() + '</td><td>' + escapeHtml(p.method) + ' — ' + escapeHtml(p.source || 'Student / Parent') + '</td><td>—</td><td class="cr">KES ' + p.amount.toLocaleString() + '</td><td class="balance">KES ' + runningBalance.toLocaleString() + '</td></tr>';
    });
    if(s.overpaymentCarry > 0){
      rows += '<tr style="background:#fef3c7;"><td>—</td><td><strong>Overpayment Credit (carried forward)</strong></td><td>—</td><td class="cr">KES ' + s.overpaymentCarry.toLocaleString() + '</td><td class="balance">—</td></tr>';
    }
    ledgerWrap.innerHTML = '<table class="ledger-table"><thead><tr><th>Date</th><th>Description</th><th>Debit (KES)</th><th>Credit (KES)</th><th>Balance (KES)</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
  var ledgerSummary = document.getElementById('studentLedgerSummary');
  if(ledgerSummary){
    ledgerSummary.innerHTML = '<div class="ledger-summary">' +
      '<div class="ls-card debit"><div class="ls-num">KES ' + (s.totalFees||0).toLocaleString() + '</div><div class="ls-lbl">Total Debit</div></div>' +
      '<div class="ls-card credit"><div class="ls-num">KES ' + (s.paid||0).toLocaleString() + '</div><div class="ls-lbl">Total Credit</div></div>' +
      '<div class="ls-card"><div class="ls-num">KES ' + balance.toLocaleString() + '</div><div class="ls-lbl">Balance</div></div>' +
    '</div>';
  }
  var tbody = document.getElementById('studentPaymentsTable');
  if(tbody){
    if(s.paymentHistory && s.paymentHistory.length){
      tbody.innerHTML = s.paymentHistory.slice().reverse().map(function(p){
        return '<tr><td>' + new Date(p.date).toLocaleDateString() + '</td><td>KES ' + p.amount.toLocaleString() + '</td><td>' + escapeHtml(p.method) + '</td><td>' + escapeHtml(p.source || 'Student / Parent') + '</td><td>' + escapeHtml(p.receipt || '—') + '</td></tr>';
      }).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:16px;color:#6b7688;">No payments recorded yet.</td></tr>';
    }
  }
}
function renderStudentMessages(){
  var box = document.getElementById('studentMessages');
  if(!box || !currentStudentSession) return;
  var s = currentStudentSession;
  var msgs = [];
  var apps = getAllApplications();
  for(var i=0;i<apps.length;i++){
    if(apps[i].appNumber === s.applicationNumber){
      (apps[i].statusHistory || []).forEach(function(h){
        msgs.push({ title: 'Application: ' + (APPLICATION_STATUSES[h.status]||{}).label, body: h.note || 'Status updated', at: h.at });
      });
      break;
    }
  }
  if(s.paymentHistory && s.paymentHistory.length){
    s.paymentHistory.forEach(function(p){
      msgs.push({ title: 'Payment Received', body: 'KES ' + p.amount + ' via ' + p.method + (p.receipt ? ' (Receipt: ' + p.receipt + ')' : ''), at: p.date });
    });
  }
  if(s.reportBackHistory && s.reportBackHistory.length){
    s.reportBackHistory.forEach(function(r){
      msgs.push({ title: 'Report Back: ' + r.term, body: r.deducted ? 'Overpayment KES ' + r.deducted.toLocaleString() + ' auto-deducted. Balance now KES ' + (r.balanceAfter||0).toLocaleString() : 'Confirmed. Balance KES ' + (r.balanceAfter||0).toLocaleString(), at: r.at });
    });
  }
  var adminNotifs = getAdminNotifHistory();
  adminNotifs.forEach(function(n){
    if(announcementMatchesAudience(n.audience, s)){
      msgs.push({ title: 'Notification: ' + n.title, body: n.message, at: n.at });
    }
  });
  var myReports = getAllStudentReports().filter(function(r){ return r.studentId === s.studentId && r.response; });
  myReports.forEach(function(r){
    msgs.push({ title: 'Reply to your report: ' + r.subject, body: r.response, at: r.updatedAt || r.at });
  });
  msgs.sort(function(a,b){ return new Date(b.at) - new Date(a.at); });
  if(msgs.length === 0){ box.innerHTML = '<p style="color:#6b7688;font-size:12.5px;">No messages yet.</p>'; return; }
  box.innerHTML = msgs.slice(0, 30).map(function(m){
    return '<div style="background:#f8fafc;border-left:3px solid #0a6b3b;padding:10px 13px;margin-bottom:8px;border-radius:5px;font-size:12.5px;">' +
      '<strong style="color:#0a1f3d;">' + escapeHtml(m.title) + '</strong>' +
      '<div style="color:#3a4654;margin-top:3px;">' + escapeHtml(m.body) + '</div>' +
      '<div style="color:#6b7688;font-size:10.5px;margin-top:4px;">' + new Date(m.at).toLocaleString() + '</div>' +
    '</div>';
  }).join('');
}

/* Course filter */
function filterCourses(){
  var s = (document.getElementById('courseSearch').value || '').toLowerCase().trim();
  var d = document.getElementById('departmentFilter').value;
  var cards = document.querySelectorAll('#coursesGrid .course-card');
  var visible = 0;
  cards.forEach(function(card){
    var name = (card.dataset.name || '').toLowerCase();
    var level = (card.dataset.level || '').toLowerCase();
    var entry = (card.dataset.entry || '').toLowerCase();
    var duration = (card.dataset.duration || '').toLowerCase();
    var text = (card.textContent || '').toLowerCase();
    var cdept = card.dataset.dept || '';
    var ms = !s || name.indexOf(s) !== -1 || level.indexOf(s) !== -1 || entry.indexOf(s) !== -1 || duration.indexOf(s) !== -1 || text.indexOf(s) !== -1;
    var md = !d || cdept === d;
    if(ms && md){ card.style.display = ''; visible++; }
    else card.style.display = 'none';
  });
  var info = document.getElementById('courseResultsInfo');
  if(info){
    if(s || d){
      info.classList.add('show');
      info.innerHTML = '<i class="fas fa-search"></i> Showing <strong>' + visible + '</strong> of <strong>' + cards.length + '</strong> courses' + (s ? ' for "' + escapeHtml(s) + '"' : '') + (d ? ' in ' + escapeHtml(d) + ' department' : '') + '.';
    } else {
      info.classList.remove('show');
    }
  }
}
function clearCourseFilters(){
  document.getElementById('courseSearch').value = '';
  document.getElementById('departmentFilter').value = '';
  filterCourses();
}
function showCourseDetails(id){ showPage('courses'); showToast('Course: ' + id, 'success'); }

function handleContactForm(e){
  e.preventDefault();
  var n = document.getElementById('contactName').value.trim();
  var em = document.getElementById('contactEmail').value.trim();
  var sub = document.getElementById('contactSubject').value.trim() || 'Inquiry';
  var msg = document.getElementById('contactMessage').value.trim();
  if(!n || !em || !msg){ showToast('Please fill all required fields', 'error'); return; }
  var body = 'Name: ' + n + '\nEmail: ' + em + '\nSubject: ' + sub + '\n\nMessage:\n' + msg;
  window.location.href = 'mailto:highwayvocational@gmail.com?subject=' + encodeURIComponent(sub) + '&body=' + encodeURIComponent(body);
  showToast('Opening email client...', 'success');
  document.getElementById('contactForm').reset();
}

function loadTestimonials(){
  testimonials = safeGet('testimonials', []);
  if(!Array.isArray(testimonials)) testimonials = [];
  renderTestimonials();
}
function renderTestimonials(){
  var slider = document.getElementById('testimonialSlider');
  var dots = document.getElementById('testimonialDots');
  if(!slider) return;
  slider.innerHTML = '';
  if(testimonials.length === 0){
    slider.innerHTML = '<div class="testimonial-slide"><div style="color:#6b7688;font-style:italic;">No testimonials yet.</div></div>';
    if(dots) dots.innerHTML = '';
    return;
  }
  testimonials.forEach(function(t){
    var slide = document.createElement('div');
    slide.className = 'testimonial-slide';
    slide.innerHTML = '<div class="stars">★★★★★</div><div class="quote">"' + escapeHtml(t.message) + '"</div><div class="author-name">' + escapeHtml(t.name) + '</div><div class="author-role">' + escapeHtml(t.role) + '</div>';
    slider.appendChild(slide);
  });
  if(dots){
    dots.innerHTML = '';
    testimonials.forEach(function(t, i){
      var dot = document.createElement('button');
      dot.className = 'tdot' + (i === 0 ? ' active' : '');
      dot.onclick = function(){ goToTestimonial(i); };
      dots.appendChild(dot);
    });
  }
  goToTestimonial(0);
}
function goToTestimonial(index){
  var slides = document.querySelectorAll('.testimonial-slide');
  if(!slides.length) return;
  if(index >= slides.length) index = 0;
  if(index < 0) index = slides.length - 1;
  testimonialIndex = index;
  var slider = document.getElementById('testimonialSlider');
  if(slider) slider.style.transform = 'translateX(-' + (index * 100) + '%)';
  document.querySelectorAll('.testimonial-dots .tdot').forEach(function(dot, i){ dot.classList.toggle('active', i === index); });
}
function openTestimonialForm(){ document.getElementById('testimonialFormSection').style.display = 'block'; }
function closeTestimonialForm(){ document.getElementById('testimonialFormSection').style.display = 'none'; }
function submitTestimonial(e){
  e.preventDefault();
  var n = document.getElementById('testimonialName').value.trim();
  var r = document.getElementById('testimonialRole').value.trim();
  var m = document.getElementById('testimonialMessage').value.trim();
  if(!n || !r || !m){ showToast('Please fill all fields', 'error'); return; }
  testimonials.push({ name:n, role:r, message:m });
  safeSet('testimonials', testimonials);
  renderTestimonials();
  document.getElementById('testimonialForm').reset();
  closeTestimonialForm();
  showToast('Thank you!', 'success');
}

function loadGallery(){
  galleryImages = safeGet('gallery_images', []);
  if(!Array.isArray(galleryImages)) galleryImages = [];
  renderGallery();
}
function saveGallery(){ safeSet('gallery_images', galleryImages); }
function addToGallery(url, label){
  if(!url) return;
  for(var i=0;i<galleryImages.length;i++){ if(galleryImages[i].url === url) return; }
  galleryImages.push({ id:'img_'+Date.now()+'_'+Math.random().toString(36).substr(2,6), url:url, label:label||'Image', addedAt:Date.now() });
  saveGallery(); renderGallery();
}
function renderGallery(){
  var grid = document.getElementById('galleryGrid');
  if(!grid) return;
  if(galleryImages.length === 0){
    grid.innerHTML = '<div class="gallery-empty" id="galleryEmpty"><i class="fas fa-images"></i><p>No images in gallery yet.</p></div>';
    return;
  }
  grid.innerHTML = galleryImages.map(function(img){
    return '<div class="gallery-item" onclick="viewGalleryImage(\'' + img.id + '\')">' +
      '<img src="' + img.url + '" alt="' + escapeHtml(img.label) + '" loading="lazy">' +
      '<div class="gallery-label">' + escapeHtml(img.label) + '</div>' +
      '<button class="gallery-delete" onclick="event.stopPropagation();deleteGalleryImage(\'' + img.id + '\')"><i class="fas fa-times"></i></button>' +
    '</div>';
  }).join('');
}
function addGalleryImage(){
  if(!adminMode){ showToast('Edit mode required', ''); return; }
  var input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
  input.onchange = function(e){
    var files = Array.from(e.target.files);
    files.forEach(function(file){
      var r = new FileReader();
      r.onload = function(ev){
        compressImage(ev.target.result, 1600, 0.9).then(function(comp){ addToGallery(comp, file.name); });
      };
      r.readAsDataURL(file);
    });
  };
  input.click();
}
function deleteGalleryImage(id){
  if(!adminMode){ showToast('Edit mode required', ''); return; }
  if(!confirm('Delete this image?')) return;
  galleryImages = galleryImages.filter(function(i){ return i.id !== id; });
  saveGallery(); renderGallery();
  showToast('Image deleted', '');
}
function clearGallery(){
  if(!adminMode){ showToast('Edit mode required', ''); return; }
  if(!confirm('Remove ALL images?')) return;
  galleryImages = []; saveGallery(); renderGallery();
  showToast('Gallery cleared', '');
}
function viewGalleryImage(id){
  var img = null;
  for(var i=0;i<galleryImages.length;i++){ if(galleryImages[i].id === id){ img = galleryImages[i]; break; } }
  if(!img) return;
  currentGalleryImage = img;
  document.getElementById('galleryViewerImage').src = img.url;
  document.getElementById('galleryViewerTitle').textContent = img.label;
  document.getElementById('galleryViewerModal').classList.add('open');
}
function closeGalleryViewer(){
  document.getElementById('galleryViewerModal').classList.remove('open');
  currentGalleryImage = null;
}
function downloadGalleryImage(){
  if(!currentGalleryImage) return;
  var a = document.createElement('a');
  a.href = currentGalleryImage.url;
  a.download = currentGalleryImage.label.replace(/[^a-z0-9]/gi,'_') + '.jpg';
  a.click();
  showToast('Download started', 'success');
}

function loadSocialLinks(){
  var links = safeGet('social_links', {});
  applySocialLinks(links);
}
function applySocialLinks(links){
  if(!links) links = safeGet('social_links', {});
  var platforms = ['whatsapp','facebook','instagram','tiktok','youtube','telegram','twitter','linkedin'];
  platforms.forEach(function(p){
    var cap = p.charAt(0).toUpperCase() + p.slice(1);
    ['social','footerSocial'].forEach(function(prefix){
      var el = document.getElementById(prefix + cap);
      if(el && links[p]){
        el.href = links[p];
        el.target = '_blank';
        el.rel = 'noopener';
        el.style.cursor = 'pointer';
      }
    });
  });
}
function saveLiveSocialLinks(){
  var socialInputs = {
    whatsapp: 'liveSocialWhatsApp', facebook: 'liveSocialFacebook', instagram: 'liveSocialInstagram',
    tiktok: 'liveSocialTikTok', youtube: 'liveSocialYouTube', telegram: 'liveSocialTelegram',
    twitter: 'liveSocialTwitter', linkedin: 'liveSocialLinkedIn'
  };
  var links = safeGet('social_links', {});
  Object.keys(socialInputs).forEach(function(k){
    var inp = document.getElementById(socialInputs[k]);
    if(inp) links[k] = inp.value.trim();
  });
  safeSet('social_links', links);
  applySocialLinks(links);
  broadcastRefresh();
  showToast('Social links saved & applied!', 'success');
}

function saveAdminSettings(){
  var pw = document.getElementById('settingAdminPw').value.trim();
  if(pw && pw.length >= 4){ ADMIN_PANEL_PASSWORD = pw; adminPassword = pw; showToast('Settings saved', 'success'); }
  else { showToast('Password must be at least 4 characters', 'error'); }
}
function wipeAllData(){
  if(!confirm('WARNING: This will delete ALL applications, students, payments, and announcements. Are you sure?')) return;
  if(!confirm('This action CANNOT be undone. Type OK to confirm.')) return;
  ['applications','students','payments','announcements','testimonials','gallery_images','student_reports','admin_notif_history','notifications','resources','timetable_data','live_classes'].forEach(function(k){ localStorage.removeItem(k); });
  showToast('All data wiped', 'success');
  setTimeout(function(){ location.reload(); }, 1000);
}

function showGenericModal(title, bodyHtml){
  var existing = document.getElementById('genericModal');
  if(existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'genericModal';
  modal.className = 'modal-overlay open';
  modal.innerHTML = '<div class="modal-content" style="max-width:720px;"><div class="modal-header"><h2><i class="fas fa-file-alt"></i> ' + escapeHtml(title) + '</h2><button class="modal-close" onclick="closeGenericModal()"><i class="fas fa-times"></i></button></div><div class="modal-body">' + bodyHtml + '</div></div>';
  document.body.appendChild(modal);
}
function closeGenericModal(){
  var m = document.getElementById('genericModal');
  if(m) m.remove();
}

/* ---------- APPLICATION FORM ---------- */
var APPLICATION_DRAFT_KEY = 'hvc_application_draft_v2';

var VALIDATION_RULES = {
  'name': function(v){
    if(!v) return 'This field is required.';
    if(!/^[a-zA-Z\s'\-\.]{2,60}$/.test(v)) return 'Use letters only (2-60 characters).';
    return null;
  },
  'name-optional': function(v){
    if(!v) return null;
    if(!/^[a-zA-Z\s'\-\.]{1,60}$/.test(v)) return 'Use letters only.';
    return null;
  },
  'required-name': function(v){
    if(!v) return 'This field is required.';
    if(!/^[a-zA-Z\s'\-\.]{2,80}$/.test(v)) return 'Use letters only (2+ characters).';
    return null;
  },
  'required': function(v){ return v && v.trim() ? null : 'This field is required.'; },
  'email': function(v){
    if(!v) return 'Email is required.';
    if(!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)) return 'Enter a valid email address (e.g. name@example.com).';
    return null;
  },
  'phone': function(v){
    if(!v) return 'Phone number is required.';
    var cleaned = v.replace(/[\s\-\(\)]/g, '');
    if(!/^(?:\+?254|0)?[17][0-9]{8}$/.test(cleaned)) return 'Enter a valid Kenyan number (e.g. 0712345678 or +254712345678).';
    return null;
  },
  'phone-optional': function(v){
    if(!v) return null;
    var cleaned = v.replace(/[\s\-\(\)]/g, '');
    if(!/^(?:\+?254|0)?[17][0-9]{8}$/.test(cleaned)) return 'Enter a valid Kenyan number or leave blank.';
    return null;
  },
  'id-optional': function(v){
    if(!v) return null;
    var cleaned = v.replace(/\s/g, '');
    if(!/^[0-9]{6,10}$/.test(cleaned)) return 'ID should be 6-10 digits.';
    return null;
  },
  'birthcert': function(v){
    if(!v) return null;
    var cleaned = v.replace(/\s/g, '');
    if(!/^[0-9]{6,15}$/.test(cleaned)) return 'Birth certificate should be 6-15 digits.';
    return null;
  },
  'dob': function(v){
    if(!v) return 'Date of birth is required.';
    var d = new Date(v);
    if(isNaN(d.getTime())) return 'Enter a valid date.';
    var today = new Date();
    var age = Math.floor((today - d) / (365.25 * 24 * 60 * 60 * 1000));
    if(age < 14) return 'You must be at least 14 years old.';
    if(age > 100) return 'Please enter a valid date of birth.';
    return null;
  },
  'year': function(v){
    if(!v) return 'Year is required.';
    var y = parseInt(v, 10);
    var now = new Date().getFullYear();
    if(isNaN(y) || y < 1980 || y > now + 1) return 'Enter a valid year (1980-' + (now + 1) + ').';
    return null;
  }
};

function validateField(el){
  if(!el) return true;
  var rule = el.getAttribute('data-validate');
  if(!rule || !VALIDATION_RULES[rule]) return true;
  var err = VALIDATION_RULES[rule](el.value);
  var errEl = document.getElementById('err_' + el.id);
  if(err){
    el.classList.add('error');
    el.classList.remove('valid');
    if(errEl) {
      errEl.classList.add('show');
      errEl.querySelector('span').textContent = err;
    }
    return false;
  } else {
    el.classList.remove('error');
    if(el.value) el.classList.add('valid');
    if(errEl) errEl.classList.remove('show');
    return true;
  }
}

function validateStep(stepNum){
  var stepEl = document.querySelector('.app-step[data-step="' + stepNum + '"]');
  if(!stepEl) return true;
  var inputs = stepEl.querySelectorAll('input[data-validate], select[data-validate], textarea[data-validate]');
  var allValid = true;
  inputs.forEach(function(el){
    if(!validateField(el)) allValid = false;
  });
  return allValid;
}

function goToAppStep(step){
  if(step < 1 || step > 8) return;
  if(step > currentAppStep){
    if(!validateStep(currentAppStep)){
      showToast('Please fix the highlighted errors before continuing.', 'error');
      var firstErr = document.querySelector('.app-step[data-step="' + currentAppStep + '"] .form-group .error');
      if(firstErr) firstErr.focus();
      return;
    }
  }
  currentAppStep = step;
  document.querySelectorAll('.app-step').forEach(function(s){ s.classList.remove('active'); });
  var t = document.querySelector('.app-step[data-step="' + step + '"]');
  if(t) t.classList.add('active');
  document.querySelectorAll('#appStepper .step').forEach(function(s){
    var n = parseInt(s.dataset.step, 10);
    s.classList.toggle('active', n === step);
    s.classList.toggle('completed', n < step);
  });
  saveApplicationDraft();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function toggleDisability(){
  var v = document.getElementById('appDisability').value;
  document.getElementById('disabilityDetailsGroup').style.display = v === 'Yes' ? 'block' : 'none';
  saveApplicationDraft();
}

var COURSE_DATA = {
  computer: [
    { value:'computer-packages', label:'Computer Packages (2 Months)', duration:'2 Months', requirement:'KCSE D', fees:'KES 3,000' },
    { value:'short-courses', label:'Short Courses (1-4 Weeks)', duration:'1-4 Weeks', requirement:'Open to all', fees:'From KES 2,000' },
    { value:'web-design', label:'Web Design (2 Months)', duration:'2 Months', requirement:'KCSE D', fees:'KES 3,500' }
  ],
  beauty: [
    { value:'beauty-therapy', label:'Beauty & Therapy (6 Months)', duration:'6 Months', requirement:'KCPE', fees:'KES 2,000' },
    { value:'hairdressing', label:'HairDressing (6 Months)', duration:'6 Months', requirement:'KCPE', fees:'KES 2,500' }
  ],
  cyber: [
    { value:'cyber-services', label:'Cyber & eCitizen Services (Daily)', duration:'Daily', requirement:'Walk-in', fees:'From KES 10' }
  ]
};
function updateCourseOptions(){
  var dept = document.getElementById('appDepartment').value;
  var cs = document.getElementById('appCourse');
  cs.innerHTML = '<option value="">Select Course...</option>';
  if(COURSE_DATA[dept]){
    COURSE_DATA[dept].forEach(function(c){
      var o = document.createElement('option');
      o.value = c.value; o.textContent = c.label;
      cs.appendChild(o);
    });
  }
  saveApplicationDraft();
}
function updateCourseInfo(){
  var dept = document.getElementById('appDepartment').value;
  var cv = document.getElementById('appCourse').value;
  var box = document.getElementById('courseInfoBox');
  if(!dept || !cv){ box.style.display = 'none'; saveApplicationDraft(); return; }
  var c = (COURSE_DATA[dept] || []).filter(function(x){ return x.value === cv; })[0];
  if(!c){ box.style.display = 'none'; return; }
  document.getElementById('infoCourse').textContent = c.label;
  document.getElementById('infoDuration').textContent = c.duration;
  document.getElementById('infoRequirement').textContent = c.requirement;
  document.getElementById('infoFees').textContent = c.fees;
  box.style.display = 'block';
  saveApplicationDraft();
}
function buildReview(){
  var sections = [
    ['Personal', [['First Name', document.getElementById('appFirstName').value], ['Last Name', document.getElementById('appLastName').value], ['DOB', document.getElementById('appDob').value], ['Gender', document.getElementById('appGender').value], ['Nationality', document.getElementById('appNationality').value]]],
    ['Contact', [['Phone', document.getElementById('appPhone').value], ['Email', document.getElementById('appEmail').value], ['County', document.getElementById('appCounty').value], ['Sub-County', document.getElementById('appSubCounty').value]]],
    ['Academic', [['Education', document.getElementById('appEducation').value], ['School', document.getElementById('appSchool').value], ['Year', document.getElementById('appYearCompleted').value]]],
    ['Course', [['Dept', document.getElementById('appDepartment').value], ['Course', document.getElementById('appCourse').value], ['Intake', document.getElementById('appIntake').value]]]
  ];
  var html = '';
  sections.forEach(function(sec){
    html += '<div style="margin-bottom:12px;"><strong style="color:#0a1f3d;">' + sec[0] + '</strong><br>';
    sec[1].forEach(function(f){ if(f[1]) html += '<span style="color:#6b7688;">' + f[0] + ':</span> <span style="color:#0a1f3d;">' + escapeHtml(f[1]) + '</span><br>'; });
    html += '</div>';
  });
  document.getElementById('reviewContent').innerHTML = html;
  showToast('Review loaded', 'success');
}
function collectApplicationData(){
  return {
    firstName: (document.getElementById('appFirstName')||{}).value || '',
    middleName: (document.getElementById('appMiddleName')||{}).value || '',
    lastName: (document.getElementById('appLastName')||{}).value || '',
    dob: (document.getElementById('appDob')||{}).value || '',
    gender: (document.getElementById('appGender')||{}).value || '',
    nationality: (document.getElementById('appNationality')||{}).value || '',
    idNumber: (document.getElementById('appIdNumber')||{}).value || '',
    birthCert: (document.getElementById('appBirthCert')||{}).value || '',
    maritalStatus: (document.getElementById('appMarital')||{}).value || '',
    disability: (document.getElementById('appDisability')||{}).value || '',
    disabilityDetails: (document.getElementById('appDisabilityDetails')||{}).value || '',
    phone: (document.getElementById('appPhone')||{}).value || '',
    altPhone: (document.getElementById('appAltPhone')||{}).value || '',
    email: (document.getElementById('appEmail')||{}).value || '',
    county: (document.getElementById('appCounty')||{}).value || '',
    subCounty: (document.getElementById('appSubCounty')||{}).value || '',
    ward: (document.getElementById('appWard')||{}).value || '',
    town: (document.getElementById('appTown')||{}).value || '',
    homeCounty: (document.getElementById('appHomeCounty')||{}).value || '',
    homeSubCounty: (document.getElementById('appHomeSubCounty')||{}).value || '',
    homeTown: (document.getElementById('appHomeTown')||{}).value || '',
    education: (document.getElementById('appEducation')||{}).value || '',
    school: (document.getElementById('appSchool')||{}).value || '',
    yearCompleted: (document.getElementById('appYearCompleted')||{}).value || '',
    kcseIndex: (document.getElementById('appKcseIndex')||{}).value || '',
    kcseGrade: (document.getElementById('appKcseGrade')||{}).value || '',
    department: (document.getElementById('appDepartment')||{}).value || '',
    course: (document.getElementById('appCourse')||{}).value || '',
    level: (document.getElementById('appLevel')||{}).value || '',
    intake: (document.getElementById('appIntake')||{}).value || '',
    studyMode: (document.getElementById('appStudyMode')||{}).value || '',
    campus: (document.getElementById('appCampus')||{}).value || '',
    guardianName: (document.getElementById('appGuardianName')||{}).value || '',
    guardianRelation: (document.getElementById('appGuardianRelation')||{}).value || '',
    guardianPhone: (document.getElementById('appGuardianPhone')||{}).value || '',
    guardianCounty: (document.getElementById('appGuardianCounty')||{}).value || '',
    guardianSubCounty: (document.getElementById('appGuardianSubCounty')||{}).value || '',
    guardianOccupation: (document.getElementById('appGuardianOccupation')||{}).value || '',
    hearAbout: (document.getElementById('appHearAbout')||{}).value || '',
    financialAid: (document.getElementById('appFinancialAid')||{}).value || '',
    scholarship: (document.getElementById('appScholarship')||{}).value || '',
    additionalInfo: (document.getElementById('appAdditionalInfo')||{}).value || ''
  };
}

function saveApplicationDraft(){
  try {
    var data = collectApplicationData();
    data._step = currentAppStep;
    data._savedAt = new Date().toISOString();
    safeSet(APPLICATION_DRAFT_KEY, data);
  } catch(e){}
}
function restoreApplicationDraft(){
  var draft = safeGet(APPLICATION_DRAFT_KEY, null);
  if(!draft) return false;
  Object.keys(draft).forEach(function(k){
    if(k.charAt(0) === '_') return;
    var el = document.getElementById('app' + k.charAt(0).toUpperCase() + k.slice(1));
    if(el){
      if(el.type === 'date' && draft[k]) el.value = draft[k].substring(0,10);
      else el.value = draft[k];
    }
  });
  if(draft.department){
    updateCourseOptions();
    if(draft.course) document.getElementById('appCourse').value = draft.course;
    updateCourseInfo();
  }
  ['appCounty','appHomeCounty','appGuardianCounty'].forEach(function(cid){
    var sel = document.getElementById(cid);
    if(sel && sel.value){
      var subId = cid === 'appCounty' ? 'appSubCounty' : cid === 'appHomeCounty' ? 'appHomeSubCounty' : 'appGuardianSubCounty';
      populateSubCounties(cid, subId);
      var map = { 'appCounty':'subCounty', 'appHomeCounty':'homeSubCounty', 'appGuardianCounty':'guardianSubCounty' };
      var draftKey = map[cid];
      if(draft[draftKey]) document.getElementById(subId).value = draft[draftKey];
    }
  });
  if(draft.disability === 'Yes') document.getElementById('disabilityDetailsGroup').style.display = 'block';
  if(draft._step && draft._step >= 1 && draft._step <= 8){
    currentAppStep = draft._step;
    document.querySelectorAll('.app-step').forEach(function(s){ s.classList.remove('active'); });
    var t = document.querySelector('.app-step[data-step="' + draft._step + '"]');
    if(t) t.classList.add('active');
    document.querySelectorAll('#appStepper .step').forEach(function(s){
      var n = parseInt(s.dataset.step, 10);
      s.classList.toggle('active', n === draft._step);
      s.classList.toggle('completed', n < draft._step);
    });
  }
  return true;
}
function clearApplicationDraft(){
  try { localStorage.removeItem(APPLICATION_DRAFT_KEY); } catch(e){}
}

function submitApplication(){
  for(var step = 1; step <= 7; step++){
    if(!validateStep(step)){
      showToast('Please complete all required fields correctly before submitting.', 'error');
      goToAppStep(step);
      setTimeout(function(){
        var firstErr = document.querySelector('.app-step.active .form-group .error');
        if(firstErr) firstErr.focus();
      }, 300);
      return;
    }
  }
  if(!document.getElementById('appDeclaration').checked){
    showToast('Please accept the declaration before submitting.', 'error');
    return;
  }
  var counter = parseInt(localStorage.getItem('app_counter') || '0', 10) + 1;
  localStorage.setItem('app_counter', String(counter));
  var appNum = 'HVC-' + new Date().getFullYear() + '-' + String(counter).padStart(6, '0');
  var data = collectApplicationData();
  delete data._step;
  delete data._savedAt;
  data.appNumber = appNum;
  data.status = 'submitted';
  data.submittedAt = new Date().toISOString();
  data.adminNote = '';
  data.statusHistory = [{ status:'submitted', at:data.submittedAt, note:'Application received' }];
  var apps = getAllApplications();
  apps.push(data);
  saveAllApplications(apps);
  clearApplicationDraft();
  document.getElementById('applicationForm').style.display = 'none';
  document.getElementById('appStepper').style.display = 'none';
  document.getElementById('applicationSuccess').style.display = 'block';
  document.getElementById('successAppNumber').textContent = appNum;
  showToast('Application submitted!', 'success');
  updateAdminStats();
}
function downloadApplicationSummary(){
  var appNum = document.getElementById('successAppNumber').textContent;
  var apps = getAllApplications();
  var app = null;
  for(var i=0;i<apps.length;i++){ if(apps[i].appNumber === appNum){ app = apps[i]; break; } }
  var content = 'HIGHWAY VOCATIONAL CENTER\nApplication Summary\n\n';
  content += 'Application Number: ' + appNum + '\n';
  content += 'Date: ' + new Date().toLocaleDateString() + '\n\n';
  if(app){
    content += 'Name: ' + app.firstName + ' ' + app.lastName + '\n';
    content += 'Phone: ' + app.phone + '\n';
    content += 'Email: ' + app.email + '\n';
    content += 'Course: ' + app.course + '\n';
    content += 'Intake: ' + app.intake + '\n';
    content += 'Status: ' + (APPLICATION_STATUSES[app.status]||{}).label + '\n\n';
  }
  content += 'Thank you for applying.\n';
  var blob = new Blob([content], { type:'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = appNum + '_summary.txt'; a.click();
  URL.revokeObjectURL(url);
  showToast('Summary downloaded', 'success');
}
function checkApplicationStatus(){
  var appNum = document.getElementById('statusAppNumber').value.trim();
  var contact = document.getElementById('statusContact').value.trim();
  if(!appNum || !contact){ showToast('Please enter both fields', 'error'); return; }
  var apps = getAllApplications();
  var app = null;
  // Partial/flexible application number matching
  var appNumUpper = appNum.toUpperCase();
  for(var i=0;i<apps.length;i++){
    if((apps[i].appNumber || '').toUpperCase() === appNumUpper){ app = apps[i]; break; }
  }
  if(!app){
    for(var j=0;j<apps.length;j++){
      if((apps[j].appNumber || '').toUpperCase().indexOf(appNumUpper) !== -1){ app = apps[j]; break; }
    }
  }
  var result = document.getElementById('statusResult');
  if(!app){
    result.innerHTML = '<div class="info-box" style="border-left-color:#dc2626;"><h4 style="color:#dc2626;"><i class="fas fa-exclamation-triangle"></i> Not Found</h4><p>No application found with that number. Please check and try again.</p></div>';
    result.style.display = 'block';
    return;
  }
  var contactLower = contact.toLowerCase();
  var matches = (app.phone && app.phone.indexOf(contact) !== -1) || (app.email && app.email.toLowerCase() === contactLower) || (contact === app.phone) || (contact === app.email) || (app.phone && app.phone.indexOf(contact.replace(/^0/, '')) !== -1);
  if(!matches){ showToast('Contact does not match our records', 'error'); return; }
  var st = APPLICATION_STATUSES[app.status || 'submitted'] || APPLICATION_STATUSES.submitted;
  var html = '<div style="background:var(--green-light);border:1px solid rgba(10,107,59,.2);border-left:4px solid var(--green);border-radius:var(--radius-sm);padding:18px;">';
  html += '<h3 style="font-family:var(--font-heading);color:var(--navy);font-size:14.5px;margin-bottom:12px;"><i class="fas fa-file-alt"></i> ' + escapeHtml(app.appNumber) + '</h3>';
  html += '<p style="font-size:12.5px;margin-bottom:6px;"><strong>Name:</strong> ' + escapeHtml(app.firstName + ' ' + app.lastName) + '</p>';
  html += '<p style="font-size:12.5px;margin-bottom:6px;"><strong>Course:</strong> ' + escapeHtml(app.course) + '</p>';
  html += '<p style="font-size:12.5px;margin-bottom:12px;"><strong>Intake:</strong> ' + escapeHtml(app.intake) + '</p>';
  html += '<div style="margin-bottom:13px;"><strong style="font-size:12.5px;">Current Status:</strong> <span class="status-badge ' + (app.status||'submitted') + '">' + st.label + '</span></div>';
  if(app.adminNote){ html += '<div style="background:#fff;border-left:3px solid var(--gold);padding:10px 13px;border-radius:5px;margin-bottom:13px;font-size:12.5px;"><strong>Note from Admissions:</strong><br>' + escapeHtml(app.adminNote) + '</div>'; }
  html += '<h4 style="font-size:12.5px;margin-bottom:10px;color:var(--navy);">Application Progress</h4>';
  html += '<div class="status-timeline">';
  var allStages = ['submitted','documents_verified','under_review','interview_scheduled','accepted','registered'];
  allStages.forEach(function(stage){
    var stageSt = APPLICATION_STATUSES[stage];
    var done = stageSt.step < st.step || (stageSt.step === st.step && stage === app.status);
    var current = stage === app.status;
    var hist = (app.statusHistory || []).filter(function(h){ return h.status === stage; });
    var histTime = hist.length ? hist[0].at : null;
    html += '<div class="tl-item' + (done ? ' done' : '') + (current ? ' current' : '') + '"><div class="tl-label">' + stageSt.label + (current ? ' (current)' : '') + '</div>' + (histTime ? '<div class="tl-time">' + new Date(histTime).toLocaleString() + '</div>' : '') + (hist.length && hist[0].note ? '<div class="tl-note">' + escapeHtml(hist[0].note) + '</div>' : '') + '</div>';
  });
  html += '</div></div>';
  result.innerHTML = html;
  result.style.display = 'block';
}

/* ---------- LIVE CAMERA ---------- */
function ensureLiveCamChannels(){
  if(liveCamState.bcLockChannel) return;
  try {
    liveCamState.bcLockChannel = new BroadcastChannel('highway_live_lock');
    liveCamState.bcLockChannel.onmessage = function(e){
      if(!e.data) return;
      if(e.data.type === 'announce' && e.data.sessionId !== liveCamState.sessionId){
        if(!liveCamState.locked && !document.getElementById('liveCamPopup').classList.contains('open')){
          setLockedState(true, e.data.sessionId);
        }
      } else if(e.data.type === 'release' && e.data.sessionId !== liveCamState.sessionId){
        setLockedState(false, null);
      } else if(e.data.type === 'query'){
        if(document.getElementById('liveCamPopup').classList.contains('open')){
          liveCamState.bcLockChannel.postMessage({ type:'announce', sessionId: liveCamState.sessionId });
        }
      }
    };
    liveCamState.bcLockChannel.postMessage({ type:'query' });
  } catch(e){}
}

function setLockedState(locked, otherSessionId){
  liveCamState.locked = locked;
  if(otherSessionId) liveCamState.otherSessionId = otherSessionId;
  var lockedOverlay = document.getElementById('liveCamLocked');
  if(lockedOverlay) lockedOverlay.classList.toggle('show', locked);
  var indicator = document.getElementById('globalLiveIndicator');
  if(indicator) indicator.classList.toggle('show', locked);
}

function requestLiveCamSlot(){
  ensureLiveCamChannels();
  if(liveCamState.bcLockChannel) liveCamState.bcLockChannel.postMessage({ type:'query' });
  setTimeout(function(){
    if(!liveCamState.locked){
      setLockedState(false, null);
      startLiveCameraStream();
      showToast('Slot free — starting camera', 'success');
    } else {
      showToast('Still busy — try again in a moment', '');
    }
  }, 700);
}

function openLiveCamera(){
  var popup = document.getElementById('liveCamPopup');
  if(!popup) return;
  popup.classList.add('open');
  liveCamState.sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2,5);
  ensureLiveCamChannels();
  try {
    if(liveCamState.bcLockChannel) liveCamState.bcLockChannel.postMessage({ type:'announce', sessionId: liveCamState.sessionId });
  } catch(e){}
  applyLiveCamPosition();
  makeLiveCamDraggable();
  resetLiveCamUI();
  startLiveCameraStream();
  updateViewerCount();
}

function closeLiveCamera(){
  try {
    if(liveCamState.bcLockChannel && liveCamState.sessionId){
      liveCamState.bcLockChannel.postMessage({ type:'release', sessionId: liveCamState.sessionId });
    }
  } catch(e){}
  stopLiveCamRecording();
  stopLiveCamStream();
  stopLiveCamQrScan();
  var popup = document.getElementById('liveCamPopup');
  if(popup) popup.classList.remove('open');
  closeLiveCamUploadPanel();
  closeLiveCamQrResult();
  setLockedState(false, null);
}

function minimizeLiveCam(){
  var popup = document.getElementById('liveCamPopup');
  var stage = popup.querySelector('.live-cam-stage');
  var footer = popup.querySelector('.live-cam-footer');
  var filters = popup.querySelector('.live-cam-filter-strip');
  liveCamState.minimized = !liveCamState.minimized;
  var display = liveCamState.minimized ? 'none' : '';
  if(stage) stage.style.display = display;
  if(footer) footer.style.display = display;
  if(filters) filters.style.display = display;
}

function toggleLiveCamFullscreen(){
  var popup = document.getElementById('liveCamPopup');
  if(!popup) return;
  if(popup.dataset.maximized === '1'){
    popup.dataset.maximized = '0';
    popup.style.width = '340px';
    popup.style.left = liveCamState.pos.x + 'px';
    popup.style.top = liveCamState.pos.y + 'px';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
  } else {
    popup.dataset.maximized = '1';
    popup.style.width = 'calc(100vw - 40px)';
    popup.style.left = '20px';
    popup.style.top = '20px';
    popup.style.right = 'auto';
    popup.style.bottom = 'auto';
  }
}

function applyLiveCamPosition(){
  var popup = document.getElementById('liveCamPopup');
  if(!popup) return;
  popup.style.left = liveCamState.pos.x + 'px';
  popup.style.top = liveCamState.pos.y + 'px';
  popup.style.right = 'auto';
  popup.style.bottom = 'auto';
}

function makeLiveCamDraggable(){
  var popup = document.getElementById('liveCamPopup');
  var header = document.getElementById('liveCamHeader');
  if(!popup || !header || header.dataset.dragInit === '1') return;
  header.dataset.dragInit = '1';
  var startX = 0, startY = 0, startLeft = 0, startTop = 0, dragging = false;
  function onPointerDown(e){
    if(e.target.closest('button')) return;
    if(popup.dataset.maximized === '1') return;
    dragging = true;
    popup.classList.add('dragging');
    startX = e.clientX;
    startY = e.clientY;
    var rect = popup.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    header.setPointerCapture && header.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onPointerMove(e){
    if(!dragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    var newLeft = Math.max(6, Math.min(window.innerWidth - popup.offsetWidth - 6, startLeft + dx));
    var newTop = Math.max(6, Math.min(window.innerHeight - 60, startTop + dy));
    popup.style.left = newLeft + 'px';
    popup.style.top = newTop + 'px';
    liveCamState.pos.x = newLeft;
    liveCamState.pos.y = newTop;
  }
  function onPointerUp(e){
    if(!dragging) return;
    dragging = false;
    popup.classList.remove('dragging');
    liveCamState.dragged = true;
    try { localStorage.setItem('live_cam_pos', JSON.stringify(liveCamState.pos)); } catch(err){}
  }
  header.addEventListener('pointerdown', onPointerDown);
  header.addEventListener('pointermove', onPointerMove);
  header.addEventListener('pointerup', onPointerUp);
  header.addEventListener('pointercancel', onPointerUp);
}

function loadLiveCamPosition(){
  var saved = safeGet('live_cam_pos', null);
  if(saved && typeof saved.x === 'number' && typeof saved.y === 'number'){
    liveCamState.pos = { x: saved.x, y: saved.y };
  }
  applyLiveCamPosition();
}

function resetLiveCamUI(){
  liveCamState.mode = 'photo';
  liveCamState.filter = 'natural';
  liveCamState.recording = false;
  updateLiveCamModeButtons();
  updateLiveCamFilterUI();
  updateLiveCamShutterIcon();
  var video = document.getElementById('liveCamVideo');
  if(video){ video.className = 'f-natural'; video.classList.toggle('mirrored', liveCamState.facing === 'user'); }
  var grid = document.getElementById('liveCamGrid');
  if(grid) grid.classList.toggle('active', liveCamState.gridOn);
  var micBtn = document.getElementById('lcMicBtn');
  if(micBtn){
    var icon = micBtn.querySelector('i');
    if(icon) icon.className = liveCamState.micEnabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
    micBtn.classList.toggle('active', liveCamState.micEnabled);
  }
}

function startLiveCameraStream(){
  if(liveCamState.locked){
    return;
  }
  stopLiveCamStream();
  var wantAudio = liveCamState.micEnabled;
  var constraints = {
    video: { facingMode: { ideal: liveCamState.facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: wantAudio
  };
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
    liveCamState.stream = stream;
    var video = document.getElementById('liveCamVideo');
    if(video){
      video.srcObject = stream;
      video.muted = true;
      video.className = 'f-' + liveCamState.filter;
      video.classList.toggle('mirrored', liveCamState.facing === 'user');
      video.play().catch(function(){});
    }
  }).catch(function(err){
    showToast('Camera/microphone access denied', 'error');
    console.error(err);
  });
}

function stopLiveCamStream(){
  if(liveCamState.stream){
    liveCamState.stream.getTracks().forEach(function(t){ t.stop(); });
    liveCamState.stream = null;
  }
  var video = document.getElementById('liveCamVideo');
  if(video) video.srcObject = null;
}

function flipLiveCam(){
  liveCamState.facing = liveCamState.facing === 'environment' ? 'user' : 'environment';
  startLiveCameraStream();
  showToast('Camera flipped', '');
}

function toggleLiveCamMic(){
  liveCamState.micEnabled = !liveCamState.micEnabled;
  var micBtn = document.getElementById('lcMicBtn');
  if(micBtn){
    var icon = micBtn.querySelector('i');
    if(icon) icon.className = liveCamState.micEnabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
    micBtn.classList.toggle('active', liveCamState.micEnabled);
  }
  if(liveCamState.stream){
    liveCamState.stream.getAudioTracks().forEach(function(t){ t.enabled = liveCamState.micEnabled; });
  }
  if(!liveCamState.stream || liveCamState.stream.getAudioTracks().length === 0){
    startLiveCameraStream();
  }
  showToast(liveCamState.micEnabled ? 'Microphone ON' : 'Microphone OFF', '');
}

function setLiveCamMode(mode){
  liveCamState.mode = mode;
  updateLiveCamModeButtons();
  updateLiveCamShutterIcon();
  if(mode === 'qr'){ showLiveCamUploadPanel(); startLiveCamQrScan(); }
  else { stopLiveCamQrScan(); closeLiveCamQrResult(); closeLiveCamUploadPanel(); }
}

function updateLiveCamModeButtons(){
  ['photo','video','qr'].forEach(function(m){
    var btn = document.getElementById('lcMode' + m.charAt(0).toUpperCase() + m.slice(1));
    if(btn) btn.classList.toggle('active', liveCamState.mode === m);
  });
}

function updateLiveCamFilterUI(){
  document.querySelectorAll('#liveCamFilters .fc').forEach(function(fc){
    fc.classList.toggle('active', fc.dataset.filter === liveCamState.filter);
  });
  var video = document.getElementById('liveCamVideo');
  if(video) video.className = 'f-' + liveCamState.filter + (liveCamState.facing === 'user' ? ' mirrored' : '');
}

document.addEventListener('click', function(e){
  var fc = e.target.closest && e.target.closest('#liveCamFilters .fc');
  if(fc){
    liveCamState.filter = fc.dataset.filter;
    updateLiveCamFilterUI();
  }
});

function updateLiveCamShutterIcon(){
  var btn = document.getElementById('liveCamShutter');
  if(!btn) return;
  var icon = btn.querySelector('i');
  if(!icon) return;
  if(liveCamState.mode === 'photo'){ btn.classList.remove('recording'); icon.className = 'fas fa-circle'; }
  else if(liveCamState.mode === 'video'){
    if(liveCamState.recording){ btn.classList.add('recording'); icon.className = 'fas fa-stop'; }
    else { btn.classList.remove('recording'); icon.className = 'fas fa-circle'; }
  } else { btn.classList.remove('recording'); icon.className = 'fas fa-search'; }
}

function liveCamCaptureOrRecord(){
  if(liveCamState.locked){ showToast('Someone is currently broadcasting. Please wait.', ''); return; }
  if(liveCamState.mode === 'photo') takeLiveCamPhoto();
  else if(liveCamState.mode === 'video'){
    showToast('Live video mode — stream is not recorded or saved', '');
  }
  else if(liveCamState.mode === 'qr'){ startLiveCamQrScan(); showToast('Scanning for QR / barcode...', ''); }
}

function flashLiveCamEffect(){
  var f = document.getElementById('liveCamFlash');
  if(!f) return;
  f.classList.remove('fire');
  void f.offsetWidth;
  f.classList.add('fire');
}

function takeLiveCamPhoto(){
  if(liveCamState.timerDelay > 0){ runLiveCamTimer(liveCamState.timerDelay, doTakeLiveCamPhoto); }
  else { doTakeLiveCamPhoto(); }
}
function runLiveCamTimer(seconds, callback){
  var timerEl = document.getElementById('liveCamTimer');
  if(!timerEl){ callback(); return; }
  var count = seconds;
  timerEl.textContent = count;
  timerEl.classList.add('active');
  var iv = setInterval(function(){
    count--;
    if(count <= 0){ clearInterval(iv); timerEl.classList.remove('active'); callback(); }
    else { timerEl.textContent = count; }
  }, 1000);
}
function doTakeLiveCamPhoto(){
  var video = document.getElementById('liveCamVideo');
  var canvas = document.getElementById('liveCamCanvas');
  if(!video || !canvas){ return; }
  var w = video.videoWidth, h = video.videoHeight;
  if(!w || !h){ showToast('Camera not ready', 'error'); return; }
  canvas.width = w; canvas.height = h;
  var ctx = canvas.getContext('2d');
  if(liveCamState.facing === 'user'){ ctx.translate(w, 0); ctx.scale(-1, 1); }
  applyLiveCamCanvasFilter(ctx);
  ctx.drawImage(video, 0, 0, w, h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  saveLiveCamCapture(dataUrl, 'photo');
  flashLiveCamEffect();
  if(navigator.vibrate) navigator.vibrate(40);
}
function applyLiveCamCanvasFilter(ctx){
  var f = {
    vivid:'saturate(1.35) contrast(1.08)',
    warm:'sepia(0.28) saturate(1.25) hue-rotate(-8deg)',
    cool:'saturate(1.1) hue-rotate(15deg)',
    mono:'grayscale(1) contrast(1.1)',
    sepia:'sepia(0.75)',
    noir:'grayscale(1) contrast(1.4)',
    vintage:'sepia(0.35) saturate(1.4)',
    fade:'brightness(1.08) saturate(0.85)'
  }[liveCamState.filter];
  ctx.filter = f || 'none';
}
function saveLiveCamCapture(dataUrl, type){
  liveCamState.lastCapture = dataUrl;
  liveCamState.captures.push({ url: dataUrl, type: type, time: Date.now() });
  addToGallery(dataUrl, 'Camera Photo');
  showToast('Saved to album', 'success');
}

function startLiveCamRecording(){
  if(!liveCamState.stream){ showToast('Camera not ready', 'error'); return; }
}
function stopLiveCamRecording(){
  if(liveCamState.mediaRecorder && liveCamState.recording){
    try { liveCamState.mediaRecorder.stop(); } catch(e){}
    liveCamState.recording = false;
    updateLiveCamShutterIcon();
  }
}

function showLiveCamUploadPanel(){ var p = document.getElementById('liveCamUploadPanel'); if(p) p.classList.add('show'); }
function closeLiveCamUploadPanel(){
  var p = document.getElementById('liveCamUploadPanel'); if(p) p.classList.remove('show');
  var pw = document.getElementById('liveCamPreviewWrap'); if(pw) pw.classList.remove('show');
}

function startLiveCamQrScan(){
  if(liveCamState.qrScanTimer) return;
  var video = document.getElementById('liveCamVideo');
  if(!video) return;
  if(!('BarcodeDetector' in window)){
    showToast('Live scan not supported — use "Upload Image" button', '');
    return;
  }
  var detector;
  try { detector = new BarcodeDetector({ formats: ['qr_code','code_128','code_39','ean_13','ean_8','upc_a','upc_e','itf','codabar','pdf417','data_matrix','aztec'] }); }
  catch(e){ detector = new BarcodeDetector({ formats: ['qr_code'] }); }
  liveCamState.qrDetector = detector;
  liveCamState.qrScanTimer = setInterval(function(){
    if(!document.getElementById('liveCamPopup').classList.contains('open')){ stopLiveCamQrScan(); return; }
    if(video.readyState !== 4) return;
    detector.detect(video).then(function(codes){
      if(codes && codes.length > 0){ showLiveCamQrResult(codes[0].rawValue); stopLiveCamQrScan(); }
    }).catch(function(){});
  }, 700);
}
function stopLiveCamQrScan(){
  if(liveCamState.qrScanTimer){ clearInterval(liveCamState.qrScanTimer); liveCamState.qrScanTimer = null; }
}
function showLiveCamQrResult(text){
  var panel = document.getElementById('liveCamQrResult');
  if(!panel) return;
  document.getElementById('liveCamQrText').textContent = text;
  panel.classList.add('show');
  var openBtn = document.getElementById('liveCamQrOpen');
  var copyBtn = document.getElementById('liveCamQrCopy');
  if(openBtn){
    openBtn.onclick = function(){
      var url = text;
      if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
      try { window.open(url, '_blank'); } catch(e){}
    };
  }
  if(copyBtn){
    copyBtn.onclick = function(){ navigator.clipboard.writeText(text).then(function(){ showToast('Copied', 'success'); }); };
  }
}
function closeLiveCamQrResult(){ var p = document.getElementById('liveCamQrResult'); if(p) p.classList.remove('show'); }

function handleLiveCamImageUpload(event){
  var file = event.target.files && event.target.files[0];
  if(!file) return;
  var previewWrap = document.getElementById('liveCamPreviewWrap');
  var previewImg = document.getElementById('liveCamPreviewImg');
  var status = document.getElementById('liveCamPreviewStatus');
  previewWrap.classList.add('show');
  status.className = 'up-status';
  status.textContent = 'Scanning image...';
  var reader = new FileReader();
  reader.onload = function(ev){
    previewImg.src = ev.target.result;
    runImageScan(ev.target.result, status);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function runImageScan(dataUrl, statusEl){
  var img = new Image();
  img.onload = function(){
    if('BarcodeDetector' in window){
      var formats = ['qr_code','code_128','code_39','ean_13','ean_8','upc_a','upc_e','itf','codabar','pdf417','data_matrix','aztec'];
      var det;
      try { det = new BarcodeDetector({ formats: formats }); } catch(e){ det = new BarcodeDetector({ formats: ['qr_code'] }); }
      det.detect(img).then(function(codes){
        if(codes && codes.length > 0){
          statusEl.className = 'up-status success';
          statusEl.textContent = 'Code found: ' + codes[0].format;
          showLiveCamQrResult(codes[0].rawValue);
        } else {
          tryJsQr(dataUrl, statusEl);
        }
      }).catch(function(){
        tryJsQr(dataUrl, statusEl);
      });
    } else {
      tryJsQr(dataUrl, statusEl);
    }
  };
  img.onerror = function(){
    statusEl.className = 'up-status error';
    statusEl.textContent = 'Could not load image.';
  };
  img.src = dataUrl;
}

function tryJsQr(dataUrl, statusEl){
  if(typeof jsQR === 'undefined'){
    statusEl.className = 'up-status error';
    statusEl.textContent = 'No code detected. Try a clearer photo.';
    return;
  }
  var img = new Image();
  img.onload = function(){
    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var imageData;
    try { imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); }
    catch(e){ statusEl.className = 'up-status error'; statusEl.textContent = 'Cannot read image pixels.'; return; }
    var code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
    if(code && code.data){
      statusEl.className = 'up-status success';
      statusEl.textContent = 'QR code detected!';
      showLiveCamQrResult(code.data);
    } else {
      statusEl.className = 'up-status error';
      statusEl.textContent = 'No QR code found. Try a clearer image.';
    }
  };
  img.onerror = function(){
    statusEl.className = 'up-status error';
    statusEl.textContent = 'Could not process image.';
  };
  img.src = dataUrl;
}

function openLiveCamGallery(){
  var modal = document.getElementById('cameraGalleryModal');
  if(!modal) return;
  var grid = document.getElementById('cameraGalleryGrid');
  if(!grid) return;
  grid.innerHTML = '';
  var items = liveCamState.captures.slice().reverse();
  if(items.length === 0){
    grid.innerHTML = '<div class="gallery-empty"><i class="fas fa-images"></i><p>No photos captured yet.</p></div>';
  } else {
    items.forEach(function(item){
      var el = document.createElement('div');
      el.className = 'gallery-item';
      el.innerHTML = '<img src="' + item.url + '" alt=""><div class="gallery-label"><i class="fas fa-camera"></i> Photo</div>';
      el.onclick = function(){ var a = document.createElement('a'); a.href = item.url; a.download = 'highway_photo_' + item.time + '.jpg'; a.click(); };
      grid.appendChild(el);
    });
  }
  modal.classList.add('open');
}
function closeLiveCamGallery(){ document.getElementById('cameraGalleryModal').classList.remove('open'); }

function updateViewerCount(){
  var el = document.getElementById('liveCamViewers');
  if(!el) return;
  var span = el.querySelector('span');
  if(span) span.textContent = String(liveCamState.viewers);
}

function broadcastRefresh(){
  try { if(!broadcastChannel) broadcastChannel = new BroadcastChannel('highway_sync'); broadcastChannel.postMessage({ type:'refresh', timestamp: Date.now() }); } catch(e){}
}
function initBroadcastChannel(){
  try {
    broadcastChannel = new BroadcastChannel('highway_sync');
    broadcastChannel.onmessage = function(e){
      if(e.data && e.data.type === 'refresh'){
        if(adminPanelAuthed) refreshAdminPanel();
        renderAdminApplications();
        renderAdminStudents();
        renderPublicResources();
        renderPublicLiveClasses();
      }
    };
  } catch(e){}
}

function loadAllData(){
  loadHeroSlides();
  loadTestimonials();
  loadNotifications();
  loadSocialLinks();
  loadGallery();
  loadSavedTimetable();
  loadSavedContent();
  applyEditableState();
  var savedLogo = localStorage.getItem('logo');
  if(savedLogo){
    var lm = document.getElementById('logoMark');
    if(lm){ lm.innerHTML = ''; var img = document.createElement('img'); img.src = savedLogo; img.alt = 'Logo'; lm.appendChild(img); }
  }
  populateAllCountySelects();
  renderAdminAnnouncements();
  renderAdminNotifHistory();
  renderAdminReports();
  renderAdminResources();
  renderPublicResources();
  renderPublicLiveClasses();
  renderAdminLiveClasses();
}

function initApplicationFormLiveValidation(){
  var form = document.getElementById('applicationForm');
  if(!form) return;
  form.querySelectorAll('[data-validate]').forEach(function(el){
    el.addEventListener('blur', function(){ validateField(el); saveApplicationDraft(); });
    el.addEventListener('input', function(){
      if(el.classList.contains('error')){
        el.classList.remove('error');
        var errEl = document.getElementById('err_' + el.id);
        if(errEl) errEl.classList.remove('show');
      }
      saveApplicationDraft();
    });
    el.addEventListener('change', function(){ validateField(el); saveApplicationDraft(); });
  });
  var restored = restoreApplicationDraft();
  if(restored) showToast('Welcome back — your application progress has been restored.', 'success');
}

function init(){
  try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); } catch(e){}
  try {
    var a = localStorage.getItem('admin_password'); if(a) adminPassword = a;
    var s = localStorage.getItem('system_password'); if(s) systemPassword = s;
  } catch(e){}

  initBroadcastChannel();
  loadAllData();
  updatePauseUI();
  setInterval(updatePauseUI, 1000);

  var st = document.getElementById('scrollTopBtn');
  if(st){
    window.addEventListener('scroll', function(){ st.classList.toggle('visible', window.scrollY > 400); });
    st.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  }
  var heroPrev = document.getElementById('heroPrev');
  var heroNext = document.getElementById('heroNext');
  if(heroPrev) heroPrev.addEventListener('click', function(e){ e.stopPropagation(); prevSlide(); });
  if(heroNext) heroNext.addEventListener('click', function(e){ e.stopPropagation(); nextSlide(); });
  var pwClose = document.getElementById('pwModalClose');
  if(pwClose) pwClose.addEventListener('click', function(){ document.getElementById('pwModal').classList.remove('active'); });
  var pwModal = document.getElementById('pwModal');
  if(pwModal) pwModal.addEventListener('click', function(e){ if(e.target === this) this.classList.remove('active'); });
  var pwForm = document.getElementById('pwForm');
  if(pwForm) pwForm.addEventListener('submit', function(e){ e.preventDefault(); handleSystemPassword(); });
  document.querySelectorAll('#durOptions button').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('#durOptions button').forEach(function(b){ b.classList.remove('selected'); });
      this.classList.add('selected');
    });
  });
  var durClose = document.getElementById('durModalClose');
  if(durClose) durClose.addEventListener('click', function(){ document.getElementById('durModal').classList.remove('active'); });
  var durSet = document.getElementById('durSet');
  if(durSet) durSet.addEventListener('click', function(){
    document.getElementById('durModal').classList.remove('active');
    var sel = document.querySelector('#durOptions .selected');
    var d = sel ? sel.dataset.dur : '1month';
    if(d === 'lifetime') showToast('Lifetime timer set', 'success'); else setPauseTimer(d);
  });
  var durConfirm = document.getElementById('durConfirm');
  if(durConfirm) durConfirm.addEventListener('click', function(){
    document.getElementById('durModal').classList.remove('active');
    var sel = document.querySelector('#durOptions .selected');
    togglePause(sel ? sel.dataset.dur : '1month');
  });
  var durManual = document.getElementById('durManual');
  if(durManual) durManual.addEventListener('click', function(){
    document.getElementById('durModal').classList.remove('active');
    togglePause('lifetime');
  });
  var adminPwForm = document.getElementById('adminPwForm');
  if(adminPwForm) adminPwForm.addEventListener('submit', function(e){ e.preventDefault(); verifyAdminPassword(); });
  var adminPanelForm = document.getElementById('adminPanelForm');
  if(adminPanelForm) adminPanelForm.addEventListener('submit', function(e){ e.preventDefault(); verifyAdminPanelPassword(); });

  var desktopDot = document.getElementById('desktopUnpauseDot');
  var dTimer = null;
  if(desktopDot){
    desktopDot.addEventListener('pointerdown', function(){ dTimer = setTimeout(showPausePasswordModal, 6000); });
    ['pointerup','pointerleave'].forEach(function(ev){ desktopDot.addEventListener(ev, function(){ clearTimeout(dTimer); }); });
  }
  var mobileDot = document.getElementById('mobileUnpauseDot');
  var mTimer = null;
  if(mobileDot){
    mobileDot.addEventListener('pointerdown', function(){ mTimer = setTimeout(showPausePasswordModal, 6000); });
    ['pointerup','pointerleave'].forEach(function(ev){ mobileDot.addEventListener(ev, function(){ clearTimeout(mTimer); }); });
  }
  var bell = document.getElementById('notificationBell');
  if(bell) bell.addEventListener('click', toggleNotification);

  var rsz = document.getElementById('receiptScannerZone');
  if(rsz){
    ['dragenter','dragover'].forEach(function(ev){ rsz.addEventListener(ev, function(e){ e.preventDefault(); rsz.classList.add('dragover'); }); });
    ['dragleave','drop'].forEach(function(ev){ rsz.addEventListener(ev, function(e){ e.preventDefault(); rsz.classList.remove('dragover'); }); });
    rsz.addEventListener('drop', function(e){
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      if(file){ var fakeEvent = { target: { files: [file], value: '' } }; handleReceiptUpload(fakeEvent); }
    });
  }

  var rdzone = document.getElementById('resourceDropZone');
  if(rdzone){
    ['dragenter','dragover'].forEach(function(ev){ rdzone.addEventListener(ev, function(e){ e.preventDefault(); rdzone.classList.add('dragover'); }); });
    ['dragleave','drop'].forEach(function(ev){ rdzone.addEventListener(ev, function(e){ e.preventDefault(); rdzone.classList.remove('dragover'); }); });
    rdzone.addEventListener('drop', function(e){
      var files = e.dataTransfer.files;
      if(files && files.length > 0){
        var fakeEvent = { target: { files: files, value: '' } };
        handleResourceUpload(fakeEvent);
      }
    });
  }

  document.querySelectorAll('.social-edit-grid input').forEach(function(inp){
    inp.addEventListener('input', function(){ });
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      closeAdminPasswordModal(); closeAdminPanelLogin(); closeNotificationEditor(); closeNotification();
      closeGalleryViewer(); closeMobileNav(); closeLiveCamGallery(); closeGenericModal();
    }
    if(e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A')){ e.preventDefault(); document.getElementById('adminPasswordModal').classList.add('open'); document.getElementById('adminPasswordInput').focus(); }
    if(e.ctrlKey && e.shiftKey && (e.key === 'x' || e.key === 'X')){ e.preventDefault(); showPausePasswordModal(); }
    if(e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')){ e.preventDefault(); if(adminMode) saveAllChanges(); }
  });
  if(location.hash === '#admin'){ setTimeout(openAdminPanelLogin, 500); }
  window.addEventListener('hashchange', function(){ if(location.hash === '#admin') openAdminPanelLogin(); });

  loadLiveCamPosition();
  ensureLiveCamChannels();

  initApplicationFormLiveValidation();

  if(!localStorage.getItem('highway_welcome_shown')){
    setTimeout(function(){
      showNotification('Welcome to Highway Vocational Center', 'Enroll now for Computer Packages, Beauty & Therapy, HairDressing, and Cyber & eCitizen Services.', 'info');
      localStorage.setItem('highway_welcome_shown', 'true');
    }, 2500);
  }
  console.log('%cHighway Vocational Center loaded', 'color:#0a6b3b;font-weight:bold;');
  console.log('%cEdit Mode: Ctrl+Shift+A (password: 9586)', 'color:#0a1f3d;');
  console.log('%cAdmin Panel: click the shield icon or visit #admin (password: 9586)', 'color:#c9a227;font-weight:bold;');
  console.log('%cCamera: top dark bar button', 'color:#c9a227;');
}

/* Expose to global */
window.showToast = showToast;
window.showPage = showPage;
window.navigateToSection = navigateToSection;
window.toggleMobileNav = toggleMobileNav;
window.closeMobileNav = closeMobileNav;
window.toggleDropdown = toggleDropdown;
window.toggleAdminMode = toggleAdminMode;
window.saveAllChanges = saveAllChanges;
window.exportData = exportData;
window.openNotificationEditor = openNotificationEditor;
window.closeNotificationEditor = closeNotificationEditor;
window.saveNotification = saveNotification;
window.closeNotification = closeNotification;
window.toggleNotification = toggleNotification;
window.openTestimonialForm = openTestimonialForm;
window.closeTestimonialForm = closeTestimonialForm;
window.submitTestimonial = submitTestimonial;
window.handleContactForm = handleContactForm;
window.verifyAdminPassword = verifyAdminPassword;
window.closeAdminPasswordModal = closeAdminPasswordModal;
window.showPausePasswordModal = showPausePasswordModal;
window.handleMakePayment = handleMakePayment;
window.setPauseTimer = setPauseTimer;
window.addGalleryImage = addGalleryImage;
window.deleteGalleryImage = deleteGalleryImage;
window.clearGallery = clearGallery;
window.viewGalleryImage = viewGalleryImage;
window.closeGalleryViewer = closeGalleryViewer;
window.downloadGalleryImage = downloadGalleryImage;
window.goToAppStep = goToAppStep;
window.toggleDisability = toggleDisability;
window.updateCourseOptions = updateCourseOptions;
window.updateCourseInfo = updateCourseInfo;
window.buildReview = buildReview;
window.submitApplication = submitApplication;
window.downloadApplicationSummary = downloadApplicationSummary;
window.checkApplicationStatus = checkApplicationStatus;
window.studentLogin = studentLogin;
window.studentLogout = studentLogout;
window.switchStudentTab = switchStudentTab;
window.filterCourses = filterCourses;
window.clearCourseFilters = clearCourseFilters;
window.showCourseDetails = showCourseDetails;
window.addHeroSlide = addHeroSlide;
window.deleteHeroSlide = deleteHeroSlide;
window.removeAllHeroSlides = removeAllHeroSlides;
window.goToSlide = goToSlide;
window.adminUploadLogo = adminUploadLogo;
window.populateSubCounties = populateSubCounties;
window.openAdminPanelLogin = openAdminPanelLogin;
window.closeAdminPanelLogin = closeAdminPanelLogin;
window.verifyAdminPanelPassword = verifyAdminPanelPassword;
window.adminPanelLogout = adminPanelLogout;
window.refreshAdminPanel = refreshAdminPanel;
window.switchAdminTab = switchAdminTab;
window.viewApplication = viewApplication;
window.editApplicationStatus = editApplicationStatus;
window.saveAppStatus = saveAppStatus;
window.deleteApplication = deleteApplication;
window.exportApplicationsCSV = exportApplicationsCSV;
window.clearAdminAppFilters = clearAdminAppFilters;
window.clearAdminStudentFilters = clearAdminStudentFilters;
window.clearAdminReportFilters = clearAdminReportFilters;
window.openAddStudentModal = openAddStudentModal;
window.createStudentManual = createStudentManual;
window.viewStudent = viewStudent;
window.deleteStudent = deleteStudent;
window.postOrUpdateAnnouncement = postOrUpdateAnnouncement;
window.editAnnouncement = editAnnouncement;
window.cancelAnnouncementEdit = cancelAnnouncementEdit;
window.deleteAnnouncement = deleteAnnouncement;
window.saveAdminSettings = saveAdminSettings;
window.wipeAllData = wipeAllData;
window.showGenericModal = showGenericModal;
window.closeGenericModal = closeGenericModal;
window.convertApplicationToStudent = convertApplicationToStudent;
window.handleReceiptUpload = handleReceiptUpload;
window.saveScannedReceipt = saveScannedReceipt;
window.cancelReceiptScan = cancelReceiptScan;
window.toggleRawText = toggleRawText;
window.submitStudentReport = submitStudentReport;
window.submitReportBack = submitReportBack;
window.renderStudentReports = renderStudentReports;
window.updateReportStatus = updateReportStatus;
window.saveReportStatus = saveReportStatus;
window.renderAdminReports = renderAdminReports;
window.loadNotifTemplate = loadNotifTemplate;
window.previewAdminNotification = previewAdminNotification;
window.sendAdminNotification = sendAdminNotification;
window.renderAdminNotifHistory = renderAdminNotifHistory;
window.viewMaterial = viewMaterial;
window.downloadMaterial = downloadMaterial;
window.handleResourceUpload = handleResourceUpload;
window.viewResource = viewResource;
window.downloadResource = downloadResource;
window.deleteResource = deleteResource;
window.renderAdminResources = renderAdminResources;
window.renderPublicResources = renderPublicResources;
window.renderTimetableEditor = renderTimetableEditor;
window.saveTimetableEditor = saveTimetableEditor;
window.resetTimetableEditor = resetTimetableEditor;
window.saveLiveSocialLinks = saveLiveSocialLinks;
window.postLiveClass = postLiveClass;
window.endLiveClass = endLiveClass;
window.deleteLiveClass = deleteLiveClass;
window.renderAdminLiveClasses = renderAdminLiveClasses;
window.renderPublicLiveClasses = renderPublicLiveClasses;
window.renderStudentLiveClasses = renderStudentLiveClasses;

window.openLiveCamera = openLiveCamera;
window.closeLiveCamera = closeLiveCamera;
window.minimizeLiveCam = minimizeLiveCam;
window.toggleLiveCamFullscreen = toggleLiveCamFullscreen;
window.flipLiveCam = flipLiveCam;
window.toggleLiveCamMic = toggleLiveCamMic;
window.setLiveCamMode = setLiveCamMode;
window.liveCamCaptureOrRecord = liveCamCaptureOrRecord;
window.openLiveCamGallery = openLiveCamGallery;
window.closeLiveCamGallery = closeLiveCamGallery;
window.handleLiveCamImageUpload = handleLiveCamImageUpload;
window.showLiveCamUploadPanel = showLiveCamUploadPanel;
window.closeLiveCamUploadPanel = closeLiveCamUploadPanel;
window.closeLiveCamQrResult = closeLiveCamQrResult;
window.requestLiveCamSlot = requestLiveCamSlot;

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();