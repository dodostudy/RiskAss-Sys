/**
 * 샘플 데이터 — "배전반 교체 공사" 시나리오
 */
const SAMPLE_DATA = {
  관리번호: 'RA-2025-0412-001',
  작업명: '배전반 교체 공사',
  작업내용: '노후 배전반 철거 및 신규 배전반 설치, 케이블 결선',

  // 체크된 기인물 (기인물명 배열)
  checkedHazards: ['비계', '사다리', '전기(충전부)', '전기(배전반)', '고소작업대', '이동식크레인'],

  overview: {
    회사부서명: '한국전력공사 전기부',
    작성일자: '2025-04-12',
    작성자: '김안전',
    작업기간: '2025.04.12 09:00~18:00',
    작업장소: 'A동 지하1층 전기실',
    중점관리사항: '정전작업 절차 준수, 잔류전압 확인, 아크플래시 방호',
    필요한보호구: '안전모, 절연장갑, 절연장화, 안전대, 보안경, 아크플래시 방호복',
    필요한공기구: '검전기, 접지봉, 절연매트, 멀티미터',
    투입중장비_수동: '',
  },

  members: [
    { affiliation: '전기부', name: '김안전', signature: '' },
    { affiliation: '전기부', name: '이이경', signature: '' },
    { affiliation: '전기부', name: '박영수', signature: '' },
    { affiliation: '협력사', name: '최기술', signature: '' },
    { affiliation: '협력사', name: '정현장', signature: '' },
    { affiliation: '안전팀', name: '강안전', signature: '' },
  ],

  processes: [
    { stage: '전원차단', content: '배전반 전원 차단 및 LOTO 조치', hazards: ['전기(충전부)', '전기(배전반)'] },
    { stage: '접지 점검', content: '접지저항 측정 및 접지선 연결 확인', hazards: ['전기(충전부)'] },
    { stage: '기존 배전반 해체', content: '노후 배전반 철거 및 반출', hazards: ['비계', '이동식크레인'] },
    { stage: '케이블 정비', content: '기존 케이블 정리 및 신규 케이블 포설', hazards: ['전기(충전부)', '사다리'] },
    { stage: '신규 배전반 설치', content: '신규 배전반 거치 및 고정', hazards: ['이동식크레인', '고소작업대'] },
    { stage: '케이블 결선', content: '케이블 단말처리 및 결선 작업', hazards: ['전기(충전부)', '전기(배전반)'] },
    { stage: '시운전 및 점검', content: '전원 투입 및 동작 시험', hazards: ['전기(충전부)', '전기(배전반)'] },
  ],

  rows: [
    { no: '1-1', stage: '전원차단', hazard: '차단기 오조작으로 감전', safety: 'LOTO 절차 준수, 무전압 확인', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 5, 기인물: '전기(배전반)' },
    { no: '1-2', stage: '전원차단', hazard: '잔류전압에 의한 감전', safety: '검전기로 무전압 확인, 잔류전압 방전', freqBefore: 3, sevBefore: 5, freqAfter: 1, sevAfter: 5, 기인물: '전기(충전부)' },
    { no: '1-3', stage: '전원차단', hazard: '아크플래시 발생', safety: '아크플래시 방호복 착용, 절연보호구', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '전기(충전부)' },
    { no: '2-1', stage: '접지 점검', hazard: '접지저항 미확보로 감전', safety: '접지저항 측정 후 기준값 확인', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '전기(충전부)' },
    { no: '2-2', stage: '접지 점검', hazard: '접지선 풀림으로 감전', safety: '접지선 체결 상태 확인, 보수', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '전기(충전부)' },
    { no: '3-1', stage: '기존 배전반 해체', hazard: '배전반 해체 중 전도', safety: '전도방지 조치 후 해체, 순서 준수', freqBefore: 2, sevBefore: 4, freqAfter: 1, sevAfter: 2, 기인물: '이동식크레인' },
    { no: '3-2', stage: '기존 배전반 해체', hazard: '크레인 인양 중 낙하', safety: '줄걸이 자격자 배치, 정격하중 준수', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '이동식크레인' },
    { no: '3-3', stage: '기존 배전반 해체', hazard: '작업자 추락 (고소)', safety: '고소작업대 사용, 안전대 착용', freqBefore: 2, sevBefore: 4, freqAfter: 1, sevAfter: 2, 기인물: '비계' },
    { no: '4-1', stage: '케이블 정비', hazard: '케이블 잔류전하 감전', safety: '방전 후 작업, 절연장갑 착용', freqBefore: 3, sevBefore: 4, freqAfter: 1, sevAfter: 2, 기인물: '전기(충전부)' },
    { no: '4-2', stage: '케이블 정비', hazard: '사다리 작업 중 추락', safety: '사다리 고정, 3점 지지 준수', freqBefore: 2, sevBefore: 4, freqAfter: 1, sevAfter: 2, 기인물: '사다리' },
    { no: '5-1', stage: '신규 배전반 설치', hazard: '배전반 양중 중 낙하', safety: '인양 경로 확보, 신호수 배치', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '이동식크레인' },
    { no: '5-2', stage: '신규 배전반 설치', hazard: '고소작업대 전도', safety: '아웃트리거 전개, 수평 지반 확인', freqBefore: 2, sevBefore: 4, freqAfter: 1, sevAfter: 2, 기인물: '고소작업대' },
    { no: '6-1', stage: '케이블 결선', hazard: '결선 중 감전', safety: '무전압 확인, 절연장갑 착용', freqBefore: 3, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '전기(충전부)' },
    { no: '6-2', stage: '케이블 결선', hazard: '단자 발열로 화재', safety: '토크렌치로 규정 토크 체결', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '전기(배전반)' },
    { no: '6-3', stage: '케이블 결선', hazard: '케이블 피복 손상 감전', safety: '케이블 피복 상태 점검, 보호', freqBefore: 2, sevBefore: 4, freqAfter: 1, sevAfter: 2, 기인물: '전기(충전부)' },
    { no: '7-1', stage: '시운전 및 점검', hazard: '전원투입 시 아크플래시', safety: '아크플래시 방호복, 원격투입', freqBefore: 3, sevBefore: 5, freqAfter: 1, sevAfter: 5, 기인물: '전기(배전반)' },
    { no: '7-2', stage: '시운전 및 점검', hazard: '보호장치 미작동으로 과전류', safety: '보호장치 동작시험 실시', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '전기(배전반)' },
    { no: '7-3', stage: '시운전 및 점검', hazard: '접지 불량으로 누전 감전', safety: '접지저항 재측정, 기준값 확인', freqBefore: 2, sevBefore: 5, freqAfter: 1, sevAfter: 3, 기인물: '전기(충전부)' },
  ],
};

