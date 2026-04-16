/**
 * 근로자 DB — 교육이수 현황 포함
 * 교육 종류:
 *   건설업교육, C&E센터교육, 유도자/신호수, 밀폐감시자, 화기감시자,
 *   특별교육(굴착기), 특별교육(중량물), 특별교육(중장비), 특별교육(정전)
 */

/** 교육 유형 정의 */
const EDUCATION_TYPES = [
  { id: 'construction',     label: '건설업교육',       required: true,  linkedRoles: [] },
  { id: 'ce_center',        label: 'C&E센터교육',      required: true,  linkedRoles: [] },
  { id: 'guide_signal',     label: '유도자/신호수',     required: false, linkedRoles: ['굴착_유도자','굴착_신호수','중장비_유도자','중장비_신호수'] },
  { id: 'confined_watcher', label: '밀폐감시자',        required: false, linkedRoles: ['밀폐감시자'] },
  { id: 'fire_watcher',     label: '화기감시자',        required: false, linkedRoles: ['화기감시자'] },
  { id: 'special_excavator',label: '특별교육(굴착기)',   required: false, linkedRoles: ['굴착_유도자','굴착_신호수'], linkedWorkTypes: ['굴착작업'] },
  { id: 'special_heavylift',label: '특별교육(중량물)',   required: false, linkedRoles: ['중량물_작업책임자'], linkedWorkTypes: ['중량물작업'] },
  { id: 'special_heavyeq',  label: '특별교육(중장비)',   required: false, linkedRoles: ['중장비_유도자','중장비_신호수'], linkedWorkTypes: ['중장비작업'] },
  { id: 'special_electric',  label: '특별교육(정전)',    required: false, linkedRoles: [], linkedWorkTypes: ['정전작업'] },
];

