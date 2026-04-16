/**
 * 중앙 상태관리 Store
 * - 이벤트 기반 구독/발행 패턴
 * - 모든 섹션이 이 store를 통해 데이터를 공유
 */
const Store = (() => {
  // 초기 상태
  const state = {
    // 관리번호/작업 기본정보
    관리번호: '',
    작업명: '',
    작업내용: '',

    // A7: 기인물 체크 리스트 (58개) - data/hazards.js에서 초기화
    hazards: [],

    // H7: 작업분류 10개
    workTypes: [
      { id: '일반작업', kind: 'manual', checked: false, auto: false, note: '' },
      { id: '화기작업', kind: 'auto', checked: false, auto: false, note: '화기감시자 배치 필' },
      { id: '밀폐작업', kind: 'auto', checked: false, auto: false, note: '산소농도측정 필' },
      { id: '고소작업', kind: 'auto', checked: false, auto: false, note: '' },
      { id: '정전작업', kind: 'auto', checked: false, auto: false, note: '' },
      { id: '굴착작업', kind: 'auto', checked: false, auto: false, note: '' },
      { id: '중장비작업', kind: 'auto', checked: false, auto: false, note: '' },
      { id: '중량물작업', kind: 'auto', checked: false, auto: false, note: '중량물작업계획서' },
      { id: '방사선작업', kind: 'manual', checked: false, auto: false, note: '' },
      { id: '잠수작업', kind: 'manual', checked: false, auto: false, note: '' },
    ],

    // H20: 참여자 명단
    members: [],

    // O7: 작업개요
    overview: {
      회사부서명: '',
      작성일자: '',
      작성자: '',
      작업기간: '',
      작업장소: '',
      작업절차서: '',
      중점관리사항: '',
      필요한보호구: '',
      필요한공기구: '',
      투입중장비_수동: '',
    },

    // U7: 공정 내용
    processes: [],

    // AB7: 위험성평가 행
    rows: [],

    // 역할 지정 (작업분류별 감시자/유도자/신호수 등)
    roleAssignments: {
      // { '화기감시자': [memberIndex, ...], '밀폐감시자': [...], '신호수': [...], '유도자': [...] }
    },

    // 중량물 작업계획서
    heavyLiftPlan: {
      작업명: '', 작업일시: '', 작업장소: '',
      중량물명칭: '', 중량: '', 규격: '',
      양중장비: '', 양중방법: '', 안전조치사항: '',
      작업책임자: '', 작성자: '', 작성일: '',
    },

    // 중장비 작업계획서
    heavyEquipmentPlan: {
      작업명: '', 작업일시: '', 작업장소: '',
      중장비종류: '', 중장비규격: '', 장비번호: '',
      운전원: '', 운전면허번호: '', 작업범위: '',
      작업방법: '', 신호수: '', 유도자: '',
      안전조치사항: '', 비상시조치계획: '',
      작업책임자: '', 작성자: '', 작성일: '',
    },

    // 밀폐작업 출입대장
    confinedEntryLog: [],

    // TBM 전용 데이터
    tbm: {
      onePoint: '',
      checklist: {},
      feedback: ['', '', '', ''],
      notes: '',
      safetyGearProvided: false,
      contractorMessage: { content: '', deliveredAt: '', deliverer: '', signature: '' },
      attendeeDetails: {},
    },
  };

  // 이벤트 구독자
  const listeners = {};

  /**
   * 상태 가져오기
   */
  function get(key) {
    if (key) return state[key];
    return { ...state };
  }

  /**
   * 상태 업데이트 + 이벤트 발행
   */
  function set(key, value) {
    const old = state[key];
    state[key] = value;
    emit(key, value, old);
  }

  /**
   * 중첩 상태 업데이트 (overview 등)
   */
  function merge(key, partial) {
    if (typeof state[key] === 'object' && !Array.isArray(state[key])) {
      state[key] = { ...state[key], ...partial };
    } else {
      state[key] = partial;
    }
    emit(key, state[key]);
  }

  /**
   * 이벤트 구독
   */
  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * 이벤트 발행
   */
  function emit(event, data, oldData) {
    (listeners[event] || []).forEach(cb => cb(data, oldData));
    // 와일드카드 리스너
    (listeners['*'] || []).forEach(cb => cb(event, data, oldData));
  }

  // === 파생 데이터 (computed) ===

  /**
   * Z7: 체크된 기인물 목록
   */
  function getSelectedHazards() {
    return state.hazards.filter(h => h.checked);
  }

  /**
   * H7: 작업분류 자동판정 실행
   */
  function classifyWorkTypes() {
    const hazards = state.hazards;
    return state.workTypes.map(t => {
      // 기인물의 작업분류 필드로 자동 판정 (모든 작업분류 공통 규칙)
      const autoHit = hazards.some(h => h.checked && h.작업분류 === t.id);
      return {
        ...t,
        auto: autoHit,
        result: (autoHit || t.checked) ? '해당' : '미해당',
      };
    });
  }

  /**
   * 작업분류 텍스트 (■ 표시)
   */
  function getWorkTypeText() {
    return classifyWorkTypes()
      .filter(t => t.result === '해당')
      .map(t => `■ ${t.id}`)
      .join('  ');
  }

  /**
   * 투입 중장비 (체크된 중장비 기인물 + 수동 추가)
   */
  function getEquipmentText() {
    const auto = state.hazards
      .filter(h => h.checked && h.중장비여부 === '중장비')
      .map(h => h.기인물);
    const manual = state.overview.투입중장비_수동;
    const all = [...auto];
    if (manual) all.push(manual);
    return all.join(', ');
  }

  /**
   * 참여자 축약 텍스트
   */
  function getMembersText() {
    const names = state.members.filter(m => m.name);
    if (names.length === 0) return '';
    if (names.length <= 5) return names.map(m => m.name).join(', ');
    return names.slice(0, 5).map(m => m.name).join(', ') + ` 등 총 ${names.length}명`;
  }

  /**
   * 위험성 등급 분류
   */
  function getRiskGrade(risk) {
    if (risk >= 12) return { grade: 'VH', label: '매우위험', color: '#C00000' };
    if (risk >= 8) return { grade: 'H', label: '고위험', color: '#E26B0A' };
    if (risk >= 4) return { grade: 'M', label: '중위험', color: '#FFC000' };
    return { grade: 'L', label: '저위험', color: '#375623' };
  }

  /**
   * 공정별 분석 (AL7)
   */
  function getStageAnalysis() {
    const rows = state.rows;
    const stageNames = [...new Set(rows.map(r => r.stage).filter(Boolean))];
    return stageNames.map(name => {
      const stageRows = rows.filter(r => r.stage === name);
      const risksBefore = stageRows.map(r => r.riskBefore).filter(v => v > 0);
      const risksAfter = stageRows.map(r => r.riskAfter).filter(v => v > 0);
      const avgBefore = risksBefore.length ? +(risksBefore.reduce((a, b) => a + b, 0) / risksBefore.length).toFixed(1) : 0;
      const avgAfter = risksAfter.length ? +(risksAfter.reduce((a, b) => a + b, 0) / risksAfter.length).toFixed(1) : 0;
      const highCount = risksBefore.filter(r => r >= 8).length;
      return {
        name,
        total: stageRows.length,
        highCount,
        avgBefore,
        avgAfter,
        reduction: avgBefore > 0 ? +((avgBefore - avgAfter) / avgBefore).toFixed(3) : 0,
        grade: avgBefore >= 8 ? '고위험' : avgBefore >= 5 ? '중위험' : '저위험',
      };
    });
  }

  /**
   * 등급 분포 (AT7)
   */
  function getRiskDistribution(type = 'before') {
    const key = type === 'before' ? 'riskBefore' : 'riskAfter';
    const values = state.rows.map(r => r[key]).filter(v => v > 0);
    return {
      VH: values.filter(v => v >= 12).length,
      H: values.filter(v => v >= 8 && v < 12).length,
      M: values.filter(v => v >= 4 && v < 8).length,
      L: values.filter(v => v >= 1 && v < 4).length,
      total: values.length,
    };
  }

  /**
   * TBM 위험예지활동 항목 (체크된 행)
   */
  function getTbmRiskItems() {
    return state.rows
      .filter(r => r.tbmChk)
      .map((r, i) => ({
        no: i + 1,
        hazard: r.hazard,
        safety: r.safety,
        source: r.no,
        riskBefore: r.riskBefore,
        confirmed: false,
      }));
  }

  /**
   * 작업분류별 필요 역할 목록
   */
  function getRequiredRoles() {
    const types = classifyWorkTypes();
    const roles = [];
    types.forEach(t => {
      if (t.result !== '해당') return;
      switch (t.id) {
        case '화기작업':
          roles.push({ role: '화기감시자', workType: '화기작업', min: 1, exclusive: true, label: '화기감시자 (겸직 금지)' });
          break;
        case '밀폐작업':
          roles.push({ role: '밀폐감시자', workType: '밀폐작업', min: 1, exclusive: true, label: '밀폐감시자 (겸직 금지)' });
          break;
        case '굴착작업':
          roles.push({ role: '굴착_유도자', workType: '굴착작업', min: 1, exclusive: true, label: '유도자 (굴착·겸직 금지)' });
          roles.push({ role: '굴착_신호수', workType: '굴착작업', min: 1, exclusive: true, label: '신호수 (굴착·겸직 금지)' });
          break;
        case '중장비작업':
          roles.push({ role: '중장비_유도자', workType: '중장비작업', min: 1, exclusive: true, label: '유도자 (중장비·겸직 금지)' });
          roles.push({ role: '중장비_신호수', workType: '중장비작업', min: 1, exclusive: true, label: '신호수 (중장비·겸직 금지)' });
          break;
        case '중량물작업':
          roles.push({ role: '중량물_작업책임자', workType: '중량물작업', min: 1, exclusive: false, label: '작업책임자 (중량물)' });
          break;
      }
    });
    return roles;
  }

  /**
   * 역할 검증: 모든 필수 역할이 지정되었는지 확인
   * - 겸직(같은 사람이 여러 역할) 시 최소 2명 이상 배치 검증
   */
  function validateRoles() {
    const roles = getRequiredRoles();
    const assignments = state.roleAssignments;
    const errors = [];

    roles.forEach(r => {
      const assigned = assignments[r.role] || [];
      if (assigned.length < r.min) {
        errors.push({ role: r.role, label: r.label, type: 'missing', message: `${r.label} 미지정` });
      }
    });

    // 겸직 검증: 감시자·유도자·신호수는 전원 겸직 금지
    const personRoles = {};
    Object.entries(assignments).forEach(([role, indices]) => {
      indices.forEach(idx => {
        if (!personRoles[idx]) personRoles[idx] = [];
        personRoles[idx].push(role);
      });
    });

    // exclusive 역할 겸직 금지 검증 (감시자·유도자·신호수 모두)
    const exclusiveRoles = roles.filter(r => r.exclusive);
    exclusiveRoles.forEach(r => {
      const assigned = assignments[r.role] || [];
      assigned.forEach(idx => {
        if (personRoles[idx] && personRoles[idx].length > 1) {
          const members = state.members;
          const name = members[idx]?.name || `참여자${idx + 1}`;
          const otherRoles = personRoles[idx].filter(ro => ro !== r.role);
          const otherLabels = otherRoles.map(ro => {
            const def = roles.find(d => d.role === ro);
            return def ? def.label.replace(/ \(겸직 금지\)| \(.*겸직 금지\)/g, '') : ro;
          }).join(', ');
          errors.push({
            role: r.role, label: r.label, type: 'exclusive',
            message: `${r.label.replace(/ \(겸직 금지\)| \(.*겸직 금지\)/g, '')} "${name}" — 겸직 금지 (현재 ${otherLabels} 겸직 중)`
          });
        }
      });
    });

    // 중복 제거
    const unique = [];
    const seen = new Set();
    errors.forEach(e => {
      const key = `${e.role}:${e.type}`;
      if (!seen.has(key)) { seen.add(key); unique.push(e); }
    });

    return { valid: unique.length === 0, errors: unique };
  }

  /**
   * 전체 데이터 내보내기 (JSON)
   */
  function exportData() {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * 전체 데이터 불러오기 (JSON)
   */
  function importData(data) {
    Object.keys(data).forEach(key => {
      if (key in state) {
        state[key] = data[key];
        emit(key, state[key]);
      }
    });
    emit('dataLoaded', state);
  }

  return {
    get, set, merge, on, emit,
    getSelectedHazards,
    classifyWorkTypes,
    getWorkTypeText,
    getEquipmentText,
    getMembersText,
    getRiskGrade,
    getStageAnalysis,
    getRiskDistribution,
    getTbmRiskItems,
    getRequiredRoles,
    validateRoles,
    exportData,
    importData,
  };
})();