/**
 * 샘플 데이터 로드
 */
function loadSampleData() {
  if (!confirm('샘플 데이터(배전반 교체 공사)를 로드하시겠습니까?\n현재 입력된 데이터는 초기화됩니다.')) return;

  const s = SAMPLE_DATA;

  // 기본 정보
  Store.set('관리번호', s.관리번호);
  Store.set('작업명', s.작업명);
  Store.set('작업내용', s.작업내용);
  document.getElementById('inp-refNo').value = s.관리번호;
  document.getElementById('inp-jobName').value = s.작업명;
  document.getElementById('inp-jobDesc').value = s.작업내용;

  // 기인물 체크
  const hazards = Store.get('hazards');
  hazards.forEach(h => {
    h.checked = s.checkedHazards.includes(h.기인물);
  });
  Store.set('hazards', [...hazards]);

  // 작업개요
  Store.merge('overview', s.overview);
  document.querySelectorAll('.overview-input').forEach(input => {
    const field = input.dataset.field;
    if (field && s.overview[field]) input.value = s.overview[field];
  });

  // 참여자
  Store.set('members', s.members.map(m => ({ ...m })));

  // 공정
  Store.set('processes', s.processes.map(p => ({ ...p, hazards: [...p.hazards] })));

  // 위험성평가 행
  Store.set('rows', s.rows.map(r => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random(),
    ...r,
    riskBefore: r.freqBefore * r.sevBefore,
    riskAfter: r.freqAfter * r.sevAfter,
    tbmChk: (r.freqBefore * r.sevBefore) >= 8,
  })));

  App.showToast('샘플 데이터(배전반 교체 공사) 로드 완료!\n18개 위험요인, 7개 공정, 6명 참여자', 'success');
}
