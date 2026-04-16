/**
 * 샘플 데이터베이스 — 복합발전 플랜트 위험성평가 10종
 * 참조: 복합발전 일반정보.md (도심형 복합화력 발전설비)
 */
const SAMPLE_DB = [
  // ====== 1. 배전반 교체 공사 ======
  {
    관리번호: 'RA-2025-0412-001', 작업명: '배전반 교체 공사', 작업내용: '노후 배전반 철거 및 신규 배전반 설치, 케이블 결선',
    checkedHazards: ['비계', '사다리', '전기(충전부)', '전기(배전반)', '고소작업대', '이동식크레인'],
    overview: { 회사부서명: '전기계전부', 작성일자: '2025-04-12', 작성자: '김안전', 작업기간: '2025.04.12 09:00~18:00', 작업장소: 'A동 지하1층 전기실', 중점관리사항: '정전작업 절차 준수, 잔류전압 확인, 아크플래시 방호', 필요한보호구: '안전모, 절연장갑, 절연장화, 안전대, 보안경, 아크플래시 방호복', 필요한공기구: '검전기, 접지봉, 절연매트, 멀티미터', 투입중장비_수동: '' },
    members: [
      { affiliation: '전기계전부', name: '김안전' },{ affiliation: '전기계전부', name: '이이경' },{ affiliation: '전기계전부', name: '박영수' },
      { affiliation: '협력사', name: '최기술' },{ affiliation: '협력사', name: '정현장' },{ affiliation: '안전환경부', name: '강안전' },
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
      { no:'1-1', stage:'전원차단', hazard:'차단기 오조작으로 감전', safety:'LOTO 절차 준수, 무전압 확인', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'전기(배전반)' },
      { no:'1-2', stage:'전원차단', hazard:'잔류전압에 의한 감전', safety:'검전기로 무전압 확인, 잔류전압 방전', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'전기(충전부)' },
      { no:'2-1', stage:'접지 점검', hazard:'접지저항 미확보로 감전', safety:'접지저항 측정 후 기준값 확인', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'전기(충전부)' },
      { no:'3-1', stage:'기존 배전반 해체', hazard:'배전반 해체 중 전도', safety:'전도방지 조치 후 해체, 순서 준수', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'이동식크레인' },
      { no:'3-2', stage:'기존 배전반 해체', hazard:'크레인 인양 중 낙하', safety:'줄걸이 자격자 배치, 정격하중 준수', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'이동식크레인' },
      { no:'4-1', stage:'케이블 정비', hazard:'사다리 작업 중 추락', safety:'사다리 고정, 3점 지지 준수', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'사다리' },
      { no:'5-1', stage:'신규 배전반 설치', hazard:'배전반 양중 중 낙하', safety:'인양 경로 확보, 신호수 배치', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'이동식크레인' },
      { no:'6-1', stage:'케이블 결선', hazard:'결선 중 감전', safety:'무전압 확인, 절연장갑 착용', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'전기(충전부)' },
      { no:'7-1', stage:'시운전 및 점검', hazard:'전원투입 시 아크플래시', safety:'아크플래시 방호복, 원격투입', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'전기(배전반)' },
    ],
  },

  // ====== 2. 가스터빈 정기정비 (GT Overhaul) ======
  {
    관리번호: 'RA-2025-0415-002', 작업명: '가스터빈 정기정비 (1-1호기)', 작업내용: '가스터빈 압축기·연소기·터빈부 분해점검 및 부품 교체',
    checkedHazards: ['비계', '고소작업대', '이동식크레인', '철골부재(보,기둥)', '용접기'],
    overview: { 회사부서명: '기계정비부', 작성일자: '2025-04-15', 작성자: '박정비', 작업기간: '2025.04.15~04.30 08:00~18:00', 작업장소: '1단계 GT-1 터빈홀', 중점관리사항: '고온설비 냉각확인, 밀폐공간 환기, 중량물 양중계획 수립', 필요한보호구: '안전모, 안전대, 안전화, 내열장갑, 방진마스크, 보안경', 필요한공기구: '유압토크렌치, 체인블록, 크레인(50ton)', 투입중장비_수동: '' },
    members: [
      { affiliation: '기계정비부', name: '박정비' },{ affiliation: '기계정비부', name: '김터빈' },{ affiliation: '기계정비부', name: '이점검' },
      { affiliation: '협력사(정비)', name: '최숙련' },{ affiliation: '협력사(정비)', name: '강기술' },{ affiliation: '협력사(정비)', name: '윤현장' },
      { affiliation: '안전환경부', name: '한감독' },{ affiliation: '품질관리부', name: '조품질' },
    ],
    processes: [
      { stage: '설비냉각 확인', content: '가스터빈 정지 후 냉각상태 확인 (터빈입구 온도 60℃ 이하)', hazards: [] },
      { stage: '외부케이싱 해체', content: '상부·하부 케이싱 볼트 해체 및 케이싱 탈거', hazards: ['이동식크레인', '철골부재(보,기둥)'] },
      { stage: '연소기 분해점검', content: '36개 버너 분리, 라이너·트랜지션피스 점검', hazards: ['고소작업대', '비계'] },
      { stage: '터빈블레이드 점검', content: '1~4단 터빈블레이드 및 노즐 마모도 점검·교체', hazards: ['비계', '고소작업대'] },
      { stage: '용접 보수', content: '크랙 부위 용접보수 및 비파괴검사(NDT)', hazards: ['용접기'] },
      { stage: '재조립 및 정렬', content: '로터 정렬(Alignment), 케이싱 재조립', hazards: ['이동식크레인', '철골부재(보,기둥)'] },
    ],
    rows: [
      { no:'1-1', stage:'설비냉각 확인', hazard:'잔열에 의한 화상', safety:'표면온도 측정 후 작업 개시, 내열장갑 착용', freqBefore:3, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'비계' },
      { no:'2-1', stage:'외부케이싱 해체', hazard:'케이싱(20ton) 인양 중 낙하', safety:'인양계획서 수립, 정격하중 준수, 신호수 배치', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'이동식크레인' },
      { no:'2-2', stage:'외부케이싱 해체', hazard:'고소작업 중 추락', safety:'비계 설치, 안전대 착용, 안전난간 설치', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'비계' },
      { no:'3-1', stage:'연소기 분해점검', hazard:'연소기 내부 잔류가스 질식', safety:'환기 실시, 산소농도 측정, 감시자 배치', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'고소작업대' },
      { no:'3-2', stage:'연소기 분해점검', hazard:'고소작업대 전도', safety:'아웃트리거 완전전개, 수평지반 확인', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'고소작업대' },
      { no:'4-1', stage:'터빈블레이드 점검', hazard:'블레이드 낙하에 의한 맞음', safety:'낙하방지 조치, 하부 출입통제', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'철골부재(보,기둥)' },
      { no:'5-1', stage:'용접 보수', hazard:'용접 불꽃 화재', safety:'화기감시자 배치, 소화기 비치, 가연물 제거', freqBefore:3, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'용접기' },
      { no:'5-2', stage:'용접 보수', hazard:'용접 흄 흡입', safety:'환기설비 가동, 방독면 착용', freqBefore:3, sevBefore:3, freqAfter:1, sevAfter:2, 기인물:'용접기' },
      { no:'6-1', stage:'재조립 및 정렬', hazard:'로터(15ton) 양중 중 낙하', safety:'2줄걸이 이상 사용, 인양경로 확보', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'이동식크레인' },
    ],
  },

  // ====== 3. HRSG 보일러 튜브 교체 ======
  {
    관리번호: 'RA-2025-0501-003', 작업명: 'HRSG 보일러 튜브 교체', 작업내용: '배열회수보일러 과열기 튜브 감육부 절단 및 신규 튜브 용접',
    checkedHazards: ['비계', '고소작업대', '용접기', '가스배관', '밀폐공간'],
    overview: { 회사부서명: '기계정비부', 작성일자: '2025-05-01', 작성자: '이용접', 작업기간: '2025.05.01~05.05 08:00~17:00', 작업장소: '2단계 HRSG-1 내부', 중점관리사항: '밀폐공간 산소농도 측정, 화기작업 허가, 고소작업 안전대', 필요한보호구: '안전모, 안전대, 방진마스크, 내열장갑, 용접보안면, 안전화', 필요한공기구: '용접기(TIG), 절단기, 체인블록, 산소농도 측정기', 투입중장비_수동: '' },
    members: [
      { affiliation: '기계정비부', name: '이용접' },{ affiliation: '기계정비부', name: '김보일러' },
      { affiliation: '협력사(용접)', name: '박용접' },{ affiliation: '협력사(용접)', name: '최배관' },
      { affiliation: '안전환경부', name: '정감시' },
    ],
    processes: [
      { stage: '계통격리·배수', content: 'HRSG 계통 격리 밸브 차단, 드럼 배수 및 잔압 해소', hazards: [] },
      { stage: '밀폐공간 진입준비', content: '환기, 산소농도 측정(18%↑), 감시자 배치', hazards: ['밀폐공간'] },
      { stage: '비계·발판 설치', content: '보일러 내부 작업발판 및 비계 조립', hazards: ['비계', '고소작업대'] },
      { stage: '감육 튜브 절단', content: '감육부 튜브 절단(가스절단기)', hazards: ['용접기', '가스배관'] },
      { stage: '신규 튜브 용접', content: 'TIG 용접으로 신규 튜브 접합', hazards: ['용접기'] },
      { stage: '비파괴검사(NDT)', content: '용접부 RT/UT 비파괴 검사 실시', hazards: [] },
    ],
    rows: [
      { no:'1-1', stage:'계통격리·배수', hazard:'잔압(증기) 분출에 의한 화상', safety:'잔압 해소 확인, 밸브 이중차단', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'가스배관' },
      { no:'2-1', stage:'밀폐공간 진입준비', hazard:'산소결핍에 의한 질식', safety:'산소농도 18% 이상 확인, 환기 지속, 감시자 배치', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'밀폐공간' },
      { no:'3-1', stage:'비계·발판 설치', hazard:'비계 조립 중 추락', safety:'안전대 착용, 작업발판 고정확인', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'비계' },
      { no:'4-1', stage:'감육 튜브 절단', hazard:'가스절단 시 화재·폭발', safety:'화기감시자 배치, 소화기 비치, 불티비산방지포', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'용접기' },
      { no:'4-2', stage:'감육 튜브 절단', hazard:'밀폐공간 내 유해가스 축적', safety:'연속 환기, 가스농도 측정기 상시 감시', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'밀폐공간' },
      { no:'5-1', stage:'신규 튜브 용접', hazard:'용접 흄 흡입(밀폐공간)', safety:'급·배기 환기, 방독면 착용', freqBefore:3, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'용접기' },
      { no:'5-2', stage:'신규 튜브 용접', hazard:'용접부 고온 접촉 화상', safety:'내열장갑, 고온주의 표지, 냉각 후 접근', freqBefore:2, sevBefore:3, freqAfter:1, sevAfter:2, 기인물:'용접기' },
    ],
  },

  // ====== 4. 증기터빈 로터 정비 ======
  {
    관리번호: 'RA-2025-0510-004', 작업명: '증기터빈 로터 정비', 작업내용: '증기터빈 로터 인출, 블레이드 점검, 싱크로 클러치 정비',
    checkedHazards: ['이동식크레인', '철골부재(보,기둥)', '비계', '고소작업대', '철골(철골구조물)'],
    overview: { 회사부서명: '기계정비부', 작성일자: '2025-05-10', 작성자: '김로터', 작업기간: '2025.05.10~05.20 08:00~18:00', 작업장소: '증기터빈홀 (ST Building)', 중점관리사항: '로터(25ton) 중량물 양중계획, 크레인 정격하중 확인', 필요한보호구: '안전모, 안전대, 안전화, 내열장갑, 보안경', 필요한공기구: '50ton 크레인, 유압토크렌치, 정밀측정기, 체인블록', 투입중장비_수동: '50ton 크레인' },
    members: [
      { affiliation: '기계정비부', name: '김로터' },{ affiliation: '기계정비부', name: '박터빈' },{ affiliation: '기계정비부', name: '이정밀' },
      { affiliation: '협력사(정비)', name: '최중량' },{ affiliation: '협력사(정비)', name: '한크레인' },
      { affiliation: '안전환경부', name: '강감독' },{ affiliation: '품질관리부', name: '윤검사' },
    ],
    processes: [
      { stage: '상부케이싱 해체', content: '증기터빈 상부 케이싱 볼트 해체 및 인양', hazards: ['이동식크레인', '비계'] },
      { stage: '로터 인출', content: '로터(25ton) 크레인 인양 및 정비대 안착', hazards: ['이동식크레인', '철골부재(보,기둥)'] },
      { stage: '블레이드 점검', content: '24단 고압터빈 블레이드 마모·균열 점검', hazards: ['비계'] },
      { stage: '싱크로 클러치 정비', content: '클러치 커플링 분해·점검·재조립', hazards: ['고소작업대'] },
      { stage: '로터 재설치', content: '로터 정렬(Alignment) 및 케이싱 재조립', hazards: ['이동식크레인', '철골(철골구조물)'] },
    ],
    rows: [
      { no:'1-1', stage:'상부케이싱 해체', hazard:'케이싱(15ton) 인양 중 낙하', safety:'중량물 작업계획서 수립, 정격하중 확인', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'이동식크레인' },
      { no:'1-2', stage:'상부케이싱 해체', hazard:'고소 비계 작업 중 추락', safety:'안전대 착용, 안전난간 설치', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'비계' },
      { no:'2-1', stage:'로터 인출', hazard:'로터(25ton) 인양 중 낙하·충돌', safety:'신호수 배치, 인양경로 출입통제, 2줄걸이', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'이동식크레인' },
      { no:'2-2', stage:'로터 인출', hazard:'줄걸이 와이어 절단', safety:'와이어 마모도 점검, 안전율 확인', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'철골부재(보,기둥)' },
      { no:'3-1', stage:'블레이드 점검', hazard:'블레이드 날카로운 모서리 절상', safety:'내절단장갑 착용, 보호캡 부착', freqBefore:2, sevBefore:2, freqAfter:1, sevAfter:1, 기인물:'비계' },
      { no:'4-1', stage:'싱크로 클러치 정비', hazard:'클러치 부품(500kg) 협착·끼임', safety:'작업전 에너지 차단(LOTO), 보조공구 사용', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'고소작업대' },
      { no:'5-1', stage:'로터 재설치', hazard:'로터 안착 시 충돌·끼임', safety:'서서히 하강, 유도자 배치, 정밀측정 확인', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'이동식크레인' },
    ],
  },

  // ====== 5. 냉각탑 구조물 보수 ======
  {
    관리번호: 'RA-2025-0520-005', 작업명: '냉각탑 충전재 교체 및 구조물 보수', 작업내용: '냉각탑 충전재 교체, FRP 구조물 보수, 살수노즐 청소',
    checkedHazards: ['비계', '사다리', '고소작업대', '작업발판/가설계단'],
    overview: { 회사부서명: '기계정비부', 작성일자: '2025-05-20', 작성자: '최냉각', 작업기간: '2025.05.20~05.22 08:00~17:00', 작업장소: '냉각탑 1-A, 1-B', 중점관리사항: '고소작업 안전대 착용, 미끄럼 방지, 레지오넬라 감염 방지', 필요한보호구: '안전모, 안전대, 안전화(미끄럼방지), 방수복, N95 마스크', 필요한공기구: '고압세척기, 전동공구, 체인블록', 투입중장비_수동: '' },
    members: [
      { affiliation: '기계정비부', name: '최냉각' },{ affiliation: '기계정비부', name: '박수처리' },
      { affiliation: '협력사', name: '김고소' },{ affiliation: '협력사', name: '이작업' },{ affiliation: '안전환경부', name: '한감독' },
    ],
    processes: [
      { stage: '냉각수 배수', content: '냉각탑 순환수 배수 및 세척', hazards: [] },
      { stage: '비계·안전난간 설치', content: '냉각탑 내부 작업용 비계 조립', hazards: ['비계', '작업발판/가설계단'] },
      { stage: '충전재 철거', content: '노후 충전재 해체 및 반출', hazards: ['고소작업대', '사다리'] },
      { stage: '구조물 보수', content: 'FRP 구조물 균열부 보수', hazards: ['비계'] },
      { stage: '신규 충전재 설치', content: '신규 충전재 설치 및 살수노즐 청소', hazards: ['고소작업대'] },
    ],
    rows: [
      { no:'1-1', stage:'냉각수 배수', hazard:'레지오넬라균 감염', safety:'N95 마스크, 방수복 착용, 소독 실시', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'비계' },
      { no:'2-1', stage:'비계·안전난간 설치', hazard:'비계 조립 중 추락(10m↑)', safety:'안전대 착용, 추락방지망 설치', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'비계' },
      { no:'3-1', stage:'충전재 철거', hazard:'고소작업 중 미끄러짐·추락', safety:'미끄럼방지 안전화, 안전대 착용', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'고소작업대' },
      { no:'3-2', stage:'충전재 철거', hazard:'충전재 낙하에 의한 맞음', safety:'하부 출입통제, 낙하물 방지망', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'사다리' },
      { no:'4-1', stage:'구조물 보수', hazard:'FRP 보수 시 유해증기 흡입', safety:'방독면 착용, 환기 실시', freqBefore:2, sevBefore:3, freqAfter:1, sevAfter:2, 기인물:'비계' },
      { no:'5-1', stage:'신규 충전재 설치', hazard:'고소작업대 작업 중 추락', safety:'안전대 체결, 아웃트리거 확인', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'고소작업대' },
    ],
  },

  // ====== 6. 지하배관 굴착 점검 ======
  {
    관리번호: 'RA-2025-0601-006', 작업명: '지하 열수송관 굴착 점검', 작업내용: '지역난방 열수송관 지하매설구간 굴착, 배관 외관점검 및 보온재 교체',
    checkedHazards: ['굴착기', '굴착면(토사)', '지반(연약)', '덤프트럭', '맨홀'],
    overview: { 회사부서명: '토건부', 작성일자: '2025-06-01', 작성자: '김굴착', 작업기간: '2025.06.01~06.05 09:00~17:00', 작업장소: '구내도로 B구간 (지하 2.5m)', 중점관리사항: '지하매설물 사전조사, 굴착면 붕괴방지, 밀폐공간(맨홀)', 필요한보호구: '안전모, 안전화, 안전조끼(반사), 방진마스크', 필요한공기구: '굴착기(0.7m3), 덤프트럭, 토류판', 투입중장비_수동: '' },
    members: [
      { affiliation: '토건부', name: '김굴착' },{ affiliation: '토건부', name: '이토목' },
      { affiliation: '협력사(토건)', name: '박운전' },{ affiliation: '협력사(토건)', name: '최유도' },
      { affiliation: '안전환경부', name: '강안전' },
    ],
    processes: [
      { stage: '지하매설물 조사', content: '지하매설물 위치 확인, 시험굴착', hazards: ['굴착기'] },
      { stage: '토사 굴착', content: '배관 노출 위한 트렌치 굴착(깊이 2.5m)', hazards: ['굴착기', '굴착면(토사)', '지반(연약)'] },
      { stage: '토류판 설치', content: '굴착면 토사 붕괴방지 토류판 설치', hazards: ['굴착면(토사)'] },
      { stage: '배관 점검·보수', content: '열수송관 외관점검, 보온재 교체', hazards: [] },
      { stage: '되메우기·다짐', content: '되메우기 및 다짐, 도로 복구', hazards: ['굴착기', '덤프트럭'] },
    ],
    rows: [
      { no:'1-1', stage:'지하매설물 조사', hazard:'지하매설물(가스관) 파손·폭발', safety:'지하매설물 도면 확인, 시험굴착, 관계기관 입회', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'굴착기' },
      { no:'2-1', stage:'토사 굴착', hazard:'굴착면 토사 붕괴 매몰', safety:'굴착기울기 1:1.5 준수, 토류판 설치', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'굴착면(토사)' },
      { no:'2-2', stage:'토사 굴착', hazard:'굴착기 작업반경 내 작업자 충돌', safety:'유도자 배치, 작업반경 출입통제', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'굴착기' },
      { no:'2-3', stage:'토사 굴착', hazard:'연약지반 굴착기 전도', safety:'지반 다짐 확인, 아웃트리거 설치', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'지반(연약)' },
      { no:'3-1', stage:'토류판 설치', hazard:'토류판 설치 중 토사 붕괴', safety:'단계별 굴착 및 토류판 설치, 지반 상태 감시', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'굴착면(토사)' },
      { no:'5-1', stage:'되메우기·다짐', hazard:'덤프트럭 후진 충돌', safety:'유도자 배치, 후방카메라 확인', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'덤프트럭' },
    ],
  },

  // ====== 7. 열교환기 화학세정 ======
  {
    관리번호: 'RA-2025-0610-007', 작업명: '열교환기 화학세정', 작업내용: '지역난방 열교환기 스케일 제거 화학세정(산세정·중화·부동태화)',
    checkedHazards: ['밀폐공간', '맨홀', '배관'],
    overview: { 회사부서명: '화학부', 작성일자: '2025-06-10', 작성자: '박화학', 작업기간: '2025.06.10~06.12 08:00~18:00', 작업장소: '열교환기실 HX-1A,1B', 중점관리사항: '유해화학물질 MSDS 숙지, 밀폐공간 안전관리, 누출 대비', 필요한보호구: '안전모, 내화학장갑, 화학보호복, 송기마스크, 안전화(내화학)', 필요한공기구: 'pH 측정기, 가스검지기, 펌프 세트, 중화제', 투입중장비_수동: '' },
    members: [
      { affiliation: '화학부', name: '박화학' },{ affiliation: '화학부', name: '김분석' },
      { affiliation: '협력사(세정)', name: '이세정' },{ affiliation: '협력사(세정)', name: '최약품' },
      { affiliation: '안전환경부', name: '한감시' },
    ],
    processes: [
      { stage: '계통 격리', content: '열교환기 계통 격리, 배수 및 충수 준비', hazards: ['배관'] },
      { stage: '약품 주입(산세정)', content: '염산(HCl 5%) 용액 주입 및 순환', hazards: ['밀폐공간'] },
      { stage: '중화처리', content: '가성소다(NaOH) 주입 중화', hazards: [] },
      { stage: '부동태화', content: '부동태화 약품 주입 및 순환', hazards: [] },
      { stage: '세정수 배출·처리', content: '세정 폐수 중화 처리 후 배출', hazards: ['맨홀'] },
    ],
    rows: [
      { no:'1-1', stage:'계통 격리', hazard:'잔류 고온수 분출 화상', safety:'밸브 이중차단, 잔압 해소 확인', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'배관' },
      { no:'2-1', stage:'약품 주입(산세정)', hazard:'염산 누출 피부·호흡기 노출', safety:'화학보호복·송기마스크 착용, MSDS 숙지', freqBefore:3, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'밀폐공간' },
      { no:'2-2', stage:'약품 주입(산세정)', hazard:'밀폐공간 유해가스(HCl) 축적', safety:'환기, 가스검지기 상시 모니터링, 감시자 배치', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'밀폐공간' },
      { no:'3-1', stage:'중화처리', hazard:'산·알칼리 혼합 시 발열 반응', safety:'서서히 주입, 온도 모니터링, 비상샤워 확보', freqBefore:2, sevBefore:3, freqAfter:1, sevAfter:2, 기인물:'배관' },
      { no:'5-1', stage:'세정수 배출·처리', hazard:'맨홀 진입 시 유해가스 질식', safety:'산소농도 측정, 감시자 배치, 구조장비 비치', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'맨홀' },
    ],
  },

  // ====== 8. 변압기 절연유 교체 ======
  {
    관리번호: 'RA-2025-0620-008', 작업명: '주변압기 절연유 교체', 작업내용: '154kV 주변압기 노후 절연유 배유, 신유 주입 및 절연저항 시험',
    checkedHazards: ['전기(충전부)', '전기(배전반)', '전기(전선/케이블)', '화물차'],
    overview: { 회사부서명: '전기계전부', 작성일자: '2025-06-20', 작성자: '이전기', 작업기간: '2025.06.20~06.22 08:00~18:00', 작업장소: '변전소 TR-1 변압기실', 중점관리사항: '154kV 정전절차 확인, 절연유 화재 방지, 환경오염 방지', 필요한보호구: '안전모, 절연장갑, 절연장화, 보안경, 내화학장갑', 필요한공기구: '절연유 펌프, 절연저항계(메거), 유중가스분석기', 투입중장비_수동: '절연유 운반차량' },
    members: [
      { affiliation: '전기계전부', name: '이전기' },{ affiliation: '전기계전부', name: '박변압' },
      { affiliation: '협력사(전기)', name: '김절연' },{ affiliation: '협력사(전기)', name: '최운반' },
      { affiliation: '안전환경부', name: '강안전' },
    ],
    processes: [
      { stage: '정전 및 LOTO', content: '154kV 계통 정전, 차단기 개방 및 LOTO', hazards: ['전기(충전부)', '전기(배전반)'] },
      { stage: '잔류전압 방전', content: '접지 투입, 잔류전압 방전 확인', hazards: ['전기(충전부)'] },
      { stage: '절연유 배유', content: '노후 절연유 배유 및 탱크로리 운반', hazards: ['화물차'] },
      { stage: '내부 점검', content: '변압기 내부 코일·절연물 육안 점검', hazards: [] },
      { stage: '신유 주입', content: '진공 탈기 후 신규 절연유 주입', hazards: ['전기(전선/케이블)'] },
      { stage: '시험 및 복전', content: '절연저항 시험, 유중가스 분석 후 복전', hazards: ['전기(충전부)', '전기(배전반)'] },
    ],
    rows: [
      { no:'1-1', stage:'정전 및 LOTO', hazard:'154kV 차단기 오조작 감전', safety:'정전절차서 준수, 이중 확인, LOTO 잠금', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'전기(배전반)' },
      { no:'2-1', stage:'잔류전압 방전', hazard:'잔류전압(고전압) 감전', safety:'검전기 확인, 접지봉 투입, 잔류전하 방전', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'전기(충전부)' },
      { no:'3-1', stage:'절연유 배유', hazard:'절연유 누출 환경오염·화재', safety:'방유제 설치, 소화기 비치, 누출감지', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'화물차' },
      { no:'5-1', stage:'신유 주입', hazard:'절연유 접촉 피부자극', safety:'내화학장갑 착용, MSDS 숙지', freqBefore:2, sevBefore:2, freqAfter:1, sevAfter:1, 기인물:'전기(전선/케이블)' },
      { no:'6-1', stage:'시험 및 복전', hazard:'복전 시 아크플래시', safety:'아크플래시 방호복, 원격투입, 안전거리 확보', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'전기(배전반)' },
    ],
  },

  // ====== 9. 연돌(Stack) 내부점검 ======
  {
    관리번호: 'RA-2025-0701-009', 작업명: '비상연돌 내부점검 및 라이닝 보수', 작업내용: '비상연돌(Bypass Stack) 내부 진입, 내화라이닝 균열부 점검 및 보수',
    checkedHazards: ['밀폐공간', '비계', '고소작업대', '사다리', '달비계(곤돌라)'],
    overview: { 회사부서명: '기계정비부', 작성일자: '2025-07-01', 작성자: '정연돌', 작업기간: '2025.07.01~07.03 09:00~16:00', 작업장소: '1단계 비상연돌(높이 60m)', 중점관리사항: '밀폐공간 진입절차 준수, 고소작업 안전대, 구조장비 비치', 필요한보호구: '안전모, 안전대(전체식), 방진마스크, 안전화, 보안경', 필요한공기구: '달비계(곤돌라), 산소농도 측정기, 보수자재, 조명장비', 투입중장비_수동: '' },
    members: [
      { affiliation: '기계정비부', name: '정연돌' },{ affiliation: '기계정비부', name: '김고소' },
      { affiliation: '협력사(밀폐)', name: '박진입' },{ affiliation: '협력사(밀폐)', name: '이보수' },
      { affiliation: '안전환경부', name: '최감시' },
    ],
    processes: [
      { stage: '밀폐공간 진입준비', content: '연돌 내 환기, 산소농도 측정, 출입허가', hazards: ['밀폐공간'] },
      { stage: '달비계 설치', content: '연돌 상부 달비계(곤돌라) 설치 및 점검', hazards: ['달비계(곤돌라)', '비계'] },
      { stage: '내부 하강점검', content: '달비계 이용 내부 하강, 라이닝 균열조사', hazards: ['달비계(곤돌라)', '밀폐공간'] },
      { stage: '라이닝 보수', content: '균열부 내화 보수재 시공', hazards: ['고소작업대', '사다리'] },
      { stage: '최종 점검·퇴거', content: '보수 품질 확인 후 장비 철수', hazards: ['밀폐공간'] },
    ],
    rows: [
      { no:'1-1', stage:'밀폐공간 진입준비', hazard:'연돌 내 잔류가스 질식', safety:'산소농도 18%↑ 확인, 연속환기, 감시자 배치', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'밀폐공간' },
      { no:'2-1', stage:'달비계 설치', hazard:'달비계 설치 중 추락(60m)', safety:'안전대 전체식 착용, 와이어 2중 체결', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'달비계(곤돌라)' },
      { no:'3-1', stage:'내부 하강점검', hazard:'달비계 와이어 파단 추락', safety:'와이어 점검, 비상정지장치 확인, 구조로프 설치', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'달비계(곤돌라)' },
      { no:'3-2', stage:'내부 하강점검', hazard:'밀폐공간 내 산소농도 저하', safety:'휴대용 가스검지기 착용, 이상 시 즉시 퇴거', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'밀폐공간' },
      { no:'4-1', stage:'라이닝 보수', hazard:'보수작업 중 고소 추락', safety:'안전대 착용, 안전발판 확보', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'고소작업대' },
      { no:'4-2', stage:'라이닝 보수', hazard:'보수재 분진 흡입', safety:'방진마스크 착용, 환기 유지', freqBefore:2, sevBefore:3, freqAfter:1, sevAfter:2, 기인물:'사다리' },
    ],
  },

  // ====== 10. 가스배관 플랜지 교체 ======
  {
    관리번호: 'RA-2025-0715-010', 작업명: 'LNG 연료가스 배관 플랜지 교체', 작업내용: '가스터빈 연료가스 공급배관 플랜지 가스켓 교체 및 기밀시험',
    checkedHazards: ['가스배관', '용접기', '배관', '굴착면(토사)'],
    overview: { 회사부서명: '기계정비부', 작성일자: '2025-07-15', 작성자: '한가스', 작업기간: '2025.07.15~07.16 08:00~17:00', 작업장소: '가스터빈 연료가스 배관실', 중점관리사항: '가스 퍼지 완료 확인, 화기작업 허가, 가스누출 검지기 상시', 필요한보호구: '안전모, 안전화, 방독면, 내화학장갑, 보안경', 필요한공기구: '토크렌치, 가스검지기, 비누수검지액, 질소 퍼지장비', 투입중장비_수동: '' },
    members: [
      { affiliation: '기계정비부', name: '한가스' },{ affiliation: '기계정비부', name: '김배관' },
      { affiliation: '협력사(배관)', name: '박플랜지' },{ affiliation: '협력사(배관)', name: '이가스켓' },
      { affiliation: '안전환경부', name: '최화기' },
    ],
    processes: [
      { stage: '가스 차단·퍼지', content: 'LNG 공급 차단, 질소 퍼지로 잔류가스 제거', hazards: ['가스배관'] },
      { stage: '가스농도 측정', content: '배관 내 잔류가스 농도 측정(LEL 0%)', hazards: ['가스배관'] },
      { stage: '플랜지 해체', content: '볼트 해체, 노후 가스켓 제거', hazards: ['배관'] },
      { stage: '신규 가스켓 설치', content: '신규 가스켓 삽입, 볼트 체결(토크관리)', hazards: ['배관'] },
      { stage: '기밀시험', content: '질소 압력시험 및 비누수 검지', hazards: ['가스배관'] },
      { stage: '가스 충전·시운전', content: 'LNG 재충전 및 가스누출 최종 확인', hazards: ['가스배관'] },
    ],
    rows: [
      { no:'1-1', stage:'가스 차단·퍼지', hazard:'잔류 LNG 가스 폭발', safety:'질소 퍼지 3회 이상 실시, LEL 0% 확인', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:5, 기인물:'가스배관' },
      { no:'2-1', stage:'가스농도 측정', hazard:'가스검지기 오작동 미감지', safety:'교정 완료 검지기 사용, 2대 이상 교차확인', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'가스배관' },
      { no:'3-1', stage:'플랜지 해체', hazard:'플랜지 해체 시 잔류가스 누출', safety:'서서히 볼트 풀기, 풍상측 작업, 방독면 착용', freqBefore:3, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'배관' },
      { no:'4-1', stage:'신규 가스켓 설치', hazard:'가스켓 불량 조립 누출', safety:'가스켓 규격 확인, 토크렌치 사용, 체결 순서 준수', freqBefore:2, sevBefore:4, freqAfter:1, sevAfter:2, 기인물:'배관' },
      { no:'5-1', stage:'기밀시험', hazard:'압력시험 중 배관 파열', safety:'시험압력 1.5배 이내, 안전거리 확보', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'가스배관' },
      { no:'6-1', stage:'가스 충전·시운전', hazard:'LNG 충전 시 가스누출 폭발', safety:'서서히 충전, 검지기 상시 모니터링, 화기작업 금지', freqBefore:2, sevBefore:5, freqAfter:1, sevAfter:3, 기인물:'가스배관' },
    ],
  },
];

