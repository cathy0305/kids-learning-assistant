// Node.js 18 이상에서는 fetch가 내장되어 있어 별도 import 필요 없음

const NEIS_CONFIG = {
  baseUrl: 'https://open.neis.go.kr/hub',
  key: process.env.NEIS_API_KEY,
  type: 'json'
};

// 초등학교 교육과정 데이터 가져오기
async function fetchElementaryCurriculum() {
  try {
    const url = `${NEIS_CONFIG.baseUrl}/elsTimetable?KEY=${NEIS_CONFIG.key}&Type=${NEIS_CONFIG.type}&pIndex=1&pSize=100`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('NEIS API Error:', error);
    return null;
  }
}

// 학교 정보 가져오기
async function fetchSchoolInfo() {
  try {
    const url = `${NEIS_CONFIG.baseUrl}/schoolInfo?KEY=${NEIS_CONFIG.key}&Type=${NEIS_CONFIG.type}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('NEIS API Error:', error);
    return null;
  }
}

export { fetchElementaryCurriculum, fetchSchoolInfo };