/** 샘플 근로자 DB (20명) */
const WORKER_DB = [
  // === 전기계전부 ===
  { id:'W001', name:'김안전', affiliation:'전기계전부', position:'대리', phone:'010-1111-0001',
    education:{ construction:'2025-03-01', ce_center:'2025-02-15', guide_signal:null, confined_watcher:null, fire_watcher:null, special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:'2025-01-10' }},
  { id:'W002', name:'이이경', affiliation:'전기계전부', position:'사원', phone:'010-1111-0002',
    education:{ construction:'2025-03-01', ce_center:'2025-02-15', guide_signal:null, confined_watcher:null, fire_watcher:null, special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:'2025-03-01' }},
  { id:'W003', name:'박영수', affiliation:'전기계전부', position:'주임', phone:'010-1111-0003',
    education:{ construction:'2025-01-15', ce_center:'2025-04-01', guide_signal:null, confined_watcher:null, fire_watcher:null, special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:'2025-01-15' }},
  { id:'W004', name:'이전기', affiliation:'전기계전부', position:'과장', phone:'010-1111-0004',
    education:{ construction:'2025-02-01', ce_center:'2025-03-10', guide_signal:null, confined_watcher:null, fire_watcher:'2025-02-01', special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:'2025-02-01' }},
  { id:'W005', name:'박변압', affiliation:'전기계전부', position:'사원', phone:'010-1111-0005',
    education:{ construction:'2025-03-15', ce_center:'2025-03-15', guide_signal:null, confined_watcher:null, fire_watcher:null, special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:'2025-03-15' }},

  // === 기계정비부 ===
  { id:'W006', name:'박정비', affiliation:'기계정비부', position:'과장', phone:'010-2222-0001',
    education:{ construction:'2025-01-10', ce_center:'2025-01-10', guide_signal:'2024-11-01', confined_watcher:'2024-12-01', fire_watcher:'2025-01-10', special_excavator:null, special_heavylift:'2025-01-10', special_heavyeq:'2025-01-10', special_electric:null }},
  { id:'W007', name:'김터빈', affiliation:'기계정비부', position:'대리', phone:'010-2222-0002',
    education:{ construction:'2025-02-01', ce_center:'2025-02-01', guide_signal:null, confined_watcher:'2025-02-01', fire_watcher:'2025-02-01', special_excavator:null, special_heavylift:'2025-02-01', special_heavyeq:null, special_electric:null }},
  { id:'W008', name:'이점검', affiliation:'기계정비부', position:'사원', phone:'010-2222-0003',
    education:{ construction:'2025-03-01', ce_center:'2025-03-01', guide_signal:null, confined_watcher:null, fire_watcher:'2025-03-01', special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:null }},
  { id:'W009', name:'김로터', affiliation:'기계정비부', position:'대리', phone:'010-2222-0004',
    education:{ construction:'2025-01-15', ce_center:'2025-01-15', guide_signal:'2025-01-15', confined_watcher:null, fire_watcher:null, special_excavator:null, special_heavylift:'2025-01-15', special_heavyeq:'2025-01-15', special_electric:null }},
  { id:'W010', name:'이용접', affiliation:'기계정비부', position:'주임', phone:'010-2222-0005',
    education:{ construction:'2025-02-15', ce_center:'2025-02-15', guide_signal:null, confined_watcher:'2025-02-15', fire_watcher:'2025-02-15', special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:null }},
  { id:'W011', name:'최냉각', affiliation:'기계정비부', position:'사원', phone:'010-2222-0006',
    education:{ construction:'2025-04-01', ce_center:'2025-04-01', guide_signal:null, confined_watcher:null, fire_watcher:null, special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:null }},

  // === 토건부 ===
  { id:'W012', name:'김굴착', affiliation:'토건부', position:'대리', phone:'010-3333-0001',
    education:{ construction:'2025-01-05', ce_center:'2025-01-05', guide_signal:'2025-01-05', confined_watcher:null, fire_watcher:null, special_excavator:'2025-01-05', special_heavylift:null, special_heavyeq:'2025-01-05', special_electric:null }},
  { id:'W013', name:'이토목', affiliation:'토건부', position:'사원', phone:'010-3333-0002',
    education:{ construction:'2025-03-01', ce_center:'2025-03-01', guide_signal:'2025-03-01', confined_watcher:null, fire_watcher:null, special_excavator:'2025-03-01', special_heavylift:null, special_heavyeq:'2025-03-01', special_electric:null }},

  // === 화학부 ===
  { id:'W014', name:'박화학', affiliation:'화학부', position:'과장', phone:'010-4444-0001',
    education:{ construction:'2025-02-01', ce_center:'2025-02-01', guide_signal:null, confined_watcher:'2025-02-01', fire_watcher:'2025-02-01', special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:null }},
  { id:'W015', name:'김분석', affiliation:'화학부', position:'사원', phone:'010-4444-0002',
    education:{ construction:'2025-04-01', ce_center:'2025-04-01', guide_signal:null, confined_watcher:'2025-04-01', fire_watcher:null, special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:null }},

  // === 안전환경부 ===
  { id:'W016', name:'강안전', affiliation:'안전환경부', position:'과장', phone:'010-5555-0001',
    education:{ construction:'2025-01-01', ce_center:'2025-01-01', guide_signal:'2025-01-01', confined_watcher:'2025-01-01', fire_watcher:'2025-01-01', special_excavator:'2025-01-01', special_heavylift:'2025-01-01', special_heavyeq:'2025-01-01', special_electric:'2025-01-01' }},
  { id:'W017', name:'한감독', affiliation:'안전환경부', position:'대리', phone:'010-5555-0002',
    education:{ construction:'2025-02-01', ce_center:'2025-02-01', guide_signal:'2025-02-01', confined_watcher:'2025-02-01', fire_watcher:'2025-02-01', special_excavator:null, special_heavylift:null, special_heavyeq:'2025-02-01', special_electric:'2025-02-01' }},
  { id:'W018', name:'정감시', affiliation:'안전환경부', position:'주임', phone:'010-5555-0003',
    education:{ construction:'2025-03-01', ce_center:'2025-03-01', guide_signal:null, confined_watcher:'2025-03-01', fire_watcher:'2025-03-01', special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:null }},

  // === 협력사 ===
  { id:'W019', name:'최기술', affiliation:'협력사', position:'반장', phone:'010-6666-0001',
    education:{ construction:'2025-03-10', ce_center:'2025-03-10', guide_signal:'2025-03-10', confined_watcher:null, fire_watcher:'2025-03-10', special_excavator:null, special_heavylift:'2025-03-10', special_heavyeq:'2025-03-10', special_electric:null }},
  { id:'W020', name:'정현장', affiliation:'협력사', position:'기사', phone:'010-6666-0002',
    education:{ construction:'2025-04-01', ce_center:'2025-04-01', guide_signal:null, confined_watcher:null, fire_watcher:null, special_excavator:null, special_heavylift:null, special_heavyeq:null, special_electric:null }},
];

/**
 * 근로자 교육이수 배지 HTML
 */
function getWorkerEducationBadges(worker, compact) {
  if (!worker || !worker.education) return '';
  return EDUCATION_TYPES.map(et => {
    const date = worker.education[et.id];
    const done = !!date;
    if (compact && !done) return '';
    return `<span class="px-1 py-0.5 ${done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'} text-[8px] rounded" title="${et.label}${date ? ' ('+date+')' : ' 미이수'}">${compact ? et.label.replace('특별교육','특') : et.label}${done ? '&#10004;' : ''}</span>`;
  }).filter(Boolean).join(' ');
}

/**
 * 역할에 필요한 교육 이수 여부 확인
 */
function checkWorkerEduForRole(worker, role) {
  if (!worker || !worker.education) return { ok: false, missing: ['근로자 DB 미등록'] };
  const missing = [];
  // 필수교육 (건설업, C&E)
  EDUCATION_TYPES.filter(e => e.required).forEach(et => {
    if (!worker.education[et.id]) missing.push(et.label);
  });
  // 역할 연계 교육
  EDUCATION_TYPES.filter(e => e.linkedRoles && e.linkedRoles.includes(role)).forEach(et => {
    if (!worker.education[et.id]) missing.push(et.label);
  });
  return { ok: missing.length === 0, missing };
}

/**
 * 근로자 DB에서 이름으로 조회
 */
function findWorkerByName(name) {
  return WORKER_DB.find(w => w.name === name) || null;
}