// 하위호환: 기존 SAMPLE_DATA 참조
const SAMPLE_DATA = SAMPLE_DB[0];

/**
 * 샘플 데이터 선택 팝업
 */
function loadSampleData() {
  const existing = document.getElementById('sampleSelectModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'sampleSelectModal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[200] no-print';
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl flex flex-col" style="width:95vw; max-width:800px; max-height:85vh;">
      <div class="p-4 bg-header-navy text-white flex justify-between items-center flex-shrink-0">
        <h3 class="font-bold">&#128203; 샘플 위험성평가 선택</h3>
        <button onclick="document.getElementById('sampleSelectModal').remove()" class="text-white/70 hover:text-white text-xl">&times;</button>
      </div>
      <div class="p-4 flex-shrink-0 border-b bg-blue-50">
        <div class="flex items-center justify-between">
          <p class="text-sm text-blue-800">복합발전 플랜트 기반 샘플 <strong>${SAMPLE_DB.length}종</strong> — 선택하여 편집기에 로드하거나, 전체를 DB에 저장할 수 있습니다.</p>
          <button onclick="_saveAllSamplesToDB()" class="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium whitespace-nowrap ml-3">
            &#128451; 전체 DB 저장
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-2">
        ${SAMPLE_DB.map((s, i) => {
          const hazardCount = s.checkedHazards.length;
          const rowCount = s.rows.length;
          const memberCount = s.members.length;
          const maxRisk = Math.max(...s.rows.map(r => r.freqBefore * r.sevBefore));
          const workTypes = [...new Set(s.checkedHazards.map(name => {
            const h = HAZARD_MASTER.find(m => m.기인물 === name);
            return h ? h.작업분류 : '일반작업';
          }))];
          return `
            <div class="p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition group" onclick="_loadSampleByIndex(${i})">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-mono text-gray-400">${s.관리번호}</span>
                    <h4 class="font-bold text-sm text-header-navy">${s.작업명}</h4>
                  </div>
                  <p class="text-xs text-gray-500 mb-2">${s.작업내용}</p>
                  <div class="flex flex-wrap gap-1 mb-1">
                    ${workTypes.map(wt => `<span class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded">${wt}</span>`).join('')}
                  </div>
                  <div class="flex gap-3 text-[10px] text-gray-400">
                    <span>&#9888; 기인물 ${hazardCount}개</span>
                    <span>&#128203; 평가행 ${rowCount}건</span>
                    <span>&#128101; ${memberCount}명</span>
                    <span class="font-bold ${maxRisk >= 12 ? 'text-risk-vh' : maxRisk >= 8 ? 'text-risk-h' : 'text-risk-m'}">최대위험도 ${maxRisk}</span>
                  </div>
                </div>
                <span class="text-gray-300 group-hover:text-header-navy text-lg ml-2 mt-2">&#9654;</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

/**
 * 특정 인덱스의 샘플을 편집기에 로드
 */
function _loadSampleByIndex(index) {
  const s = SAMPLE_DB[index];
  if (!confirm(`"${s.작업명}" 샘플을 로드하시겠습니까?\n현재 입력된 데이터는 초기화됩니다.`)) return;

  document.getElementById('sampleSelectModal')?.remove();
  _applySampleData(s);
  App.showToast(`샘플 "${s.작업명}" 로드 완료!\n${s.rows.length}개 위험요인, ${s.processes.length}개 공정, ${s.members.length}명`, 'success');
}

/**
 * 샘플 데이터를 Store에 적용
 */
function _applySampleData(s) {
  Store.set('관리번호', s.관리번호);
  Store.set('작업명', s.작업명);
  Store.set('작업내용', s.작업내용);
  document.getElementById('inp-refNo').value = s.관리번호;
  document.getElementById('inp-jobName').value = s.작업명;
  document.getElementById('inp-jobDesc').value = s.작업내용;

  const hazards = Store.get('hazards');
  hazards.forEach(h => { h.checked = s.checkedHazards.includes(h.기인물); });
  Store.set('hazards', [...hazards]);

  Store.merge('overview', s.overview);
  document.querySelectorAll('.overview-input').forEach(input => {
    const field = input.dataset.field;
    if (field && s.overview[field]) input.value = s.overview[field];
  });

  Store.set('members', s.members.map(m => ({ ...m, signature: '' })));
  Store.set('processes', s.processes.map(p => ({ ...p, hazards: [...(p.hazards || [])] })));
  Store.set('rows', s.rows.map(r => ({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random(),
    ...r,
    riskBefore: r.freqBefore * r.sevBefore,
    riskAfter: r.freqAfter * r.sevAfter,
    tbmChk: (r.freqBefore * r.sevBefore) >= 8,
  })));

  StepWizard.goTo(0);
}

/**
 * 전체 샘플 DB를 IndexedDB에 저장
 */
function _saveAllSamplesToDB() {
  if (!confirm(`샘플 ${SAMPLE_DB.length}건을 전부 IndexedDB에 저장하시겠습니까?\n동일 관리번호가 있으면 덮어쓰기됩니다.`)) return;

  const dbReq = indexedDB.open('RiskAssDB', 1);
  dbReq.onupgradeneeded = () => {
    const db = dbReq.result;
    if (!db.objectStoreNames.contains('assessments')) {
      db.createObjectStore('assessments', { keyPath: 'key' });
    }
  };
  dbReq.onsuccess = () => {
    const db = dbReq.result;
    const tx = db.transaction('assessments', 'readwrite');
    const store = tx.objectStore('assessments');

    SAMPLE_DB.forEach(s => {
      // 기인물 전체 배열 구성
      const hazards = HAZARD_MASTER.map(h => ({
        ...h,
        checked: s.checkedHazards.includes(h.기인물),
      }));

      const data = {
        key: s.관리번호,
        관리번호: s.관리번호,
        작업명: s.작업명,
        작업내용: s.작업내용,
        hazards,
        workTypes: [
          { id: '일반작업', kind: 'manual', checked: false, auto: false },
          { id: '화기작업', kind: 'auto', checked: false, auto: false },
          { id: '밀폐작업', kind: 'auto', checked: false, auto: false },
          { id: '고소작업', kind: 'auto', checked: false, auto: false },
          { id: '정전작업', kind: 'auto', checked: false, auto: false },
          { id: '굴착작업', kind: 'auto', checked: false, auto: false },
          { id: '중장비작업', kind: 'auto', checked: false, auto: false },
          { id: '중량물작업', kind: 'auto', checked: false, auto: false },
          { id: '방사선작업', kind: 'manual', checked: false, auto: false },
          { id: '잠수작업', kind: 'manual', checked: false, auto: false },
        ],
        overview: s.overview,
        members: s.members.map(m => ({ ...m, signature: '' })),
        processes: s.processes.map(p => ({ ...p, hazards: [...(p.hazards || [])] })),
        rows: s.rows.map(r => ({
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random(),
          ...r,
          riskBefore: r.freqBefore * r.sevBefore,
          riskAfter: r.freqAfter * r.sevAfter,
          tbmChk: (r.freqBefore * r.sevBefore) >= 8,
        })),
        roleAssignments: {},
        tbm: { onePoint: '', checklist: {}, feedback: ['','','',''], notes: '', safetyGearProvided: false, contractorMessage: { content: '', deliveredAt: '', deliverer: '', signature: '' }, attendeeDetails: {} },
        heavyLiftPlan: {},
        heavyEquipmentPlan: {},
        confinedEntryLog: [],
        savedAt: new Date().toISOString(),
      };

      store.put(data);
    });

    tx.oncomplete = () => {
      document.getElementById('sampleSelectModal')?.remove();
      App.showToast(`샘플 ${SAMPLE_DB.length}건 전체 DB 저장 완료!\nDB관리에서 확인하세요.`, 'success');
    };
  };
}
